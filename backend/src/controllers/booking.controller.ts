import { Request, Response } from 'express';
import { BookingStatus, PaymentStatus, RoomStatus, PaymentMethod } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

// Price calculation helper
export const calculateBookingPricing = async (
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  couponCode?: string | null
) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { branch: true },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const roomCharges = room.pricePerNight * nights;

  let discountAmount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (
      coupon &&
      coupon.status === 'ACTIVE' &&
      coupon.startDate <= new Date() &&
      coupon.endDate >= new Date() &&
      (!coupon.branchId || coupon.branchId === room.branchId) &&
      roomCharges >= coupon.minBookingAmount &&
      coupon.usedCount < coupon.usageLimit
    ) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (roomCharges * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    }
  }

  // 12% GST tax rate
  const taxableAmount = Math.max(0, roomCharges - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.12 * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    room,
    nights,
    roomCharges,
    discountAmount,
    taxAmount,
    totalAmount,
  };
};

export const checkAvailabilityAndPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, checkInDate, checkOutDate, couponCode } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      res.status(400).json({ success: false, message: 'Invalid check-in or check-out dates.' });
      return;
    }

    // Check overlap
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        AND: [
          { checkInDate: { lt: checkOut } },
          { checkOutDate: { gt: checkIn } },
        ],
      },
    });

    if (overlap) {
      res.status(409).json({
        success: false,
        isAvailable: false,
        message: 'This room is already reserved for the selected dates. Please choose another room or date.',
      });
      return;
    }

    const pricing = await calculateBookingPricing(roomId, checkIn, checkOut, couponCode);

    res.json({
      success: true,
      isAvailable: true,
      data: pricing,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Customer Online Booking (Desk Payment Only)
export const createCustomerBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      res.status(401).json({ success: false, message: 'User must be authenticated.' });
      return;
    }

    const {
      branchId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
      couponCode,
      guestName,
      guestEmail,
      guestPhone,
      idType,
      idNumber,
    } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
      return;
    }

    // 1. Calculate authoritative price on backend before starting transaction
    const pricing = await calculateBookingPricing(roomId, checkIn, checkOut, couponCode);

    // Generate booking reference
    const branchCode = pricing.room.branch.city.substring(0, 3).toUpperCase();
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `HOD-${branchCode}-${Date.now().toString().slice(-4)}-${uniqueSuffix}`;

    // Execute in a transaction to prevent race conditions
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Double check room overlap
      const conflict = await tx.booking.findFirst({
        where: {
          roomId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
          AND: [
            { checkInDate: { lt: checkOut } },
            { checkOutDate: { gt: checkIn } },
          ],
        },
      });

      if (conflict) {
        throw new Error('This room was just reserved by another guest for these dates. Please choose another room.');
      }

      // 2. Create booking
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId,
          branchId,
          roomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfNights: pricing.nights,
          numberOfGuests,
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.UNPAID,
          roomCharges: pricing.roomCharges,
          extraCharges: 0,
          taxAmount: pricing.taxAmount,
          discountAmount: pricing.discountAmount,
          totalAmount: pricing.totalAmount,
          paidAmount: 0,
          balanceAmount: pricing.totalAmount,
          couponCode: couponCode || null,
          specialRequests: specialRequests || null,
          notes: 'Online reservation. Payment will be collected at hotel reception desk upon check-in/checkout.',
          guests: {
            create: [
              {
                fullName: guestName,
                email: guestEmail || req.user?.email,
                phone: guestPhone,
                idType: idType || 'Government ID',
                idNumber: idNumber || 'Pending verification at desk',
                isPrimary: true,
              },
            ],
          },
        },
        include: {
          room: { include: { roomType: true } },
          branch: true,
          guests: true,
        },
      });

      if (couponCode && pricing.discountAmount > 0) {
        await tx.coupon.update({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newBooking;
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'CUSTOMER',
      action: 'CREATE_BOOKING',
      entity: 'Booking',
      entityId: booking.id,
      branchId: booking.branchId,
      details: `Customer created reservation ${booking.bookingNumber} for ${booking.room.roomNumber} (${booking.numberOfNights} nights, ₹${booking.totalAmount}). Payment at desk.`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed! Payment will be collected at House of Dreams reception desk.',
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reception Walk-in Booking
export const createWalkInBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const staffId = req.user?.userId;
    const staffBranchId = req.user?.branchId;

    const {
      branchId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      guestName,
      guestEmail,
      guestPhone,
      idType,
      idNumber,
      specialRequests,
      advancePaymentAmount,
      paymentMethod,
      paymentNotes,
    } = req.body;

    const targetBranchId = req.user?.role === 'RECEPTION' ? staffBranchId! : branchId;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Calculate pricing and branch reference before opening transaction
    const pricing = await calculateBookingPricing(roomId, checkIn, checkOut);
    const branch = await prisma.branch.findUnique({ where: { id: targetBranchId } });
    const branchCode = (branch?.city || 'HOD').substring(0, 3).toUpperCase();
    const bookingNumber = `HOD-WLK-${branchCode}-${Date.now().toString().slice(-4)}`;

    const advance = advancePaymentAmount && advancePaymentAmount > 0 ? advancePaymentAmount : 0;
    const initialPaid = Math.min(advance, pricing.totalAmount);
    const balance = Math.max(0, pricing.totalAmount - initialPaid);

    let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (initialPaid >= pricing.totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (initialPaid > 0) {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    const booking = await prisma.$transaction(async (tx) => {
      // Overlap check
      const conflict = await tx.booking.findFirst({
        where: {
          roomId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
          AND: [
            { checkInDate: { lt: checkOut } },
            { checkOutDate: { gt: checkIn } },
          ],
        },
      });

      if (conflict) {
        throw new Error('This room is not available for the requested walk-in dates.');
      }

      // Check or create customer account for guest email
      const customerEmail = guestEmail || `walkin.${Date.now()}@houseofdreams.local`;
      let customer = await tx.user.findUnique({ where: { email: customerEmail.toLowerCase() } });
      if (!customer) {
        customer = await tx.user.create({
          data: {
            name: guestName,
            email: customerEmail.toLowerCase(),
            phone: guestPhone,
            passwordHash: 'WALK_IN_GUEST_NO_PASS',
            role: 'CUSTOMER',
            status: 'ACTIVE',
          },
        });
      }

      const createdBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: customer.id,
          branchId: targetBranchId,
          roomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfNights: pricing.nights,
          numberOfGuests,
          status: BookingStatus.CONFIRMED,
          paymentStatus,
          roomCharges: pricing.roomCharges,
          extraCharges: 0,
          taxAmount: pricing.taxAmount,
          discountAmount: 0,
          totalAmount: pricing.totalAmount,
          paidAmount: initialPaid,
          balanceAmount: balance,
          specialRequests,
          notes: `Walk-in booking created by ${req.user?.name}.`,
          guests: {
            create: [
              {
                fullName: guestName,
                email: guestEmail,
                phone: guestPhone,
                idType,
                idNumber,
                isPrimary: true,
              },
            ],
          },
        },
      });

      // If advance payment provided at desk
      if (initialPaid > 0 && paymentMethod) {
        const payNum = `PAY-WLK-${Date.now().toString().slice(-6)}`;
        await tx.payment.create({
          data: {
            paymentNumber: payNum,
            bookingId: createdBooking.id,
            branchId: targetBranchId,
            amount: initialPaid,
            paymentMethod: paymentMethod as PaymentMethod,
            status: 'PAID',
            collectedById: staffId!,
            notes: paymentNotes || 'Walk-in desk advance payment',
          },
        });
      }

      return createdBooking;
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'RECEPTION',
      action: 'WALK_IN_BOOKING',
      entity: 'Booking',
      entityId: booking.id,
      branchId: booking.branchId,
      details: `Walk-in booking ${booking.bookingNumber} created for ${guestName}.`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in booking created successfully.',
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Check-in Guest (Reception)
export const checkInGuest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (req.user?.role === 'RECEPTION' && req.user.branchId !== booking.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only check in guests at your assigned branch.' });
      return;
    }

    if (booking.status === BookingStatus.CHECKED_IN) {
      res.status(400).json({ success: false, message: 'Guest is already checked in.' });
      return;
    }

    if (booking.status === BookingStatus.CANCELLED) {
      res.status(400).json({ success: false, message: 'Cannot check in a cancelled booking.' });
      return;
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CHECKED_IN,
          actualCheckIn: new Date(),
          checkedInById: req.user?.userId,
        },
      });

      await tx.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.OCCUPIED },
      });

      return b;
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'RECEPTION',
      action: 'GUEST_CHECK_IN',
      entity: 'Booking',
      entityId: booking.id,
      branchId: booking.branchId,
      details: `Checked in guest for booking ${booking.bookingNumber}. Room ${booking.room.roomNumber} set to OCCUPIED.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Guest checked in successfully. Room ${booking.room.roomNumber} is now OCCUPIED.`,
      data: updatedBooking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check-out Guest (Reception)
