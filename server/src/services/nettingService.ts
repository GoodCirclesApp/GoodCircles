import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { WalletService } from './walletService';



export class NettingService {
  /**
   * Evaluates activation triggers and updates NettingActivation table.
   * Runs weekly.
   */
  static async evaluateTriggers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Volume Gate: 500 M2M transactions, 50 unique pairs
    const m2mTransactions = await prisma.merchantObligation.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

    const m2mCount = m2mTransactions.length;
    const uniquePairs = new Set(m2mTransactions.map(t => 
      [t.debtorMerchantId, t.creditorMerchantId].sort().join('-')
    )).size;

    const trigger1Met = m2mCount >= 500 && uniquePairs >= 50;

    // 2. Value Gate: Simulated monthly savings > $5,000
    // We look at the last 30 days of simulated batches
    const simulatedBatches = await prisma.nettingBatch.findMany({
      where: {
        status: 'SIMULATED',
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const totalSimulatedSavings = simulatedBatches.reduce(
      (acc, batch) => acc.add(batch.savings), 
      new Decimal(0)
    );

    const trigger2Met = totalSimulatedSavings.gt(new Decimal(5000));

    // Check if both met for 2 consecutive weeks
    const lastActivation = await prisma.nettingActivation.findFirst({
      orderBy: { checkDate: 'desc' }
    });

    let isActive = lastActivation?.isActive || false;

    if (!isActive && trigger1Met && trigger2Met) {
      // Check previous week
      const previousCheck = await prisma.nettingActivation.findFirst({
        where: { checkDate: { lt: new Date() } },
        orderBy: { checkDate: 'desc' }
      });

      if (previousCheck?.trigger1Met && previousCheck?.trigger2Met) {
        isActive = true;
        console.log('NETTING ACTIVATED: Both triggers met for 2 consecutive weeks.');
      }
    }

    return await prisma.nettingActivation.create({
      data: {
        m2mTransactionCount30d: m2mCount,
        uniqueMerchantPairs30d: uniquePairs,
        simulatedMonthlySavings: totalSimulatedSavings,
        trigger1Met,
        trigger2Met,
        isActive
      }
    });
  }

  /**
   * Main netting algorithm. Runs daily.
   */
  static async runNettingCycle() {
    const activation = await prisma.nettingActivation.findFirst({
      orderBy: { checkDate: 'desc' }
    });
    const isEnabled = activation?.isActive || false;

    // 1. Get unsettled obligations.
    // In simulation mode only pull obligations that have never been assigned to a batch
    // (batchId: null), so each obligation is simulated exactly once and stale entries
    // don't inflate projected savings on subsequent daily runs.
    // In executed mode pull all unsettled (including previously-simulated) so none slip through.
    const obligationFilter = isEnabled
      ? { isSettled: false }
      : { isSettled: false, batchId: null };

    const obligations = await prisma.merchantObligation.findMany({
      where: obligationFilter,
      include: { transaction: true }
    });

    if (obligations.length === 0) return null;

    const grossObligations = obligations.reduce(
      (acc, o) => acc.add(o.amount), 
      new Decimal(0)
    );

    // 2. Multilateral Netting Algorithm
    // Map of merchantId -> netBalance
    const balances: Record<string, Decimal> = {};
    const merchants = new Set<string>();

    obligations.forEach(o => {
      merchants.add(o.debtorMerchantId);
      merchants.add(o.creditorMerchantId);

      balances[o.debtorMerchantId] = (balances[o.debtorMerchantId] || new Decimal(0)).sub(o.amount);
      balances[o.creditorMerchantId] = (balances[o.creditorMerchantId] || new Decimal(0)).add(o.amount);
    });

    // Separate Debtors and Creditors
    const debtors: { id: string; balance: Decimal }[] = [];
    const creditors: { id: string; balance: Decimal }[] = [];

    for (const id in balances) {
      if (balances[id].lt(0)) {
        debtors.push({ id, balance: balances[id].abs() });
      } else if (balances[id].gt(0)) {
        creditors.push({ id, balance: balances[id] });
      }
    }

    // Match Debtors to Creditors to find minimal settlements
    const settlements: { debtor: string; creditor: string; amount: Decimal }[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const amount = Decimal.min(debtor.balance, creditor.balance);

      if (amount.gt(0)) {
        settlements.push({ debtor: debtor.id, creditor: creditor.id, amount });
      }

      debtor.balance = debtor.balance.sub(amount);
      creditor.balance = creditor.balance.sub(amount);

      if (debtor.balance.isZero()) dIdx++;
      if (creditor.balance.isZero()) cIdx++;
    }

    const netSettled = settlements.reduce((acc, s) => acc.add(s.amount), new Decimal(0));
    // Savings = Gross - Net (This is the amount of money that didn't have to move)
    // In terms of fees, it's the fees avoided on the gross volume
    const savings = grossObligations.sub(netSettled);

    // 3. Simulation vs Execution Branching
    const status = isEnabled ? 'EXECUTED' : 'SIMULATED';

    return await prisma.$transaction(async (tx) => {
      const batch = await tx.nettingBatch.create({
        data: {
          grossObligations,
          netSettled,
          savings,
          status,
          merchantCount: merchants.size,
          cycleCount: obligations.length - settlements.length // Approximation of cycles resolved
        }
      });

      if (isEnabled) {
        // Execute settlements via internal wallet transfers
        for (const s of settlements) {
          const debtorMerchant = await tx.merchant.findUnique({ where: { id: s.debtor } });
          const creditorMerchant = await tx.merchant.findUnique({ where: { id: s.creditor } });

          if (debtorMerchant && creditorMerchant) {
            await WalletService.fundWallet(
              debtorMerchant.userId, 
              -Number(s.amount), 
              `Netting Settlement (Batch ${batch.id})`,
              tx
            );
            await WalletService.fundWallet(
              creditorMerchant.userId, 
              Number(s.amount), 
              `Netting Settlement (Batch ${batch.id})`,
              tx
            );
          }
        }

        // Mark obligations as settled
        await tx.merchantObligation.updateMany({
          where: { id: { in: obligations.map(o => o.id) } },
          data: { isSettled: true, batchId: batch.id }
        });
      } else {
        // Just link obligations to the simulated batch
        await tx.merchantObligation.updateMany({
          where: { id: { in: obligations.map(o => o.id) } },
          // We don't mark as settled in simulation mode so they can be netted again
          data: { batchId: batch.id }
        });
      }

      return batch;
    });
  }

  static async getStatus() {
    const activation = await prisma.nettingActivation.findFirst({
      orderBy: { checkDate: 'desc' }
    });
    return {
      isActive: activation?.isActive || false,
      triggers: {
        volume: {
          current: activation?.m2mTransactionCount30d || 0,
          target: 500,
          met: activation?.trigger1Met || false
        },
        pairs: {
          current: activation?.uniqueMerchantPairs30d || 0,
          target: 50,
          met: activation?.trigger1Met || false
        },
        savings: {
          current: Number(activation?.simulatedMonthlySavings || 0),
          target: 5000,
          met: activation?.trigger2Met || false
        }
      }
    };
  }

  static async getHistory() {
    return await prisma.nettingBatch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30
    });
  }

