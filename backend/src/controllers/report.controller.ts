import { Response } from 'express';
import { BookingStatus, RoomStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId } = req.query;

    const branchFilter: any = {};
    if (req.user?.role === 'RECEPTION') {
      branchFilter.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'ALL') {
      branchFilter.branchId = branchId as string;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const isReception = req.user?.role === 'RECEPTION';

    // Execute all queries in parallel via Promise.all to eliminate sequential round-trip latency
    const [
      totalBranches,
      roomCounts,
      todayCheckIns,
      todayCheckOuts,
      todayBookings,
      todayPayments,
      monthlyPayments,
      outstandingBookings,
      paymentMethodAggs,
      bookingStatusAggs,
      sevenDayTrend,
      activeBranches,
    ] = await Promise.all([
      // 1. Total branches
      prisma.branch.count({
        where: isReception ? { id: req.user?.branchId || '' } : {},
      }),

      // 2. Room status breakdown in 1 single grouped query
      prisma.room.groupBy({
        by: ['status'],
        where: branchFilter,
        _count: { _all: true },
      }),

      // 3. Today's Check-ins
      prisma.booking.count({
        where: {
          ...branchFilter,
          checkInDate: { gte: startOfToday, lte: endOfToday },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        },
      }),

      // 4. Today's Check-outs
      prisma.booking.count({
        where: {
          ...branchFilter,
          checkOutDate: { gte: startOfToday, lte: endOfToday },
          status: { in: [BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] },
        },
      }),

      // 5. Today's Bookings created
      prisma.booking.count({
        where: {
          ...branchFilter,
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
      }),

      // 6. Today's Desk Revenue collected
      prisma.payment.aggregate({
        where: {
          ...branchFilter,
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
        _sum: { amount: true },
      }),

      // 7. Monthly Desk Revenue
      prisma.payment.aggregate({
        where: {
          ...branchFilter,
          createdAt: { gte: startOfMonth, lte: endOfToday },
        },
        _sum: { amount: true },
      }),

      // 8. Outstanding Payments across active stays
      prisma.booking.aggregate({
        where: {
          ...branchFilter,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
          balanceAmount: { gt: 0 },
        },
        _sum: { balanceAmount: true },
      }),

      // 9. Payment Methods in 1 single query
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: branchFilter,
        _sum: { amount: true },
      }),

      // 10. Booking Status counts in 1 single query
      prisma.booking.groupBy({
        by: ['status'],
        where: branchFilter,
        _count: { _all: true },
      }),

      // 11. 7-Day Revenue Trend (Parallelized for Admin)
      !isReception
        ? Promise.all(
            Array.from({ length: 7 }, (_, idx) => {
              const i = 6 - idx;
              const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
              const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
              const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
              return prisma.payment
                .aggregate({
                  where: { ...branchFilter, createdAt: { gte: dStart, lte: dEnd } },
                  _sum: { amount: true },
                })
                .then((agg) => ({
                  date: dStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  revenue: agg._sum.amount || 0,
                }));
            })
          )
        : Promise.resolve([]),

      // 12. Active Branches with room statuses (Admin only)
      !isReception
        ? prisma.branch.findMany({
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              name: true,
              city: true,
              rooms: { select: { id: true, status: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    // Parse Room Counts
    let totalRooms = 0;
    let availableRooms = 0;
    let occupiedRooms = 0;
    let cleaningRooms = 0;

    for (const r of roomCounts) {
      totalRooms += r._count._all;
      if (r.status === RoomStatus.AVAILABLE) availableRooms = r._count._all;
      if (r.status === RoomStatus.OCCUPIED) occupiedRooms = r._count._all;
      if (r.status === RoomStatus.CLEANING) cleaningRooms = r._count._all;
    }

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const todayRevenue = todayPayments._sum.amount || 0;
    const monthlyRevenue = monthlyPayments._sum.amount || 0;
    const outstandingPayments = outstandingBookings._sum.balanceAmount || 0;

    // Parse Payment Methods
    const methodBreakdown: Record<string, number> = { CASH: 0, CARD: 0, UPI: 0, OTHER: 0 };
    for (const pm of paymentMethodAggs) {
      methodBreakdown[pm.paymentMethod] = pm._sum.amount || 0;
    }

    // Parse Booking Statuses
    const statusCounts: Record<string, number> = {
      confirmed: 0,
      checkedIn: 0,
      checkedOut: 0,
      cancelled: 0,
      noShow: 0,
    };
    for (const bs of bookingStatusAggs) {
      if (bs.status === BookingStatus.CONFIRMED) statusCounts.confirmed = bs._count._all;
      if (bs.status === BookingStatus.CHECKED_IN) statusCounts.checkedIn = bs._count._all;
      if (bs.status === BookingStatus.CHECKED_OUT) statusCounts.checkedOut = bs._count._all;
      if (bs.status === BookingStatus.CANCELLED) statusCounts.cancelled = bs._count._all;
      if (bs.status === BookingStatus.NO_SHOW) statusCounts.noShow = bs._count._all;
    }

    // Parse Branch Occupancy (for Admin)
    const branchOccupancy = activeBranches.map((b) => {
      const totalR = b.rooms.length;
      const occR = b.rooms.filter((r) => r.status === 'OCCUPIED').length;
      const rate = totalR > 0 ? Math.round((occR / totalR) * 100) : 0;
      return {
        id: b.id,
        name: b.name,
        city: b.city,
        totalRooms: totalR,
        occupiedRooms: occR,
        occupancyRate: rate,
      };
    });

    res.json({
      success: true,
      data: {
        cards: {
          totalBranches,
          totalRooms,
          availableRooms,
          occupiedRooms,
          cleaningRooms,
          occupancyRate,
          todayCheckIns,
          todayCheckOuts,
          todayBookings,
          todayRevenue,
          monthlyRevenue,
          outstandingPayments,
        },
        methodBreakdown,
        statusCounts,
        sevenDayTrend,
        branchOccupancy,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId, timeframe = 'monthly' } = req.query;

    const where: any = {};
    if (req.user?.role === 'RECEPTION') {
      where.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'ALL') {
      where.branchId = branchId as string;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        branch: { select: { name: true, city: true } },
        collectedBy: { select: { name: true } },
        booking: { select: { bookingNumber: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

    res.json({
      success: true,
      data: {
        timeframe,
        totalCollected,
        paymentCount: payments.length,
        payments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReportsCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type = 'bookings', branchId } = req.query;

    const where: any = {};
    if (req.user?.role === 'RECEPTION') {
      where.branchId = req.user.branchId;
    } else if (branchId && branchId !== 'ALL') {
      where.branchId = branchId as string;
    }

    if (type === 'bookings') {
      const bookings = await prisma.booking.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          branch: { select: { name: true } },
          room: { select: { roomNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      let csv = 'Booking Number,Customer Name,Email,Phone,Branch,Room,Check In,Check Out,Nights,Total Amount,Paid Amount,Balance,Status,Payment Status\n';
      bookings.forEach((b) => {
        csv += `"${b.bookingNumber}","${b.customer.name}","${b.customer.email}","${b.customer.phone || ''}","${b.branch.name}","${b.room.roomNumber}","${b.checkInDate.toISOString().split('T')[0]}","${b.checkOutDate.toISOString().split('T')[0]}",${b.numberOfNights},${b.totalAmount},${b.paidAmount},${b.balanceAmount},"${b.status}","${b.paymentStatus}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=house-of-dreams-bookings-${Date.now()}.csv`);
      res.status(200).send(csv);
      return;
    }

    if (type === 'payments') {
      const payments = await prisma.payment.findMany({
        where,
        include: {
          branch: { select: { name: true } },
          collectedBy: { select: { name: true } },
          booking: { select: { bookingNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      let csv = 'Payment Number,Booking Reference,Branch,Amount,Method,Status,Collected By,Date\n';
      payments.forEach((p) => {
        csv += `"${p.paymentNumber}","${p.booking.bookingNumber}","${p.branch.name}",${p.amount},"${p.paymentMethod}","${p.status}","${p.collectedBy.name}","${p.createdAt.toISOString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=house-of-dreams-payments-${Date.now()}.csv`);
      res.status(200).send(csv);
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid report type for export' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
