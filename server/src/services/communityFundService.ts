import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';



export class CommunityFundService {
  /**
   * Check if Phase B (Investment/Loan) is active.
   * Phase B is active if at least one CDFI partner has partnershipStatus="active".
   */
  static async isPhaseBActive(): Promise<boolean> {
    const activeCDFI = await prisma.cDFIPartner.findFirst({
      where: { partnershipStatus: 'active' }
    });
    return !!activeCDFI;
  }

  /**
   * Get all active community funds.
   */
  static async getFunds(regionId?: string) {
    return prisma.communityFund.findMany({
      where: {
        isActive: true,
        OR: [
          { regionId: regionId },
          { regionId: null }
        ]
      },
      include: {
        cdfiPartner: true
      }
    });
  }

  /**
   * Contribute to a community fund.
   */
  static async contribute(userId: string, fundId: string, amount: number, source: 'waived_discount' | 'direct') {
    return prisma.$transaction(async (tx) => {
      const fund = await tx.communityFund.findUnique({
        where: { id: fundId }
      });

      if (!fund || !fund.isActive) {
        throw new Error('Fund not found or inactive');
      }

      const contribution = await tx.fundContribution.create({
        data: {
          fundId,
          userId,
          amount: new Decimal(amount),
          source
        }
      });

      await tx.communityFund.update({
        where: { id: fundId },
        data: {
          totalCapital: { increment: new Decimal(amount) }
        }
      });

      return contribution;
    });
  }

  /**
   * Merchant applies for a loan from a community fund.
   */
  static async applyForLoan(merchantId: string, fundId: string, amount: number, termMonths: number) {
    const isPhaseB = await this.isPhaseBActive();
    if (!isPhaseB) {
      throw new Error('Loan applications are not currently available (Phase B inactive)');
    }

    const fund = await prisma.communityFund.findUnique({
      where: { id: fundId }
    });

    if (!fund || fund.type !== 'loan_fund') {
      throw new Error('Invalid fund for loan application');
    }

    // Create a deployment record with status "pending_approval"
    // Note: I'll use "active" as a base status but maybe I should have added "pending" to the schema.
    // Let's assume "active" means it's under review if it doesn't have a cdfiApprovedBy yet.
    // Actually, let's just use the status field.
    return prisma.fundDeployment.create({
      data: {
        fundId,
        recipientMerchantId: merchantId,
        amount: new Decimal(amount),
        deploymentType: 'loan',
        repaymentTermMonths: termMonths,
        status: 'pending_approval'
      }
    });
  }

  /**
   * Process a repayment for a loan.
   */
  static async processRepayment(deploymentId: string, amount: number) {
    return prisma.$transaction(async (tx) => {
      const deployment = await tx.fundDeployment.findUnique({
        where: { id: deploymentId },
        include: { fund: true }
      });

      if (!deployment || deployment.deploymentType !== 'loan') {
        throw new Error('Invalid deployment for repayment');
      }

      // Simple interest calculation for now
      const interestRate = deployment.interestRate || new Decimal(0.05);
      const interestAmount = new Decimal(amount).mul(interestRate);
      const principalAmount = new Decimal(amount).sub(interestAmount);

      const repayment = await tx.fundRepayment.create({
        data: {
          deploymentId,
          amount: new Decimal(amount),
          principalAmount,
          interestAmount
        }
      });

      await tx.fundDeployment.update({
        where: { id: deploymentId },
        data: {
          repaidAmount: { increment: new Decimal(amount) },
          status: deployment.repaidAmount.add(new Decimal(amount)).gte(deployment.amount) ? 'repaid' : 'active'
        }
      });

      // Distribute returns to contributors
      await this.distributeReturns(deploymentId, interestAmount, tx);

      return repayment;
    });
  }

  /**
   * Distribute returns (interest) back to fund contributors.
   */
  private static async distributeReturns(deploymentId: string, totalInterest: Decimal, tx: any) {
    const deployment = await tx.fundDeployment.findUnique({
      where: { id: deploymentId }
    });

    const contributions = await tx.fundContribution.findMany({
      where: { fundId: deployment.fundId }
    });

    const totalFundCapital = contributions.reduce((sum: Decimal, c: any) => sum.add(c.amount), new Decimal(0));

    for (const contribution of contributions) {
      const share = contribution.amount.div(totalFundCapital);
      const returnAmount = totalInterest.mul(share);

      if (returnAmount.gt(0)) {
        await tx.fundReturn.create({
          data: {
            fundContributionId: contribution.id,
            amount: returnAmount,
            returnType: 'interest'
          }
        });

        // Also credit the user's wallet or platform credits
        // For now, let's assume we add to platform credits
        await tx.creditLedger.create({
          data: {
            userId: contribution.userId,
            amount: returnAmount,
            source: 'COMMUNITY_FUND_RETURN'
          }
        });
      }
    }
  }

  /**
   * Get consumer's community fund portfolio.
   */
  static async getConsumerPortfolio(userId: string) {
    const contributions = await prisma.fundContribution.findMany({
      where: { userId },
      include: {
        fund: true,
        returns: true
      }
    });

    const totalInvested = contributions.reduce((sum, c) => sum.add(c.amount), new Decimal(0));
    const totalReturns = contributions.reduce((sum, c) => {
      const contributionReturns = c.returns.reduce((rSum, r) => rSum.add(r.amount), new Decimal(0));
      return sum.add(contributionReturns);
    }, new Decimal(0));

    return {
      totalInvested,
      totalReturns,
      contributions: contributions.map(c => ({
        fundName: c.fund.name,
        amount: c.amount,
        date: c.createdAt,
        returns: c.returns.reduce((sum, r) => sum.add(r.amount), new Decimal(0))
      }))
    };
  }
}
