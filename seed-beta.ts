/**
 * Good Circles — Beta Seed Data Script
 * 
 * Creates test accounts, products, and demo data.
 * IDEMPOTENT: Only creates products that don't already exist.
 * This preserves the admin toggle state across deploys.
 * 
 * Run: npx tsx seed-beta.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_PRODUCTS } from './server/src/data/demoProducts';

const prisma = new PrismaClient();

const BETA_PASSWORD = 'BetaTest2026!';

async function seed() {
  console.log('[Seed] Starting beta seed data...');

  const passwordHash = await bcrypt.hash(BETA_PASSWORD, 12);

  // ─── Platform Admin ──────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: 'admin@goodcircles.org' },
    update: {},
    create: {
      email: 'admin@goodcircles.org',
      passwordHash,
      role: 'PLATFORM',
      firstName: 'Platform',
      lastName: 'Admin',
    }
  });
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: 0 }
  });
  console.log(`[Seed] ✅ Admin: admin@goodcircles.org`);

  // ─── Nonprofits ──────────────────────────────────────────────────────

  const nonprofitData = [
    { email: 'contact@localfoodbank.org', firstName: 'Maria', lastName: 'Santos', orgName: 'Community Food Bank', ein: '47-1234567', mission: 'Fighting hunger by providing nutritious food to families in need across the metro area.' },
    { email: 'info@youthscholars.org', firstName: 'James', lastName: 'Washington', orgName: 'Youth Scholars Alliance', ein: '47-2345678', mission: 'Providing scholarships, tutoring, and mentorship programs for underserved youth.' },
    { email: 'team@greencleanup.org', firstName: 'Priya', lastName: 'Patel', orgName: 'Green Cleanup Initiative', ein: '47-3456789', mission: 'Organizing community cleanups, tree planting, and environmental education programs.' },
  ];

  const nonprofits = [];
  for (const np of nonprofitData) {
    const user = await prisma.user.upsert({
      where: { email: np.email },
      update: {},
      create: { email: np.email, passwordHash, role: 'NONPROFIT', firstName: np.firstName, lastName: np.lastName }
    });
    const nonprofit = await prisma.nonprofit.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        orgName: np.orgName,
        ein: np.ein,
        missionStatement: np.mission,
        isVerified: true,
        verifiedAt: new Date(),
        referralCode: `REF-${np.orgName.replace(/\s/g, '').slice(0, 8).toUpperCase()}`
      }
    });
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: 0 }
    });
    nonprofits.push(nonprofit);
    console.log(`[Seed] ✅ Nonprofit: ${np.email} (${np.orgName})`);
  }

  // ─── Merchants ───────────────────────────────────────────────────────

  const merchantData = [
    { email: 'marco@theharvesttable.com', firstName: 'Marco', lastName: 'Rivera', businessName: 'The Harvest Table', businessType: 'SERVICES', category: 'Dining' },
    { email: 'lisa@fixitlocal.com', firstName: 'Lisa', lastName: 'Chen', businessName: 'Fix-It Local Plumbing', businessType: 'SERVICES', category: 'Home Services' },
    { email: 'david@justicelaw.com', firstName: 'David', lastName: 'Okafor', businessName: 'Justice Partners Legal', businessType: 'SERVICES', category: 'Professional Services' },
    { email: 'sarah@farmfreshco.com', firstName: 'Sarah', lastName: 'Kim', businessName: 'Farm Fresh Collective', businessType: 'GOODS', category: 'Groceries' },
    { email: 'alex@tutorzone.com', firstName: 'Alex', lastName: 'Nguyen', businessName: 'TutorZone Academy', businessType: 'SERVICES', category: 'Education' },
  ];

  const merchants = [];
  for (const m of merchantData) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { email: m.email, passwordHash, role: 'MERCHANT', firstName: m.firstName, lastName: m.lastName }
    });
    const merchant = await prisma.merchant.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: m.businessName,
        businessType: m.businessType,
        isVerified: true,
        onboardedAt: new Date(),
        regionId: null,
      }
    });
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: 0 }
    });
    merchants.push({ merchant, category: m.category });
    console.log(`[Seed] ✅ Merchant: ${m.email} (${m.businessName})`);
  }

  // ─── Product/Service Listings (from consolidated demoProducts.ts) ───
  // Only creates products that don't already exist.
  // This preserves the admin toggle (isActive) state across deploys.

  let created = 0;
  let skipped = 0;

  for (const product of DEMO_PRODUCTS) {
    const merchant = merchants[product.merchantIdx % merchants.length];
    
    // Check if this product already exists for this merchant
    const existing = await prisma.productService.findFirst({
      where: {
        merchantId: merchant.merchant.id,
        name: product.name,
      }
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.productService.create({
      data: {
        merchantId: merchant.merchant.id,
        name: product.name,
        description: product.desc,
        price: product.price,
        cogs: product.cogs,
        type: product.type,
        category: product.category,
        isActive: true,
      }
    });
    created++;
  }
  console.log(`[Seed] ✅ Products: ${created} created, ${skipped} already existed`);

  // ─── Consumers ───────────────────────────────────────────────────────

  const consumerData = [
    { email: 'alice@beta.test', firstName: 'Alice', lastName: 'Johnson' },
    { email: 'bob@beta.test', firstName: 'Bob', lastName: 'Williams' },
    { email: 'carol@beta.test', firstName: 'Carol', lastName: 'Davis' },
    { email: 'dan@beta.test', firstName: 'Dan', lastName: 'Martinez' },
    { email: 'emma@beta.test', firstName: 'Emma', lastName: 'Garcia' },
    { email: 'frank@beta.test', firstName: 'Frank', lastName: 'Brown' },
    { email: 'grace@beta.test', firstName: 'Grace', lastName: 'Lee' },
    { email: 'henry@beta.test', firstName: 'Henry', lastName: 'Taylor' },
    { email: 'iris@beta.test', firstName: 'Iris', lastName: 'Anderson' },
    { email: 'jack@beta.test', firstName: 'Jack', lastName: 'Thomas' },
  ];

  for (const c of consumerData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash,
        role: 'NEIGHBOR',
        firstName: c.firstName,
        lastName: c.lastName,
        electedNonprofitId: nonprofits[Math.floor(Math.random() * nonprofits.length)].id,
      }
    });
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: 50 }
    });
    console.log(`[Seed] ✅ Consumer: ${c.email} ($50 wallet balance)`);
  }

  // ─── Community Initiatives ───────────────────────────────────────────

  const initCount = await prisma.communityInitiative.count();
  if (initCount === 0) {
    await prisma.communityInitiative.create({
      data: {
        title: 'Mobile Health Clinic',
        description: 'A fully equipped mobile medical unit to serve under-resourced neighborhoods. Target: 3 monthly clinics serving 200+ residents each.',
        fundingGoal: 50000,
        currentFunding: 12450,
        createdBy: admin.id,
        nonprofitId: nonprofits[0].id,
        isActive: true,
      }
    });

    await prisma.communityInitiative.create({
      data: {
        title: 'Youth Coding Lab',
        description: 'Equip a community center with 20 laptops and curriculum for free coding classes for teens ages 13-18.',
        fundingGoal: 15000,
        currentFunding: 8200,
        createdBy: admin.id,
        nonprofitId: nonprofits[1].id,
        isActive: true,
      }
    });
    console.log('[Seed] ✅ Created 2 community initiatives');
  }

  // ─── Referral Bonus Tiers ────────────────────────────────────────────

  const tierCount = await prisma.referralBonusTier.count();
  if (tierCount === 0) {
    await prisma.referralBonusTier.createMany({
      data: [
        { tierName: 'Activation', nonprofitFundingThreshold: 7500, bonusAmount: 500 },
        { tierName: 'Established', nonprofitFundingThreshold: 25000, bonusAmount: 1000 },
        { tierName: 'High Volume', nonprofitFundingThreshold: 75000, bonusAmount: 2500 },
        { tierName: 'Anchor Merchant', nonprofitFundingThreshold: 150000, bonusAmount: 5000 },
      ]
    });
    console.log('[Seed] ✅ Seeded 4 referral bonus tiers');
  }

  // ─── Affiliate Program + Demo Listings ──────────────────────────────
  // Uses categories NOT covered by native merchants so the Priority Engine
  // correctly surfaces these while suppressing them once local merchants exist.

  const affiliateProgramCount = await prisma.affiliateProgram.count();
  if (affiliateProgramCount === 0) {
    const demoProgram = await prisma.affiliateProgram.create({
      data: {
        name: 'Amazon Associates',
        platform: 'AMAZON',
        trackingId: 'goodcircles-20',
        baseCommRate: 0.04,
        logoUrl: null,
        isActive: true,
      }
    });

    await prisma.affiliateListing.createMany({
      data: [
        {
          programId: demoProgram.id,
          externalId: 'B09G9FPHY6',
          title: 'Anker 65W USB-C Charging Station (4-Port)',
          description: 'Fast-charge up to 4 devices simultaneously. Compatible with all USB-C devices.',
          imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
          price: 35.99,
          affiliateUrl: 'https://www.amazon.com/dp/B09G9FPHY6?tag=goodcircles-20',
          category: 'Electronics',
          commRate: 0.04,
          isActive: true,
          createdBy: admin.id,
        },
        {
          programId: demoProgram.id,
          externalId: 'B08N5WRWNW',
          title: 'Kindle Paperwhite (16 GB) — Waterproof E-Reader',
          description: 'Adjustable warm light, 6.8" display, weeks of battery life.',
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
          price: 139.99,
          affiliateUrl: 'https://www.amazon.com/dp/B08N5WRWNW?tag=goodcircles-20',
          category: 'Electronics',
          commRate: 0.04,
          isActive: true,
          createdBy: admin.id,
        },
        {
          programId: demoProgram.id,
          externalId: 'B07VGRJDFY',
          title: 'Patagonia Better Sweater Fleece Jacket',
          description: 'Made from 100% recycled polyester fleece. Fair Trade Certified.',
          imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
          price: 99.00,
          affiliateUrl: 'https://www.amazon.com/dp/B07VGRJDFY?tag=goodcircles-20',
          category: 'Clothing',
          commRate: 0.04,
          isActive: true,
          createdBy: admin.id,
        },
        {
          programId: demoProgram.id,
          externalId: 'B09B8YWXDF',
          title: 'Yoga Mat — Non-Slip, Eco-Friendly, 6mm Thick',
          description: 'Natural tree rubber base with moisture-wicking top layer. Includes carry strap.',
          imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
          price: 54.99,
          affiliateUrl: 'https://www.amazon.com/dp/B09B8YWXDF?tag=goodcircles-20',
          category: 'Sports & Fitness',
          commRate: 0.04,
          isActive: true,
          createdBy: admin.id,
        },
        {
          programId: demoProgram.id,
          externalId: 'B08BHXG144',
          title: 'Atomic Habits — James Clear (Hardcover)',
          description: 'The #1 New York Times bestseller on building good habits and breaking bad ones.',
          imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
          price: 18.99,
          affiliateUrl: 'https://www.amazon.com/dp/B08BHXG144?tag=goodcircles-20',
          category: 'Books',
          commRate: 0.045,
          isActive: true,
          createdBy: admin.id,
        },
        {
          programId: demoProgram.id,
          externalId: 'B07D4P3D6K',
          title: 'Vitafusion Extra Strength Vitamin D3 Gummies (120ct)',
          description: '3000 IU per serving. Peach, blackberry, and strawberry flavors. No artificial flavors.',
          imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
          price: 14.49,
          affiliateUrl: 'https://www.amazon.com/dp/B07D4P3D6K?tag=goodcircles-20',
          category: 'Health & Wellness',
          commRate: 0.04,
          isActive: true,
          createdBy: admin.id,
        },
      ]
    });
    console.log('[Seed] ✅ Created 1 affiliate program (Amazon Associates) + 6 demo listings');
  }

  // ─── Donation Pool Fund ──────────────────────────────────────────────

  await prisma.communityFund.upsert({
    where: { id: 'beta-donation-pool' },
    update: {},
    create: {
      id: 'beta-donation-pool',
      name: 'Community Donation Pool',
      type: 'donation_pool',
      totalCapital: 0,
      deployedCapital: 0,
      isActive: true,
    }
  });
  console.log('[Seed] ✅ Created donation pool fund');

  console.log('\n[Seed] ═══════════════════════════════════════════');
  console.log('[Seed] Beta seed data complete!');
  console.log('[Seed] ');
  console.log('[Seed] All accounts use password: BetaTest2026!');
  console.log('[Seed] Consumer wallets funded with $50 each.');
  console.log('[Seed] All merchants and nonprofits are pre-verified.');
  console.log('[Seed] ═══════════════════════════════════════════\n');
}

seed()
  .catch(err => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
