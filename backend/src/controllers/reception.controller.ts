import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getAllReceptionStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: 'RECEPTION' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        branchId: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        _count: {
          select: {
            checkIns: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: staff });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReceptionStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, branchId } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      res.status(400).json({ success: false, message: 'Specified branch not found.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const staff = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role: 'RECEPTION',
        status: 'ACTIVE',
        branchId,
      },
      include: {
        branch: true,
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'CREATE_RECEPTION_STAFF',
      entity: 'User',
      entityId: staff.id,
      branchId,
      details: `Created receptionist account: ${staff.name} (${staff.email}) assigned to ${branch.name}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Receptionist account for ${staff.name} created and assigned to ${branch.name}.`,
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
        branch: staff.branch,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReceptionStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, branchId, status, password } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;
    if (branchId) updateData.branchId = branchId;
    if (status) updateData.status = status;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { branch: true },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'UPDATE_RECEPTION_STAFF',
      entity: 'User',
      entityId: id,
      branchId: updated.branchId || undefined,
      details: `Updated reception account: ${updated.email}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Reception staff profile updated successfully.',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        status: updated.status,
        branch: updated.branch,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
