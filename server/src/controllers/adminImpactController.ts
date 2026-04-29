import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RegionalMetricsService } from '../services/regionalMetricsService';
import { MunicipalService } from '../services/municipalService';



export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await prisma.region.findMany({
      include: {
        metrics: {
          orderBy: { period: 'desc' },
          take: 1,
        },
        partner: true,
      },
    });
    res.json(regions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRegionDashboard = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const metrics = await prisma.regionalMetric.findMany({
      where: { regionId: id },
      orderBy: { period: 'asc' },
    });
    const region = await prisma.region.findUnique({ where: { id } });
    res.json({ region, metrics });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRegionMerchants = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const merchants = await prisma.merchant.findMany({
      where: { regionId: id },
      include: {
        transactions: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });
    res.json(merchants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const activateMunicipalPartnership = async (req: Request, res: Response) => {
  const { regionId } = req.params as { regionId: string };
  const { name, email } = req.body;
  try {
    const result = await MunicipalService.activatePartnership(regionId, { name, email });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const addMunicipalIncentive = async (req: Request, res: Response) => {
  const { partnerId } = req.params as { partnerId: string };
  const { type, description, criteria } = req.body;
  try {
    const result = await MunicipalService.addIncentive(partnerId, { type, description, criteria });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getPlatformWideImpact = async (req: Request, res: Response) => {
  try {
    const [
      totalNeighbors,
      totalMerchants,
      totalNonprofits,
      txAggregate,
      topNonprofitsRaw,
      topMerchantsRaw,
      monthlyRaw,
      categoryRaw,
    ] = await Promise.all([
      // Community Members = consumers only (NEIGHBOR role), not all platform users
      prisma.user.count({ where: { role: 'NEIGHBOR' } }),
      prisma.merchant.count(),
      prisma.nonprofit.count(),
      prisma.transaction.aggregate({
        _count: { id: true },
        _sum: { grossAmount: true, discountAmount: true, nonprofitShare: true, merchantNet: true },
      }),
      prisma.transaction.groupBy({
        by: ['nonprofitId'],
        _sum: { nonprofitShare: true },
        orderBy: { _sum: { nonprofitShare: 'desc' } },
        take: 6,
      }),
      prisma.transaction.groupBy({
        by: ['merchantId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.transaction.findMany({
        select: { createdAt: true, grossAmount: true, nonprofitShare: true, merchantNet: true, neighborId: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Category breakdown by transaction count (actual spending, not just listing count)
      prisma.transaction.groupBy({
        by: ['productServiceId'],
        _count: { id: true },
        _sum: { grossAmount: true },
        orderBy: { _sum: { grossAmount: 'desc' } },
        take: 50,
      }),
    ]);

    // Resolve nonprofit names (field is orgName, not name)
    const npIds = topNonprofitsRaw.map(r => r.nonprofitId);
    const npRecords = await prisma.nonprofit.findMany({ where: { id: { in: npIds } }, select: { id: true, orgName: true } });
    const npMap = Object.fromEntries(npRecords.map(n => [n.id, n.orgName]));

    // Resolve merchant names
    const mIds = topMerchantsRaw.map(r => r.merchantId);
    const mRecords = await prisma.merchant.findMany({ where: { id: { in: mIds } }, select: { id: true, businessName: true } });
    const mMap = Object.fromEntries(mRecords.map(m => [m.id, m.businessName]));

    // Resolve categories for the top transaction products
    const psIds = categoryRaw.map(r => r.productServiceId);
    const psRecords = await prisma.productService.findMany({ where: { id: { in: psIds } }, select: { id: true, category: true } });
    const psMap = Object.fromEntries(psRecords.map(p => [p.id, p.category]));

    // Aggregate by category (group the top products by their category)
    const categoryTotals: Record<string, number> = {};
    for (const r of categoryRaw) {
      const cat = psMap[r.productServiceId] ?? 'Other';
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(r._sum.grossAmount ?? 0);
    }
    const categoryBreakdownFinal = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Build monthly growth data (last 6 months)
    const now = new Date();
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyGrowthData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const txs = monthlyRaw.filter(t => t.createdAt >= d && t.createdAt < next);
      const uniqueUsers = new Set(txs.map(t => t.neighborId)).size;
      return {
        month: MONTH_NAMES[d.getMonth()],
        users: uniqueUsers,
        // Volume = what consumer actually paid (gross minus discount)
        volume: txs.reduce((s, t) => s + Number(t.grossAmount ?? 0) - Number(0), 0),
        donations: txs.reduce((s, t) => s + Number(t.nonprofitShare ?? 0), 0),
      };
    });

    // totalVolume = gross listed price across all transactions
    const totalVolume = Number(txAggregate._sum.grossAmount ?? 0);
    const totalConsumerSavings = Number(txAggregate._sum.discountAmount ?? 0);
    const totalNonprofitFunding = Number(txAggregate._sum.nonprofitShare ?? 0);
    const totalMerchantNet = Number(txAggregate._sum.merchantNet ?? 0);

    // Local retention = money that stayed in the local economy:
    // merchant revenue (merchantNet) + nonprofit funding (nonprofitShare)
    // Consumer savings are returned to the consumer. Platform fee leaves the local pool.
    const totalLocalRetention = totalMerchantNet + totalNonprofitFunding;

    res.json({
      totalUsers: totalNeighbors,
      totalMerchants,
      totalNonprofits,
      totalTransactions: txAggregate._count.id ?? 0,
      totalVolume,
      totalConsumerSavings,
      totalNonprofitFunding,
      totalLocalRetention,
      monthlyGrowthData,
      topNonprofits: topNonprofitsRaw.map(r => ({
        name: npMap[r.nonprofitId] ?? 'Unknown Nonprofit',
        received: Number(r._sum.nonprofitShare ?? 0),
      })),
      topMerchants: topMerchantsRaw.map(r => ({
        name: mMap[r.merchantId] ?? 'Unknown Merchant',
        transactions: r._count.id ?? 0,
      })),
      categoryBreakdown: categoryBreakdownFinal.length > 0
        ? categoryBreakdownFinal
        : [{ name: 'Marketplace', value: 1 }],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const triggerAggregation = async (req: Request, res: Response) => {
  const { period } = req.body;
  try {
    const result = await RegionalMetricsService.runAggregation(period);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
