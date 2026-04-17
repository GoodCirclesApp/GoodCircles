import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  DEMO_MERCHANTS,
  DEMO_NONPROFITS,
  DEMO_NEIGHBORS,
  DEMO_PRODUCTS,
} from '../data/demoProducts';

const DEMO_DOMAIN = '@demo.goodcircles.ms';
const DEMO_PASSWORD_HASH = bcrypt.hashSync('DemoMS2026!', 10);

// ─── Status ──────────────────────────────────────────────────────────────────

export const getMockDataStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const [demoUsers, demoMerchants, demoNonprofits, demoProducts, demoTransactions, totalUsers, totalProducts, totalTransactions] =
      await Promise.all([
        prisma.user.count({ where: { email: { endsWith: DEMO_DOMAIN } } }),
        prisma.merchant.count({ where: { user: { email: { endsWith: DEMO_DOMAIN } } } }),
        prisma.nonprofit.count({ where: { user: { email: { endsWith: DEMO_DOMAIN } } } }),
        prisma.productService.count({ where: { merchant: { user: { email: { endsWith: DEMO_DOMAIN } } } } }),
        prisma.transaction.count({ where: { neighbor: { email: { endsWith: DEMO_DOMAIN } } } }),
        prisma.user.count(),
        prisma.productService.count({ where: { isActive: true } }),
        prisma.transaction.count(),
      ]);

    res.json({
      isLoaded: demoUsers > 0,
      node: 'Central Mississippi — Jackson Metro',
      demoUsers,
      demoMerchants,
      demoNonprofits,
      demoProducts,
      demoTransactions,
      totalUsers,
      totalProducts,
      totalTransactions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Load ─────────────────────────────────────────────────────────────────────

export const loadMockData = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const alreadyLoaded = await prisma.user.count({ where: { email: { endsWith: DEMO_DOMAIN } } });
    if (alreadyLoaded > 0) {
      return res.json({ success: true, message: 'Demo data already loaded', alreadyLoaded: true });
    }

    // 1. Create nonprofit users + entities
    const nonprofitRecords: { id: string; userId: string }[] = [];
    for (const np of DEMO_NONPROFITS) {
      const user = await prisma.user.create({
        data: {
          email: np.email,
          password: DEMO_PASSWORD_HASH,
          firstName: np.name.split(' ')[0],
          lastName: np.name.split(' ').slice(1).join(' '),
          role: 'NONPROFIT',
          isActive: true,
          wallet: { create: { balance: 0 } },
        },
      });
      const nonprofit = await prisma.nonprofit.create({
        data: {
          userId: user.id,
          name: np.name,
          description: getNpDescription(np.name),
          category: getNpCategory(np.name),
          ein: np.ein,
          isVerified: true,
        },
      });
      nonprofitRecords.push({ id: nonprofit.id, userId: user.id });
    }

    // 2. Create merchant users + entities
    const merchantRecords: { id: string; userId: string }[] = [];
    for (const m of DEMO_MERCHANTS) {
      const user = await prisma.user.create({
        data: {
          email: m.email,
          password: DEMO_PASSWORD_HASH,
          firstName: m.name.split(' ')[0],
          lastName: m.name.split(' ').slice(1).join(' ') || 'Owner',
          role: 'MERCHANT',
          isActive: true,
          wallet: { create: { balance: 500 + Math.random() * 2000 } },
        },
      });
      const merchant = await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: m.name,
          category: getMerchantCategory(m.name),
          city: m.city,
          state: m.state,
          zipCode: getMsZip(m.city),
          isActive: true,
          acceptsCredits: true,
        },
      });
      merchantRecords.push({ id: merchant.id, userId: user.id });
    }

    // 3. Create products for each merchant
    const productRecords: { id: string; merchantIdx: number; price: number; cogs: number }[] = [];
    for (const p of DEMO_PRODUCTS) {
      const merchantRecord = merchantRecords[p.merchantIdx];
      if (!merchantRecord) continue;
      const ps = await prisma.productService.create({
        data: {
          merchantId: merchantRecord.id,
          name: p.name,
          description: p.desc,
          price: p.price,
          cogs: p.cogs,
          type: p.type,
          category: p.category,
          isActive: true,
        },
      });
      productRecords.push({ id: ps.id, merchantIdx: p.merchantIdx, price: p.price, cogs: p.cogs });
    }

    // 4. Create neighbor users
    const neighborRecords: string[] = [];
    for (const n of DEMO_NEIGHBORS) {
      const user = await prisma.user.create({
        data: {
          email: n.email,
          password: DEMO_PASSWORD_HASH,
          firstName: n.firstName,
          lastName: n.lastName,
          role: 'NEIGHBOR',
          isActive: true,
          wallet: { create: { balance: 50 + Math.random() * 400 } },
        },
      });
      neighborRecords.push(user.id);
    }

    // 5. Create realistic transactions (~400 over 90 days)
    let txCount = 0;
    const now = Date.now();
    const ninety = 90 * 86400000;

    // Transaction frequency weights per merchant (higher = more transactions)
    const txWeights = [12, 15, 10, 4, 5, 6, 8, 3, 2, 7, 6, 9]; // matches DEMO_MERCHANTS order

    for (let mIdx = 0; mIdx < merchantRecords.length; mIdx++) {
      const merchant = merchantRecords[mIdx];
      const mProducts = productRecords.filter(p => p.merchantIdx === mIdx);
      if (mProducts.length === 0) continue;
      const count = txWeights[mIdx] ?? 5;

      for (let i = 0; i < count; i++) {
        const neighborId = neighborRecords[Math.floor(Math.random() * neighborRecords.length)];
        const product = mProducts[Math.floor(Math.random() * mProducts.length)];
        const nonprofit = nonprofitRecords[Math.floor(Math.random() * nonprofitRecords.length)];
        const createdAt = new Date(now - Math.random() * ninety);

        const gross = product.price;
        const cogs = product.cogs;
        const discountAmount = gross * 0.10;
        const effectiveRevenue = gross - discountAmount;
        const netProfit = effectiveRevenue - cogs;
        const nonprofitShare = netProfit * 0.10;
        const platformFee = netProfit * 0.01;
        const merchantNet = cogs + netProfit * 0.89;
        const neighborPays = effectiveRevenue;
        const paymentMethod = Math.random() > 0.35 ? 'INTERNAL' : 'STRIPE';

        try {
          await prisma.transaction.create({
            data: {
              neighborId,
              merchantId: merchant.id,
              productServiceId: product.id,
              nonprofitId: nonprofit.id,
              grossAmount: gross,
              discountAmount,
              nonprofitShare,
              platformFee,
              merchantNet,
              paymentMethod,
              discountMode: 'PRICE_REDUCTION',
              discountWaived: false,
              createdAt,
            },
          });
          txCount++;

          // Update wallet balances for INTERNAL payments
          if (paymentMethod === 'INTERNAL') {
            await prisma.wallet.updateMany({
              where: { userId: neighborId },
              data: { balance: { decrement: neighborPays } },
            });
            await prisma.wallet.updateMany({
              where: { userId: merchant.userId },
              data: { balance: { increment: merchantNet } },
            });
            await prisma.wallet.updateMany({
              where: { userId: nonprofit.userId },
              data: { balance: { increment: nonprofitShare } },
            });
          }
        } catch (_) { /* skip constraint errors */ }
      }
    }

    res.json({
      success: true,
      message: `Central Mississippi demo data loaded`,
      created: {
        nonprofits: nonprofitRecords.length,
        merchants: merchantRecords.length,
        products: productRecords.length,
        neighbors: neighborRecords.length,
        transactions: txCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Unload ───────────────────────────────────────────────────────────────────

export const unloadMockData = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const deleted = await wipeDemoData();
    res.json({ success: true, message: 'Demo data removed', deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Wipe Legacy ─────────────────────────────────────────────────────────────
// One-time cleanup: removes ALL non-admin users and their data.
// Used to clear the old Los Angeles seed data before loading Central MS demo.

export const wipeLegacyData = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const adminEmails = ['admin@goodcircles.org'];
    const nonAdminUsers = await prisma.user.findMany({
      where: { email: { notIn: adminEmails } },
      select: { id: true },
    });
    const userIds = nonAdminUsers.map(u => u.id);

    if (userIds.length === 0) {
      return res.json({ success: true, message: 'No legacy data found', deleted: 0 });
    }

    const merchantIds = (await prisma.merchant.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(m => m.id);
    const nonprofitIds = (await prisma.nonprofit.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(n => n.id);
    const walletIds = (await prisma.wallet.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(w => w.id);

    // Delete in FK-safe order
    await prisma.donorMilestone.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.donationReceipt.deleteMany({ where: { neighborId: { in: userIds } } });
    await prisma.creditLedger.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.ledgerEntry.deleteMany({ where: { walletId: { in: walletIds } } });
    await prisma.booking.deleteMany({ where: { merchantId: { in: merchantIds } } });
    await prisma.transaction.deleteMany({
      where: { OR: [{ neighborId: { in: userIds } }, { merchantId: { in: merchantIds } }, { nonprofitId: { in: nonprofitIds } }] },
    });
    await prisma.productService.deleteMany({ where: { merchantId: { in: merchantIds } } });
    await prisma.wallet.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.merchant.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.nonprofit.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });

    res.json({ success: true, message: 'Legacy data wiped. Admin credentials preserved.', deleted: userIds.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function wipeDemoData() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_DOMAIN } },
    select: { id: true },
  });
  const userIds = demoUsers.map(u => u.id);
  if (userIds.length === 0) return { users: 0, transactions: 0, products: 0 };

  const merchantIds = (await prisma.merchant.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(m => m.id);
  const nonprofitIds = (await prisma.nonprofit.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(n => n.id);
  const walletIds = (await prisma.wallet.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(w => w.id);

  await prisma.donorMilestone.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.donationReceipt.deleteMany({ where: { neighborId: { in: userIds } } });
  await prisma.creditLedger.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.ledgerEntry.deleteMany({ where: { walletId: { in: walletIds } } });
  await prisma.booking.deleteMany({ where: { merchantId: { in: merchantIds } } });

  const txDel = await prisma.transaction.deleteMany({
    where: { OR: [{ neighborId: { in: userIds } }, { merchantId: { in: merchantIds } }, { nonprofitId: { in: nonprofitIds } }] },
  });
  const pdDel = await prisma.productService.deleteMany({ where: { merchantId: { in: merchantIds } } });
  await prisma.wallet.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.merchant.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.nonprofit.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  return { users: userIds.length, transactions: txDel.count, products: pdDel.count };
}

function getNpDescription(name: string): string {
  const map: Record<string, string> = {
    'Mississippi Food Network': 'Mississippi\'s largest food bank network, serving 43,000 people per week across all 82 counties through a network of 500+ partner agencies.',
    'The Stewpot Community Services': 'Providing food, shelter, job training, and addiction recovery services to the homeless and working poor in Jackson since 1981.',
    'Boys & Girls Club of Central Mississippi': 'Providing after-school programs, summer camps, and youth development services for children in Hinds, Rankin, and Madison counties.',
    'Habitat for Humanity Mississippi Capital Area': 'Building and renovating homes alongside low-income families in the Jackson metro area to provide safe, affordable homeownership.',
    'Big Brothers Big Sisters of Greater Mississippi': 'Matching youth ages 6–18 with caring adult mentors to ignite their potential across Central Mississippi.',
  };
  return map[name] || `Serving the Central Mississippi community through impactful programs and direct services.`;
}

function getNpCategory(name: string): string {
  const map: Record<string, string> = {
    'Mississippi Food Network': 'Food Security',
    'The Stewpot Community Services': 'Human Services',
    'Boys & Girls Club of Central Mississippi': 'Youth Development',
    'Habitat for Humanity Mississippi Capital Area': 'Housing',
    'Big Brothers Big Sisters of Greater Mississippi': 'Youth Mentorship',
  };
  return map[name] || 'Community Services';
}

function getMerchantCategory(name: string): string {
  const map: Record<string, string> = {
    "Walker's Drive-In": 'Dining',
    'Cups Coffee & Tea': 'Cafe & Bakery',
    "McDade's Market": 'Grocery',
    "Patton's Heating & Air": 'Home Services',
    'Bravo! Italian Restaurant': 'Dining',
    'Whole Health Pharmacy': 'Health & Pharmacy',
    "Hal & Mal's": 'Entertainment & Dining',
    'Capital City Pest Control': 'Home Services',
    'Watkins & Eager PLLC': 'Professional Services',
    'Foundation Fitness': 'Fitness & Wellness',
    'Capitol City Auto Service': 'Automotive',
    'Jackson Baking Company': 'Bakery',
  };
  return map[name] || 'Local Business';
}

function getMsZip(city: string): string {
  const map: Record<string, string> = {
    Jackson: '39201',
    Ridgeland: '39157',
    Madison: '39110',
    Brandon: '39042',
    Pearl: '39208',
    Clinton: '39056',
    Flowood: '39232',
    Canton: '39046',
    Byram: '39272',
    Richland: '39218',
  };
  return map[city] || '39201';
}
