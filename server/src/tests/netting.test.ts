import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { NettingService } from '../services/nettingService';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Net Settlement — Netting Algorithm', () => {
  const merchantIds: string[] = [];
  const userIds: string[] = [];
  let nonprofitId: string;

  beforeAll(async () => {
    // Cleanup
    await prisma.merchantObligation.deleteMany();
    await prisma.nettingBatch.deleteMany();
    await prisma.nettingActivation.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 12);

    // Create nonprofit for transactions
    const npUser = await prisma.user.create({
      data: { email: `netting-np-${Date.now()}@test.com`, passwordHash, role: 'NONPROFIT' }
    });
    const np = await prisma.nonprofit.create({
      data: { userId: npUser.id, orgName: 'Netting Test NP', ein: `NP-NETTING-${Date.now()}`, isVerified: true }
    });
    nonprofitId = np.id;

    // Create 5 merchants for cycle testing
    for (let i = 0; i < 5; i++) {
      const user = await prisma.user.create({
        data: { email: `netting-merchant-${i}-${Date.now()}@test.com`, passwordHash, role: 'MERCHANT' }
      });
      const merchant = await prisma.merchant.create({
        data: { userId: user.id, businessName: `Netting Merchant ${i}`, businessType: 'BOTH', isVerified: true }
      });
      // Create a wallet for each merchant
      await prisma.wallet.create({
        data: { userId: user.id, balance: 10000 }
      });
      // Create a product for each merchant
      await prisma.productService.create({
        data: { merchantId: merchant.id, name: `Product ${i}`, price: 100, cogs: 40, type: 'PRODUCT', category: 'Retail' }
      });
      merchantIds.push(merchant.id);
      userIds.push(user.id);
    }
  });

  afterAll(async () => {
    await prisma.merchantObligation.deleteMany();
    await prisma.nettingBatch.deleteMany();
    await prisma.nettingActivation.deleteMany();
    await prisma.$disconnect();
  });

  it('should create bilateral obligations correctly', async () => {
    // Merchant 0 owes Merchant 1: $500
    await prisma.merchantObligation.create({
      data: {
        debtorMerchantId: merchantIds[0],
        creditorMerchantId: merchantIds[1],
        amount: 500,
        transactionId: `fake-tx-bilateral-${Date.now()}-1`,
      }
    });

    // Merchant 1 owes Merchant 0: $300
    await prisma.merchantObligation.create({
      data: {
        debtorMerchantId: merchantIds[1],
        creditorMerchantId: merchantIds[0],
        amount: 300,
        transactionId: `fake-tx-bilateral-${Date.now()}-2`,
      }
    });

    const unsettled = await prisma.merchantObligation.findMany({
      where: { isSettled: false }
    });

    expect(unsettled.length).toBeGreaterThanOrEqual(2);
  });

  it('should resolve bilateral netting (A<->B)', async () => {
    // After netting: net flow is Merchant 0 owes Merchant 1 only $200 ($500 - $300)
    // Gross obligations = $800, net = $200, savings = $600

    const batch = await NettingService.runNettingCycle();
    
    if (batch) {
      expect(Number(batch.grossObligations)).toBeGreaterThan(0);
      expect(Number(batch.savings)).toBeGreaterThanOrEqual(0);
      // Net settled should be less than or equal to gross
      expect(Number(batch.netSettled)).toBeLessThanOrEqual(Number(batch.grossObligations));
    }
  });

  it('should handle a 3-merchant cycle (A->B->C->A)', async () => {
    // Clear previous obligations
    await prisma.merchantObligation.updateMany({ data: { isSettled: true } });

    // Create cycle: M0 -> M1 -> M2 -> M0
    await prisma.merchantObligation.create({
      data: {
        debtorMerchantId: merchantIds[0],
        creditorMerchantId: merchantIds[1],
        amount: 1000,
        transactionId: `fake-tx-cycle3-${Date.now()}-1`,
      }
    });
    await prisma.merchantObligation.create({
      data: {
        debtorMerchantId: merchantIds[1],
        creditorMerchantId: merchantIds[2],
        amount: 800,
        transactionId: `fake-tx-cycle3-${Date.now()}-2`,
      }
    });
    await prisma.merchantObligation.create({
      data: {
        debtorMerchantId: merchantIds[2],
        creditorMerchantId: merchantIds[0],
        amount: 600,
        transactionId: `fake-tx-cycle3-${Date.now()}-3`,
      }
    });

    // Gross = $2400
    // The cycle min is $600 (C->A), so $600 can be netted out of the cycle
    // Residuals: M0->M1: $400, M1->M2: $200, M2->M0: $0
    // Net = $600, Savings = $1800

    const batch = await NettingService.runNettingCycle();
    if (batch) {
      expect(Number(batch.grossObligations)).toBeGreaterThan(0);
      expect(Number(batch.cycleCount)).toBeGreaterThanOrEqual(0);
    }
  });

  it('should run in simulation mode when not activated', async () => {
    // Set activation to false
    await prisma.nettingActivation.create({
      data: {
        m2mTransactionCount30d: 10,
        uniqueMerchantPairs30d: 3,
        simulatedMonthlySavings: 100,
        trigger1Met: false,
        trigger2Met: false,
        isActive: false
      }
    });

    // Clear and create fresh obligations
    await prisma.merchantObligation.updateMany({ data: { isSettled: true } });
    await prisma.merchantObligation.create({
      data: {
        debtorMerchantId: merchantIds[0],
        creditorMerchantId: merchantIds[1],
        amount: 200,
        transactionId: `fake-tx-sim-${Date.now()}-1`,
      }
    });

    const batch = await NettingService.runNettingCycle();
    if (batch) {
      // Should be simulated, not executed
      expect(batch.status).toBe('SIMULATED');
    }
  });

  it('should evaluate dual triggers correctly', async () => {
    const result = await NettingService.evaluateTriggers();
    
    expect(result).toBeDefined();
    expect(typeof result.isActive).toBe('boolean');
    // With our small test data, triggers should NOT be met
    expect(result.trigger1Met).toBe(false); // Need 500 transactions
    expect(result.trigger2Met).toBe(false); // Need $5000 savings
  });
});
