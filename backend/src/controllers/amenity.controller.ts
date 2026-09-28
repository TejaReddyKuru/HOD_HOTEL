import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getAllAmenities = async (req: Request, res: Response): Promise<void> => {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: amenities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAmenity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const amenity = await prisma.amenity.create({ data });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'CREATE_AMENITY',
      entity: 'Amenity',
      entityId: amenity.id,
      details: `Created amenity: ${amenity.name}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Amenity created successfully', data: amenity });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAmenity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.amenity.update({
      where: { id },
      data: req.body,
    });

    res.json({ success: true, message: 'Amenity updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAmenity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.amenity.delete({ where: { id } });
    res.json({ success: true, message: 'Amenity deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
