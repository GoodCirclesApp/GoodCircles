import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CreditService } from '../services/creditService';
import { prisma } from '../lib/prisma';
import { z } from 'zod';



export const getCreditBalance = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const balance = await CreditService.getBalance(req.user.id);
    const expiringSoon = await CreditService.getExpiringSoon(req.user.id);
    res.json({ balance, expiringSoon });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCreditHistory = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const history = await CreditService.getHistory(req.user.id);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCreditEligibility = async (req: AuthRequest, res: Response) => {
  try {
    const isEligible = await CreditService.isSystemActivated();
    res.json({ isEligible });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSystemStatus = async (req: AuthRequest, res: Response) => {
  try {
    const isSystemActive = await CreditService.isSystemActivated();
    const velocityMetrics = await CreditService.getVelocityMetrics();
    
    // Get active categories with credit acceptance unlocked
    const activeCategories = await prisma.coopActivationTracking.findMany({
      where: { thresholdMet: true, coopType: 'CATEGORY_SPECIFIC' },
      select: { category: true, regionId: true },
      distinct: ['category', 'regionId']
    });

    // Overall co-op progress
    const latestCrossCategory = await prisma.coopActivationTracking.findFirst({
      where: { coopType: 'CROSS_CATEGORY' },
      orderBy: { checkDate: 'desc' }
    });

    res.json({
      creditEarningActive: isSystemActive,
      crossCategoryProgress: latestCrossCategory ? {
        merchantCount: latestCrossCategory.merchantCount,
        thresholdRequired: latestCrossCategory.thresholdRequired,
        progressPct: latestCrossCategory.progressPct,
        thresholdMet: latestCrossCategory.thresholdMet
      } : null,
      categoriesWithCreditAcceptance: activeCategories,
      circulation: {
        overallVelocity: velocityMetrics.overallVelocity,
        maxCirculation: velocityMetrics.maxCirculation,
        consumerToMerchant: velocityMetrics.consumerToMerchant,
        merchantToMerchant: velocityMetrics.merchantToMerchant,
        activeBalance: velocityMetrics.supply.activeBalance,
        uniqueHolders: velocityMetrics.uniqueHolders,
        totalTransferVolume: velocityMetrics.transfers.totalVolume
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMerchantEligibility = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!merchant) return res.status(404).json({ error: 'Merchant account not found' });
    
    const eligibility = await CreditService.isMerchantEligible(merchant.id);
    res.json(eligibility);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const transferCredits = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const schema = z.object({
    toUserId: z.string().uuid(),
    amount: z.number().positive()
  });

  try {
    const { toUserId, amount } = schema.parse(req.body);
    const transfer = await CreditService.transferCredits(req.user.id, toUserId, amount);
    res.json(transfer);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(400).json({ error: err.message });
  }
};

export const getVelocity = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Forbidden' });
  
  try {
    const metrics = await CreditService.getVelocityMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDiscountMode = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const schema = z.object({
    discountMode: z.enum(['PRICE_REDUCTION', 'PLATFORM_CREDITS'])
  });

  try {
    const { discountMode } = schema.parse(req.body);

    // If switching to PLATFORM_CREDITS, check eligibility
    if (discountMode === 'PLATFORM_CREDITS') {
      const isEligible = await CreditService.isSystemActivated();
      if (!isEligible) {
        return res.status(403).json({ error: 'Platform credits are not yet available. Threshold not met.' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { discountMode }
    });

    res.json({ discountMode: user.discountMode });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};
