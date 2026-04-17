import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { WalletService } from '../services/walletService';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Wallet & Ledger Integrity', () => {
  let consumerId: string;
  let merchantUserId: string;
  let merchantId: string;
  let walletId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', 12);

    // Create consumer with wallet
    const consumer = await prisma.user.create({
      data: { email: `wallet-test-consumer-${Date.now()}@test.com`, passwordHash, role: 'NEIGHBOR' }
    });
    consumerId = consumer.id;
    const wallet = await prisma.wallet.create({
      data: { userId: consumer.id, balance: 0 }
    });
    walletId = wallet.id;

    // Create merchant with wallet
    const mUser = await prisma.user.create({
      data: { email: `wallet-test-merchant-${Date.now()}@test.com`, passwordHash, role: 'MERCHANT' }
    });
    merchantUserId = mUser.id;
    const merchant = await prisma.merchant.create({
      data: { userId: mUser.id, businessName: 'Wallet Test Merchant', businessType: 'BOTH', isVerified: true }
    });
    merchantId = merchant.id;
    await prisma.wallet.create({
      data: { userId: mUser.id, balance: 0 }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Funding & Balance', () => {
    it('should fund a wallet and reflect correct balance', async () => {
      await WalletService.fundWallet(consumerId, 500);
      const wallet = await prisma.wallet.findUnique({ where: { userId: consumerId } });
      expect(Number(wallet!.balance)).toBe(500);
    });

    it('should create a CREDIT ledger entry when funding', async () => {
      const entries = await prisma.ledgerEntry.findMany({
        where: { wallet: { userId: consumerId }, entryType: 'CREDIT' }
      });
      expect(entries.length).toBeGreaterThanOrEqual(1);
      expect(Number(entries[0].amount)).toBe(500);
    });

    it('should reject withdrawal exceeding balance', async () => {
      await expect(
        WalletService.withdraw(consumerId, 1000)
      ).rejects.toThrow();
    });

    it('should process withdrawal correctly', async () => {
      await WalletService.withdraw(consumerId, 100);
      const wallet = await prisma.wallet.findUnique({ where: { userId: consumerId } });
      expect(Number(wallet!.balance)).toBe(400);
    });
  });

  describe('Double-Entry Integrity', () => {
    it('sum of all credits should equal sum of all debits + remaining balance', async () => {
      const entries = await prisma.ledgerEntry.findMany({
        where: { wallet: { userId: consumerId } }
      });

      const totalCredits = entries
        .filter(e => e.entryType === 'CREDIT')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const totalDebits = entries
        .filter(e => e.entryType === 'DEBIT')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const wallet = await prisma.wallet.findUnique({ where: { userId: consumerId } });
      const balance = Number(wallet!.balance);

      // Credits - Debits should equal current balance
      expect(totalCredits - totalDebits).toBeCloseTo(balance, 2);
    });

    it('balanceAfter should be monotonically consistent in ledger entries', async () => {
      const entries = await prisma.ledgerEntry.findMany({
        where: { wallet: { userId: consumerId } },
        orderBy: { createdAt: 'asc' }
      });

      for (let i = 1; i < entries.length; i++) {
        const prevBalance = Number(entries[i - 1].balanceAfter);
        const currentAmount = Number(entries[i].amount);
        const currentBalance = Number(entries[i].balanceAfter);

        if (entries[i].entryType === 'CREDIT') {
          expect(currentBalance).toBeCloseTo(prevBalance + currentAmount, 2);
        } else {
          expect(currentBalance).toBeCloseTo(prevBalance - currentAmount, 2);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle funding with $0 gracefully', async () => {
      // $0 funding should either be rejected or be a no-op
      try {
        await WalletService.fundWallet(consumerId, 0);
      } catch {
        // Expected — $0 funding should fail
      }
      const wallet = await prisma.wallet.findUnique({ where: { userId: consumerId } });
      expect(Number(wallet!.balance)).toBe(400); // Unchanged
    });

    it('should handle very small amounts ($0.01)', async () => {
      const balanceBefore = Number(
        (await prisma.wallet.findUnique({ where: { userId: consumerId } }))!.balance
      );
      
      await WalletService.fundWallet(consumerId, 0.01);
      
      const balanceAfter = Number(
        (await prisma.wallet.findUnique({ where: { userId: consumerId } }))!.balance
      );
      
      expect(balanceAfter).toBeCloseTo(balanceBefore + 0.01, 2);
    });

    it('should handle large amounts ($1,000,000)', async () => {
      await WalletService.fundWallet(consumerId, 1000000);
      const wallet = await prisma.wallet.findUnique({ where: { userId: consumerId } });
      expect(Number(wallet!.balance)).toBeGreaterThan(1000000);
    });
  });
});
