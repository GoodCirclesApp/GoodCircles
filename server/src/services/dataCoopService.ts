import { prisma } from '../lib/prisma';
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth } from 'date-fns';



export class DataCoopService {
  private static readonly ACTIVATION_THRESHOLD = 10;

  static async joinCoop(merchantId: string) {
    const existing = await prisma.dataCoopMember.findUnique({
      where: { merchantId }
    });

    if (existing) {
      if (existing.optedOutAt) {
        return prisma.dataCoopMember.update({
          where: { merchantId },
          data: { optedOutAt: null, optedInAt: new Date() }
        });
      }
      return existing;
    }

    return prisma.dataCoopMember.create({
      data: { merchantId }
    });
  }

  static async leaveCoop(merchantId: string) {
    return prisma.dataCoopMember.update({
      where: { merchantId },
      data: { optedOutAt: new Date() }
    });
  }

  static async getCoopStatus(merchantId: string) {
    const member = await prisma.dataCoopMember.findUnique({
      where: { merchantId }
    });

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { listings: true }
    });

    if (!merchant) throw new Error('Merchant not found');

    const categories = Array.from(new Set(merchant.listings.map(l => l.category)));
    const regionId = merchant.regionId;

    const statuses = await Promise.all(categories.map(async (category) => {
      const activation = await prisma.dataCoopActivation.findFirst({
        where: { category, regionId },
        orderBy: { checkDate: 'desc' }
      });

      const currentCount = await prisma.dataCoopMember.count({
        where: {
          optedOutAt: null,
          merchant: {
            regionId,
            listings: { some: { category } }
          }
        }
      });

      return {
        category,
        regionId,
        currentCount,
        thresholdRequired: this.ACTIVATION_THRESHOLD,
        thresholdMet: currentCount >= this.ACTIVATION_THRESHOLD,
        insightsAvailable: activation?.insightsAvailable || false
      };
    }));

    return {
      isMember: !!member && !member.optedOutAt,
      optedInAt: member?.optedInAt,
      statuses
    };
  }

  static async collectAnonymizedData() {
    const yesterday = subDays(new Date(), 1);
    const start = startOfDay(yesterday);
    const end = endOfDay(yesterday);

    // Get all transactions from opted-in merchants
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        merchant: {
          dataCoopMember: {
            optedOutAt: null
          }
        }
      },
      include: {
        productService: true,
        merchant: true
      }
    });

    const anonymized = transactions.map(t => ({
      category: t.productService.category,
      regionId: t.merchant.regionId,
      grossAmount: Number(t.grossAmount),
      nonprofitShare: Number(t.nonprofitShare),
      platformFee: Number(t.platformFee),
      merchantNet: Number(t.merchantNet),
      transactionDate: t.createdAt
    }));

    if (anonymized.length > 0) {
      // Use individual creates instead of createMany for better SQLite compatibility and error reporting
      for (const data of anonymized) {
        await prisma.anonymizedTransaction.create({
          data
        });
      }
    }

    return anonymized.length;
  }

  static async evaluateActivationThresholds() {
    // Get all active categories and regions
    const merchants = await prisma.merchant.findMany({
      where: {
        dataCoopMember: {
          optedOutAt: null
        }
      },
      include: {
        listings: true
      }
    });

    const combinations = new Map<string, { category: string, regionId: string | null, count: number }>();

    for (const m of merchants) {
      const categories = new Set(m.listings.map(l => l.category));
      for (const cat of categories) {
        const key = `${cat}|${m.regionId}`;
        const existing = combinations.get(key) || { category: cat, regionId: m.regionId, count: 0 };
        existing.count++;
        combinations.set(key, existing);
      }
    }

    const results = [];
    for (const combo of combinations.values()) {
      const thresholdMet = combo.count >= this.ACTIVATION_THRESHOLD;
      
      const activation = await prisma.dataCoopActivation.create({
        data: {
          category: combo.category,
          regionId: combo.regionId,
          optedInMemberCount: combo.count,
          thresholdRequired: this.ACTIVATION_THRESHOLD,
          thresholdMet,
          insightsAvailable: thresholdMet // For now, if threshold met, insights are available (or will be after next monthly job)
        }
      });
      results.push(activation);
    }

    return results;
  }

  static async generateInsights() {
    const lastMonth = subDays(new Date(), 30);
    const start = startOfMonth(lastMonth);
    const end = endOfMonth(lastMonth);
    const period = format(start, 'yyyy-MM');

    // Only generate for activated combinations
    // Fetch all activated records and filter for distinct category/regionId manually to avoid SQLite/Prisma distinct quirks
    const allActivated = await prisma.dataCoopActivation.findMany({
      where: { thresholdMet: true },
      orderBy: { checkDate: 'desc' }
    });

    const seen = new Set<string>();
    const activated = allActivated.filter(act => {
      const key = `${act.category}|${act.regionId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    for (const act of activated) {
      const data = await prisma.anonymizedTransaction.findMany({
        where: {
          category: act.category,
          regionId: act.regionId,
          transactionDate: { gte: start, lte: end }
        }
      });

      if (data.length === 0) continue;

      // a. Average transaction value
      const totalGross = data.reduce((sum, t) => sum + t.grossAmount, 0);
      const avgValue = totalGross / data.length;
      
      // Safety check for numeric values
      if (isNaN(avgValue) || !isFinite(avgValue)) continue;

      // b. Demand trends (MoM growth) - would need previous month data
      // For simplicity, let's just store current metrics
      
      const insights = [
        {
          category: act.category,
          regionId: act.regionId,
          metricName: 'AVG_TRANSACTION_VALUE',
          metricValue: avgValue,
          period,
          statisticalConfidence: 0.9,
          memberCountAtGeneration: act.optedInMemberCount
        },
        {
          category: act.category,
          regionId: act.regionId,
          metricName: 'TOTAL_VOLUME',
          metricValue: totalGross,
          period,
          statisticalConfidence: 0.9,
          memberCountAtGeneration: act.optedInMemberCount
        }
      ];

      for (const insight of insights) {
        await prisma.marketInsight.create({
          data: insight
        });
      }
    }
  }

  static async getInsights(merchantId: string, category: string, regionId: string | null) {
    // Check if merchant is opted in
    const member = await prisma.dataCoopMember.findUnique({
      where: { merchantId }
    });

    const isMember = !!member && !member.optedOutAt;

    if (!isMember) {
      // Check if they have premium access
      const access = await prisma.dataCoopAccess.findFirst({
        where: {
          merchantId,
          category,
          regionId,
          expiresAt: { gte: new Date() }
        }
      });

      if (!access) {
        throw new Error('Access denied. Join the Data Coop or purchase premium access.');
      }
    }

    // Check if insights are activated for this combo
    const activation = await prisma.dataCoopActivation.findFirst({
      where: { category, regionId, thresholdMet: true },
      orderBy: { checkDate: 'desc' }
    });

    if (!activation) {
      throw new Error('Insights not yet available for this category/region.');
    }

    return prisma.marketInsight.findMany({
      where: { category, regionId },
      orderBy: { period: 'desc' }
    });
  }

  static async purchasePremiumAccess(merchantId: string, category: string, regionId: string | null) {
    // In a real app, this would involve a payment
    // For now, we just grant access for 30 days
    return prisma.dataCoopAccess.create({
      data: {
        merchantId,
        category,
        regionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  static async getAdminDashboard() {
    const totalMembers = await prisma.dataCoopMember.count({ where: { optedOutAt: null } });
    const totalMerchants = await prisma.merchant.count();
    const activations = await prisma.dataCoopActivation.findMany({
      distinct: ['category', 'regionId'],
      orderBy: { checkDate: 'desc' }
    });
    
    const premiumRevenue = await prisma.dataCoopAccess.count() * 25; // Assume $25 per access

    return {
      optInRate: totalMerchants > 0 ? totalMembers / totalMerchants : 0,
      totalMembers,
      activeCategories: activations.filter(a => a.thresholdMet).length,
      totalCategories: activations.length,
      premiumRevenue
    };
  }
}
