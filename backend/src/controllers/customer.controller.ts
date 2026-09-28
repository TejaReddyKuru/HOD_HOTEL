import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getAllCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const where: any = { role: 'CUSTOMER' };
    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        address: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            paidAmount: true,
            checkInDate: true,
            checkOutDate: true,
            branch: { select: { name: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = customers.map((c) => {
      const totalBookings = c.bookings.length;
      const completedStays = c.bookings.filter((b) => b.status === 'CHECKED_OUT').length;
      const cancelledBookings = c.bookings.filter((b) => b.status === 'CANCELLED').length;
      const totalSpending = c.bookings
        .filter((b) => b.status === 'CHECKED_OUT' || b.status === 'CHECKED_IN')
        .reduce((sum, b) => sum + b.paidAmount, 0);

      const pastStays = c.bookings
        .filter((b) => b.status === 'CHECKED_OUT')
        .sort((a, b) => new Date(b.checkOutDate).getTime() - new Date(a.checkOutDate).getTime());

      const lastStay = pastStays.length > 0 ? pastStays[0].checkOutDate : null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        address: c.address,
        createdAt: c.createdAt,
        totalBookings,
        completedStays,
        cancelledBookings,
        totalSpending,
        lastStay,
        bookings: c.bookings,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Customers can only view their own profile
    if (req.user?.role === 'CUSTOMER' && req.user.userId !== id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
        bookings: {
          include: {
            room: { include: { roomType: true } },
            branch: { select: { id: true, name: true, city: true } },
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, phone, address } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        status: true,
      },
    });

    await createAuditLog({
      userId,
      userName: updated.name,
      role: req.user?.role || 'USER',
      action: 'UPDATE_PROFILE',
      entity: 'User',
      entityId: userId,
      details: `Profile updated for ${updated.email}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
