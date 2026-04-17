import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

function generateReceiptNumber(fiscalYear: number, merchantId: string, sequence: number): string {
  const shortId = merchantId.replace(/-/g, '').substring(0, 8).toUpperCase();
  return `GC-${fiscalYear}-${shortId}-${String(sequence).padStart(4, '0')}`;
}

export class DonationReceiptService {
  static async createForTransaction(transactionId: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        merchant: true,
        nonprofit: true,
      },
    });
    if (!tx) throw new Error('Transaction not found');
    if (tx.nonprofitShare.lte(0)) return null; // nothing to receipt

    // Require EIN before issuing receipt
    if (!tx.nonprofit.ein) throw new Error('Nonprofit EIN is required before issuing donation receipts');

    const fiscalYear = tx.createdAt.getFullYear();

    // Sequence = count of receipts already issued for this merchant this year + 1
    const existing = await prisma.donationReceipt.count({
      where: { merchantId: tx.merchantId, fiscalYear },
    });
    const receiptNumber = generateReceiptNumber(fiscalYear, tx.merchantId, existing + 1);

    return prisma.donationReceipt.create({
      data: {
        transactionId: tx.id,
        nonprofitId: tx.nonprofitId,
        merchantId: tx.merchantId,
        donationAmount: tx.nonprofitShare,
        fiscalYear,
        receiptNumber,
        nonprofitEin: tx.nonprofit.ein,
        nonprofitName: tx.nonprofit.orgName,
        merchantName: tx.merchant.businessName,
      },
    });
  }

  // Annual tax summary for a merchant: total donations per nonprofit per year
  static async getMerchantTaxSummary(merchantId: string, fiscalYear: number) {
    const receipts = await prisma.donationReceipt.findMany({
      where: { merchantId, fiscalYear },
      include: { nonprofit: { select: { orgName: true, ein: true } } },
      orderBy: { issuedAt: 'asc' },
    });

    const totals: Record<string, { orgName: string; ein: string; total: number; count: number }> = {};
    for (const r of receipts) {
      const key = r.nonprofitId;
      if (!totals[key]) {
        totals[key] = { orgName: r.nonprofitName, ein: r.nonprofitEin, total: 0, count: 0 };
      }
      totals[key].total += Number(r.donationAmount);
      totals[key].count += 1;
    }

    return {
      fiscalYear,
      merchantId,
      totalDonated: receipts.reduce((s, r) => s + Number(r.donationAmount), 0),
      byNonprofit: Object.values(totals),
      receipts,
    };
  }

  // Nonprofit view: all receipts issued on their behalf for a year
  static async getNonprofitAnnualReceipts(nonprofitId: string, fiscalYear: number) {
    return prisma.donationReceipt.findMany({
      where: { nonprofitId, fiscalYear },
      include: { merchant: { select: { businessName: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
