import { prisma } from '../lib/prisma';
import crypto from 'crypto';



export class MunicipalService {
  /**
   * Activates a municipal partnership for a region.
   */
  static async activatePartnership(regionId: string, contactInfo: { name: string, email: string }) {
    const region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) throw new Error('Region not found');

    const partner = await prisma.municipalPartner.upsert({
      where: { regionId },
      update: {
        partnershipStatus: 'active',
        activatedAt: new Date(),
        isActive: true,
        contactName: contactInfo.name,
        contactEmail: contactInfo.email,
      },
      create: {
        regionId,
        cityName: region.cityName,
        state: region.state,
        contactName: contactInfo.name,
        contactEmail: contactInfo.email,
        partnershipStatus: 'active',
        activatedAt: new Date(),
        isActive: true,
      },
    });

    // Generate an access token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.municipalAccessToken.create({
      data: {
        partnerId: partner.id,
        tokenHash,
        permissions: JSON.stringify(['view_dashboard', 'view_merchants', 'download_reports']),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    return { partner, token };
  }

  /**
   * Adds an incentive to a municipal partner.
   */
  static async addIncentive(partnerId: string, incentive: { type: string, description: string, criteria: any }) {
    return prisma.municipalIncentive.create({
      data: {
        partnerId,
        incentiveType: incentive.type,
        description: incentive.description,
        eligibilityCriteria: JSON.stringify(incentive.criteria),
      },
    });
  }

  /**
   * Checks merchant eligibility for municipal incentives.
   */
  static async getMerchantEligibleIncentives(merchantId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { region: { include: { partner: { include: { incentives: true } } } } }
    });

    if (!merchant?.region?.partner?.isActive) return [];

    const incentives = merchant.region.partner.incentives;
    const eligibleIncentives = [];

    // Fetch merchant's recent metrics for eligibility check
    const period = new Date().toISOString().slice(0, 7); // Current month
    const transactions = await prisma.transaction.count({
      where: {
        merchantId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    for (const incentive of incentives) {
      const criteria = JSON.parse(incentive.eligibilityCriteria);
      let isEligible = true;

      if (criteria.minTransactions && transactions < criteria.minTransactions) {
        isEligible = false;
      }

      if (isEligible) {
        eligibleIncentives.push(incentive);
      }
    }

    return eligibleIncentives;
  }

  /**
   * Validates a municipal access token.
   */
  static async validateToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const accessToken = await prisma.municipalAccessToken.findUnique({
      where: { tokenHash },
      include: { partner: { include: { region: true } } },
    });

    if (!accessToken || !accessToken.partner.isActive) return null;
    if (accessToken.expiresAt && accessToken.expiresAt < new Date()) return null;

    return accessToken;
  }
}
