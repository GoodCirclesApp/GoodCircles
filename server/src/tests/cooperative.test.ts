import { describe, it, expect, beforeAll } from 'vitest';
import { CooperativeService } from '../services/cooperativeService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

describe('Cooperative Ownership Structure', () => {
  let merchants: any[] = [];
  let productService: any;
  let nonprofit: any;

  beforeAll(async () => {
    // Clean up
    await prisma.coopMember.deleteMany();
    await prisma.patronageRecord.deleteMany();
    await prisma.cooperative.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.productService.deleteMany();
    await prisma.merchant.deleteMany();
    await prisma.nonprofit.deleteMany();
    await prisma.user.deleteMany();
    
    // Create a nonprofit
    const npUser = await prisma.user.create({
      data: {
        email: `np-${Date.now()}@example.com`,
        passwordHash: 'hash',
        role: 'NONPROFIT',
        firstName: 'Test',
        lastName: 'Nonprofit'
      }
    });
    nonprofit = await prisma.nonprofit.create({
      data: {
        userId: npUser.id,
        orgName: 'Test Nonprofit',
        ein: `99-888777${Date.now().toString().slice(-1)}`,
        isVerified: true
      }
    });

    // Create 3 merchants for testing
    for (let i = 1; i <= 3; i++) {
      const user = await prisma.user.create({
        data: {
          email: `test-merchant-${i}-${Date.now()}@example.com`,
          passwordHash: 'hash',
          role: 'MERCHANT',
          firstName: 'Test',
          lastName: `Merchant ${i}`
        }
      });
      const merchant = await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: `Test Business ${i}`,
          businessType: 'RETAIL',
          taxId: `12345678${i}`,
          isVerified: true
        }
      });
      merchants.push(merchant);
    }

    // Create a product service for the first merchant (who will be part of coop)
    productService = await prisma.productService.create({
      data: {
        merchantId: merchants[0].id,
        name: 'Test Product',
        description: 'Testing',
        price: 10,
        type: 'PRODUCT',
        category: 'RETAIL'
      }
    });
  });

  it('should form a new cooperative with 3 merchants', async () => {
    const coop = await CooperativeService.formCooperative({
      name: 'Test Cooperative',
      type: 'PURCHASING',
      ein: '999888777',
      fiscalYearEnd: '12-31',
      merchantIds: merchants.map(m => m.id)
    });

    expect(coop.name).toBe('Test Cooperative');
    expect(coop.ein).toBe('999888777');
    
    const details = await CooperativeService.getCoopDetails(coop.id);
    expect(details.members.length).toBe(3);
    expect(details.merchantId).toBeDefined();
  });

  it('should allow a merchant to join an existing cooperative', async () => {
    const coop = await prisma.cooperative.findFirst();
    
    const newUser = await prisma.user.create({
      data: {
        email: `new-member-${Date.now()}@example.com`,
        passwordHash: 'hash',
        role: 'MERCHANT',
        firstName: 'New',
        lastName: 'Member'
      }
    });
    const newMerchant = await prisma.merchant.create({
      data: {
        userId: newUser.id,
        businessName: 'New Member Business',
        businessType: 'RETAIL',
        taxId: '000111222',
        isVerified: true
      }
    });

    const membership = await CooperativeService.joinCooperative(coop.id, newMerchant.id);
    expect(membership.merchantId).toBe(newMerchant.id);
    expect(membership.equityShares.toString()).toBe('10');
  });

  it('should calculate patronage dividends correctly', async () => {
    const coop = await prisma.cooperative.findFirst({ include: { members: true } });
    const fiscalYear = 2025;
    const surplus = 1000;

    // Create some transactions to simulate patronage
    // Member 1 buys $500 from Coop
    // Member 2 buys $500 from Coop
    // Total $1000
    
    const coopMerchant = await prisma.merchant.findUnique({ where: { id: coop.merchantId } });
    
    for (let i = 0; i < 2; i++) {
      const memberMerchant = await prisma.merchant.findUnique({ 
        where: { id: coop.members[i].merchantId }
      });
      
      await prisma.transaction.create({
        data: {
          merchantId: coop.merchantId, // Seller
          neighborId: memberMerchant.userId, // Buyer
          productServiceId: productService.id,
          nonprofitId: nonprofit.id,
          grossAmount: 500,
          merchantNet: 450,
          paymentMethod: 'CARD',
          createdAt: new Date(fiscalYear, 5, 15) // Middle of fiscal year
        }
      });
    }

    const records = await CooperativeService.calculatePatronageDividends(coop.id, fiscalYear, surplus);
    
    expect(records.length).toBe(4); // 3 founders + 1 new member
    // Each of the first 2 should get 50% of surplus = 500
    expect(records.find(r => r.merchantId === coop.members[0].merchantId).patronageDividendAmount.toString()).toBe('500');
    expect(records.find(r => r.merchantId === coop.members[1].merchantId).patronageDividendAmount.toString()).toBe('500');
    // Others should get 0
    expect(records.find(r => r.merchantId === coop.members[2].merchantId).patronageDividendAmount.toString()).toBe('0');
    
    // Check equity update (20% of 500 = 100)
    const updatedMember = await prisma.coopMember.findUnique({ where: { id: coop.members[0].id } });
    // Initial was 100 for founders
    expect(updatedMember.equityShares.toString()).toBe('200');
  });

  it('should handle member withdrawal', async () => {
    const coop = await prisma.cooperative.findFirst({ include: { members: true } });
    const memberToWithdraw = coop.members[0];

    const updated = await CooperativeService.withdrawMember(coop.id, memberToWithdraw.merchantId);
    expect(updated.status).toBe('WITHDRAWN');
    expect(updated.withdrawnAt).toBeDefined();
  });
});
