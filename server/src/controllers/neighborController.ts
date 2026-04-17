import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';



export const getElectedNonprofit = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        electedNonprofit: {
          select: { id: true, orgName: true, missionStatement: true }
        }
      }
    });
    res.json(user?.electedNonprofit || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const setElectedNonprofit = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { nonprofitId } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { electedNonprofitId: nonprofitId },
      include: { electedNonprofit: true }
    });
    res.json(user.electedNonprofit);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getImpactData = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const transactions = await prisma.transaction.findMany({
      where: { neighborId: req.user.id },
      include: { productService: true },
      orderBy: { createdAt: 'asc' },
    });

    // Savings vs retail = sum of discountAmount (actual price reduction received)
    const totalSavedVsRetail = transactions.reduce(
      (acc, t) => acc + Number(t.discountAmount), 0
    );

    // Nonprofit contributions triggered by this neighbor's purchases
    const totalNonprofitContributed = transactions.reduce(
      (acc, t) => acc + Number(t.nonprofitShare), 0
    );

    // Capital kept circulating internally (INTERNAL payment, money stayed in ecosystem)
    const internalTransactions = transactions.filter(t => t.paymentMethod === 'INTERNAL');
    const capitalKeptInternal = internalTransactions.reduce(
      (acc, t) => acc + Number(t.grossAmount), 0
    );

    // Capital velocity score: average number of days between purchases
    // Higher frequency = faster velocity = more community impact per dollar
    let velocityScore = 0;
    if (transactions.length >= 2) {
      const first = transactions[0].createdAt.getTime();
      const last = transactions[transactions.length - 1].createdAt.getTime();
      const daySpan = (last - first) / (1000 * 60 * 60 * 24) || 1;
      const txPerDay = transactions.length / daySpan;
      // Normalize to a 0–100 score (10+ tx/day = 100)
      velocityScore = Math.min(100, Math.round(txPerDay * 10));
    } else if (transactions.length === 1) {
      velocityScore = 10;
    }

    const categories = transactions.map(t => t.productService.category);
    const categoryCounts: Record<string, number> = {};
    categories.forEach(c => { categoryCounts[c] = (categoryCounts[c] ?? 0) + 1; });
    const favoriteCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Community fund contributions (waived discounts)
    const waivedTotal = transactions
      .filter(t => t.discountWaived)
      .reduce((acc, t) => acc + Number(t.discountAmount), 0);

    res.json({
      totalSavedVsRetail,
      totalNonprofitContributed,
      capitalKeptInternal,
      waivedToInitiatives: waivedTotal,
      velocityScore,
      transactionCount: transactions.length,
      internalTransactionCount: internalTransactions.length,
      favoriteCategories,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const generateQrToken = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { QrCheckoutService } = await import('../services/qrCheckoutService');
    const result = await QrCheckoutService.generateToken(req.user.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listNonprofits = async (req: Request, res: Response) => {
  try {
    const nonprofits = await prisma.nonprofit.findMany({
      where: { isVerified: true },
      include: {
        _count: {
          select: { transactions: true }
        },
        transactions: {
          select: { nonprofitShare: true }
        }
      }
    });

    const formatted = nonprofits.map(n => {
      const totalFunding = n.transactions.reduce((acc, t) => acc + Number(t.nonprofitShare), 0);
      return {
        id: n.id,
        orgName: n.orgName,
        missionStatement: n.missionStatement,
        totalFunding,
        transactionCount: n._count.transactions
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const initiativeSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  fundingGoal: z.number().positive(),
  nonprofitId: z.string().optional(),
});

export const createInitiative = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const data = initiativeSchema.parse(req.body);
    const initiative = await prisma.communityInitiative.create({
      data: {
        ...data,
        createdBy: req.user.id,
      }
    });
    res.status(201).json(initiative);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const waiveDiscount = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const schema = z.object({
    initiativeId: z.string(),
    amount: z.number().positive()
  });

  try {
    const { initiativeId, amount } = schema.parse(req.body);
    
    // In a real app, we'd deduct from the user's pending discount or wallet
    // For now, we'll just update the initiative funding
    const initiative = await prisma.communityInitiative.update({
      where: { id: initiativeId },
      data: { currentFunding: { increment: amount } }
    });

    res.json(initiative);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const listInitiatives = async (req: Request, res: Response) => {
  try {
    const initiatives = await prisma.communityInitiative.findMany({
      where: { isActive: true },
      include: {
        nonprofit: {
          select: { orgName: true }
        }
      }
    });
    res.json(initiatives);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getInitiativeDetail = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const initiative = await prisma.communityInitiative.findUnique({
      where: { id },
      include: {
        nonprofit: { select: { orgName: true } },
        creator: { select: { firstName: true, lastName: true } }
      }
    });
    if (!initiative) return res.status(404).json({ error: 'Initiative not found' });
    res.json(initiative);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
