import { prisma } from '../lib/prisma';
import { DonorProfileService } from './donorProfileService';

export class DmsExportService {

  // ── Aggregate donor stats for the DMS dashboard ───────────────────────────

  static async getDonorStats(nonprofitId: string) {
    const [totalResult, monthResult, donorCount, recentDonors] = await Promise.all([
      prisma.transaction.aggregate({
        where: { nonprofitId },
        _sum: { nonprofitShare: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          nonprofitId,
          createdAt: { gte: new Date(new Date().setDate(1)) }, // start of current month
        },
        _sum: { nonprofitShare: true },
        _count: true,
      }),
      prisma.transaction.groupBy({
        by: ['neighborId'],
        where: { nonprofitId },
        _count: true,
      }),
      prisma.transaction.findMany({
        where: { nonprofitId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { neighborId: true, nonprofitShare: true, createdAt: true },
      }),
    ]);

    return {
      totalFunding: Number(totalResult._sum.nonprofitShare ?? 0),
      totalTransactions: totalResult._count,
      monthlyFunding: Number(monthResult._sum.nonprofitShare ?? 0),
      monthlyTransactions: monthResult._count,
      uniqueDonors: donorCount.length,
      avgPerDonor: donorCount.length > 0
        ? Number(totalResult._sum.nonprofitShare ?? 0) / donorCount.length
        : 0,
      recentDonors,
    };
  }

  // ── Privacy-respecting paginated donor list ────────────────────────────────

  static async getDonorList(nonprofitId: string, page = 1, pageSize = 25) {
    const offset = (page - 1) * pageSize;

    // Aggregate per donor
    const rows = await prisma.transaction.groupBy({
      by: ['neighborId'],
      where: { nonprofitId },
      _sum: { nonprofitShare: true },
      _count: true,
      _max: { createdAt: true },
      orderBy: { _sum: { nonprofitShare: 'desc' } },
      skip: offset,
      take: pageSize,
    });

    const totalDonors = await prisma.transaction.groupBy({
      by: ['neighborId'],
      where: { nonprofitId },
    });

    // Resolve donor identities (privacy-filtered)
    const donors = await Promise.all(
      rows.map(async (row) => {
        const identity = await DonorProfileService.resolveDonorIdentity(row.neighborId);
        return {
          id: row.neighborId,
          displayName: identity?.displayName ?? 'Anonymous Donor',
          email: identity?.email ?? null,
          totalDonated: Number(row._sum.nonprofitShare ?? 0),
          transactionCount: row._count,
          lastDonation: row._max.createdAt,
        };
      })
    );

    return { donors, total: totalDonors.length, page, pageSize };
  }

  // ── Queue an export job (runs synchronously, completes immediately) ─────────

  static async runExport(nonprofitId: string, format: 'CSV' | 'JSON', dateFrom: Date, dateTo: Date, requestedBy: string) {
    const job = await prisma.dmsExportJob.create({
      data: { nonprofitId, format, dateFrom, dateTo, requestedBy, status: 'RUNNING' },
    });

    try {
      const transactions = await prisma.transaction.findMany({
        where: { nonprofitId, createdAt: { gte: dateFrom, lte: dateTo } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          neighborId: true,
          grossAmount: true,
          nonprofitShare: true,
          discountAmount: true,
          paymentMethod: true,
          merchant: { select: { businessName: true } },
        },
      });

      // Resolve donor identities
      const rows = await Promise.all(
        transactions.map(async (tx) => {
          const identity = await DonorProfileService.resolveDonorIdentity(tx.neighborId);
          return {
            transaction_id: tx.id,
            date: tx.createdAt.toISOString(),
            donor_name: identity?.displayName ?? 'Anonymous Donor',
            donor_email: identity?.email ?? '',
            donation_amount: Number(tx.nonprofitShare).toFixed(2),
            purchase_amount: Number(tx.grossAmount).toFixed(2),
            merchant: (tx.merchant as any)?.businessName ?? '',
            payment_method: tx.paymentMethod,
          };
        })
      );

      await prisma.dmsExportJob.update({
        where: { id: job.id },
        data: { status: 'DONE', rowCount: rows.length, completedAt: new Date() },
      });

      return { job: { ...job, status: 'DONE', rowCount: rows.length }, rows, format };
    } catch (err: any) {
      await prisma.dmsExportJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', error: err.message },
      });
      throw err;
    }
  }

  static async getExportJobs(nonprofitId: string) {
    return prisma.dmsExportJob.findMany({
      where: { nonprofitId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // ── Serialize rows to CSV string ───────────────────────────────────────────

  static toCsv(rows: Record<string, string>[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
    ];
    return lines.join('\n');
  }
}
