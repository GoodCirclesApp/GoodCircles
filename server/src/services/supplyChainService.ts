import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';



export class SupplyChainService {
  static CATEGORY_THRESHOLD = 75;

  /**
   * Check if a category/region is activated for supply chain mapping.
   */
  static async checkActivationStatus(category: string, regionId: string | null) {
    const latestTracking = await prisma.coopActivationTracking.findFirst({
      where: {
        coopType: 'CATEGORY_SPECIFIC',
        category,
        regionId
      },
      orderBy: { checkDate: 'desc' }
    });

    const merchantCount = latestTracking?.merchantCount || 0;
    const thresholdMet = merchantCount >= this.CATEGORY_THRESHOLD;

    return {
      thresholdMet,
      merchantCount,
      thresholdRequired: this.CATEGORY_THRESHOLD,
      progressPct: Math.min(100, (merchantCount / this.CATEGORY_THRESHOLD) * 100)
    };
  }

  /**
   * Declare an external supply relationship.
   */
  static async declareRelationship(merchantId: string, data: {
    externalSupplierName: string,
    productCategory: string,
    avgMonthlySpend: number
  }) {
    return prisma.supplyRelationship.create({
      data: {
        buyerMerchantId: merchantId,
        supplierType: 'external',
        externalSupplierName: data.externalSupplierName,
        productCategory: data.productCategory,
        avgMonthlySpend: new Decimal(data.avgMonthlySpend)
      }
    });
  }

  /**
   * Get suggested on-platform alternatives for a merchant.
   * Only returns results for activated categories.
   */
  static async getMatches(merchantId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    });
    if (!merchant) throw new Error('Merchant not found');

    const relationships = await prisma.supplyRelationship.findMany({
      where: { buyerMerchantId: merchantId, supplierType: 'external' }
    });

    const matches = [];
    for (const rel of relationships) {
      const { thresholdMet } = await this.checkActivationStatus(rel.productCategory, merchant.regionId);
      if (thresholdMet) {
        const relMatches = await prisma.supplyMatch.findMany({
          where: {
            buyerMerchantId: merchantId,
            productCategory: rel.productCategory,
            status: 'suggested'
          },
          include: { suggestedSupplier: true }
        });
        matches.push(...relMatches);
      }
    }

    return matches;
  }

  /**
   * Run the matching job for a merchant.
   */
  static async runMatchingJob(merchantId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    });
    if (!merchant) throw new Error('Merchant not found');

    const relationships = await prisma.supplyRelationship.findMany({
      where: { buyerMerchantId: merchantId, supplierType: 'external' }
    });

    for (const rel of relationships) {
      // Find potential suppliers on the platform
      const potentialSuppliers = await prisma.merchant.findMany({
        where: {
          id: { not: merchantId },
          businessType: rel.productCategory,
          regionId: merchant.regionId,
          isVerified: true
        }
      });

      for (const supplier of potentialSuppliers) {
        // Calculate potential savings: 5% estimated from fee elimination + co-op pricing
        const potentialSavings = rel.avgMonthlySpend.mul(new Decimal(0.05));
        
        // Match confidence score: 0-1
        // Simple heuristic: same category (1.0), same region (+0.2), verified (+0.2)
        // Capped at 1.0
        let confidence = 0.6; // Base for same category
        if (supplier.regionId === merchant.regionId) confidence += 0.2;
        if (supplier.isVerified) confidence += 0.2;
        confidence = Math.min(1.0, confidence);

        await prisma.supplyMatch.upsert({
          where: {
            // Need a unique constraint or manual check
            // For simplicity, let's just create if not exists
            id: `match-${merchantId}-${supplier.id}-${rel.productCategory}`
          },
          update: {
            potentialSavings,
            matchConfidence: confidence
          },
          create: {
            id: `match-${merchantId}-${supplier.id}-${rel.productCategory}`,
            buyerMerchantId: merchantId,
            suggestedSupplierMerchantId: supplier.id,
            productCategory: rel.productCategory,
            potentialSavings,
            matchConfidence: confidence,
            status: 'suggested'
          }
        });
      }
    }
  }

  /**
   * Get supply chain status for a merchant.
   */
  static async getStatus(merchantId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    });
    if (!merchant) throw new Error('Merchant not found');

    const relationships = await prisma.supplyRelationship.findMany({
      where: { buyerMerchantId: merchantId, supplierType: 'external' }
    });

    const categories = Array.from(new Set(relationships.map(r => r.productCategory)));
    const status = [];

    for (const cat of categories as string[]) {
      const activation = await this.checkActivationStatus(cat, merchant.regionId);
      status.push({
        category: cat,
        ...activation
      });
    }

    return status;
  }

  /**
   * Get platform-wide supply chain overview for admin.
   */
  static async getAdminOverview() {
    const totalRelationships = await prisma.supplyRelationship.count();
    const internalRelationships = await prisma.supplyRelationship.count({
      where: { supplierType: 'internal' }
    });

    const internalizationRate = totalRelationships > 0 
      ? (internalRelationships / totalRelationships) * 100 
      : 0;

    const allMatches = await prisma.supplyMatch.findMany({
      where: { status: 'accepted' }
    });

    const totalSavings = allMatches.reduce((sum, m) => sum.add(m.potentialSavings), new Decimal(0));

    const activations = await prisma.coopActivationTracking.findMany({
      where: { coopType: 'CATEGORY_SPECIFIC' },
      orderBy: { checkDate: 'desc' },
      distinct: ['category', 'regionId']
    });

    return {
      internalizationRate,
      totalSavings,
      categoryActivations: activations.map(a => ({
        category: a.category,
        regionId: a.regionId,
        merchantCount: a.merchantCount,
        thresholdMet: a.thresholdMet
      }))
    };
  }
}
