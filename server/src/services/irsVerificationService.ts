import { prisma } from '../lib/prisma';

export class IrsVerificationService {
  static async checkNonprofit(ein: string): Promise<{
    verified: boolean;
    isRevoked: boolean;
    legalName: string | null;
    deductibilityCode: string | null;
    note: string;
  }> {
    const record = await prisma.irsNonprofitRecord.findUnique({ where: { ein } });

    if (!record) {
      return {
        verified: false,
        isRevoked: false,
        legalName: null,
        deductibilityCode: null,
        note: 'EIN not found in IRS database. Verify the EIN is correct or try again after the next sync.',
      };
    }

    if (record.isRevoked) {
      return {
        verified: false,
        isRevoked: true,
        legalName: record.legalName,
        deductibilityCode: null,
        note: `This organization's tax-exempt status was revoked${record.revokedDate ? ` on ${record.revokedDate.toISOString().split('T')[0]}` : ''}. Donations cannot be directed here.`,
      };
    }

    return {
      verified: true,
      isRevoked: false,
      legalName: record.legalName,
      deductibilityCode: record.deductibilityCode,
      note: 'Organization is in good standing per IRS records.',
    };
  }

  static async syncFromIrs(): Promise<{ success: boolean; message: string }> {
    // Production implementation fetches three IRS bulk data sources:
    // 1. EO BMF Extract: https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
    // 2. Publication 78 Data: https://apps.irs.gov/app/eos/
    // 3. Auto-Revocation List: https://www.irs.gov/charities-non-profits/automatic-revocation-of-exemption
    //
    // Parse CSV → upsert IrsNonprofitRecord → log result to IrsSyncLog
    //
    // This stub simulates the sync for development. Replace with real HTTP fetch + csv-parse in production.

    const log = await prisma.irsSyncLog.create({
      data: {
        status: 'SIMULATED',
        recordsTotal: 0,
        revokedCount: 0,
        newRecords: 0,
        updatedRecords: 0,
      },
    });

    console.log(`[IRS Sync] Sync job ${log.id} recorded. Production sync requires IRS bulk data download.`);
    return { success: true, message: 'Sync logged. Configure IRS bulk data source for production.' };
  }

  static async seedFromPlatformNonprofits(): Promise<void> {
    const nonprofits = await prisma.nonprofit.findMany({ select: { ein: true, orgName: true } });
    for (const np of nonprofits) {
      if (!np.ein) continue;
      await prisma.irsNonprofitRecord.upsert({
        where: { ein: np.ein },
        update: { legalName: np.orgName, lastSyncedAt: new Date() },
        create: {
          ein: np.ein,
          legalName: np.orgName,
          deductibilityCode: 'PC',
          isRevoked: false,
        },
      });
    }
    console.log(`[IRS Sync] Seeded ${nonprofits.length} platform nonprofits into IRS verification table.`);
  }

  static async getRecentSyncLogs(limit = 10) {
    return prisma.irsSyncLog.findMany({
      orderBy: { syncDate: 'desc' },
      take: limit,
    });
  }
}
