import { Request, Response } from 'express';
import { BookingStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, includeHidden } = req.query;

    const where: any = {};
    if (branchId) where.branchId = branchId as string;
    if (includeHidden !== 'true') where.isHidden = false;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true } },
        branch: { select: { id: true, name: true, city: true } },
        room: { select: { roomNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    const { branchId, roomId, rating, comment } = req.body;

    if (!customerId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // RULE 9: Verify that customer has at least ONE completed stay (CHECKED_OUT) at this branch
    const completedStay = await prisma.booking.findFirst({
      where: {
        customerId,
        branchId,
        status: BookingStatus.CHECKED_OUT,
      },
    });

    if (!completedStay) {
      res.status(403).json({
        success: false,
        message: 'Only guests who have completed a stay at this branch are eligible to submit a verified review.',
      });
      return;
    }

    const review = await prisma.review.create({
      data: {
        customerId,
        branchId,
        roomId: roomId || null,
        rating,
        comment,
      },
      include: {
        customer: { select: { name: true } },
        branch: { select: { name: true } },
      },
    });

    await createAuditLog({
      userId: customerId,
      userName: req.user?.name,
      role: 'CUSTOMER',
      action: 'SUBMIT_REVIEW',
      entity: 'Review',
      entityId: review.id,
      branchId,
      details: `Customer submitted a ${rating}-star review for ${review.branch.name}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your heartfelt review has been shared with House of Dreams.',
      data: review,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleHideReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isHidden: !review.isHidden },
    });

    res.json({
      success: true,
      message: `Review is now ${updated.isHidden ? 'hidden from public view' : 'visible publicly'}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
