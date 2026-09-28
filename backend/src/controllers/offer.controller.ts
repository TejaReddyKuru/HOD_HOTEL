import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, branchId, amount } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { branch: { select: { name: true } } },
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid coupon code.' });
      return;
    }

    const now = new Date();
    if (coupon.status !== 'ACTIVE' || coupon.startDate > now || coupon.endDate < now) {
      res.status(400).json({ success: false, message: 'This coupon has expired or is inactive.' });
      return;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'This coupon has reached its maximum redemption limit.' });
      return;
    }

    if (coupon.branchId && branchId && coupon.branchId !== branchId) {
      res.status(400).json({
        success: false,
        message: `This coupon is only valid for ${coupon.branch?.name}.`,
      });
      return;
    }

    const bookingAmount = parseFloat(amount) || 0;
    if (bookingAmount < coupon.minBookingAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum reservation amount of ₹${coupon.minBookingAmount.toLocaleString()} required to use this coupon.`,
      });
      return;
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      calculatedDiscount = (bookingAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    } else {
      calculatedDiscount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: Math.min(calculatedDiscount, bookingAmount),
        description: coupon.description,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      include: { branch: { select: { id: true, name: true, city: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOffer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minBookingAmount: data.minBookingAmount || 0,
        maxDiscount: data.maxDiscount || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        branchId: data.branchId || null,
        usageLimit: data.usageLimit || 100,
        status: data.status || 'ACTIVE',
      },
    });

    await createAuditLog({
      userId: req.user?.userId,
      userName: req.user?.name,
      role: 'ADMIN',
      action: 'CREATE_OFFER',
      entity: 'Coupon',
      entityId: coupon.id,
      details: `Created offer coupon: ${coupon.code}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Offer created', data: coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOffer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const payload: any = { ...data };
    if (data.startDate) payload.startDate = new Date(data.startDate);
    if (data.endDate) payload.endDate = new Date(data.endDate);
    if (data.code) payload.code = data.code.toUpperCase();

    const updated = await prisma.coupon.update({
      where: { id },
      data: payload,
    });

    res.json({ success: true, message: 'Offer updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOffer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ success: true, message: 'Offer deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
