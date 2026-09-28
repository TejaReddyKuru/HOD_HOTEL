import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId, action, entity, limit = 50 } = req.query;

    const where: any = {};
    if (branchId) where.branchId = branchId as string;
    if (action) where.action = action as string;
    if (entity) where.entity = entity as string;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string, 10),
    });

    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
