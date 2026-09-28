import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, address } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        address: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    createAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      role: 'CUSTOMER',
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: newUser.id,
      details: `Customer registered account: ${newUser.email}`,
      ipAddress: req.ip,
    }).catch((err) => console.error('Registration audit log error:', err));

    res.status(201).json({
      success: true,
      message: 'Welcome to House of Dreams! Your account has been registered successfully.',
      data: {
        token,
        user: newUser,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact hotel management.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email address or password.' });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      name: user.name,
    });

    // Non-blocking background audit log to eliminate login response delay
    createAuditLog({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      branchId: user.branchId || undefined,
      details: `${user.role} logged in: ${user.email}`,
      ipAddress: req.ip,
    }).catch((err) => console.error('Background audit log error:', err));

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          branchId: user.branchId,
          branch: user.branch,
          address: user.address,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        branchId: true,
        status: true,
        address: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            phone: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
