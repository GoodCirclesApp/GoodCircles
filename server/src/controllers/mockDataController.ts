import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { GC_DISCOUNT_RATE, NONPROFIT_RATE, PLATFORM_RATE, MERCHANT_PROFIT_RATE } from '../lib/splitRates';
import {
  DEMO_MERCHANTS,
  DEMO_NONPROFITS,
  DEMO_NEIGHBORS,
  DEMO_PRODUCTS,
} from '../data/demoProducts';

const DEMO_DOMAIN = '@demo.goodcircles.ms';
// Demo accounts only (never seeded in production — see the NODE_ENV/SEED gates on the
// load routes). Overridable via env so the literal isn't the only credential source
// (compliance audit D13); falls back to the documented demo password for local use.
const DEMO_PASSWORD_HASH = bcrypt.hashSync(process.env.DEMO_ACCOUNT_PASSWORD || 'DemoMS2026!', 10);

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
          passwordHash: DEMO_PASSWORD_HASH,
          firstName: np.name.split(' ')[0],
          lastName: np.name.split(' ').slice(1).join(' '),
          role: 'NONPROFIT',
          wallet: { create: { balance: 0 } },
        },
      });
      const nonprofit = await prisma.nonprofit.create({
        data: {
          userId: user.id,
          orgName: np.name,
          missionStatement: getNpDescription(np.name),
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
          passwordHash: DEMO_PASSWORD_HASH,
          firstName: m.name.split(' ')[0],
          lastName: m.name.split(' ').slice(1).join(' ') || 'Owner',
          role: 'MERCHANT',
          wallet: { create: { balance: 500 + Math.random() * 2000 } },
        },
      });
      const merchant = await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: m.name,
          businessType: getMerchantCategory(m.name),
          creditAcceptance: 'FULL',
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
          passwordHash: DEMO_PASSWORD_HASH,
          firstName: n.firstName,
          lastName: n.lastName,
          role: 'NEIGHBOR',
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
        const discountAmount = gross * GC_DISCOUNT_RATE;
        const effectiveRevenue = gross - discountAmount;
        const netProfit = effectiveRevenue - cogs;
        const nonprofitShare = netProfit * NONPROFIT_RATE;
        const platformFee = netProfit * PLATFORM_RATE;
        const merchantNet = cogs + netProfit * MERCHANT_PROFIT_RATE;
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
// Cleanup: removes ALL users except the platform admin + admin-viewer and their data.
// Use this to reset prod to a fresh, clean marketplace (no products, no transactions,
// no demo/seed accounts) while keeping the two operating accounts that should stay live.

export const wipeLegacyData = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const adminEmails = ['admin@goodcircles.org', 'viewer@goodcircles.org'];
    const nonAdminUsers = await prisma.user.findMany({
      where: { email: { notIn: adminEmails } },
      select: { id: true },
    });
    const userIds = nonAdminUsers.map(u => u.id);

    if (userIds.length === 0) {
      return res.json({ success: true, message: 'Already clean — only the admin and viewer accounts exist.', deleted: 0 });
    }

    const result = await purgeUsers(userIds);
    res.json({ success: true, message: 'Reset complete. Admin + viewer accounts preserved; all other users and their data removed.', deleted: result.users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// FK-safe teardown of a set of users and EVERYTHING anchored to them — their
// merchants, nonprofits, wallets, and every child row that RESTRICT-references
// those entities (which is what blocks a naive delete). Runs in a single
// transaction so it can never leave a half-deleted state, and clears the
// append-only LocalDollarEdge snapshot rows so demo data also leaves the graph.
async function purgeUsers(userIds: string[]): Promise<{ users: number; transactions: number; products: number }> {
  if (userIds.length === 0) return { users: 0, transactions: 0, products: 0 };

  const merchantIds = (await prisma.merchant.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(m => m.id);
  const nonprofitIds = (await prisma.nonprofit.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(n => n.id);
  const walletIds = (await prisma.wallet.findMany({ where: { userId: { in: userIds } }, select: { id: true } })).map(w => w.id);

  const mFilter = { merchantId: { in: merchantIds } };
  const npFilter = { nonprofitId: { in: nonprofitIds } };

  return prisma.$transaction(async (tx) => {
    // ── Children that RESTRICT-reference a NONPROFIT (must precede nonprofit delete) ──
    await tx.donorMilestone.deleteMany({ where: { OR: [{ userId: { in: userIds } }, npFilter] } });
    await tx.dmsExportJob.deleteMany({ where: npFilter });
    await tx.crmWebhook.deleteMany({ where: npFilter });
    await tx.nonprofitDigestLog.deleteMany({ where: npFilter });
    await tx.ccvCampaign.deleteMany({ where: npFilter });        // CcvContract cascades from CcvCampaign
    await tx.impactUpdate.deleteMany({ where: npFilter });        // also cascades; explicit for safety
    await tx.donationReceipt.deleteMany({ where: { OR: [mFilter, npFilter] } });

    // ── Children that RESTRICT-reference a MERCHANT ──
    await tx.cogsSuggestion.deleteMany({ where: mFilter });
    await tx.supplyMatch.deleteMany({ where: { OR: [{ buyerMerchantId: { in: merchantIds } }, { suggestedSupplierMerchantId: { in: merchantIds } }] } });
    await tx.supplyRelationship.deleteMany({ where: { OR: [{ buyerMerchantId: { in: merchantIds } }, { supplierMerchantId: { in: merchantIds } }] } });
    await tx.benefitEnrollment.deleteMany({ where: mFilter });

    // ── MerchantReferral RESTRICT-references BOTH merchant and nonprofit; its
    //    ReferralBonusPayout children RESTRICT-reference it, so clear those first. ──
    const referralFilter = { OR: [{ merchantId: { in: merchantIds } }, { referringNonprofitId: { in: nonprofitIds } }] };
    await tx.referralBonusPayout.deleteMany({ where: { referral: referralFilter } });
    await tx.merchantReferral.deleteMany({ where: referralFilter });

    // ── Bookings RESTRICT-reference BOTH merchant and nonprofit (reminders cascade) ──
    await tx.booking.deleteMany({ where: { OR: [mFilter, npFilter] } });

    // ── Transactions RESTRICT-reference neighbor/merchant/nonprofit; clear before products ──
    const txDel = await tx.transaction.deleteMany({ where: { OR: [{ neighborId: { in: userIds } }, mFilter, npFilter] } });

    // ── Append-only graph rows carry snapshot ids (no FK) — clear so demo leaves the graph ──
    await tx.localDollarEdge.deleteMany({ where: { OR: [{ neighborId: { in: userIds } }, mFilter, npFilter] } });

    // ── Wallet ledger + credit ──
    await tx.ledgerEntry.deleteMany({ where: { walletId: { in: walletIds } } });
    await tx.creditLedger.deleteMany({ where: { userId: { in: userIds } } });

    // ── Products, then the parent entities ──
    const pdDel = await tx.productService.deleteMany({ where: mFilter });
    await tx.wallet.deleteMany({ where: { userId: { in: userIds } } });
    await tx.merchant.deleteMany({ where: { userId: { in: userIds } } });
    await tx.nonprofit.deleteMany({ where: { userId: { in: userIds } } });
    const userDel = await tx.user.deleteMany({ where: { id: { in: userIds } } });

    return { users: userDel.count, transactions: txDel.count, products: pdDel.count };
  }, { maxWait: 15000, timeout: 60000 });
}

async function wipeDemoData() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_DOMAIN } },
    select: { id: true },
  });
  return purgeUsers(demoUsers.map(u => u.id));
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
