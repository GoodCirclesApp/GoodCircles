import { prisma } from '../lib/prisma';
import { sendEmail } from './emailService';
import { wrap, heading, paragraph } from './emailLayoutService';
import { CrmWebhookService } from './crmWebhookService';

const MILESTONES = [
  { key: 'FIRST_DONATION', threshold: 0 },  // any amount triggers
  { key: 'TOTAL_100',      threshold: 100 },
  { key: 'TOTAL_500',      threshold: 500 },
  { key: 'TOTAL_1000',     threshold: 1000 },
] as const;

export class DonorMilestoneService {
  // Call this after every successful transaction — checks and fires once per milestone
  static async checkAndFire(userId: string, nonprofitId: string) {
    const [user, nonprofit, aggregate] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } }),
      prisma.nonprofit.findUnique({ where: { id: nonprofitId }, select: { orgName: true } }),
      prisma.transaction.aggregate({
        where: { neighborId: userId, nonprofitId },
        _sum: { nonprofitShare: true },
        _count: true,
      }),
    ]);

    if (!user || !nonprofit) return;

    const totalDonated = Number(aggregate._sum.nonprofitShare ?? 0);
    const txCount = aggregate._count;

    for (const m of MILESTONES) {
      if (m.key === 'FIRST_DONATION' && txCount !== 1) continue;
      if (m.threshold > 0 && totalDonated < m.threshold) continue;

      // Idempotent — only fires once per milestone per donor per nonprofit
      const alreadyFired = await prisma.donorMilestone.findUnique({
        where: { userId_nonprofitId_milestone: { userId, nonprofitId, milestone: m.key } },
      });
      if (alreadyFired) continue;

      await prisma.donorMilestone.create({ data: { userId, nonprofitId, milestone: m.key } });

      // Send milestone email
      await sendEmail({
        to: user.email,
        toName: user.firstName ?? 'Neighbor',
        subject: this.emailSubject(m.key, nonprofit.orgName),
        html: this.emailHtml(m.key, user.firstName ?? 'Neighbor', nonprofit.orgName, totalDonated),
        meta: { triggerSource: 'DONOR_MILESTONE', userId, layoutVariant: 'TRANSACTIONAL' },
      });

      // Fire CRM webhook
      await CrmWebhookService.fire(nonprofitId, 'milestone.reached', {
        userId,
        milestone: m.key,
        totalDonated,
        nonprofitId,
      });
    }
  }

  private static emailSubject(milestone: string, orgName: string): string {
    const map: Record<string, string> = {
      FIRST_DONATION: `Your first contribution to ${orgName} — thank you.`,
      TOTAL_100:      `You've generated $100 for ${orgName} through your shopping.`,
      TOTAL_500:      `$500 milestone reached for ${orgName}. Remarkable.`,
      TOTAL_1000:     `You've contributed $1,000 to ${orgName}. You're a cornerstone.`,
    };
    return map[milestone] ?? `Impact milestone reached for ${orgName}`;
  }

  private static emailHtml(milestone: string, firstName: string, orgName: string, total: number): string {
    const messages: Record<string, string> = {
      FIRST_DONATION: `Your very first Good Circles purchase has just generated a donation for ${orgName}. This is how the circle begins — through your everyday spending, your community grows stronger.`,
      TOTAL_100:      `Through your regular shopping, you've now quietly contributed $100 to ${orgName}. No fundraiser. No extra spending. Just your daily choices, compounding into impact.`,
      TOTAL_500:      `$500 to ${orgName} — generated automatically through $${total.toFixed(2)} in cumulative purchases. You're among the most impactful members in your community.`,
      TOTAL_1000:     `You have now contributed $1,000 to ${orgName} through Good Circles. That is not a small number. It represents a year of intentional living, and ${orgName} feels it.`,
    };
    const msg = messages[milestone] ?? `You've reached a new giving milestone with ${orgName}.`;
    const body = `${heading(`Hello, ${firstName}.`)}${paragraph(msg)}`;
    return wrap({ body, footerVariant: 'TRANSACTIONAL' });
  }
}
