import { prisma } from '../lib/prisma';

// Pre-loaded filing deadlines for Good Circles L3C. Seeded on first admin access.
// Recurrence: YEARLY:MM-DD (e.g. YEARLY:04-15 = April 15 each year)
const STATIC_DEADLINES = [
  {
    title: 'Wyoming L3C Annual Report',
    description: 'File annual report with Wyoming Secretary of State. Handled by registered agent.',
    jurisdiction: 'WYOMING',
    category: 'ANNUAL_REPORT',
    monthDay: '04-15',
    agencyUrl: 'https://wyobiz.wyo.gov',
  },
  {
    title: 'Mississippi Foreign Annual Report',
    description: 'Annual report for Mississippi foreign qualification. $250 filing fee.',
    jurisdiction: 'MISSISSIPPI',
    category: 'ANNUAL_REPORT',
    monthDay: '04-15',
    agencyUrl: 'https://www.sos.ms.gov/business-services',
  },
  {
    title: 'Florida Annual Report',
    description: 'Annual report with Florida Division of Corporations. $138.75 fee.',
    jurisdiction: 'FLORIDA',
    category: 'ANNUAL_REPORT',
    monthDay: '05-01',
    agencyUrl: 'https://dos.fl.gov/sunbiz',
  },
  {
    title: 'Georgia Annual Report',
    description: 'Annual report with Georgia Secretary of State. $60 fee.',
    jurisdiction: 'GEORGIA',
    category: 'ANNUAL_REPORT',
    monthDay: '04-01',
    agencyUrl: 'https://sos.ga.gov/corporations',
  },
  {
    title: 'Alabama Business Privilege Tax',
    description: 'Alabama Business Privilege Tax return. Minimum $50 (may qualify for exemption as L3C).',
    jurisdiction: 'ALABAMA',
    category: 'TAX',
    monthDay: '04-15',
    agencyUrl: 'https://www.revenue.alabama.gov',
  },
  {
    title: 'Alabama CCV Annual Registration Renewal',
    description: 'Annual renewal of Commercial Co-Venturer registration with Alabama AG. $100 fee.',
    jurisdiction: 'ALABAMA',
    category: 'CCV_FILING',
    monthDay: '09-30',
    agencyUrl: 'https://ago.alabama.gov/charitable-organizations',
  },
  {
    title: 'Federal Tax Return (Form 1065)',
    description: 'Partnership tax return filed with IRS. Requires accountant.',
    jurisdiction: 'FEDERAL',
    category: 'TAX',
    monthDay: '03-15',
    agencyUrl: 'https://www.irs.gov/forms-pubs/about-form-1065',
  },
  {
    title: 'Quarterly Mission Compliance Report',
    description: 'Internal mission multiplier verification and profit/distribution cap review.',
    jurisdiction: 'INTERNAL',
    category: 'MISSION',
    monthDay: null,
    agencyUrl: null,
    isQuarterly: true,
  },
  {
    title: 'BOI FinCEN Filing Review',
    description: 'Review whether any beneficial ownership changes occurred requiring FinCEN BOI update (within 30 days of change).',
    jurisdiction: 'FEDERAL',
    category: 'REGULATORY',
    monthDay: '01-01',
    agencyUrl: 'https://boiefiling.fincen.gov',
  },
  {
    title: 'Nonprofit Good Standing Verification',
    description: 'Monthly IRS EO BMF sync to verify all platform nonprofits remain in good standing.',
    jurisdiction: 'FEDERAL',
    category: 'MISSION',
    monthDay: null,
    agencyUrl: 'https://apps.irs.gov/app/eos/',
    isMonthly: true,
  },
  {
    title: '1099-K Merchant Reporting',
    description: 'Issue IRS Form 1099-K to all merchants who crossed the $600 gross sales threshold in prior year.',
    jurisdiction: 'FEDERAL',
    category: 'TAX',
    monthDay: '01-31',
    agencyUrl: 'https://www.irs.gov/forms-pubs/about-form-1099-k',
  },
  {
    title: 'Louisiana Annual Report',
    description: 'Annual report filed on the anniversary date of Louisiana foreign qualification.',
    jurisdiction: 'LOUISIANA',
    category: 'ANNUAL_REPORT',
    monthDay: null,
    agencyUrl: 'https://www.sos.la.gov/BusinessServices',
    isAnniversary: true,
  },
];

