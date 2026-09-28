import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getInvoiceByBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        branch: true,
        room: { include: { roomType: true } },
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
        guests: true,
        charges: { orderBy: { createdAt: 'asc' } },
        payments: {
          include: { collectedBy: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        },
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

    // Find or create invoice record
    let invoice = await prisma.invoice.findFirst({
      where: { bookingId },
    });

    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          bookingId: booking.id,
          branchId: booking.branchId,
          customerId: booking.customerId,
          roomCharges: booking.roomCharges,
          extraCharges: booking.extraCharges,
          taxAmount: booking.taxAmount,
          discountAmount: booking.discountAmount,
          totalAmount: booking.totalAmount,
          paidAmount: booking.paidAmount,
          balanceAmount: booking.balanceAmount,
          issuedDate: new Date(),
          notes: 'Thank you for staying at House of Dreams.',
        },
      });
    }

    res.json({
      success: true,
      data: {
        invoice,
        booking,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
