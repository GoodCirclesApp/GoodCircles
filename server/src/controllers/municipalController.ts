import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { MunicipalService } from '../services/municipalService';



export const getMunicipalDashboard = async (req: Request, res: Response) => {
  const token = req.headers['x-municipal-token'] as string;
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const accessToken = await MunicipalService.validateToken(token);
    if (!accessToken) return res.status(403).json({ error: 'Invalid or expired token' });

    const regionId = accessToken.partner.regionId;
    const metrics = await prisma.regionalMetric.findMany({
      where: { regionId },
      orderBy: { period: 'asc' },
    });
    const region = accessToken.partner.region;
    res.json({ region, metrics });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMunicipalMerchants = async (req: Request, res: Response) => {
  const token = req.headers['x-municipal-token'] as string;
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const accessToken = await MunicipalService.validateToken(token);
    if (!accessToken) return res.status(403).json({ error: 'Invalid or expired token' });

    const regionId = accessToken.partner.regionId;
    const merchants = await prisma.merchant.findMany({
      where: { regionId },
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

export const getMerchantEligibleIncentives = async (req: Request, res: Response) => {
  const { merchantId } = req.params as { merchantId: string };
  try {
    const incentives = await MunicipalService.getMerchantEligibleIncentives(merchantId);
    res.json(incentives);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
