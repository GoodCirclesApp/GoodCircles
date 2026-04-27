import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Cities: aggregate by merchant physicalCity + physicalState
    const cityAgg = await prisma.transaction.groupBy({
      by: ['merchantId'],
      _sum: { nonprofitShare: true, grossAmount: true },
      _count: { id: true },
    });

    const merchantLocations = await prisma.merchant.findMany({
      where: { physicalCity: { not: null } },
      select: { id: true, physicalCity: true, physicalState: true },
    });
    const locMap: Record<string, { city: string; state: string }> = {};
    merchantLocations.forEach(m => {
      if (m.physicalCity) locMap[m.id] = { city: m.physicalCity, state: m.physicalState ?? '' };
    });

    const cityMap: Record<string, { volume: number; nonprofitFunding: number; txCount: number; memberCount: number }> = {};
    cityAgg.forEach(row => {
      const loc = locMap[row.merchantId];
      if (!loc) return;
      const key = `${loc.city}, ${loc.state}`;
      if (!cityMap[key]) cityMap[key] = { volume: 0, nonprofitFunding: 0, txCount: 0, memberCount: 1 };
      cityMap[key].volume += Number(row._sum.grossAmount ?? 0);
      cityMap[key].nonprofitFunding += Number(row._sum.nonprofitShare ?? 0);
      cityMap[key].txCount += row._count.id;
    });
    const cities = Object.entries(cityMap)
      .map(([name, d]) => ({ name, ...d, impactPerMember: d.memberCount > 0 ? d.nonprofitFunding / d.memberCount : 0 }))
      .sort((a, b) => b.nonprofitFunding - a.nonprofitFunding)
      .slice(0, 20);

    // Merchants: by total nonprofitShare generated
    const merchantAgg = await prisma.transaction.groupBy({
      by: ['merchantId'],
      _sum: { nonprofitShare: true, grossAmount: true },
      _count: { id: true },
      orderBy: { _sum: { nonprofitShare: 'desc' } },
      take: 20,
    });
    const merchantIds = merchantAgg.map(r => r.merchantId);
    const merchantDetails = await prisma.merchant.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, businessName: true, physicalCity: true, physicalState: true },
    });
    const mMap: Record<string, { businessName: string; city: string }> = {};
    merchantDetails.forEach(m => { mMap[m.id] = { businessName: m.businessName, city: `${m.physicalCity ?? ''}, ${m.physicalState ?? ''}`.trim() }; });
    const merchants = merchantAgg.map(r => ({
      id: r.merchantId,
      name: mMap[r.merchantId]?.businessName ?? 'Unknown',
      city: mMap[r.merchantId]?.city ?? '',
      nonprofitFunding: Number(r._sum.nonprofitShare ?? 0),
      volume: Number(r._sum.grossAmount ?? 0),
      txCount: r._count.id,
    }));

    // Neighbors: by nonprofitShare generated through their purchases
    const neighborAgg = await prisma.transaction.groupBy({
      by: ['neighborId'],
      _sum: { nonprofitShare: true, grossAmount: true },
      _count: { id: true },
      orderBy: { _sum: { nonprofitShare: 'desc' } },
      take: 20,
    });
    const neighborIds = neighborAgg.map(r => r.neighborId);
    const neighborDetails = await prisma.user.findMany({
      where: { id: { in: neighborIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const nbrMap: Record<string, string> = {};
    neighborDetails.forEach(u => { nbrMap[u.id] = `${u.firstName ?? ''} ${u.lastName ? u.lastName[0] + '.' : ''}`.trim(); });
    const neighbors = neighborAgg.map(r => ({
      id: r.neighborId,
      name: nbrMap[r.neighborId] ?? 'Community Member',
      nonprofitFunding: Number(r._sum.nonprofitShare ?? 0),
      txCount: r._count.id,
      isCurrentUser: r.neighborId === req.user!.id,
    }));

    // Nonprofits: by total nonprofitShare received
    const nonprofitAgg = await prisma.transaction.groupBy({
      by: ['nonprofitId'],
      _sum: { nonprofitShare: true },
      _count: { id: true },
      orderBy: { _sum: { nonprofitShare: 'desc' } },
      take: 20,
    });
    const npIds = nonprofitAgg.map(r => r.nonprofitId);
    const npDetails = await prisma.nonprofit.findMany({
      where: { id: { in: npIds } },
      select: { id: true, orgName: true },
    });
    const npMap: Record<string, string> = {};
    npDetails.forEach(n => { npMap[n.id] = n.orgName; });
    const nonprofits = nonprofitAgg.map(r => ({
      id: r.nonprofitId,
      name: npMap[r.nonprofitId] ?? 'Unknown Nonprofit',
      totalReceived: Number(r._sum.nonprofitShare ?? 0),
      txCount: r._count.id,
    }));

    res.json({ cities, merchants, neighbors, nonprofits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