export const checkOutGuest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (req.user?.role === 'RECEPTION' && req.user.branchId !== booking.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only check out guests at your assigned branch.' });
      return;
    }

    if (booking.status !== BookingStatus.CHECKED_IN) {
      res.status(400).json({ success: false, message: 'Only checked-in guests can be checked out.' });
      return;
    }

    if (booking.balanceAmount > 0) {
      res.status(400).json({
        success: false,
        message: `Outstanding balance of ₹${booking.balanceAmount.toLocaleString()} must be cleared at the desk before checkout.`,
      });
      return;
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CHECKED_OUT,
          actualCheckOut: new Date(),
        },
      });

      // Change room status to CLEANING
      await tx.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.CLEANING },
      });

      // Automatically generate invoice if not already generated
      const existingInvoice = await tx.invoice.findFirst({ where: { bookingId: id } });
      if (!existingInvoice) {
        const invNum = `INV-${Date.now().toString().slice(-6)}`;
        await tx.invoice.create({
          data: {
            invoiceNumber: invNum,
            bookingId: b.id,
            branchId: b.branchId,
            customerId: b.customerId,
            roomCharges: b.roomCharges,
            extraCharges: b.extraCharges,
            taxAmount: b.taxAmount,
            discountAmount: b.discountAmount,
            totalAmount: b.totalAmount,
            paidAmount: b.paidAmount,
            balanceAmount: b.balanceAmount,
            issuedDate: new Date(),
            notes: 'Thank you for staying at House of Dreams.',
          },
        });
      }

      return b;
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'RECEPTION',
      action: 'GUEST_CHECK_OUT',
      entity: 'Booking',
      entityId: booking.id,
      branchId: booking.branchId,
      details: `Checked out guest for booking ${booking.bookingNumber}. Room ${booking.room.roomNumber} set to CLEANING.`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Checkout complete! Room ${booking.room.roomNumber} is now marked for CLEANING.`,
      data: updatedBooking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Extra Charges (Room service, laundry, extra bed)
export const addExtraCharge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, quantity, unitPrice } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (req.user?.role === 'RECEPTION' && req.user.branchId !== booking.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only add charges for your branch.' });
      return;
    }

    const totalItemAmount = quantity * unitPrice;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.extraCharge.create({
        data: {
          bookingId: id,
          description,
          quantity,
          unitPrice,
          totalAmount: totalItemAmount,
          addedBy: req.user?.name,
        },
      });

      const newExtraCharges = booking.extraCharges + totalItemAmount;
      const taxableSubtotal = Math.max(0, booking.roomCharges + newExtraCharges - booking.discountAmount);
      const newTaxAmount = Math.round(taxableSubtotal * 0.12 * 100) / 100;
      const newTotal = Math.round((taxableSubtotal + newTaxAmount) * 100) / 100;
      const newBalance = Math.max(0, newTotal - booking.paidAmount);

      let newPaymentStatus = booking.paymentStatus;
      if (newBalance > 0 && booking.paidAmount > 0) {
        newPaymentStatus = PaymentStatus.PARTIALLY_PAID;
      } else if (newBalance > 0 && booking.paidAmount === 0) {
        newPaymentStatus = PaymentStatus.UNPAID;
      }

      return await tx.booking.update({
        where: { id },
        data: {
          extraCharges: newExtraCharges,
          taxAmount: newTaxAmount,
          totalAmount: newTotal,
          balanceAmount: newBalance,
          paymentStatus: newPaymentStatus,
        },
        include: {
          charges: true,
          payments: true,
        },
      });
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'STAFF',
      action: 'ADD_EXTRA_CHARGE',
      entity: 'Booking',
      entityId: id,
      branchId: booking.branchId,
      details: `Added charge: ${description} (Qty ${quantity} x ₹${unitPrice} = ₹${totalItemAmount}) to ${booking.bookingNumber}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Extra charge added: ${description} (₹${totalItemAmount}). Booking total updated.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Booking
