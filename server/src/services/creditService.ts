import { prisma } from '../lib/prisma';



export class CreditService {
  /**
   * Check if the cross-category co-op threshold has been met.
   * This gates the "Platform Credits" feature for consumers.
   * Threshold is 200 merchants platform-wide.
   */
  static async isSystemActivated(tx?: any): Promise<boolean> {
    const client = tx || prisma;
    const latestTracking = await client.coopActivationTracking.findFirst({
      where: { coopType: 'CROSS_CATEGORY' },
      orderBy: { checkDate: 'desc' }
    });

    return latestTracking ? latestTracking.thresholdMet : false;
  }

  /**
   * Check if a specific merchant is eligible to accept credits.
   * Requires at least one co-op category active that the merchant belongs to.
   * (Cross-category at 200 merchants OR category-specific at 75 merchants in their category/region).
   */
  static async isMerchantEligible(merchantId: string, tx?: any): Promise<{ eligible: boolean; reason?: string; progress?: number }> {
    const client = tx || prisma;
    
    // 1. Check cross-category activation
    const systemActive = await this.isSystemActivated(client);
    if (systemActive) return { eligible: true };

    // 2. Check category-specific activation
    const merchant = await client.merchant.findUnique({
      where: { id: merchantId },
      include: { listings: true }
    });

    if (!merchant) return { eligible: false, reason: 'Merchant not found' };

    const categories = Array.from(new Set(merchant.listings.map((l: any) => l.category)));
    
    for (const category of categories) {
      const tracking = await client.coopActivationTracking.findFirst({
        where: {
          coopType: 'CATEGORY_SPECIFIC',
          category,
          regionId: merchant.regionId
        },
        orderBy: { checkDate: 'desc' }
      });

      if (tracking && tracking.thresholdMet) {
        return { eligible: true };
      }
    }

    // If not eligible, find the best progress to show
    const latestCross = await client.coopActivationTracking.findFirst({
      where: { coopType: 'CROSS_CATEGORY' },
      orderBy: { checkDate: 'desc' }
    });

    return { 
      eligible: false, 
      reason: 'Co-op activation threshold not yet met for your category or region.',
      progress: latestCross ? latestCross.progressPct : 0
    };
  }

