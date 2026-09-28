import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getAllBranches = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const statusFilter = req.query.status as string;

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.status = 'ACTIVE';
    } else if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const branches = await prisma.branch.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            rooms: true,
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: branches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBranchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            roomType: true,
            roomAmenities: {
              include: {
                amenity: true,
              },
            },
          },
        },
        reviews: {
          where: { isHidden: false },
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            rooms: true,
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!branch) {
      res.status(404).json({ success: false, message: 'Branch not found' });
      return;
    }

    res.json({ success: true, data: branch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const imagesJson = Array.isArray(data.images) ? JSON.stringify(data.images) : '[]';

    const branch = await prisma.branch.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
        mapsUrl: data.mapsUrl,
        checkInTime: data.checkInTime || '14:00',
        checkOutTime: data.checkOutTime || '11:00',
        featuredImage: data.featuredImage || (Array.isArray(data.images) && data.images[0]) || null,
        images: imagesJson,
        status: data.status || 'ACTIVE',
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'CREATE_BRANCH',
      entity: 'Branch',
      entityId: branch.id,
      branchId: branch.id,
      details: `Created new hotel branch: ${branch.name}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Branch created successfully', data: branch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatePayload: any = { ...data };
    if (data.images && Array.isArray(data.images)) {
      updatePayload.images = JSON.stringify(data.images);
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: updatePayload,
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'UPDATE_BRANCH',
      entity: 'Branch',
      entityId: branch.id,
      branchId: branch.id,
      details: `Updated branch details for ${branch.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Branch updated successfully', data: branch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBranchStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      res.status(404).json({ success: false, message: 'Branch not found' });
      return;
    }

    const newStatus = branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const updated = await prisma.branch.update({
      where: { id },
      data: { status: newStatus },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'TOGGLE_BRANCH_STATUS',
      entity: 'Branch',
      entityId: branch.id,
      branchId: branch.id,
      details: `Changed branch status from ${branch.status} to ${newStatus}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Branch successfully ${newStatus === 'ACTIVE' ? 'reactivated' : 'deactivated'}. Historical bookings preserved.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const branch = await prisma.branch.findUnique({
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

    if (!branch) {
      res.status(404).json({ success: false, message: 'Branch not found' });
      return;
    }

    if (branch._count.bookings > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete branch with ${branch._count.bookings} active reservations. Please cancel or check out existing stays first, or deactivate the branch instead.`,
      });
      return;
    }

    // Delete associated rooms and branch
    await prisma.$transaction(async (tx) => {
      await tx.room.deleteMany({ where: { branchId: id } });
      await tx.user.updateMany({ where: { branchId: id }, data: { branchId: null } });
      await tx.branch.delete({ where: { id } });
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'DELETE_BRANCH',
      entity: 'Branch',
      entityId: id,
      details: `Deleted hotel branch: ${branch.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Branch ${branch.name} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