export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Role validation
    if (req.user?.role === 'CUSTOMER' && booking.customerId !== req.user.userId) {
      res.status(403).json({ success: false, message: 'You can only cancel your own bookings.' });
      return;
    }

    if (req.user?.role === 'RECEPTION' && req.user.branchId !== booking.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only cancel bookings for your branch.' });
      return;
    }

    if (booking.status === BookingStatus.CHECKED_IN || booking.status === BookingStatus.CHECKED_OUT) {
      res.status(400).json({ success: false, message: 'Cannot cancel an active or completed stay.' });
      return;
    }

    // Check cancellation policy for customer: must be >= 48 hours before check-in date
    if (req.user?.role === 'CUSTOMER') {
      const now = new Date();
      const hoursDiff = (booking.checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        res.status(400).json({
          success: false,
          message: 'Cancellations within 24 hours of scheduled check-in cannot be processed online. Please contact the reception desk.',
        });
        return;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
      });

      // Free room if room status was reserved
      if (booking.room.status === RoomStatus.RESERVED) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: RoomStatus.AVAILABLE },
        });
      }

      return b;
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'USER',
      action: 'CANCEL_BOOKING',
      entity: 'Booking',
      entityId: id,
      branchId: booking.branchId,
      details: `Booking ${booking.bookingNumber} was cancelled by ${req.user?.name}.`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Booking cancelled successfully.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Room (Admin / Reception)
