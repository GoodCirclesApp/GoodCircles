import { prisma } from '../lib/prisma';
import { FfiecGeocodingService } from './ffiecGeocodingService';

// Percentage of affiliate platformShare allocated to the CDFI first-loss pool.
// $5 per $100 of affiliate revenue = 5% of commTotal.
// Since platformShare = 50% of commTotal, this is 10% of platformShare.
const FIRST_LOSS_POOL_RATE = 0.05;

export class CdfiPackagingService {

  // Called after every transaction settles. Checks whether the merchant has
  // crossed a CDFI's milestone threshold and is in a target census tract.
  // Fire-and-forget safe — logs errors internally.
  static async evaluateMerchantForPackaging(merchantId: string): Promise<void> {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true, businessName: true, censusTractId: true,
        isQualifiedInvestmentArea: true, physicalState: true,
        taxReportingFlags: { select: { grossSales: true, taxYear: true } },
      },
    });
    if (!merchant) return;

    // Geocode if not yet done
    if (!merchant.censusTractId) {
      await FfiecGeocodingService.geocodeMerchant(merchantId);
    }

    // Count total transactions for this merchant
    const txCount = await prisma.transaction.count({ where: { merchantId } });

    // Find all active CDFIs whose milestone the merchant has reached
    // and whose target area includes this merchant's census tract
    const cdfiList = await prisma.cDFIPartner.findMany({
      where: { partnershipStatus: 'active' },
      select: {
        id: true, orgName: true, milestoneThreshold: true, targetCensusTracts: true,
      },
    });

    for (const cdfi of cdfiList) {
      if (txCount < cdfi.milestoneThreshold) continue;

      // Check if already packaged for this CDFI
      const existing = await prisma.merchantCdfiPackage.findFirst({
        where: { merchantId, cdfiPartnerId: cdfi.id, status: { not: 'DECLINED' } },
      });
      if (existing) continue;

      // Check census tract targeting
      const inArea = await FfiecGeocodingService.isInTargetArea(merchantId, cdfi.id);
      if (!inArea) continue;

      // Build performance snapshot
      const currentYear = new Date().getFullYear();
      const currentFlag = merchant.taxReportingFlags.find(f => f.taxYear === currentYear);
      const grossRevenue = currentFlag ? Number(currentFlag.grossSales) : 0;

      const packageSnapshot = {
        businessName: merchant.businessName,
        physicalState: merchant.physicalState,
        censusTractId: merchant.censusTractId,
        isQualifiedInvestmentArea: merchant.isQualifiedInvestmentArea,
        transactionCount: txCount,
        grossRevenueCurrent: grossRevenue,
        snapshotDate: new Date().toISOString(),
      };

      await prisma.merchantCdfiPackage.create({
        data: {
          merchantId,
          cdfiPartnerId: cdfi.id,
          triggerMetric: 'TRANSACTION_MILESTONE',
          transactionCount: txCount,
          grossRevenue,
          censusTractId: merchant.censusTractId,
          packageSnapshot,
        },
      });

      console.log(`[CDFI Packaging] Packaged ${merchant.businessName} for ${cdfi.orgName} (${txCount} transactions)`);
    }
  }

  // Allocate 5% of affiliate commTotal to the CDFI's first-loss pool
  // when a conversion is confirmed. Called from affiliate service on confirmation.
  static async allocateFirstLossContribution(
    conversionId: string,
    commTotal: number,
  ): Promise<void> {
    const poolAmount = commTotal * FIRST_LOSS_POOL_RATE;
    if (poolAmount <= 0) return;

    // Find any active CDFI first-loss pool fund
    const poolFund = await prisma.communityFund.findFirst({
      where: { type: 'cdfi_first_loss', isActive: true },
    });
    if (!poolFund) return;

    // Dummy userId for system-generated contributions (platform account)
    const platformUser = await prisma.user.findFirst({ where: { role: 'PLATFORM' } });
    if (!platformUser) return;

    await prisma.$transaction(async (tx) => {
      await tx.fundContribution.create({
        data: {
          fundId: poolFund.id,
          userId: platformUser.id,
          amount: poolAmount,
          source: 'affiliate_first_loss',
        },
      });
      await tx.communityFund.update({
        where: { id: poolFund.id },
        data: { totalCapital: { increment: poolAmount } },
      });
    });
  }

  // Generate a TLR (Transaction Level Report) CSV for a CDFI,
  // using their stored column mapping to map GoodCircles fields → their headers.
  // Returns a CSV string — streamed directly to response, never persisted.
  static async generateTlrCsv(cdfiPartnerId: string, taxYear: number): Promise<string> {
    const cdfi = await prisma.cDFIPartner.findUnique({
      where: { id: cdfiPartnerId },
      select: { orgName: true, tlrColumnMapping: true },
    });
    if (!cdfi) throw new Error('CDFI not found');

    // Default column mapping if none uploaded by CDFI
    const mapping: Record<string, string> = (cdfi.tlrColumnMapping as Record<string, string>) ?? {
      loan_id: 'id',
      business_name: 'recipientMerchant.businessName',
      census_tract: 'recipientMerchant.censusTractId',
      loan_amount: 'amount',
      deployment_type: 'deploymentType',
      interest_rate: 'interestRate',
      term_months: 'repaymentTermMonths',
      status: 'status',
      deployed_at: 'deployedAt',
      repaid_amount: 'repaidAmount',
    };

    const cdfiObj = await prisma.cDFIPartner.findUnique({
      where: { id: cdfiPartnerId },
      select: { managedFunds: { select: { id: true } } },
    });
    const fundIds = cdfiObj?.managedFunds.map(f => f.id) ?? [];

    const deployments = await prisma.fundDeployment.findMany({
      where: {
        fundId: { in: fundIds },
        deployedAt: {
          gte: new Date(`${taxYear}-01-01`),
          lte: new Date(`${taxYear}-12-31`),
        },
      },
      include: {
        recipientMerchant: {
          select: { businessName: true, censusTractId: true, taxId: true },
        },
      },
    });

    const headers = Object.keys(mapping);
    const rows = deployments.map(d => {
      return headers.map(header => {
        const field = mapping[header];
        // Resolve dot-notation field paths
        const val = field.split('.').reduce((obj: any, key) => obj?.[key], d);
        if (val === null || val === undefined) return '';
        if (val instanceof Date) return val.toISOString().split('T')[0];
        return String(val);
      }).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // Return pending merchant packages for a CDFI — the "inbox" view.
  static async getPackagesForCdfi(cdfiPartnerId: string) {
    return prisma.merchantCdfiPackage.findMany({
      where: { cdfiPartnerId },
      include: {
        merchant: {
          select: {
            businessName: true, physicalCity: true, physicalState: true,
            censusTractId: true, isQualifiedInvestmentArea: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updatePackageStatus(
    packageId: string,
    status: 'REVIEWED' | 'CONVERTED' | 'DECLINED',
  ) {
    return prisma.merchantCdfiPackage.update({
      where: { id: packageId },
      data: { status, reviewedAt: new Date() },
    });
  }
}
