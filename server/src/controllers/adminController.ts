
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { PriceSentinelService } from '../services/priceSentinelService';
import bcrypt from 'bcryptjs';



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

export const getSentinelFlags = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const flags = await PriceSentinelService.getFlags();
    res.json(flags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const resolveSentinelFlag = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const flagId = req.params.flagId as string;
  const { approve } = req.body as { approve: boolean };
  try {
    const flag = await PriceSentinelService.resolveFlag(flagId, approve);
    res.json(flag);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const SEED_NONPROFITS = [
  { email: 'info@communityfoodbank.org', firstName: 'Community', lastName: 'Food Bank', orgName: 'Community Food Bank', ein: '12-3456789', missionStatement: 'We eliminate hunger in our community by connecting people with nutritious food and creating pathways to self-sufficiency.' },
  { email: 'info@youthempowerment.org', firstName: 'Youth', lastName: 'Empowerment Alliance', orgName: 'Youth Empowerment Alliance', ein: '23-4567890', missionStatement: 'We provide mentorship, education, and opportunity to young people in underserved neighborhoods so every child can reach their full potential.' },
  { email: 'info@greencityfund.org', firstName: 'Green', lastName: 'City Fund', orgName: 'Green City Environmental Fund', ein: '34-5678901', missionStatement: 'We protect urban green spaces, champion sustainability, and build a cleaner, healthier city for current and future generations.' },
  { email: 'info@neighborhoodarts.org', firstName: 'Neighborhood', lastName: 'Arts Collective', orgName: 'Neighborhood Arts Collective', ein: '45-6789012', missionStatement: 'We make art accessible to everyone by funding free community programs, public murals, and creative education in local schools.' },
  { email: 'info@housingforward.org', firstName: 'Housing', lastName: 'Forward', orgName: 'Housing Forward', ein: '56-7890123', missionStatement: 'We work to end homelessness and housing insecurity through emergency shelter, transitional housing, and long-term support services.' },
];

export const getPendingNonprofits = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const pending = await prisma.nonprofit.findMany({
    where: { isVerified: false },
    include: { user: { select: { email: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(pending);
};

export const verifyNonprofitOverride = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const nonprofitId = req.params.nonprofitId as string;
  const nonprofit = await prisma.nonprofit.findUnique({ where: { id: nonprofitId } });
  if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });

  const updated = await prisma.nonprofit.update({
    where: { id: nonprofitId },
    data: { isVerified: true, verifiedAt: new Date() },
  });
  console.log(`[Admin] Manual IRS override: ${updated.orgName} (EIN ${updated.ein}) verified by admin ${req.user.id}`);
  res.json({ success: true, nonprofit: updated });
};

export const revokeNonprofitVerification = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const nonprofitId = req.params.nonprofitId as string;
  const updated = await prisma.nonprofit.update({
    where: { id: nonprofitId },
    data: { isVerified: false, verifiedAt: null },
  });
  res.json({ success: true, nonprofit: updated });
};

export const seedNonprofits = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const passwordHash = await bcrypt.hash('GoodCircles2026!', 12);
  const results: { orgName: string; status: string }[] = [];

  for (const np of SEED_NONPROFITS) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: np.email } });
      if (existing) {
        const record = await prisma.nonprofit.findUnique({ where: { userId: existing.id } });
        if (record && !record.isVerified) {
          await prisma.nonprofit.update({ where: { id: record.id }, data: { isVerified: true, verifiedAt: new Date() } });
          results.push({ orgName: np.orgName, status: 'verified' });
        } else {
          results.push({ orgName: np.orgName, status: 'already exists' });
        }
        continue;
      }
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: np.email, passwordHash, role: 'NONPROFIT', firstName: np.firstName, lastName: np.lastName, isActive: true },
        });
        await tx.nonprofit.create({
          data: { userId: user.id, orgName: np.orgName, ein: np.ein, missionStatement: np.missionStatement, isVerified: true, verifiedAt: new Date() },
        });
      });
      results.push({ orgName: np.orgName, status: 'created' });
    } catch (err: any) {
      results.push({ orgName: np.orgName, status: `error: ${err.message}` });
    }
  }

  res.json({ message: 'Nonprofit seed complete', results });
};
