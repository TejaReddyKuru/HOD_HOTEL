import { Response } from 'express';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const recordDeskPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const staffId = req.user?.userId;
    if (!staffId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { bookingId, amount, paymentMethod, notes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { branch: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Branch isolation for Reception
    if (req.user?.role === 'RECEPTION' && req.user.branchId !== booking.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only record desk payments for your assigned branch.' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
      return;
    }

    if (amount > booking.balanceAmount + 0.01) {
      res.status(400).json({
        success: false,
        message: `Amount (₹${amount.toLocaleString()}) exceeds the outstanding balance (₹${booking.balanceAmount.toLocaleString()}).`,
      });
      return;
    }

    const branchCode = booking.branch.city.substring(0, 3).toUpperCase();
    const paymentNumber = `PAY-${branchCode}-${Date.now().toString().slice(-6)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record payment
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          bookingId,
          branchId: booking.branchId,
          amount,
          paymentMethod: paymentMethod as PaymentMethod,
          status: 'PAID',
          collectedById: staffId,
          notes: notes || 'Desk payment collected at reception',
        },
        include: {
          collectedBy: { select: { id: true, name: true, email: true } },
        },
      });

      // 2. Update booking paid and balance amounts
      const newPaid = booking.paidAmount + amount;
      const newBalance = Math.max(0, booking.totalAmount - newPaid);

      let newPaymentStatus: PaymentStatus = PaymentStatus.PARTIALLY_PAID;
      if (newBalance === 0) {
        newPaymentStatus = PaymentStatus.PAID;
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus: newPaymentStatus,
        },
      });

      // 3. Update or create invoice
      const invoice = await tx.invoice.findFirst({ where: { bookingId } });
      if (invoice) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaid,
            balanceAmount: newBalance,
          },
        });
      } else {
        const invNumber = `INV-${Date.now().toString().slice(-6)}`;
        await tx.invoice.create({
          data: {
            invoiceNumber: invNumber,
            bookingId: booking.id,
            branchId: booking.branchId,
            customerId: booking.customerId,
            roomCharges: booking.roomCharges,
            extraCharges: booking.extraCharges,
            taxAmount: booking.taxAmount,
            discountAmount: booking.discountAmount,
            totalAmount: booking.totalAmount,
            paidAmount: newPaid,
            balanceAmount: newBalance,
            issuedDate: new Date(),
          },
        });
      }

      return { payment, updatedBooking };
    }, { maxWait: 15000, timeout: 30000 });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'STAFF',
      action: 'RECORD_DESK_PAYMENT',
      entity: 'Payment',
      entityId: result.payment.id,
      branchId: booking.branchId,
      details: `Collected ₹${amount} via ${paymentMethod} for booking ${booking.bookingNumber}. New balance: ₹${result.updatedBooking.balanceAmount}.`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Desk payment of ₹${amount.toLocaleString()} recorded successfully via ${paymentMethod}.`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId, paymentMethod, startDate, endDate } = req.query;

    const where: any = {};

    if (req.user?.role === 'RECEPTION') {
      where.branchId = req.user.branchId;
    } else if (branchId) {
      where.branchId = branchId as string;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod as PaymentMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const eDate = new Date(endDate as string);
        eDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = eDate;
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            totalAmount: true,
            paidAmount: true,
            balanceAmount: true,
            customer: { select: { id: true, name: true, email: true, phone: true } },
            room: { select: { roomNumber: true } },
          },
        },
        branch: { select: { id: true, name: true, city: true } },
        collectedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
