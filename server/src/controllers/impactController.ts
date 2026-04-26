import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    const [txAgg, merchantsByState, nonprofitCount, cdfiAgg, userCount] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { grossAmount: true, nonprofitShare: true },
        _count: { id: true },
      }),
      prisma.merchant.groupBy({
        by: ['physicalState'],
        _count: { id: true },
        where: { isVerified: true, physicalState: { not: null } },
      }),
      prisma.nonprofit.count({ where: { isVerified: true } }),
      prisma.fundDeployment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    // Transaction volume by state via merchant join
    const txByState = await prisma.transaction.groupBy({
      by: ['merchantId'],
      _sum: { grossAmount: true, nonprofitShare: true },
      _count: { id: true },
    });

    // Map merchantId → physicalState
    const merchantStateMap: Record<string, string> = {};
    const merchantRows = await prisma.merchant.findMany({
      where: { physicalState: { not: null } },
      select: { id: true, physicalState: true },
    });
    merchantRows.forEach(m => {
      if (m.physicalState) merchantStateMap[m.id] = m.physicalState;
    });

    // Aggregate tx volume by state
    const volumeByState: Record<string, { volume: number; nonprofitShare: number; txCount: number }> = {};
    txByState.forEach(row => {
      const state = merchantStateMap[row.merchantId];
      if (!state) return;
      if (!volumeByState[state]) volumeByState[state] = { volume: 0, nonprofitShare: 0, txCount: 0 };
      volumeByState[state].volume += Number(row._sum.grossAmount ?? 0);
      volumeByState[state].nonprofitShare += Number(row._sum.nonprofitShare ?? 0);
      volumeByState[state].txCount += row._count.id;
    });

    res.json({
      national: {
        totalVolume: Number(txAgg._sum.grossAmount ?? 0),
        totalNonprofitFunding: Number(txAgg._sum.nonprofitShare ?? 0),
        totalTransactions: txAgg._count.id,
        totalMerchants: merchantsByState.reduce((s, r) => s + r._count.id, 0),
        totalNonprofits: nonprofitCount,
        cdfiCapitalDeployed: Number(cdfiAgg._sum.amount ?? 0),
        cdfiDeployments: cdfiAgg._count.id,
        activeUsers: userCount,
      },
      byState: merchantsByState.map(r => ({
        state: r.physicalState,
        merchants: r._count.id,
        volume: volumeByState[r.physicalState!]?.volume ?? 0,
        nonprofitFunding: volumeByState[r.physicalState!]?.nonprofitShare ?? 0,
        txCount: volumeByState[r.physicalState!]?.txCount ?? 0,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStateDetail = async (req: AuthRequest, res: Response) => {
  const state = req.params.state as string;
  try {
    const merchants = await prisma.merchant.findMany({
      where: { physicalState: state, isVerified: true },
      select: { id: true, businessName: true, physicalCity: true, businessType: true },
    });

    const merchantIds = merchants.map(m => m.id);

    const txByMerchant = await prisma.transaction.groupBy({
      by: ['merchantId'],
      _sum: { grossAmount: true, nonprofitShare: true },
      _count: { id: true },
      where: { merchantId: { in: merchantIds } },
    });

    const txMap: Record<string, { volume: number; nonprofitFunding: number; txCount: number }> = {};
    txByMerchant.forEach(r => {
      txMap[r.merchantId] = {
        volume: Number(r._sum.grossAmount ?? 0),
        nonprofitFunding: Number(r._sum.nonprofitShare ?? 0),
        txCount: r._count.id,
      };
    });

    // Group by city
    const cityMap: Record<string, { merchants: number; volume: number; nonprofitFunding: number; txCount: number }> = {};
    merchants.forEach(m => {
      const city = m.physicalCity ?? 'Unknown';
      if (!cityMap[city]) cityMap[city] = { merchants: 0, volume: 0, nonprofitFunding: 0, txCount: 0 };
      cityMap[city].merchants++;
      const tx = txMap[m.id];
      if (tx) {
        cityMap[city].volume += tx.volume;
        cityMap[city].nonprofitFunding += tx.nonprofitFunding;
        cityMap[city].txCount += tx.txCount;
      }
    });

    const cities = Object.entries(cityMap)
      .map(([city, data]) => ({ city, state, ...data }))
      .sort((a, b) => b.volume - a.volume);

    const stateTotal = {
      merchants: merchants.length,
      volume: cities.reduce((s, c) => s + c.volume, 0),
      nonprofitFunding: cities.reduce((s, c) => s + c.nonprofitFunding, 0),
      txCount: cities.reduce((s, c) => s + c.txCount, 0),
    };

    res.json({ state, totals: stateTotal, cities });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
