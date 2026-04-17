import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';



export class BenefitService {
  static CROSS_CATEGORY_THRESHOLD = 200;

  /**
   * Check if the benefits system is activated.
   */
  static async checkActivationStatus() {
    const latestTracking = await prisma.coopActivationTracking.findFirst({
      where: { coopType: 'CROSS_CATEGORY' },
      orderBy: { checkDate: 'desc' }
    });

    const merchantCount = latestTracking?.merchantCount || 0;
    const thresholdMet = merchantCount >= this.CROSS_CATEGORY_THRESHOLD;

    return {
      thresholdMet,
      merchantCount,
      thresholdRequired: this.CROSS_CATEGORY_THRESHOLD,
      progressPct: Math.min(100, (merchantCount / this.CROSS_CATEGORY_THRESHOLD) * 100),
      estimatedSavings: 20 // 20% savings estimate
    };
  }

  /**
   * Get available benefit programs.
   */
  static async getPrograms() {
    const { thresholdMet } = await this.checkActivationStatus();
    if (!thresholdMet) {
      throw new Error('Benefits system is not yet activated. Threshold of 200 merchants required.');
    }

    return prisma.benefitProgram.findMany({
      where: { isActive: true }
    });
  }

  /**
   * Enroll a merchant in a benefit program.
   */
  static async enroll(merchantId: string, programId: string) {
    const { thresholdMet } = await this.checkActivationStatus();
    if (!thresholdMet) {
      throw new Error('Benefits system is not yet activated.');
    }

    return prisma.benefitEnrollment.upsert({
      where: {
        programId_merchantId: { programId, merchantId }
      },
      update: { status: 'active' },
      create: {
        programId,
        merchantId,
        status: 'active'
      }
    });
  }

  /**
   * Get merchant's current enrollments and savings.
   */
  static async getMerchantEnrollments(merchantId: string) {
    const enrollments = await prisma.benefitEnrollment.findMany({
      where: { merchantId, status: 'active' },
      include: { program: true }
    });

    const totalMonthlySavings = enrollments.reduce((sum, e) => {
      const savings = e.program.individualRateMonthly.sub(e.program.groupRateMonthly);
      return sum.add(savings);
    }, new Decimal(0));

    return {
      enrollments,
      totalMonthlySavings
    };
  }

  /**
   * Get admin stats for benefits.
   */
  static async getAdminStats() {
    const enrollments = await prisma.benefitEnrollment.findMany({
      where: { status: 'active' },
      include: { program: true }
    });

    const totalSavings = enrollments.reduce((sum, e) => {
      const savings = e.program.individualRateMonthly.sub(e.program.groupRateMonthly);
      return sum.add(savings);
    }, new Decimal(0));

    const programsByParticipation = await prisma.benefitProgram.findMany({
      include: {
        _count: {
          select: { enrollments: { where: { status: 'active' } } }
        }
      }
    });

    return {
      totalMerchantsEnrolled: new Set(enrollments.map(e => e.merchantId)).size,
      totalSavings,
      programsByParticipation: programsByParticipation.map(p => ({
        id: p.id,
        name: p.providerName,
        type: p.type,
        participantCount: p._count.enrollments
      }))
    };
  }
}
