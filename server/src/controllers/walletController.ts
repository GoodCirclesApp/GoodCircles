import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { WalletService } from '../services/walletService';
import { z } from 'zod';

export const getBalance = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const balance = await WalletService.getBalance(req.user.id);
    res.json({ balance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCreditBalance = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const balance = await WalletService.getCreditBalance(req.user.id);
    res.json({ balance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const history = await WalletService.getHistory(req.user.id, page, limit);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const fundWallet = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const schema = z.object({
    amount: z.number().positive(),
    description: z.string().optional()
  });

  try {
    const { amount, description } = schema.parse(req.body);
    // In a real app, we'd process a Stripe charge here before funding the wallet
    const wallet = await WalletService.fundWallet(req.user.id, amount, description);
    res.json(wallet);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
};

export const withdraw = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const schema = z.object({
    amount: z.number().positive(),
    description: z.string().optional()
  });

  try {
    const { amount, description } = schema.parse(req.body);
    // In a real app, we'd trigger a Stripe Payout here
    const wallet = await WalletService.withdraw(req.user.id, amount, description);
    res.json(wallet);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
};
