import { prisma } from '../lib/prisma';

export class ImpactUpdateService {
  static async create(nonprofitId: string, data: {
    title: string;
    body: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }) {
    return prisma.impactUpdate.create({ data: { nonprofitId, ...data } });
  }

  static async listForNonprofit(nonprofitId: string, limit = 20) {
    return prisma.impactUpdate.findMany({
      where: { nonprofitId, isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Donor feed: pull updates from the nonprofit they've elected — "pull" architecture
  static async getDonorFeed(userId: string, limit = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { electedNonprofitId: true },
    });
    if (!user?.electedNonprofitId) return [];
    return prisma.impactUpdate.findMany({
      where: { nonprofitId: user.electedNonprofitId, isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { nonprofit: { select: { orgName: true } } },
    });
  }

  static async unpublish(id: string, nonprofitId: string) {
    return prisma.impactUpdate.updateMany({
      where: { id, nonprofitId },
      data: { isPublished: false },
    });
  }
}
