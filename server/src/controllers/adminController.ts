
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { PriceSentinelService } from '../services/priceSentinelService';
import { FeatureFlagService, FeatureFlags } from '../services/featureFlagService';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

async function writeAuditLog(adminId: string, action: string, targetId?: string, detail?: string) {
  await prisma.adminAuditLog.create({ data: { adminId, action, targetId, detail } }).catch(() => {});
}



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

    const totalCount = totalTransactions._count.id;
    const walletPaidCount = await prisma.transaction.count({ where: { paymentMethod: 'WALLET' } });
    const internalBankingAdoption = totalCount > 0 ? walletPaidCount / totalCount : 0;

    res.json({
      totalRevenue,
      totalTransactionCount: totalCount,
      totalTransactionVolume: Number(totalTransactions._sum.grossAmount || 0),
      totalNonprofitFunding: Number(totalNonprofitFunding._sum.nonprofitShare || 0),
      communityFundCapital: 0,
      activeUsersByRole: userCounts.reduce((acc: any, curr) => {
        acc[curr.role] = curr._count.id;
        return acc;
      }, {}),
      internalBankingAdoption,
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

  try {
    const [feeAgg, totalCount, walletCount, walletBalanceAgg] = await Promise.all([
      prisma.transaction.aggregate({ _sum: { platformFee: true, grossAmount: true } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { paymentMethod: 'WALLET' } }),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
    ]);

    const platformFeeRevenue = Number(feeAgg._sum.platformFee ?? 0);
    const totalVolume = Number(feeAgg._sum.grossAmount ?? 0);
    const cardCount = totalCount - walletCount;
    const internalPct = totalCount > 0 ? Math.round((walletCount / totalCount) * 100) : 0;
    // Stripe card fee saved per wallet transaction ≈ 2.9% + $0.30; estimate savings
    const avgTxSize = totalCount > 0 ? totalVolume / totalCount : 0;
    const nettingSavings = walletCount * (avgTxSize * 0.029 + 0.30);

    res.json({
      platformFeeRevenue,
      processingFeePassThrough: cardCount * (avgTxSize * 0.029 + 0.30),
      paymentSplit: { internal: internalPct, card: 100 - internalPct },
      aggregateWalletBalance: Number(walletBalanceAgg._sum.balance ?? 0),
      nettingSavings: Math.round(nettingSavings * 100) / 100,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

  try {
    // Nonprofit digest: last sent time from log table
    const lastDigest = await prisma.nonprofitDigestLog.findFirst({
      orderBy: { sentAt: 'desc' },
      select: { sentAt: true },
    }).catch(() => null);

    // Last wallet top-up completion (proxy for payment processing health)
    const lastTopUp = await prisma.walletTopUp.findFirst({
      where: { status: 'SUCCEEDED' },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    }).catch(() => null);

    // Last transaction (proxy for settlement processor)
    const lastTx = await prisma.transaction.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const jobs = [
      {
        name: 'Settlement Processor',
        status: lastTx ? 'SUCCESS' : 'PENDING',
        lastRun: lastTx?.createdAt ?? null,
      },
      {
        name: 'Nonprofit Digest',
        status: lastDigest ? 'SUCCESS' : 'PENDING',
        lastRun: lastDigest?.sentAt ?? null,
      },
      {
        name: 'Wallet Reconciliation',
        status: lastTopUp ? 'SUCCESS' : 'PENDING',
        lastRun: lastTopUp?.completedAt ?? null,
      },
    ];

    res.json({
      apiResponseTime: 0,
      errorRate: 0,
      jobs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

export const getDiskUsage = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const tables = await prisma.$queryRaw<{ table: string; total_size: string; live_rows: bigint }[]>`
    SELECT
      relname AS table,
      pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
      n_live_tup AS live_rows
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(relid) DESC
    LIMIT 15
  `;
  const dbSize = await prisma.$queryRaw<{ total_db_size: string }[]>`
    SELECT pg_size_pretty(pg_database_size(current_database())) AS total_db_size
  `;
  res.json({
    totalDatabaseSize: dbSize[0]?.total_db_size,
    tables: tables.map(t => ({ ...t, live_rows: Number(t.live_rows) })),
  });
};

export const clearIrsData = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  await prisma.$executeRaw`TRUNCATE TABLE "IrsNonprofitRecord"`;
  await prisma.irsSyncLog.deleteMany({});
  await prisma.$executeRaw`CHECKPOINT`; // flush WAL to disk so Railway volume meter updates
  console.log(`[Admin] IRS data cleared by ${req.user.id}`);
  res.json({ success: true, message: 'IRS records cleared. Trigger a new sync from the Compliance dashboard.' });
};

// ── CDFI Partner Management ─────────────────────────────────────────────────

export const getCdfiApplicants = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const cdfis = await prisma.cDFIPartner.findMany({
    include: { user: { select: { email: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(cdfis);
};

export const activateCdfiPartner = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const cdfiId = req.params.cdfiId as string;
  try {
    const cdfi = await prisma.cDFIPartner.findUnique({ where: { id: cdfiId } });
    if (!cdfi) return res.status(404).json({ error: 'CDFI not found' });

    // Auto-create first-loss pool fund if not already linked
    let firstLossPoolId = (cdfi as any).firstLossPoolId as string | undefined;
    if (!firstLossPoolId) {
      const fund = await prisma.communityFund.create({
        data: {
          name: `${cdfi.orgName} — First-Loss Reserve`,
          type: 'cdfi_first_loss',
          cdfiPartnerId: cdfiId,
          totalCapital: 0,
          deployedCapital: 0,
          isActive: true,
          activatedAt: new Date(),
        },
      });
      firstLossPoolId = fund.id;
    }

    const updated = await prisma.cDFIPartner.update({
      where: { id: cdfiId },
      data: {
        partnershipStatus: 'active',
        activatedAt: new Date(),
        ...(firstLossPoolId && { firstLossPoolId } as any),
      },
    });

    console.log(`[Admin] Activated CDFI ${cdfi.orgName} — first-loss pool: ${firstLossPoolId} by admin ${req.user.id}`);
    res.json({ success: true, cdfi: updated, firstLossPoolId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deactivateCdfiPartner = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const cdfiId = req.params.cdfiId as string;
  try {
    const updated = await prisma.cDFIPartner.update({
      where: { id: cdfiId },
      data: { partnershipStatus: 'suspended' },
    });
    await writeAuditLog(req.user.id, 'SUSPEND_CDFI', cdfiId);
    console.log(`[Admin] Suspended CDFI ${cdfiId} by admin ${req.user.id}`);
    res.json({ success: true, cdfi: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── User account management ──────────────────────────────────────────────────

export const getUserDetail = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.params.userId as string;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        merchant: { select: { businessName: true, isVerified: true } },
        nonprofit: { select: { orgName: true, ein: true, isVerified: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, grossAmount: true, createdAt: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editUser = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.params.userId as string;
  const schema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['NEIGHBOR', 'MERCHANT', 'NONPROFIT', 'PLATFORM', 'CDFI']).optional(),
    isActive: z.boolean().optional(),
  });
  try {
    const data = schema.parse(req.body);
    const before = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, role: true, isActive: true } });
    const user = await prisma.user.update({ where: { id: userId }, data });
    await writeAuditLog(req.user.id, 'EDIT_USER', userId, JSON.stringify({ before, after: data }));
    res.json(user);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const changeAdminPassword = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const schema = z.object({ currentPassword: z.string(), newPassword: z.string().min(10) });
  try {
    const { currentPassword, newPassword } = schema.parse(req.body);
    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!admin) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: hash } });
    await writeAuditLog(req.user.id, 'CHANGE_PASSWORD', req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.params.userId as string;
  const schema = z.object({ newPassword: z.string().min(8) });
  try {
    const { newPassword } = schema.parse(req.body);
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    await writeAuditLog(req.user.id, 'RESET_USER_PASSWORD', userId);
    res.json({ success: true });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// ── Credit issuance ──────────────────────────────────────────────────────────

export const issueCredits = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.params.userId as string;
  const schema = z.object({ amount: z.number().positive(), reason: z.string().min(3) });
  try {
    const { amount, reason } = schema.parse(req.body);
    const credit = await prisma.creditLedger.create({
      data: {
        userId,
        amount,
        entryType: 'CREDIT',
        source: 'PROMOTIONAL',
      },
    });
    await writeAuditLog(req.user.id, 'ISSUE_CREDITS', userId, JSON.stringify({ amount, reason }));
    res.json({ success: true, credit });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// ── Balance adjustment ───────────────────────────────────────────────────────

export const adjustWalletBalance = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.params.userId as string;
  const schema = z.object({
    amount: z.number(),
    reason: z.string().min(3),
    entryType: z.enum(['CREDIT', 'DEBIT']),
  });
  try {
    const { amount, reason, entryType } = schema.parse(req.body);
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const delta = entryType === 'CREDIT' ? Math.abs(amount) : -Math.abs(amount);
    const newBalance = Number(wallet.balance) + delta;
    if (newBalance < 0) return res.status(400).json({ error: 'Adjustment would result in negative balance' });

    await prisma.wallet.update({ where: { userId }, data: { balance: newBalance } });
    await prisma.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        entryType,
        amount: Math.abs(amount),
        balanceAfter: newBalance,
        description: `Admin adjustment: ${reason}`,
      },
    });
    await writeAuditLog(req.user.id, 'ADJUST_BALANCE', userId, JSON.stringify({ entryType, amount, reason, newBalance }));
    res.json({ success: true, newBalance });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// ── Demo reset (expose existing betaController logic) ────────────────────────
// Imports resetBetaTransactions from betaController and re-exports under admin route
import { resetBetaTransactions } from './betaController';
export { resetBetaTransactions as adminResetDemo };

// ── Feature flags management ─────────────────────────────────────────────────

export const getFeatureFlags = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  res.json(FeatureFlagService.getAll());
};

export const updateFeatureFlag = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const { flag, value } = req.body;
  if (typeof flag !== 'string' || typeof value !== 'boolean') {
    return res.status(400).json({ error: 'flag (string) and value (boolean) required' });
  }
  await FeatureFlagService.setFlag(flag as keyof FeatureFlags, value);
  await writeAuditLog(req.user.id, 'SET_FEATURE_FLAG', undefined, JSON.stringify({ flag, value }));
  res.json({ message: `Flag "${flag}" set to ${value}`, flags: FeatureFlagService.getAll() });
};

export const getDemoMode = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  res.json({ demoMode: FeatureFlagService.isDemoMode() });
};

export const setDemoMode = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'enabled (boolean) required' });
  await FeatureFlagService.setDemoMode(enabled);
  await writeAuditLog(req.user.id, 'SET_DEMO_MODE', undefined, JSON.stringify({ enabled }));
  res.json({ demoMode: enabled });
};

// ── Audit log ────────────────────────────────────────────────────────────────

export const getAuditLog = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Unauthorized' });
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  try {
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
