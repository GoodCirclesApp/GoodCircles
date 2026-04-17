import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { DataCoopService } from '../services/dataCoopService';
import { z } from 'zod';

export const joinCoop = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'MERCHANT') return res.status(403).json({ error: 'Only merchants can join the Data Coop' });

  try {
    
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const member = await DataCoopService.joinCoop(merchant.id);
    res.json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const leaveCoop = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'MERCHANT') return res.status(403).json({ error: 'Only merchants can leave the Data Coop' });

  try {
    
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const member = await DataCoopService.leaveCoop(merchant.id);
    res.json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'MERCHANT') return res.status(403).json({ error: 'Only merchants can access Data Coop status' });

  try {
    
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const status = await DataCoopService.getCoopStatus(merchant.id);
    res.json(status);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getInsights = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'MERCHANT') return res.status(403).json({ error: 'Only merchants can access Data Coop insights' });

  try {
    const { category, regionId } = z.object({
      category: z.string(),
      regionId: z.string().nullable()
    }).parse(req.query);

    
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const insights = await DataCoopService.getInsights(merchant.id, category, regionId);
    res.json(insights);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(400).json({ error: err.message });
  }
};

export const purchasePremium = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'MERCHANT') return res.status(403).json({ error: 'Only merchants can purchase premium access' });

  try {
    const { category, regionId } = z.object({
      category: z.string(),
      regionId: z.string().nullable()
    }).parse(req.body);

    
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const access = await DataCoopService.purchasePremiumAccess(merchant.id, category, regionId);
    res.json(access);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(400).json({ error: err.message });
  }
};

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') return res.status(403).json({ error: 'Only platform admins can access the Data Coop dashboard' });

  try {
    const dashboard = await DataCoopService.getAdminDashboard();
    res.json(dashboard);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
