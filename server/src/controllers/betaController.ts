import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { generateTokens } from '../utils/tokenUtils';
import { AuthRequest } from '../middleware/authMiddleware';
import { FeatureFlagService } from '../services/featureFlagService';

// ─── Beta Registration ────────────────────────────────────────────────
// Special registration that auto-verifies merchants/nonprofits and funds
// consumer wallets with $5000 test balance.

const betaRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['NEIGHBOR', 'MERCHANT', 'NONPROFIT']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // Merchant fields
  businessName: z.string().optional(),
  businessType: z.enum(['GOODS', 'SERVICES', 'BOTH']).optional(),
  // Nonprofit fields
  orgName: z.string().optional(),
  ein: z.string().optional(),
  missionStatement: z.string().optional(),
});

export const betaRegister = async (req: Request, res: Response) => {
  try {
    const data = betaRegisterSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      // 2. Create role-specific record (AUTO-VERIFIED for beta)
      if (data.role === 'MERCHANT') {
        if (!data.businessName || !data.businessType) {
          throw new Error('Business name and type required for merchants');
        }
        await tx.merchant.create({
          data: {
            userId: user.id,
            businessName: data.businessName,
            businessType: data.businessType,
            isVerified: true,       // Auto-verified for beta
            onboardedAt: new Date(), // Auto-onboarded
          },
        });
      } else if (data.role === 'NONPROFIT') {
        if (!data.orgName || !data.ein) {
          throw new Error('Organization name and EIN required for nonprofits');
        }
        await tx.nonprofit.create({
          data: {
            userId: user.id,
            orgName: data.orgName,
            ein: data.ein,
            missionStatement: data.missionStatement,
            isVerified: true, // Auto-verified for beta
            verifiedAt: new Date(),
            referralCode: `BETA-${data.orgName.replace(/\s/g, '').slice(0, 6).toUpperCase()}-${Date.now().toString(36).slice(-4)}`,
          },
        });
      }

      // 3. Create wallet with $5000 test balance for all roles
      await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 5000.00,
        },
      });

      // 4. Create a ledger entry for the initial balance
      const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
      if (wallet) {
        await tx.ledgerEntry.create({
          data: {
            walletId: wallet.id,
            entryType: 'CREDIT',
            amount: 5000.00,
            balanceAfter: 5000.00,
            description: 'Beta test initial funding',
          },
        });
      }

      // 5. Elect a default nonprofit (first verified one)
      if (data.role === 'NEIGHBOR') {
        const defaultNonprofit = await tx.nonprofit.findFirst({
          where: { isVerified: true },
        });
        if (defaultNonprofit) {
          await tx.user.update({
            where: { id: user.id },
            data: { electedNonprofitId: defaultNonprofit.id },
          });
        }
      }

      return user;
    });

    const tokens = generateTokens(result);
    res.status(201).json({
      message: 'Beta account created successfully! Your wallet has been funded with $5,000.00 for testing.',
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
        firstName: result.firstName,
        lastName: result.lastName,
      },
      wallet: { balance: 5000.00, currency: 'USD' },
      ...tokens,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ─── Admin: Reset Beta Transactions ──────────────────────────────────
// Clears all transactions, resets wallets to $5000, clears netting history.
// Does NOT delete user accounts, listings, or nonprofits.
export const resetBetaTransactions = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const counts = await prisma.$transaction(async (tx) => {
      // 1. Clear credit ledger
      const credits = await tx.creditLedger.deleteMany();
      // 2. Clear credit transfers
      const transfers = await tx.creditTransfer.deleteMany();
      // 3. Clear ledger entries
      const ledger = await tx.ledgerEntry.deleteMany();
      // 4. Clear merchant obligations
      const obligations = await tx.merchantObligation.deleteMany();
      // 5. Clear netting batches
      const batches = await tx.nettingBatch.deleteMany();
      // 6. Clear netting activation records
      const activations = await tx.nettingActivation.deleteMany();
      // 7. Clear fund contributions and returns
      const fundReturns = await tx.fundReturn.deleteMany();
      const fundRepayments = await tx.fundRepayment.deleteMany();
      const fundDeployments = await tx.fundDeployment.deleteMany();
      const fundContributions = await tx.fundContribution.deleteMany();
      // 8. Clear referral payouts (keep referral links)
      const payouts = await tx.referralBonusPayout.deleteMany();
      // 9. Clear bookings and reminders
      const reminders = await tx.bookingReminder.deleteMany();
      const bookings = await tx.booking.deleteMany();
      // 10. Clear transactions
      const transactions = await tx.transaction.deleteMany();

      // 11. Reset all wallets to $5000
      await tx.wallet.updateMany({
        data: { balance: 5000.00 },
      });

      // 12. Create fresh ledger entries for reset balances
      const wallets = await tx.wallet.findMany();
      for (const wallet of wallets) {
        await tx.ledgerEntry.create({
          data: {
            walletId: wallet.id,
            entryType: 'CREDIT',
            amount: 5000.00,
            balanceAfter: 5000.00,
            description: 'Beta reset — wallet refunded to $5,000',
          },
        });
      }

      // 13. Reset community initiative funding
      await tx.communityInitiative.updateMany({
        data: { currentFunding: 0 },
      });

      // 14. Reset community fund capital
      await tx.communityFund.updateMany({
        data: { totalCapital: 0, deployedCapital: 0 },
      });

      return {
        transactionsCleared: transactions.count,
        bookingsCleared: bookings.count,
        ledgerEntriesCleared: ledger.count,
        creditsCleared: credits.count,
        nettingBatchesCleared: batches.count,
        obligationsCleared: obligations.count,
        walletsReset: wallets.length,
      };
    });

    res.json({
      message: 'Beta data reset complete. All wallets restored to $5,000. Accounts and listings preserved.',
      ...counts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Feature Flags Endpoints ──────────────────────────────────────────
export const getFeatureFlags = async (req: Request, res: Response) => {
  res.json(FeatureFlagService.getAll());
};

export const updateFeatureFlag = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { flag, value } = req.body;
  if (typeof flag !== 'string' || typeof value !== 'boolean') {
    return res.status(400).json({ error: 'flag (string) and value (boolean) required' });
  }
  FeatureFlagService.setFlag(flag as any, value);
  res.json({ message: `Flag "${flag}" set to ${value}`, flags: FeatureFlagService.getAll() });
};

export const activatePhase3 = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  FeatureFlagService.activatePhase3();
  res.json({ message: 'Phase 3 features activated', flags: FeatureFlagService.getAll() });
};
