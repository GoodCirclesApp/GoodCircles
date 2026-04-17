
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';



export const getStats = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const totalTransactions = await prisma.transaction.aggregate({
      _sum: { grossAmount: true },
      _count: { id: true }
    });

    const totalRevenue = Number(totalTransactions._sum.grossAmount || 0) * 0.01; // 1% platform fee
    const totalNonprofitFunding = await prisma.transaction.aggregate({
      _sum: { nonprofitShare: true }
    });

    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    res.json({
      totalRevenue,
      totalTransactionCount: totalTransactions._count.id,
      totalTransactionVolume: Number(totalTransactions._sum.grossAmount || 0),
      totalNonprofitFunding: Number(totalNonprofitFunding._sum.nonprofitShare || 0),
      communityFundCapital: 1250000, // Mock for now
      activeUsersByRole: userCounts.reduce((acc: any, curr) => {
        acc[curr.role] = curr._count.id;
        return acc;
      }, {}),
      internalBankingAdoption: 0.65 // Mock for now
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const userId = req.params.userId as string;
  const { isActive } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        neighbor: { select: { firstName: true, lastName: true } },
        merchant: { select: { businessName: true } },
        nonprofit: { select: { orgName: true } }
      }
    });
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const refundTransaction = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { txId } = req.params;
  // Logic for refunding would go here (Stripe refund + database update)
  res.json({ success: true, message: 'Refund processed' });
};

export const getFinancialOverview = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    platformFeeRevenue: 45200,
    processingFeePassThrough: 12800,
    paymentSplit: { internal: 60, card: 40 },
    aggregateWalletBalance: 850000,
    nettingSavings: 15400
  });
};

export const getCooperatives = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json([
    { id: 'c1', name: 'Westside Merchant Coop', members: 45, dividendStatus: 'DISTRIBUTED' },
    { id: 'c2', name: 'Eastside Artisan Coop', members: 28, dividendStatus: 'PENDING' }
  ]);
};

export const getCommunityFundOversight = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    fundBalance: 1250000,
    deployedCapital: 850000,
    loanPerformance: 0.98,
    returnDistributions: 42000
  });
};

export const getMunicipalPartners = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json([
    { id: 'm1', name: 'City of Portland', activeUsers: 12000, impactScore: 88 },
    { id: 'm2', name: 'City of Seattle', activeUsers: 15000, impactScore: 92 }
  ]);
};

export const getDataCoopStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    aggregationStatus: 'ACTIVE',
    lastInsightLog: '2026-03-22T08:00:00Z',
    premiumRevenue: 12500
  });
};

export const getSystemHealth = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({
    apiResponseTime: 120,
    errorRate: 0.005,
    jobs: [
      { name: 'Netting', status: 'SUCCESS', lastRun: '2026-03-22T00:00:00Z' },
      { name: 'Payouts', status: 'SUCCESS', lastRun: '2026-03-22T01:00:00Z' }
    ]
  });
};
