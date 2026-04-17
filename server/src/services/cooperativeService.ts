import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';



export class CooperativeService {
  /**
   * Form a new legal cooperative.
   * Requires minimum 3 merchants.
   */
  static async formCooperative(data: {
    name: string;
    type: 'PURCHASING' | 'MARKETING' | 'SHARED_SERVICES';
    ein: string;
    fiscalYearEnd: string;
    merchantIds: string[];
  }) {
    if (data.merchantIds.length < 3) {
      throw new Error('A cooperative requires at least 3 founding merchants.');
    }

    return await prisma.$transaction(async (tx: any) => {
      // 1. Create a User and Merchant record for the Cooperative itself
      // This allows the coop to act as a "merchant" on the platform
      const coopUser = await tx.user.create({
        data: {
          email: `coop-${data.ein}@goodcircles.local`,
          passwordHash: 'COOP_ENTITY', // Placeholder
          role: 'MERCHANT',
          firstName: 'Cooperative',
          lastName: data.name
        }
      });

      const coopMerchant = await tx.merchant.create({
        data: {
          userId: coopUser.id,
          businessName: data.name,
          businessType: data.type,
          taxId: data.ein,
          isVerified: true,
          onboardedAt: new Date()
        }
      });

      // 2. Create the Cooperative record
      const cooperative = await tx.cooperative.create({
        data: {
          name: data.name,
          type: data.type,
          ein: data.ein,
          fiscalYearEnd: data.fiscalYearEnd,
          merchantId: coopMerchant.id
        }
      });

      // 3. Add founding members
      for (const merchantId of data.merchantIds) {
        await tx.coopMember.create({
          data: {
            coopId: cooperative.id,
            merchantId,
            equityShares: 100 // Initial equity for founders
          }
        });
      }

      return cooperative;
    });
  }

  /**
   * Merchant joins an existing cooperative.
   */
  static async joinCooperative(coopId: string, merchantId: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id: coopId } });
    if (!coop || !coop.isActive) throw new Error('Cooperative not found or inactive');

    return await prisma.coopMember.create({
      data: {
        coopId,
        merchantId,
        equityShares: 10 // Standard entry equity
      }
    });
  }

  /**
   * Calculate and distribute patronage dividends for a fiscal year.
   * member_patronage_ratio = member_purchases / total_coop_purchases
   * member_dividend = coop_surplus * member_patronage_ratio
   */
  static async calculatePatronageDividends(coopId: string, fiscalYear: number, coopSurplus: number) {
    const coop = await prisma.cooperative.findUnique({
      where: { id: coopId },
      include: { members: { where: { status: 'ACTIVE' } } }
    });

    if (!coop) throw new Error('Cooperative not found');

    // 1. Get total purchases made by members through the coop in the fiscal year
    // We assume "through the coop" means transactions where the coop was the merchant
    // or transactions linked to coop purchasing groups.
    
    const startDate = new Date(fiscalYear, 0, 1);
    const endDate = new Date(fiscalYear, 11, 31, 23, 59, 59);

    const memberPurchases: Record<string, Decimal> = {};
    let totalCoopPurchases = new Decimal(0);

    for (const member of coop.members) {
      // Find transactions where member bought from coop
      // We need to find the member's user ID to check neighborId in transactions
      const memberMerchant = await prisma.merchant.findUnique({ 
        where: { id: member.merchantId },
        include: { user: true }
      });
      
      const transactions = await prisma.transaction.findMany({
        where: {
          merchantId: coop.merchantId, // Coop is the seller
          neighborId: memberMerchant.userId, // Member is the buyer
          createdAt: { gte: startDate, lte: endDate }
        }
      });

      const total = transactions.reduce((sum: Decimal, t: any) => sum.add(t.grossAmount), new Decimal(0));
      memberPurchases[member.merchantId] = total;
      totalCoopPurchases = totalCoopPurchases.add(total);
    }

    if (totalCoopPurchases.isZero()) {
      throw new Error('No patronage activity recorded for this fiscal year.');
    }

    const results = [];
    const surplus = new Decimal(coopSurplus);

    for (const member of coop.members) {
      const memberTotal = memberPurchases[member.merchantId];
      const ratio = memberTotal.div(totalCoopPurchases);
      const dividend = surplus.mul(ratio);

      // Record patronage
      const record = await prisma.patronageRecord.create({
        data: {
          coopId,
          merchantId: member.merchantId,
          fiscalYear,
          totalPurchasesThroughCoop: memberTotal,
          patronageDividendAmount: dividend,
          distributedAt: new Date(),
          form1099Issued: true // Flag for 1099-PATR
        }
      });

      // Update equity (retained patronage)
      const equityAddition = dividend.mul(new Decimal(0.20));
      await prisma.coopMember.update({
        where: { id: member.id },
        data: {
          equityShares: { increment: equityAddition }
        }
      });

      results.push(record);
    }

    return results;
  }

  /**
   * Handle member withdrawal.
   * Equity is returned per bylaws (simulated as a pending return).
   */
  static async withdrawMember(coopId: string, merchantId: string) {
    const member = await prisma.coopMember.findUnique({
      where: { coopId_merchantId: { coopId, merchantId } }
    });

    if (!member || member.status === 'WITHDRAWN') {
      throw new Error('Member not found or already withdrawn');
    }

    return await prisma.coopMember.update({
      where: { id: member.id },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date()
      }
    });
  }

  static async getCoopDetails(coopId: string) {
    return await prisma.cooperative.findUnique({
      where: { id: coopId },
      include: {
        members: {
          include: { merchant: true }
        },
        patronageRecords: {
          orderBy: { fiscalYear: 'desc' }
        }
      }
    });
  }
}