  /**
   * Get the current credit balance for a user.
   */
  static async getBalance(userId: string, tx?: any): Promise<number> {
    const client = tx || prisma;
    const now = new Date();
    
    const credits = await client.creditLedger.findMany({
      where: {
        userId,
        redeemedTransactionId: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    });

    return credits.reduce((sum: number, c: any) => sum + Number(c.amount), 0);
  }

  /**
   * Issue credits to a user.
   */
  static async issueCredits(userId: string, amount: number, source: string, transactionId?: string, circulationCount = 0, tx?: any) {
    const client = tx || prisma;
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return client.creditLedger.create({
      data: {
        userId,
        amount,
        source,
        transactionId,
        circulationCount,
        expiresAt
      }
    });
  }

  /**
   * Transfer credits between users.
   */
  static async transferCredits(fromUserId: string, toUserId: string, amount: number, tx?: any) {
    const client = tx || prisma;
    
    return await client.$transaction(async (t: any) => {
      const balance = await this.getBalance(fromUserId, t);
      if (balance < amount) throw new Error('Insufficient credit balance');

      // Check if both are merchants and if they are eligible
      const fromUser = await t.user.findUnique({ where: { id: fromUserId }, include: { merchant: true } });
      const toUser = await t.user.findUnique({ where: { id: toUserId }, include: { merchant: true } });

      if (fromUser.role === 'MERCHANT') {
        const eligibility = await this.isMerchantEligible(fromUser.merchant.id, t);
        if (!eligibility.eligible) throw new Error('Your merchant account is not yet eligible for credit transfers (Co-op activation required)');
      }

      if (toUser.role === 'MERCHANT') {
        const eligibility = await this.isMerchantEligible(toUser.merchant.id, t);
        if (!eligibility.eligible) throw new Error('Recipient merchant account is not yet eligible for credit transfers (Co-op activation required)');
      }

      const transfer = await t.creditTransfer.create({
        data: { fromUserId, toUserId, amount }
      });

      // Debit from sender (FIFO)
      await this.redeemCreditsInternal(fromUserId, amount, undefined, transfer.id, t);

      // Credit to recipient
      // We need to know the average circulation count of the spent credits
      // For simplicity, we'll just use the max circulation count + 1
      await this.issueCredits(toUserId, amount, 'TRANSFER', undefined, 1, t); // Simplified circulation tracking

      return transfer;
    });
  }

  /**
   * Internal redemption logic used by both transaction payments and transfers.
   */
  private static async redeemCreditsInternal(userId: string, amountToRedeem: number, transactionId?: string, transferId?: string, tx?: any) {
    const client = tx || prisma;
    const now = new Date();
    
    const availableCredits = await client.creditLedger.findMany({
      where: {
        userId,
        redeemedTransactionId: null,
        transferId: null, // Not already transferred in this context
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    let remainingToRedeem = amountToRedeem;
    let totalCirculation = 0;
    let count = 0;
    
    for (const credit of availableCredits) {
      if (remainingToRedeem <= 0) break;

      const creditAmount = Number(credit.amount);
      const portionToRedeem = Math.min(creditAmount, remainingToRedeem);
      
      totalCirculation += credit.circulationCount;
      count++;

      if (creditAmount <= remainingToRedeem) {
        await client.creditLedger.update({
          where: { id: credit.id },
          data: { 
            redeemedTransactionId: transactionId,
            transferId: transferId
          }
        });
        remainingToRedeem -= creditAmount;
      } else {
        await client.creditLedger.update({
          where: { id: credit.id },
          data: { amount: creditAmount - remainingToRedeem }
        });

        await client.creditLedger.create({
          data: {
            userId,
            amount: remainingToRedeem,
            source: credit.source,
            transactionId: credit.transactionId,
            redeemedTransactionId: transactionId,
            transferId: transferId,
            circulationCount: credit.circulationCount,
            expiresAt: credit.expiresAt,
            createdAt: credit.createdAt
          }
        });
        
        remainingToRedeem = 0;
      }
    }

    return { avgCirculation: count > 0 ? totalCirculation / count : 0 };
  }

  /**
   * Redeem credits for a transaction.
   * If the merchant is eligible, they receive the credits (circulation).
   */
  static async redeemCredits(userId: string, amountToRedeem: number, transactionId: string, tx?: any) {
    const client = tx || prisma;
    
    const transaction = await client.transaction.findUnique({
      where: { id: transactionId },
      include: { merchant: true }
    });

    if (!transaction) throw new Error('Transaction not found');

    const { avgCirculation } = await this.redeemCreditsInternal(userId, amountToRedeem, transactionId, undefined, client);

    // If merchant is eligible, they receive the credits
    const eligibility = await this.isMerchantEligible(transaction.merchant.id, client);
    if (eligibility.eligible) {
      // Merchant's user receives the credits
      await this.issueCredits(transaction.merchant.userId, amountToRedeem, 'MERCHANT_REWARD', transactionId, Math.floor(avgCirculation) + 1, client);
    }
  }

  /**
   * Get comprehensive credit velocity metrics.
   * Tracks circulation separately for consumer-to-merchant vs merchant-to-merchant flows.
   */
  static async getVelocityMetrics(tx?: any) {
    const client = tx || prisma;
    const now = new Date();

    // Overall average circulation count
    const overallAvg = await client.creditLedger.aggregate({
      _avg: { circulationCount: true },
      _max: { circulationCount: true },
      _count: { id: true }
    });

    // Consumer-to-merchant: credits earned by consumers (source=DISCOUNT) that were redeemed
    const consumerToMerchant = await client.creditLedger.aggregate({
      where: {
        source: { in: ['DISCOUNT', 'WAIVER_RETURN', 'REFERRAL', 'COMMUNITY_FUND', 'PROMOTIONAL'] },
        redeemedTransactionId: { not: null }
      },
      _avg: { circulationCount: true },
      _count: { id: true }
    });

    // Merchant-to-merchant: credits received by merchants (source=MERCHANT_REWARD) that were transferred or redeemed
    const merchantToMerchant = await client.creditLedger.aggregate({
      where: {
        source: { in: ['MERCHANT_REWARD', 'TRANSFER'] },
        redeemedTransactionId: { not: null }
      },
      _avg: { circulationCount: true },
      _count: { id: true }
    });

    // Total credits issued (all CREDIT entries)
    const totalIssued = await client.creditLedger.aggregate({
      _sum: { amount: true },
      _count: { id: true }
    });

    // Active credits (not redeemed, not expired)
    const activeCredits = await client.creditLedger.aggregate({
      where: {
        redeemedTransactionId: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Redeemed credits
    const redeemedCredits = await client.creditLedger.aggregate({
      where: {
        redeemedTransactionId: { not: null }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Expired credits
    const expiredCredits = await client.creditLedger.aggregate({
      where: {
        redeemedTransactionId: null,
        expiresAt: { lte: now }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Transfer volume
    const transferVolume = await client.creditTransfer.aggregate({
      _sum: { amount: true },
      _count: { id: true }
    });

    // Unique users with active credit balances
    const uniqueHolders = await client.creditLedger.findMany({
      where: {
        redeemedTransactionId: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      select: { userId: true },
      distinct: ['userId']
    });

    return {
      overallVelocity: overallAvg._avg.circulationCount || 0,
      maxCirculation: overallAvg._max.circulationCount || 0,
      totalEntries: overallAvg._count.id,
      consumerToMerchant: {
        avgCirculation: consumerToMerchant._avg.circulationCount || 0,
        redemptionCount: consumerToMerchant._count.id
      },
      merchantToMerchant: {
        avgCirculation: merchantToMerchant._avg.circulationCount || 0,
        redemptionCount: merchantToMerchant._count.id
      },
      supply: {
        totalIssued: Number(totalIssued._sum.amount || 0),
        totalIssuedCount: totalIssued._count.id,
        activeBalance: Number(activeCredits._sum.amount || 0),
        activeCount: activeCredits._count.id,
        redeemedTotal: Number(redeemedCredits._sum.amount || 0),
        redeemedCount: redeemedCredits._count.id,
        expiredTotal: Number(expiredCredits._sum.amount || 0),
        expiredCount: expiredCredits._count.id
      },
      transfers: {
        totalVolume: Number(transferVolume._sum.amount || 0),
        totalCount: transferVolume._count.id
      },
      uniqueHolders: uniqueHolders.length
    };
  }

  /**
   * Get credit velocity (average circulation count) — simple version for backward compat.
   */
  static async getVelocity(tx?: any) {
    const client = tx || prisma;
    const result = await client.creditLedger.aggregate({
      _avg: { circulationCount: true }
    });
    return result._avg.circulationCount || 0;
  }

  /**
   * Get credit history for a user.
   */
  static async getHistory(userId: string, tx?: any) {
    const client = tx || prisma;
    return client.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get credits expiring soon.
   */
  static async getExpiringSoon(userId: string, tx?: any) {
    const client = tx || prisma;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return client.creditLedger.findMany({
      where: {
        userId,
        redeemedTransactionId: null,
        expiresAt: {
          gt: now,
          lte: thirtyDaysFromNow
        }
      }
    });
  }
}