export const changeRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newRoomId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (req.user?.role === 'RECEPTION' && req.user.branchId !== booking.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden branch.' });
      return;
    }

    const newRoom = await prisma.room.findUnique({ where: { id: newRoomId } });
    if (!newRoom) {
      res.status(404).json({ success: false, message: 'New room not found' });
      return;
    }

    if (newRoom.branchId !== booking.branchId) {
      res.status(400).json({ success: false, message: 'New room must belong to the same branch.' });
      return;
    }

    // Check overlap for new room
    const conflict = await prisma.booking.findFirst({
      where: {
        roomId: newRoomId,
        id: { not: booking.id },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        AND: [
          { checkInDate: { lt: booking.checkOutDate } },
          { checkOutDate: { gt: booking.checkInDate } },
        ],
      },
    });

    if (conflict) {
      res.status(400).json({ success: false, message: 'The chosen room is already booked for these dates.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { roomId: newRoomId },
      });

      // If checked in, adjust room statuses
      if (booking.status === BookingStatus.CHECKED_IN) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: RoomStatus.CLEANING },
        });
        await tx.room.update({
          where: { id: newRoomId },
          data: { status: RoomStatus.OCCUPIED },
        });
      }
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'STAFF',
      action: 'CHANGE_ROOM',
      entity: 'Booking',
      entityId: id,
      branchId: booking.branchId,
      details: `Moved booking ${booking.bookingNumber} from Room ${booking.room.roomNumber} to Room ${newRoom.roomNumber}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Room changed to Room ${newRoom.roomNumber} successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Bookings (Admin = all branches, Reception = branch only, Customer = own bookings)
export const getAllBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId, status, paymentStatus, search, date } = req.query;

    const where: any = {};

    if (req.user?.role === 'CUSTOMER') {
      where.customerId = req.user.userId;
    } else if (req.user?.role === 'RECEPTION') {
      where.branchId = req.user.branchId;
    } else if (branchId) {
      where.branchId = branchId as string;
    }

    if (status) {
      where.status = status as BookingStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (date) {
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
      where.OR = [
        { checkInDate: { gte: targetDate, lt: nextDay } },
        { checkOutDate: { gte: targetDate, lt: nextDay } },
      ];
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { bookingNumber: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { customer: { email: { contains: q, mode: 'insensitive' } } },
        { customer: { phone: { contains: q, mode: 'insensitive' } } },
        { room: { roomNumber: { contains: q, mode: 'insensitive' } } },
        { guests: { some: { fullName: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        branch: { select: { id: true, name: true, city: true } },
        room: { include: { roomType: true } },
        guests: true,
        charges: true,
        payments: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Booking by ID
export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        branch: true,
        room: { include: { roomType: true, roomAmenities: { include: { amenity: true } } } },
        guests: true,
        charges: { orderBy: { createdAt: 'asc' } },
        payments: {
          include: { collectedBy: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        invoices: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Role check
    if (req.user?.role === 'CUSTOMER' && booking.customerId !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    if (req.user?.role === 'RECEPTION' && req.user.branchId !== booking.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