export class ComplianceService {
  static async seedDeadlines(): Promise<void> {
    const existing = await prisma.complianceDeadline.count();
    if (existing > 0) return;

    const currentYear = new Date().getFullYear();

    for (const d of STATIC_DEADLINES) {
      const isQuarterly = (d as any).isQuarterly;
      const isMonthly = (d as any).isMonthly;
      const isAnniversary = (d as any).isAnniversary;

      if (isQuarterly) {
        const quarters = [
          new Date(`${currentYear}-03-31`),
          new Date(`${currentYear}-06-30`),
          new Date(`${currentYear}-09-30`),
          new Date(`${currentYear}-12-31`),
        ];
        for (const dueDate of quarters) {
          await prisma.complianceDeadline.create({
            data: {
              title: d.title,
              description: d.description,
              jurisdiction: d.jurisdiction,
              category: d.category,
              dueDate,
              isRecurring: true,
              recurrenceRule: 'QUARTERLY',
              agencyUrl: d.agencyUrl ?? null,
            },
          });
        }
      } else if (isMonthly) {
        const dueDate = new Date();
        dueDate.setDate(1);
        dueDate.setMonth(dueDate.getMonth() + 1);
        await prisma.complianceDeadline.create({
          data: {
            title: d.title,
            description: d.description,
            jurisdiction: d.jurisdiction,
            category: d.category,
            dueDate,
            isRecurring: true,
            recurrenceRule: 'MONTHLY',
            agencyUrl: d.agencyUrl ?? null,
          },
        });
      } else if (isAnniversary || !d.monthDay) {
        continue;
      } else {
        const [month, day] = d.monthDay.split('-').map(Number);
        let dueDate = new Date(currentYear, month - 1, day);
        if (dueDate < new Date()) dueDate = new Date(currentYear + 1, month - 1, day);
        await prisma.complianceDeadline.create({
          data: {
            title: d.title,
            description: d.description,
            jurisdiction: d.jurisdiction,
            category: d.category,
            dueDate,
            isRecurring: true,
            recurrenceRule: `YEARLY:${d.monthDay}`,
            agencyUrl: d.agencyUrl ?? null,
          },
        });
      }
    }

    console.log('[Compliance] Deadline calendar seeded.');
  }

  static async getDeadlines(filter?: { category?: string; jurisdiction?: string }) {
    return prisma.complianceDeadline.findMany({
      where: {
        ...(filter?.category && { category: filter.category }),
        ...(filter?.jurisdiction && { jurisdiction: filter.jurisdiction }),
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  static async markComplete(deadlineId: string, userId: string, notes?: string) {
    return prisma.complianceDeadline.update({
      where: { id: deadlineId },
      data: { completedAt: new Date(), completedBy: userId, notes: notes ?? null },
    });
  }

  static async getCcvCampaigns() {
    return prisma.ccvCampaign.findMany({
      include: { nonprofit: { select: { orgName: true, ein: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  static async createCcvCampaign(data: {
    name: string;
    nonprofitId: string;
    states: string[];
    startDate: Date;
    endDate?: Date;
    notes?: string;
  }) {
    const { startDate, endDate, states } = data;

    // Auto-calculate state-specific deadlines
    const msNoticeFiledAt: Date | null = states.includes('MS')
      ? new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days before
      : null;
    const alRegistrationFiledAt: Date | null = states.includes('AL')
      ? new Date(startDate.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days before
      : null;
    const msReportDueAt: Date | null = endDate && states.includes('MS')
      ? new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days after
      : null;
    const alClosingDueAt: Date | null = endDate && states.includes('AL')
      ? new Date(endDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days after
      : null;

    return prisma.ccvCampaign.create({
      data: {
        name: data.name,
        nonprofitId: data.nonprofitId,
        states,
        startDate,
        endDate: endDate ?? null,
        notes: data.notes ?? null,
        msNoticeFiledAt,
        alRegistrationFiledAt,
        msReportDueAt,
        alClosingDueAt,
      },
    });
  }

  static async generateQuarterlyMissionReport() {
    const now = new Date();
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const qEnd = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 0);

    const agg = await prisma.transaction.aggregate({
      where: { createdAt: { gte: qStart, lte: qEnd } },
      _sum: { grossAmount: true, nonprofitShare: true, platformFee: true, merchantNet: true },
      _count: { id: true },
    });

    const grossAmount = Number(agg._sum.grossAmount ?? 0);
    const nonprofitShare = Number(agg._sum.nonprofitShare ?? 0);
    const platformFee = Number(agg._sum.platformFee ?? 0);
    const txCount = agg._count.id;

    const missionMultiplier = platformFee > 0 ? (nonprofitShare / platformFee).toFixed(2) : 'N/A';

    return {
      period: `Q${Math.ceil((qStart.getMonth() + 1) / 3)} ${qStart.getFullYear()}`,
      periodStart: qStart.toISOString().split('T')[0],
      periodEnd: qEnd.toISOString().split('T')[0],
      totalGrossTransactionVolume: grossAmount.toFixed(2),
      totalNonprofitDonations: nonprofitShare.toFixed(2),
      totalPlatformFees: platformFee.toFixed(2),
      totalTransactions: txCount,
      missionMultiplierRatio: missionMultiplier,
      missionMultiplierTarget: '10:1',
      missionMultiplierMet: platformFee > 0 && nonprofitShare / platformFee >= 10,
      generatedAt: now.toISOString(),
      note: 'This report is for internal L3C mission compliance documentation. Store in Corporate Minute Book.',
    };
  }
}
