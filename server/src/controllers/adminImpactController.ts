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
      totalUsers,
      totalMerchants,
      totalNonprofits,
      txAggregate,
      topNonprofitsRaw,
      topMerchantsRaw,
      monthlyRaw,
      categoryRaw,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.merchant.count(),
      prisma.nonprofit.count(),
      prisma.transaction.aggregate({
        _count: { id: true },
        _sum: { grossAmount: true, discountAmount: true, nonprofitShare: true },
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
        select: { createdAt: true, grossAmount: true, nonprofitShare: true, neighborId: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.productService.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
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
        volume: txs.reduce((s, t) => s + Number(t.grossAmount ?? 0), 0),
        donations: txs.reduce((s, t) => s + Number(t.nonprofitShare ?? 0), 0),
      };
    });

    const totalVolume = Number(txAggregate._sum.grossAmount ?? 0);
    const totalConsumerSavings = Number(txAggregate._sum.discountAmount ?? 0);
    const totalNonprofitFunding = Number(txAggregate._sum.nonprofitShare ?? 0);

    res.json({
      totalUsers,
      totalMerchants,
      totalNonprofits,
      totalTransactions: txAggregate._count.id ?? 0,
      totalVolume,
      totalConsumerSavings,
      totalNonprofitFunding,
      totalLocalRetention: totalVolume * 0.68,
      monthlyGrowthData,
      topNonprofits: topNonprofitsRaw.map(r => ({
        name: npMap[r.nonprofitId] ?? 'Unknown Nonprofit',
        received: Number(r._sum.nonprofitShare ?? 0),
      })),
      topMerchants: topMerchantsRaw.map(r => ({
        name: mMap[r.merchantId] ?? 'Unknown Merchant',
        transactions: r._count.id ?? 0,
      })),
      categoryBreakdown: categoryRaw.length > 0
        ? categoryRaw.map(r => ({ name: r.category ?? 'Other', value: r._count.id }))
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
