import { prisma } from '../lib/prisma';

export class DonorProfileService {
  static async getOrCreate(userId: string) {
    return prisma.donorProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  static async update(userId: string, data: { shareNameWithNonprofits?: boolean; shareEmailWithNonprofits?: boolean }) {
    return prisma.donorProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  // Returns masked or real donor identity based on their privacy settings
  static async resolveDonorIdentity(userId: string) {
    const [user, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, firstName: true, lastName: true, email: true } }),
      prisma.donorProfile.findUnique({ where: { userId } }),
    ]);
    if (!user) return null;
    return {
      id: user.id,
      displayName: profile?.shareNameWithNonprofits !== false
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Anonymous'
        : 'Anonymous Donor',
      email: profile?.shareEmailWithNonprofits === true ? user.email : null,
    };
  }
}
