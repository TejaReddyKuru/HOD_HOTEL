import { Request, Response } from 'express';
import { RoomStatus, BookingStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const searchAvailableRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, checkInDate, checkOutDate, guests, roomTypeId } = req.query;

    if (!branchId || !checkInDate || !checkOutDate) {
      res.status(400).json({
        success: false,
        message: 'Please provide branchId, checkInDate, and checkOutDate to check availability.',
      });
      return;
    }

    const checkIn = new Date(checkInDate as string);
    const checkOut = new Date(checkOutDate as string);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid check-in or check-out date format.' });
      return;
    }

    if (checkIn >= checkOut) {
      res.status(400).json({ success: false, message: 'Check-out date must be strictly after check-in date.' });
      return;
    }

    const guestCount = guests ? parseInt(guests as string, 10) : 1;

    // 1. Find all bookings that overlap with requested range and are active
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        branchId: branchId as string,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        AND: [
          { checkInDate: { lt: checkOut } },
          { checkOutDate: { gt: checkIn } },
        ],
      },
      select: { roomId: true },
    });

    const bookedRoomIds = overlappingBookings.map((b) => b.roomId);

    // 2. Query available rooms in this branch
    const whereRoom: any = {
      branchId: branchId as string,
      status: { notIn: [RoomStatus.MAINTENANCE] },
      id: { notIn: bookedRoomIds },
      capacity: { gte: guestCount },
    };

    if (roomTypeId) {
      whereRoom.roomTypeId = roomTypeId as string;
    }

    const availableRooms = await prisma.room.findMany({
      where: whereRoom,
      include: {
        roomType: true,
        branch: {
          select: { id: true, name: true, city: true, checkInTime: true, checkOutTime: true },
        },
        roomAmenities: {
          include: { amenity: true },
        },
      },
      orderBy: { pricePerNight: 'asc' },
    });

    res.json({
      success: true,
      data: {
        totalAvailable: availableRooms.length,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights: Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
        rooms: availableRooms,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRooms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId, status, roomTypeId, floor } = req.query;

    const where: any = {};

    // Reception isolation: enforce their branchId
    if (req.user?.role === 'RECEPTION') {
      where.branchId = req.user.branchId;
    } else if (branchId) {
      where.branchId = branchId as string;
    }

    if (status) {
      where.status = status as RoomStatus;
    }

    if (roomTypeId) {
      where.roomTypeId = roomTypeId as string;
    }

    if (floor) {
      where.floor = parseInt(floor as string, 10);
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, city: true } },
        roomType: true,
        roomAmenities: { include: { amenity: true } },
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
          },
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            customer: { select: { name: true, phone: true } },
            checkInDate: true,
            checkOutDate: true,
          },
          orderBy: { checkInDate: 'asc' },
          take: 1,
        },
      },
      orderBy: [{ branchId: 'asc' }, { floor: 'asc' }, { roomNumber: 'asc' }],
    });

    res.json({ success: true, data: rooms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        branch: true,
        roomType: true,
        roomAmenities: { include: { amenity: true } },
        reviews: {
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.json({ success: true, data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;

    const existing = await prisma.room.findUnique({
      where: {
        branchId_roomNumber: {
          branchId: data.branchId,
          roomNumber: data.roomNumber,
        },
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: `Room number ${data.roomNumber} already exists in this branch.`,
      });
      return;
    }

    const room = await prisma.room.create({
      data: {
        branchId: data.branchId,
        roomTypeId: data.roomTypeId,
        roomNumber: data.roomNumber,
        floor: data.floor,
        capacity: data.capacity,
        pricePerNight: data.pricePerNight,
        description: data.description,
        images: Array.isArray(data.images) ? JSON.stringify(data.images) : '[]',
        status: data.status || RoomStatus.AVAILABLE,
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'CREATE_ROOM',
      entity: 'Room',
      entityId: room.id,
      branchId: room.branchId,
      details: `Created room ${room.roomNumber} (Floor ${room.floor}, ₹${room.pricePerNight}/night)`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Room created successfully', data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const payload: any = { ...data };
    if (data.images && Array.isArray(data.images)) {
      payload.images = JSON.stringify(data.images);
    }

    const updated = await prisma.room.update({
      where: { id },
      data: payload,
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'UPDATE_ROOM',
      entity: 'Room',
      entityId: id,
      branchId: updated.branchId,
      details: `Updated room ${updated.roomNumber} attributes`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Room updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoomStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    // Branch isolation for Reception
    if (req.user?.role === 'RECEPTION' && req.user.branchId !== room.branchId) {
      res.status(403).json({ success: false, message: 'Forbidden: You can only update rooms in your assigned branch.' });
      return;
    }

    const updated = await prisma.room.update({
      where: { id },
      data: { status: status as RoomStatus },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: req.user?.role || 'STAFF',
      action: 'UPDATE_ROOM_STATUS',
      entity: 'Room',
      entityId: room.id,
      branchId: room.branchId,
      details: `Room ${room.roomNumber} status changed from ${room.status} to ${status}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Room ${room.roomNumber} status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
            },
          },
        },
      },
    });

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    if (room._count.bookings > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete room with ${room._count.bookings} active reservations. Please change or complete existing bookings first.`,
      });
      return;
    }

    await prisma.room.delete({ where: { id } });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'DELETE_ROOM',
      entity: 'Room',
      entityId: id,
      branchId: room.branchId,
      details: `Deleted Room ${room.roomNumber}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Room ${room.roomNumber} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

