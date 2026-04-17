import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { CommunityFundService } from '../services/communityFundService';
import { CDFIService } from '../services/cdfiService';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Community Fund & CDFI Integration', () => {
  let neighborId: string;
  let merchantId: string;
  let cdfiUserId: string;
  let cdfiPartnerId: string;
  let donationFundId: string;
  let loanFundId: string;

  beforeAll(async () => {
    // Cleanup
    await prisma.fundReturn.deleteMany();
    await prisma.fundRepayment.deleteMany();
    await prisma.fundDeployment.deleteMany();
    await prisma.fundContribution.deleteMany();
    await prisma.communityFund.deleteMany();
    await prisma.cDFIPartner.deleteMany();
    await prisma.merchant.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 12);

    // Create users
    const neighbor = await prisma.user.create({
      data: {
        email: 'neighbor@example.com',
        passwordHash,
        role: 'NEIGHBOR'
      }
    });
    neighborId = neighbor.id;

    const merchantUser = await prisma.user.create({
      data: {
        email: 'merchant@example.com',
        passwordHash,
        role: 'MERCHANT'
      }
    });
    const merchant = await prisma.merchant.create({
      data: {
        userId: merchantUser.id,
        businessName: 'Local Shop',
        businessType: 'GOODS'
      }
    });
    merchantId = merchant.id;

    const cdfiUser = await prisma.user.create({
      data: {
        email: 'cdfi@example.com',
        passwordHash,
        role: 'CDFI'
      }
    });
    cdfiUserId = cdfiUser.id;

    const cdfi = await prisma.cDFIPartner.create({
      data: {
        userId: cdfiUser.id,
        orgName: 'Community Capital',
        cdfiCertificationNumber: 'CDFI-123',
        lendingRegions: JSON.stringify(['region-1']),
        partnershipStatus: 'applied'
      }
    });
    cdfiPartnerId = cdfi.id;

    // Create funds
    const donationFund = await prisma.communityFund.create({
      data: {
        name: 'Local Relief Fund',
        type: 'donation_pool',
        isActive: true
      }
    });
    donationFundId = donationFund.id;

    const loanFund = await prisma.communityFund.create({
      data: {
        name: 'Small Business Growth Fund',
        type: 'loan_fund',
        cdfiPartnerId: cdfi.id,
        isActive: true
      }
    });
    loanFundId = loanFund.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should allow donations before CDFI activation', async () => {
    const isPhaseB = await CommunityFundService.isPhaseBActive();
    expect(isPhaseB).toBe(false);

    const contribution = await CommunityFundService.contribute(neighborId, donationFundId, 50, 'waived_discount');
    expect(contribution.amount.toString()).toBe('50');

    const fund = await prisma.communityFund.findUnique({ where: { id: donationFundId } });
    expect(fund?.totalCapital.toString()).toBe('50');
  });

  it('should prevent loan applications before CDFI activation', async () => {
    await expect(
      CommunityFundService.applyForLoan(merchantId, loanFundId, 1000, 12)
    ).rejects.toThrow('Loan applications are not currently available (Phase B inactive)');
  });

  it('should activate Phase B when CDFI is activated', async () => {
    await prisma.cDFIPartner.update({
      where: { id: cdfiPartnerId },
      data: { partnershipStatus: 'active' }
    });

    const isPhaseB = await CommunityFundService.isPhaseBActive();
    expect(isPhaseB).toBe(true);
  });

  it('should allow loan applications after CDFI activation', async () => {
    const application = await CommunityFundService.applyForLoan(merchantId, loanFundId, 1000, 12);
    expect(application.status).toBe('pending_approval');
    expect(application.amount.toString()).toBe('1000');
  });

  it('should allow CDFI to approve loan and disburse funds', async () => {
    // Need a wallet for the merchant
    await prisma.wallet.create({
      data: { userId: (await prisma.merchant.findUnique({ where: { id: merchantId } }))!.userId, balance: 0 }
    });

    const applications = await CDFIService.getApplications(cdfiPartnerId);
    expect(applications.length).toBe(1);

    const deployment = await CDFIService.approveApplication(cdfiPartnerId, applications[0].id, {
      interestRate: 0.05,
      termMonths: 12
    });

    expect(deployment.status).toBe('active');
    expect(deployment.cdfiApprovedBy).toBe(cdfiPartnerId);

    const merchantUser = await prisma.user.findFirst({
      where: { merchant: { id: merchantId } },
      include: { wallet: true }
    });
    expect(merchantUser?.wallet?.balance.toString()).toBe('1000');
  });

  it('should process repayments and distribute returns to contributors', async () => {
    // First, neighbor invests in the fund
    await CommunityFundService.contribute(neighborId, loanFundId, 1000, 'direct');

    const deployments = await prisma.fundDeployment.findMany({
      where: { recipientMerchantId: merchantId, status: 'active' }
    });
    
    // Process a $100 repayment
    const repayment = await CommunityFundService.processRepayment(deployments[0].id, 100);
    expect(repayment.amount.toString()).toBe('100');
    
    // Interest is 5% of 100 = 5
    expect(repayment.interestAmount.toString()).toBe('5');
    expect(repayment.principalAmount.toString()).toBe('95');

    // Check returns distributed to neighbor
    const returns = await prisma.fundReturn.findMany({
      include: { contribution: true }
    });
    expect(returns.length).toBeGreaterThan(0);
    // Since neighbor is the only contributor (1000/1000 = 100%), they get all 5
    expect(returns[0].amount.toString()).toBe('5');

    const portfolio = await CommunityFundService.getConsumerPortfolio(neighborId);
    expect(portfolio.totalReturns.toString()).toBe('5');
  });
});
