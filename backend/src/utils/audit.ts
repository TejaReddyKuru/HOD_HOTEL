import prisma from '../config/prisma';

export interface AuditLogParams {
  userId?: string;
  userName?: string;
  role: string;
  action: string;
  entity: string;
  entityId?: string;
  branchId?: string;
  details?: string;
  ipAddress?: string;
}

export const createAuditLog = async (params: AuditLogParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        role: params.role,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        branchId: params.branchId,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
