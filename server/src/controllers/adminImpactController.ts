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
    const metrics = await prisma.regionalMetric.groupBy({
      by: ['period'],
      _sum: {
        totalTransactions: true,
        totalGtv: true,
        totalLocalSpendRetained: true,
        totalNonprofitFunding: true,
        totalCommunityFundDeployed: true,
        totalJobsSupported: true,
        merchantsActive: true,
        consumersActive: true,
      },
      orderBy: { period: 'asc' },
    });
    res.json(metrics);
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
