import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { WalletService } from '../services/walletService';
import { QrCheckoutService } from '../services/qrCheckoutService';
import { z } from 'zod';
import { getStripe } from '../services/stripeService';
import { prisma } from '../lib/prisma';
import { sendWalletTopUpEmail } from '../services/emailService';

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

// Creates a Stripe PaymentIntent — client uses the clientSecret with Stripe Elements.
// Wallet is only credited inside the webhook when payment_intent.succeeded fires.
export const createFundIntent = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const schema = z.object({ amount: z.number().positive().max(10000) });
  try {
    const { amount } = schema.parse(req.body);
    const stripe = getStripe();
    const amountCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { userId: req.user.id, purpose: 'wallet_topup' },
      automatic_payment_methods: { enabled: true },
    });

    // Record pending top-up
    await prisma.walletTopUp.create({
      data: {
        userId: req.user.id,
        amount,
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// Called by Stripe webhook when payment_intent.succeeded fires
export const completeFundFromWebhook = async (paymentIntentId: string): Promise<void> => {
  const topUp = await prisma.walletTopUp.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!topUp || topUp.status !== 'PENDING') return;

  const amount = Number(topUp.amount);
  await WalletService.fundWallet(topUp.userId, amount, 'Wallet top-up via card');
  await prisma.walletTopUp.update({
    where: { id: topUp.id },
    data: { status: 'SUCCEEDED', completedAt: new Date() },
  });

  // Send confirmation email
  try {
    const user = await prisma.user.findUnique({
      where: { id: topUp.userId },
      select: { email: true, firstName: true },
    });
    const balance = await WalletService.getBalance(topUp.userId);
    if (user) {
      await sendWalletTopUpEmail({
        userEmail: user.email,
        firstName: user.firstName ?? 'there',
        amount,
        newBalance: Number(balance),
      });
    }
  } catch (err) {
    console.error('[Wallet] Top-up email error:', err);
  }
};

export const withdraw = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const schema = z.object({ amount: z.number().positive(), description: z.string().optional() });
  try {
    const { amount, description } = schema.parse(req.body);
    const wallet = await WalletService.withdraw(req.user.id, amount, description);
    res.json(wallet);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// QR token: generate a signed, time-limited token for in-person checkout
export const generateQrToken = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await QrCheckoutService.generateToken(req.user.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
