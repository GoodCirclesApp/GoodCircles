import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';



export class RegionalMetricsService {
  /**
   * Aggregates metrics for all regions for a specific period (YYYY-MM).
   */
  static async runAggregation(period: string) {
    const regions = await prisma.region.findMany();
    const results = [];

    for (const region of regions) {
      const metrics = await this.calculateMetricsForRegion(region.id, period);
      
      const record = await prisma.regionalMetric.upsert({
        where: {
          regionId_period: {
            regionId: region.id,
            period: period,
          },
        },
        update: metrics,
        create: {
          regionId: region.id,
          period: period,
          ...metrics,
        },
      });
      results.push(record);
    }

    return results;
  }

  /**
   * Calculates metrics for a specific region and period.
   */
  static async calculateMetricsForRegion(regionId: string, period: string) {
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const merchants = await prisma.merchant.findMany({
      where: { regionId },
      include: {
        transactions: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const merchantIds = merchants.map(m => m.id);
    const transactions = merchants.flatMap(m => m.transactions);

    const totalTransactions = transactions.length;
    const totalGtv = transactions.reduce((sum, t) => sum.add(t.grossAmount), new Decimal(0));
    
    // total_local_spend_retained = sum of all internal transactions (using internal balance)
    const totalLocalSpendRetained = transactions
      .filter(t => t.paymentMethod === 'INTERNAL_BALANCE')
      .reduce((sum, t) => sum.add(t.grossAmount), new Decimal(0));

    const totalNonprofitFunding = transactions.reduce((sum, t) => sum.add(new Decimal(t.nonprofitShare.toString())), new Decimal(0));

    // total_community_fund_deployed
    const deployments = await prisma.fundDeployment.findMany({
      where: {
        recipientMerchantId: { in: merchantIds },
        deployedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const totalCommunityFundDeployed = deployments.reduce((sum, d) => sum.add(new Decimal(d.amount.toString())), new Decimal(0));

    // total_jobs_supported = estimated based on merchant transaction volume and industry multipliers
    // For simplicity, we'll use a base multiplier of 0.0001 jobs per dollar of GTV
    const totalJobsSupported = totalGtv.toNumber() * 0.0001;

    const merchantsActive = merchants.filter(m => m.transactions.length > 0).length;
    
    const consumerIds = new Set(transactions.map(t => t.neighborId));
    const consumersActive = consumerIds.size;

    const internalPaymentPct = totalTransactions > 0 
      ? (transactions.filter(t => t.paymentMethod === 'INTERNAL_BALANCE').length / totalTransactions) * 100 
      : 0;

    const avgTransactionValue = totalTransactions > 0 
      ? totalGtv.dividedBy(totalTransactions) 
      : new Decimal(0);

    return {
      totalTransactions,
      totalGtv,
      totalLocalSpendRetained,
      totalNonprofitFunding,
      totalCommunityFundDeployed,
      totalJobsSupported,
      merchantsActive,
      consumersActive,
      internalPaymentPct,
      avgTransactionValue,
    };
  }

  /**
   * Auto-creates regions based on merchant locations if they don't have one.
   * This is a simplified version that groups by city/state.
   */
  static async autoDiscoverRegions() {
    const merchantsWithoutRegion = await prisma.merchant.findMany({
      where: { regionId: null },
      include: { user: true }
    });

    const cityGroups: Record<string, string[]> = {};

    for (const merchant of merchantsWithoutRegion) {
      // In a real app, we'd use geocoding or address fields.
      // Here we'll assume some default city/state for the demo if not present.
      const city = "Default City"; 
      const state = "Default State";
      const key = `${city}, ${state}`;
      
      if (!cityGroups[key]) cityGroups[key] = [];
      cityGroups[key].push(merchant.id);
    }

    for (const [key, merchantIds] of Object.entries(cityGroups)) {
      const [cityName, state] = key.split(', ');
      
      let region = await prisma.region.findFirst({
        where: { cityName, state }
      });

      if (!region) {
        region = await prisma.region.create({
          data: {
            name: `${cityName} Region`,
            cityName,
            state,
          }
        });
      }

      await prisma.merchant.updateMany({
        where: { id: { in: merchantIds } },
        data: { regionId: region.id }
      });
    }
  }
}