  static async getSavings() {
    const executed = await prisma.nettingBatch.aggregate({
      where: { status: 'EXECUTED' },
      _sum: { savings: true }
    });
    const simulated = await prisma.nettingBatch.aggregate({
      where: { status: 'SIMULATED' },
      _sum: { savings: true }
    });

    return {
      actual: executed._sum.savings || new Decimal(0),
      projected: simulated._sum.savings || new Decimal(0)
    };
  }

  static async getActivationHistory() {
    return await prisma.nettingActivation.findMany({
      orderBy: { checkDate: 'desc' }
    });
  }

  /**
   * 1099-B Compliance Data Export (IRTA Standards)
   */
  static async getComplianceData(merchantId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const sales = await prisma.merchantObligation.findMany({
      where: {
        creditorMerchantId: merchantId,
        createdAt: { gte: startDate, lte: endDate },
        isSettled: true
      },
      include: { transaction: true }
    });

    const purchases = await prisma.merchantObligation.findMany({
      where: {
        debtorMerchantId: merchantId,
        createdAt: { gte: startDate, lte: endDate },
        isSettled: true
      },
      include: { transaction: true }
    });

    return {
      merchantId,
      year,
      grossSales: sales.reduce((acc, s) => acc.add(s.amount), new Decimal(0)),
      grossPurchases: purchases.reduce((acc, p) => acc.add(p.amount), new Decimal(0)),
      transactionCount: sales.length + purchases.length,
      details: {
        sales,
        purchases
      }
    };
  }
}
