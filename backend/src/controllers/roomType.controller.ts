import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getAllRoomTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        _count: {
          select: { rooms: true },
        },
      },
      orderBy: { basePrice: 'asc' },
    });

    res.json({ success: true, data: roomTypes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roomType = await prisma.roomType.findUnique({
      where: { id },
      include: { rooms: true },
    });

    if (!roomType) {
      res.status(404).json({ success: false, message: 'Room type not found' });
      return;
    }

    res.json({ success: true, data: roomType });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoomType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const roomType = await prisma.roomType.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        basePrice: data.basePrice,
        maxOccupancy: data.maxOccupancy,
        bedType: data.bedType,
        amenities: Array.isArray(data.amenities) ? JSON.stringify(data.amenities) : '[]',
        images: Array.isArray(data.images) ? JSON.stringify(data.images) : '[]',
        status: data.status || 'ACTIVE',
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'CREATE_ROOM_TYPE',
      entity: 'RoomType',
      entityId: roomType.id,
      details: `Created room category: ${roomType.name} (Base ₹${roomType.basePrice})`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Room type created successfully', data: roomType });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoomType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const payload: any = { ...data };
    if (data.amenities && Array.isArray(data.amenities)) {
      payload.amenities = JSON.stringify(data.amenities);
    }
    if (data.images && Array.isArray(data.images)) {
      payload.images = JSON.stringify(data.images);
    }

    const updated = await prisma.roomType.update({
      where: { id },
      data: payload,
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'UPDATE_ROOM_TYPE',
      entity: 'RoomType',
      entityId: id,
      details: `Updated room type: ${updated.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Room type updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoomType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const roomCount = await prisma.room.count({ where: { roomTypeId: id } });
    if (roomCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete room type: It is currently assigned to ${roomCount} active room(s).`,
      });
      return;
    }

    await prisma.roomType.delete({ where: { id } });

    res.json({ success: true, message: 'Room type deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
