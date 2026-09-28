import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyToken, TokenPayload } from '../utils/jwt';
import prisma from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    // Verify user is still active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, branchId: true, status: true, name: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({ success: false, message: 'Account is inactive or not found.' });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Your role is ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};

export const requireBranchAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  // Admin has access to all branches
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }

  // Reception only has access to their assigned branch
  if (req.user.role === UserRole.RECEPTION) {
    const requestedBranchId =
      req.params.branchId || req.body.branchId || (req.query.branchId as string);

    if (requestedBranchId && req.user.branchId !== requestedBranchId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Reception staff can only manage their assigned hotel branch.',
      });
      return;
    }
    return next();
  }

  res.status(403).json({ success: false, message: 'Unauthorized branch operation.' });
};
