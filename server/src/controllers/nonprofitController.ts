import { Request, Response } from 'express';
import { ReferralService } from '../services/referralService';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { DonationReceiptService } from '../services/donationReceiptService';



export const getReferralCode = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Only nonprofits can access referral codes' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) {
      return res.status(404).json({ error: 'Nonprofit record not found' });
    }

    const code = await ReferralService.getReferralCode(nonprofit.id);
    res.json({ referralCode: code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getReferrals = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Only nonprofits can access referrals' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) {
      return res.status(404).json({ error: 'Nonprofit record not found' });
    }

    const referrals = await ReferralService.getNonprofitReferrals(nonprofit.id);
    res.json(referrals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getReferralDetail = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Only nonprofits can access referral details' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) {
      return res.status(404).json({ error: 'Nonprofit record not found' });
    }

    const detail = await ReferralService.getReferralDetail(req.params.id as string, nonprofit.id);
    res.json(detail);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });

    const transactions = await prisma.transaction.findMany({
      where: { nonprofitId: nonprofit.id }
    });

    const totalFunding = transactions.reduce((sum, tx) => sum + Number(tx.nonprofitShare), 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyFunding = transactions
      .filter(tx => new Date(tx.createdAt) >= thisMonth)
      .reduce((sum, tx) => sum + Number(tx.nonprofitShare), 0);

    const uniqueSupporters = new Set(transactions.map(tx => tx.neighborId)).size;
    const uniqueMerchants = new Set(transactions.map(tx => tx.merchantId)).size;

    // Real 6-month trend from transaction data
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const trend: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const agg = await prisma.transaction.aggregate({
        where: { nonprofitId: nonprofit.id, createdAt: { gte: start, lt: end } },
        _sum: { nonprofitShare: true },
      });
      trend.push({ month: monthNames[d.getMonth()], amount: Number(agg._sum.nonprofitShare ?? 0) });
    }

    res.json({
      totalFunding,
      monthlyFunding,
      transactionCount: transactions.length,
      uniqueSupporters,
      uniqueMerchants,
      trend
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });

    const transactions = await prisma.transaction.findMany({
      where: { nonprofitId: nonprofit.id },
      include: {
        merchant: true,
        productService: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(transactions.map(tx => ({
      id: tx.id,
      merchantName: tx.merchant.businessName,
      amount: Number(tx.nonprofitShare),
      category: tx.productService.category,
      date: tx.createdAt,
      status: 'SETTLED'
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });

    const transactions = await prisma.transaction.findMany({
      where: { nonprofitId: nonprofit.id },
      include: { productService: true }
    });

    const categories: Record<string, number> = {};
    transactions.forEach(tx => {
      const cat = tx.productService.category;
      categories[cat] = (categories[cat] || 0) + Number(tx.nonprofitShare);
    });

    const topCategories = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const geographicCoverage = new Set(
      transactions.map(tx => tx.consumerState).filter(Boolean)
    ).size;

    const totalShare = transactions.reduce((sum, tx) => sum + Number(tx.nonprofitShare), 0);

    res.json({
      topCategories,
      geographicCoverage,
      avgContribution: transactions.length > 0 ? totalShare / transactions.length : 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getReferralInfo = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id },
      include: {
        referrals: {
          include: {
            merchant: true,
            payouts: { include: { tier: true } },
          },
        },
      },
    });

    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });

    const totalEarnings = nonprofit.referrals.reduce(
      (sum, r) => sum + r.payouts.reduce((s, p) => s + Number(p.amount), 0),
      0
    );

    res.json({
      referralLink: `https://goodcircles.org/join?ref=${(nonprofit as any).referralCode || nonprofit.id}`,
      totalReferrals: nonprofit.referrals.length,
      totalEarnings,
      referredMerchants: nonprofit.referrals.map(r => ({
        id: r.id,
        name: r.merchant.businessName,
        status: r.is_active ? 'ACTIVE' : 'PENDING',
        earnings: r.payouts.reduce((s, p) => s + Number(p.amount), 0),
        currentTier: r.payouts.length > 0 ? r.payouts[r.payouts.length - 1].tier?.tierName ?? 'Active' : 'None',
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getInitiatives = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });

    const initiatives = await prisma.communityInitiative.findMany({
      where: { nonprofitId: nonprofit.id }
    });

    const supporterCounts = await Promise.all(
      initiatives.map(i =>
        prisma.transaction.count({ where: { waivedToInitiativeId: i.id } })
      )
    );

    res.json(initiatives.map((i, idx) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      goal: Number(i.fundingGoal),
      current: Number(i.currentFunding),
      supporters: supporterCounts[idx],
      status: i.isActive ? 'ACTIVE' : 'COMPLETED',
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createInitiative = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });

    const { title, description, goal } = req.body;

    const initiative = await prisma.communityInitiative.create({
      data: {
        title,
        description,
        fundingGoal: goal,
        createdBy: req.user.id,
        nonprofitId: nonprofit.id
      }
    });

    res.json(initiative);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { orgName, missionStatement } = req.body;

    const nonprofit = await prisma.nonprofit.update({
      where: { userId: req.user.id },
      data: {
        orgName,
        missionStatement
      }
    });

    res.json(nonprofit);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPayouts = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Mock payouts for now as there's no Payout model in schema
    res.json([
      { id: 'p1', amount: 4500, date: '2026-03-15', status: 'PAID', method: 'Stripe •••• 4242' },
      { id: 'p2', amount: 3200, date: '2026-02-15', status: 'PAID', method: 'Stripe •••• 4242' },
      { id: 'p3', amount: 2800, date: '2026-01-15', status: 'PAID', method: 'Stripe •••• 4242' },
      { id: 'p4', amount: 1500, date: '2026-04-15', status: 'PENDING', method: 'Stripe •••• 4242' },
    ]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── Donation Receipts ─────────────────────────────────────────────────────────

export const getAnnualReceipts = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') return res.status(403).json({ error: 'Unauthorized' });
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  try {
    const nonprofit = await prisma.nonprofit.findUnique({ where: { userId: req.user.id } });
    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });
    const receipts = await DonationReceiptService.getNonprofitAnnualReceipts(nonprofit.id, year);
    res.json(receipts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── Nonprofit-as-Vendor ───────────────────────────────────────────────────────
// Allows a verified nonprofit to register as a vendor (creates a shadow Merchant
// record) so they can list services (tutoring, counseling, job training, etc.)
// through the standard marketplace. All proceeds flow to the nonprofit wallet.

export const registerAsVendor = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const nonprofit = await prisma.nonprofit.findUnique({ where: { userId: req.user.id } });
    if (!nonprofit) return res.status(404).json({ error: 'Nonprofit not found' });
    if (!nonprofit.isVerified) return res.status(403).json({ error: 'Nonprofit must be verified before listing services' });

    const existing = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (existing) return res.json({ message: 'Already registered as vendor', merchant: existing });

    const merchant = await prisma.merchant.create({
      data: {
        userId: req.user.id,
        businessName: nonprofit.orgName,
        businessType: 'NONPROFIT_VENDOR',
        isVerified: true,
        onboardedAt: new Date(),
      },
    });

    res.status(201).json({ merchant });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const nonprofitListingSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  type: z.enum(['SERVICE']),
  category: z.string(),
  isActive: z.boolean().optional().default(true),
});

export const createNonprofitListing = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const data = nonprofitListingSchema.parse(req.body);
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(403).json({ error: 'Register as a vendor first via POST /nonprofit/vendor/register' });

    const listing = await prisma.productService.create({
      data: { ...data, merchantId: merchant.id, cogs: 0 },
    });
    res.status(201).json(listing);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getNonprofitListings = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.json([]);
    const listings = await prisma.productService.findMany({ where: { merchantId: merchant.id } });
    res.json(listings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStripeStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'NONPROFIT') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { userId: req.user.id }
    });

    res.json({
      isConnected: !!nonprofit?.stripeAccountId,
      accountId: nonprofit?.stripeAccountId
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
