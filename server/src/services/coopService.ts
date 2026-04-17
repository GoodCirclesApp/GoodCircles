import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';



export class CoopService {
  // TIER 1 Threshold: 200+ total active verified merchants platform-wide
  static readonly TIER1_THRESHOLD = 200;
  // TIER 2 Threshold: 75+ merchants in the same business_type within a region
  static readonly TIER2_THRESHOLD = 75;
  // Logistics radius in miles
  static readonly LOGISTICS_RADIUS_MILES = 150;

  /**
   * Weekly job to evaluate all category/region combinations against thresholds
   */
  static async evaluateActivationThresholds() {
    const checkDate = new Date();
    console.log(`[CoopService] Starting weekly threshold evaluation: ${checkDate.toISOString()}`);

    // 1. Evaluate TIER 1: Cross-Category
    const totalMerchants = await prisma.merchant.count({
      where: { isVerified: true, user: { isActive: true } }
    });

    const tier1Met = totalMerchants >= this.TIER1_THRESHOLD;
    const tier1Progress = Math.min(100, (totalMerchants / this.TIER1_THRESHOLD) * 100);

    await prisma.coopActivationTracking.create({
      data: {
        checkDate,
        coopType: 'CROSS_CATEGORY',
        merchantCount: totalMerchants,
        thresholdRequired: this.TIER1_THRESHOLD,
        thresholdMet: tier1Met,
        progressPct: tier1Progress
      }
    });

    if (tier1Met) {
      await this.checkAndActivateGroup('CROSS_CATEGORY', null, null);
    }

    // 2. Evaluate TIER 2: Category-Specific
    // We group merchants by category and regionId
    // For simplicity in this implementation, we assume regionId is pre-assigned or we use a simple clustering
    // In a real app, we might use PostGIS or a similar tool for radius checks.
    // Here we'll use the regionId field on the Merchant model.
    
    const categoryRegionGroups = await prisma.merchant.groupBy({
      by: ['businessType', 'regionId'],
      where: { isVerified: true, user: { isActive: true }, regionId: { not: null } } as any,
      _count: {
        id: true
      }
    });

    for (const group of categoryRegionGroups) {
      const count = group._count.id;
      const category = group.businessType;
      const regionId = group.regionId!;
      
      const tier2Met = count >= this.TIER2_THRESHOLD;
      const tier2Progress = Math.min(100, (count / this.TIER2_THRESHOLD) * 100);

      await prisma.coopActivationTracking.create({
        data: {
          checkDate,
          coopType: 'CATEGORY_SPECIFIC',
          category,
          regionId,
          merchantCount: count,
          thresholdRequired: this.TIER2_THRESHOLD,
          thresholdMet: tier2Met,
          progressPct: tier2Progress
        }
      });

      if (tier2Met) {
        await this.checkAndActivateGroup('CATEGORY_SPECIFIC', category, regionId);
      }
    }
  }

  /**
   * Checks if a group has met thresholds for 2 consecutive checks and activates it
   */
  private static async checkAndActivateGroup(coopType: string, category: string | null, regionId: string | null) {
    // Check if group is already active
    const existingGroup = await prisma.purchasingGroup.findFirst({
      where: {
        coopType,
        category,
        regionId,
        status: 'ACTIVE'
      }
    });

    if (existingGroup) return;

    // Check last 2 tracking records
    const lastTwoRecords = await prisma.coopActivationTracking.findMany({
      where: {
        coopType,
        category,
        regionId
      },
      orderBy: { checkDate: 'desc' },
      take: 2
    });

    if (lastTwoRecords.length === 2 && lastTwoRecords.every(r => r.thresholdMet)) {
      // ACTIVATE!
      console.log(`[CoopService] Activating ${coopType} group for ${category || 'All'} in ${regionId || 'Global'}`);
      
      const groupName = category 
        ? `${category} Purchasing Cooperative (${regionId})`
        : `Global Merchant Services Cooperative`;

      const group = await prisma.purchasingGroup.create({
        data: {
          name: groupName,
          coopType,
          category,
          regionId,
          minMembers: coopType === 'CROSS_CATEGORY' ? this.TIER1_THRESHOLD : this.TIER2_THRESHOLD,
          status: 'ACTIVE',
          activatedAt: new Date()
        }
      });

      // Auto-enroll eligible merchants
      const eligibleMerchants = await prisma.merchant.findMany({
        where: {
          isVerified: true,
          user: { isActive: true },
          businessType: category || undefined,
          regionId: regionId || undefined
        } as any
      });

      for (const merchant of eligibleMerchants) {
        await prisma.groupMember.upsert({
          where: {
            groupId_merchantId: {
              groupId: group.id,
              merchantId: merchant.id
            }
          },
          update: { isActive: true },
          create: {
            groupId: group.id,
            merchantId: merchant.id,
            isActive: true
          }
        });
      }

      // In a real app, we would trigger notifications here
      console.log(`[CoopService] Notified ${eligibleMerchants.length} merchants about new co-op: ${group.name}`);
    }
  }

