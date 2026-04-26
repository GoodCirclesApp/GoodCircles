import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';



export class CDFIService {
  /**
   * Get CDFI dashboard data.
   */
  static async getDashboard(cdfiId: string) {
    const cdfi = await prisma.cDFIPartner.findUnique({
      where: { id: cdfiId },
      include: {
        managedFunds: {
          include: {
            deployments: true,
            contributions: true
          }
        }
      }
    });

    if (!cdfi) throw new Error('CDFI not found');

    const totalCapital = cdfi.managedFunds.reduce((sum, f) => sum.add(f.totalCapital), new Decimal(0));
    const deployedCapital = cdfi.managedFunds.reduce((sum, f) => sum.add(f.deployedCapital), new Decimal(0));
    const activeLoans = cdfi.managedFunds.reduce((count, f) => count + f.deployments.filter(d => d.status === 'active').length, 0);

    return {
      orgName: cdfi.orgName,
      partnershipStatus: cdfi.partnershipStatus,
      totalCapital,
      deployedCapital,
      activeLoans,
      funds: cdfi.managedFunds.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        totalCapital: f.totalCapital,
        deployedCapital: f.deployedCapital,
        loanCount: f.deployments.length
      }))
    };
  }

  /**
   * Get pending loan applications for a CDFI.
   */
  static async getApplications(cdfiId: string) {
    const cdfi = await prisma.cDFIPartner.findUnique({
      where: { id: cdfiId },
      include: { managedFunds: true }
    });

    if (!cdfi) throw new Error('CDFI not found');

    const fundIds = cdfi.managedFunds.map(f => f.id);

    return prisma.fundDeployment.findMany({
      where: {
        fundId: { in: fundIds },
        status: 'pending_approval'
      },
      include: {
        fund: true,
        recipientMerchant: true
      }
    });
  }

  /**
   * Get a loan application by ID.
   */
  static async getApplicationById(id: string) {
    return prisma.fundDeployment.findUnique({
      where: { id },
      include: {
        fund: true,
        recipientMerchant: true
      }
    });
  }

  /**
   * Get merchant transaction history for underwriting.
   */
  static async getMerchantHistory(merchantId: string | null) {
    if (!merchantId) return [];
    return prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  /**
   * Approve a loan application.
   */
  static async approveApplication(cdfiId: string, deploymentId: string, terms: { interestRate: number, termMonths: number }) {
    return prisma.$transaction(async (tx) => {
      const deployment = await tx.fundDeployment.findUnique({
        where: { id: deploymentId },
        include: { fund: true }
      });

      if (!deployment || deployment.status !== 'pending_approval') {
        throw new Error('Application not found or already processed');
      }

      const updatedDeployment = await tx.fundDeployment.update({
        where: { id: deploymentId },
        data: {
          status: 'active',
          interestRate: new Decimal(terms.interestRate),
          repaymentTermMonths: terms.termMonths,
          cdfiApprovedBy: cdfiId,
          deployedAt: new Date()
        }
      });

      // Update fund's deployed capital
      await tx.communityFund.update({
        where: { id: deployment.fundId },
        data: {
          deployedCapital: { increment: deployment.amount }
        }
      });

      // Disburse to merchant's wallet
      if (deployment.recipientMerchantId) {
        const merchant = await tx.merchant.findUnique({
          where: { id: deployment.recipientMerchantId }
        });

        if (merchant) {
          await tx.ledgerEntry.create({
            data: {
              walletId: (await tx.wallet.findUnique({ where: { userId: merchant.userId } })).id,
              entryType: 'CREDIT',
              amount: deployment.amount,
              balanceAfter: (await tx.wallet.findUnique({ where: { userId: merchant.userId } })).balance.add(deployment.amount),
              description: `Loan disbursement from ${deployment.fund.name}`
            }
          });

          await tx.wallet.update({
            where: { userId: merchant.userId },
            data: {
              balance: { increment: deployment.amount }
            }
          });
        }
      }

      return updatedDeployment;
    });
  }

  /**
   * Deny a loan application.
   */
  static async denyApplication(cdfiId: string, deploymentId: string, reason: string) {
    return prisma.fundDeployment.update({
      where: { id: deploymentId },
      data: { status: 'defaulted' },
    });
  }

  /**
   * Get impact metrics for a CDFI.
   */
  static async getImpactMetrics(cdfiId: string) {
    const deployments = await prisma.fundDeployment.findMany({
      where: { cdfiApprovedBy: cdfiId },
      include: { fund: true }
    });

    const totalDeployed = deployments.reduce((sum, d) => sum.add(d.amount), new Decimal(0));
    const repaidAmount = deployments.reduce((sum, d) => sum.add(d.repaidAmount), new Decimal(0));
    const defaultRate = deployments.length > 0 
      ? deployments.filter(d => d.status === 'defaulted').length / deployments.length 
      : 0;

    return {
      totalDeployed,
      repaidAmount,
      defaultRate,
      loanCount: deployments.length,
      federalProgramUtilization: {
        nmtc: deployments.filter(d => d.fund.type === 'investment_fund').length,
        cdfiFund: deployments.length,
        sba: deployments.filter(d => d.interestRate && d.interestRate.lt(0.05)).length
      }
    };
  }
}
