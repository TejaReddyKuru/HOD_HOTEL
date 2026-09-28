import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getAllSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.hotelSetting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({ success: true, data: settings, map: settingsMap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSetting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await prisma.hotelSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'UPDATE_SETTING',
      entity: 'HotelSetting',
      entityId: key,
      details: `Updated setting ${key} = ${value}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Setting saved', data: setting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