  static async getMerchantCoopStatus(merchantId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { user: true }
    });

    if (!merchant) throw new Error('Merchant not found');

    // 1. Cross-Category Progress
    const tier1Latest = await prisma.coopActivationTracking.findFirst({
      where: { coopType: 'CROSS_CATEGORY' },
      orderBy: { checkDate: 'desc' }
    });

    // 2. Category-Specific Progress
    const tier2Latest = await prisma.coopActivationTracking.findFirst({
      where: {
        coopType: 'CATEGORY_SPECIFIC',
        category: merchant.businessType,
        regionId: (merchant as any).regionId
      },
      orderBy: { checkDate: 'desc' }
    });

    // 3. Active Groups
    const activeGroups = await prisma.purchasingGroup.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { coopType: 'CROSS_CATEGORY' },
          { coopType: 'CATEGORY_SPECIFIC', category: merchant.businessType, regionId: (merchant as any).regionId }
        ]
      },
      include: {
        members: { where: { merchantId } }
      }
    });

    return {
      tier1: tier1Latest || { progressPct: 0, merchantCount: 0, thresholdRequired: this.TIER1_THRESHOLD },
      tier2: tier2Latest || { progressPct: 0, merchantCount: 0, thresholdRequired: this.TIER2_THRESHOLD },
      activeGroups: activeGroups.map(g => ({
        ...g,
        isMember: g.members.length > 0
      }))
    };
  }

  static async getCategoryProgress(category: string, regionId: string) {
    const latest = await prisma.coopActivationTracking.findFirst({
      where: { category, regionId },
      orderBy: { checkDate: 'desc' }
    });

    const merchants = await prisma.merchant.findMany({
      where: { businessType: category, regionId, isVerified: true } as any,
      select: { businessName: true }
    });

    return {
      progress: latest,
      participatingMerchants: merchants.map(m => m.businessName)
    };
  }

  static async createDeal(groupId: string, dealData: any) {
    const group = await prisma.purchasingGroup.findUnique({
      where: { id: groupId }
    });

    if (!group || group.status !== 'ACTIVE') {
      throw new Error('Group is not active or does not exist');
    }

    return prisma.groupDeal.create({
      data: {
        groupId,
        supplierName: dealData.supplierName,
        productDescription: dealData.productDescription,
        unitPriceRetail: dealData.unitPriceRetail,
        unitPriceGroup: dealData.unitPriceGroup,
        minQuantity: dealData.minQuantity,
        deadline: new Date(dealData.deadline),
        status: 'OPEN'
      }
    });
  }

  static async commitToDeal(dealId: string, merchantId: string, quantity: number) {
    const deal = await prisma.groupDeal.findUnique({
      where: { id: dealId },
      include: { group: true }
    });

    if (!deal || deal.status !== 'OPEN') {
      throw new Error('Deal is not open or does not exist');
    }

    // Check if merchant is in the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_merchantId: {
          groupId: deal.groupId,
          merchantId
        }
      }
    });

    if (!membership || !membership.isActive) {
      throw new Error('Merchant is not an active member of this group');
    }

    const commitment = await prisma.groupCommitment.upsert({
      where: {
        dealId_merchantId: {
          dealId,
          merchantId
        }
      },
      update: { quantity },
      create: {
        dealId,
        merchantId,
        quantity
      }
    });

    // Update current commitments
    const totalCommitments = await prisma.groupCommitment.aggregate({
      where: { dealId },
      _sum: { quantity: true }
    });

    await prisma.groupDeal.update({
      where: { id: dealId },
      data: { currentCommitments: totalCommitments._sum.quantity || 0 }
    });

    return commitment;
  }

  static async processDealLifecycles() {
    const now = new Date();
    const openDeals = await prisma.groupDeal.findMany({
      where: { status: 'OPEN', deadline: { lte: now } }
    });

    for (const deal of openDeals) {
      if (deal.currentCommitments >= deal.minQuantity) {
        await prisma.groupDeal.update({
          where: { id: deal.id },
          data: { status: 'COMMITTED' }
        });
        console.log(`[CoopService] Deal ${deal.id} COMMITTED. Notifying group admin.`);
      } else {
        await prisma.groupDeal.update({
          where: { id: deal.id },
          data: { status: 'EXPIRED' }
        });
        console.log(`[CoopService] Deal ${deal.id} EXPIRED. Threshold not met.`);
      }
    }
  }

  static async getMerchantSavings(merchantId: string) {
    const fulfilledDeals = await prisma.groupDeal.findMany({
      where: { status: 'FULFILLED' },
      include: {
        commitments: {
          where: { merchantId }
        }
      }
    });

    let totalSavings = 0;
    for (const deal of fulfilledDeals) {
      const commitment = deal.commitments[0];
      if (commitment) {
        const savingsPerUnit = Number(deal.unitPriceRetail) - Number(deal.unitPriceGroup);
        totalSavings += savingsPerUnit * commitment.quantity;
      }
    }

    return { totalSavings };
  }

  static async getAdminImpact() {
    const fulfilledDeals = await prisma.groupDeal.findMany({
      where: { status: 'FULFILLED' },
      include: { group: true }
    });

    const impactByCategory: Record<string, number> = {};
    let totalPlatformSavings = 0;

    for (const deal of fulfilledDeals) {
      const savingsPerUnit = Number(deal.unitPriceRetail) - Number(deal.unitPriceGroup);
      const dealSavings = savingsPerUnit * deal.currentCommitments;
      totalPlatformSavings += dealSavings;

      const category = deal.group.category || 'Cross-Category';
      impactByCategory[category] = (impactByCategory[category] || 0) + dealSavings;
    }

    return {
      totalPlatformSavings,
      impactByCategory
    };
  }
}
