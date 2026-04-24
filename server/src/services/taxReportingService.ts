import { prisma } from '../lib/prisma';
import { sendEmail } from './emailService';

const THRESHOLD_1099K = 600; // IRS current threshold (post-2023 rule)
const INFORM_TX_THRESHOLD = 200;
const INFORM_REVENUE_THRESHOLD = 5000;

export class TaxReportingService {
  // Called after every settled transaction to update running totals
  static async trackTransaction(merchantId: string, grossAmount: number, year?: number) {
    const taxYear = year ?? new Date().getFullYear();

    const flag = await prisma.taxReportingFlag.upsert({
      where: { merchantId_taxYear: { merchantId, taxYear } },
      update: { grossSales: { increment: grossAmount }, updatedAt: new Date() },
      create: { merchantId, taxYear, grossSales: grossAmount },
    });

    const informFlag = await prisma.informActFlag.upsert({
      where: { merchantId_taxYear: { merchantId, taxYear } },
      update: {
        transactionCount: { increment: 1 },
        grossRevenue: { increment: grossAmount },
        updatedAt: new Date(),
      },
      create: { merchantId, taxYear, transactionCount: 1, grossRevenue: grossAmount },
    });

    // Check 1099-K threshold
    if (!flag.requires1099K && Number(flag.grossSales) + grossAmount >= THRESHOLD_1099K) {
      await prisma.taxReportingFlag.update({
        where: { merchantId_taxYear: { merchantId, taxYear } },
        data: { requires1099K: true, flaggedAt: new Date() },
      });
    }

    // Check INFORM Act thresholds
    const newTxCount = informFlag.transactionCount + 1;
    const newRevenue = Number(informFlag.grossRevenue) + grossAmount;
    if (
      !informFlag.requiresVerification &&
      (newTxCount >= INFORM_TX_THRESHOLD || newRevenue >= INFORM_REVENUE_THRESHOLD)
    ) {
      await prisma.informActFlag.update({
        where: { merchantId_taxYear: { merchantId, taxYear } },
        data: { requiresVerification: true, flaggedAt: new Date() },
      });
    }
  }

  static async get1099KReport(taxYear: number) {
    return prisma.taxReportingFlag.findMany({
      where: { taxYear, requires1099K: true },
      include: {
        merchant: {
          include: {
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { grossSales: 'desc' },
    });
  }

  static async getInformActQueue(taxYear?: number) {
    const year = taxYear ?? new Date().getFullYear();
    return prisma.informActFlag.findMany({
      where: { taxYear: year, requiresVerification: true },
      include: {
        merchant: {
          include: {
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { transactionCount: 'desc' },
    });
  }

  static async markInformVerified(merchantId: string, taxYear: number) {
    return prisma.informActFlag.update({
      where: { merchantId_taxYear: { merchantId, taxYear } },
      data: { verifiedAt: new Date() },
    });
  }

  static async markInformCertified(merchantId: string, taxYear: number) {
    return prisma.informActFlag.update({
      where: { merchantId_taxYear: { merchantId, taxYear } },
      data: { certifiedAt: new Date() },
    });
  }

  static async notify1099KMerchants(taxYear: number): Promise<{ notified: number }> {
    const flags = await prisma.taxReportingFlag.findMany({
      where: { taxYear, requires1099K: true, notifiedAt: null },
      include: {
        merchant: { include: { user: { select: { email: true, firstName: true } } } },
      },
    });

    let notified = 0;
    for (const flag of flags) {
      const { email, firstName } = flag.merchant.user;
      try {
        await sendEmail({
          to: email,
          toName: firstName || 'Merchant',
          subject: `Action Required: IRS Form 1099-K for ${taxYear}`,
          html: `
            <p>Hi ${firstName},</p>
            <p>Your Good Circles merchant account exceeded $${THRESHOLD_1099K} in gross sales for ${taxYear}.
            Good Circles is required to issue you IRS Form 1099-K reporting $${Number(flag.grossSales).toFixed(2)} in gross sales.</p>
            <p>Please ensure your tax information is up to date in your Merchant Dashboard.
            You will receive your 1099-K by January 31, ${taxYear + 1}.</p>
            <p>— Good Circles L3C</p>
          `,
        });
        await prisma.taxReportingFlag.update({
          where: { merchantId_taxYear: { merchantId: flag.merchantId, taxYear } },
          data: { notifiedAt: new Date() },
        });
        notified++;
      } catch (e) {
        console.error(`[TaxReporting] Failed to notify merchant ${flag.merchantId}:`, e);
      }
    }

    return { notified };
  }

  // Generate CSV export for 1099-K filing
  static async export1099KCsv(taxYear: number): Promise<string> {
    const flags = await this.get1099KReport(taxYear);

    const header = 'Merchant ID,Business Name,Tax ID,Email,Gross Sales,Tax Year';
    const rows = flags.map(f => {
      const m = f.merchant;
      return [
        m.id,
        `"${m.businessName}"`,
        m.taxId ?? '',
        m.user.email,
        Number(f.grossSales).toFixed(2),
        taxYear,
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  // State-tagged transaction report for CCV post-campaign compliance
  static async getStateReport(state: string, startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        consumerState: state.toUpperCase(),
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        nonprofit: { select: { orgName: true, ein: true } },
        merchant: { select: { businessName: true, taxId: true } },
        productService: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totals = transactions.reduce(
      (acc, t) => ({
        grossSales: acc.grossSales + Number(t.grossAmount),
        totalDonated: acc.totalDonated + Number(t.nonprofitShare),
        platformFees: acc.platformFees + Number(t.platformFee),
        txCount: acc.txCount + 1,
      }),
      { grossSales: 0, totalDonated: 0, platformFees: 0, txCount: 0 }
    );

    return {
      state,
      periodStart: startDate.toISOString().split('T')[0],
      periodEnd: endDate.toISOString().split('T')[0],
      ...totals,
      transactions,
    };
  }
}
