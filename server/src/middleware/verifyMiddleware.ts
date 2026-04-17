import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './authMiddleware';



export const requireVerified = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.user.role === 'MERCHANT') {
      const merchant = await prisma.merchant.findUnique({
        where: { userId: req.user.id }
      });
      if (!merchant || !merchant.isVerified) {
        return res.status(403).json({ error: 'Merchant account not verified' });
      }
    } else if (req.user.role === 'NONPROFIT') {
      const nonprofit = await prisma.nonprofit.findUnique({
        where: { userId: req.user.id }
      });
      if (!nonprofit || !nonprofit.isVerified) {
        return res.status(403).json({ error: 'Nonprofit account not verified' });
      }
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Verification check failed' });
  }
};
