import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { NettingService } from '../services/nettingService';
import { prisma } from '../lib/prisma';



export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const status = await NettingService.getStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await NettingService.getHistory();
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSavings = async (req: AuthRequest, res: Response) => {
  try {
    const savings = await NettingService.getSavings();
    res.json(savings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getActivationHistory = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  try {
    const history = await NettingService.getActivationHistory();
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const triggerEvaluation = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  try {
    const result = await NettingService.evaluateTriggers();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const runCycle = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  try {
    const result = await NettingService.runNettingCycle();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCompliance = async (req: AuthRequest, res: Response) => {
  const merchantId = req.params.merchantId;
  const yearQuery = req.query.year;
  const year = parseInt(Array.isArray(yearQuery) ? (yearQuery[0] as string) : (yearQuery as string)) || new Date().getFullYear();

  try {
    // Only the merchant themselves or an admin can see this
    const userMerchant = await prisma.merchant.findUnique({ where: { userId: req.user?.id } });
    if (req.user?.role !== 'ADMIN' && userMerchant?.id !== merchantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const data = await NettingService.getComplianceData(merchantId as string, year);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
