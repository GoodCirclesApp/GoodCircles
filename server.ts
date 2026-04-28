import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/src/routes/authRoutes';
import emailRoutes from './server/src/routes/emailRoutes';
import neighborRoutes from './server/src/routes/neighborRoutes';
import merchantRoutes from './server/src/routes/merchantRoutes';
import marketplaceRoutes from './server/src/routes/marketplaceRoutes';
import nonprofitRoutes from './server/src/routes/nonprofitRoutes';
import paymentRoutes from './server/src/routes/paymentRoutes';
import walletRoutes from './server/src/routes/walletRoutes';
import checkoutRoutes from './server/src/routes/checkoutRoutes';
import nettingRoutes from './server/src/routes/nettingRoutes';
import creditRoutes from './server/src/routes/creditRoutes';
import adminRoutes from './server/src/routes/adminRoutes';
import bookingRoutes from './server/src/routes/bookingRoutes';
import dataCoopRoutes from './server/src/routes/dataCoopRoutes';
import coopRoutes from './server/src/routes/coopRoutes';
import cdfiRoutes from './server/src/routes/cdfiRoutes';
import impactRoutes from './server/src/routes/impactRoutes';
import leaderboardRoutes from './server/src/routes/leaderboardRoutes';
import feedRoutes from './server/src/routes/feedRoutes';
import communityFundRoutes from './server/src/routes/communityFundRoutes';
import benefitRoutes from './server/src/routes/benefitRoutes';
import supplyChainRoutes from './server/src/routes/supplyChainRoutes';
import adminImpactRoutes from './server/src/routes/adminImpactRoutes';
import municipalRoutes from './server/src/routes/municipalRoutes';
import betaRoutes from './server/src/routes/betaRoutes';
import catalogRoutes from './server/src/routes/catalogRoutes';
import affiliateRoutes from './server/src/routes/affiliateRoutes';
import governanceRoutes from './server/src/routes/governanceRoutes';
import refundRoutes from './server/src/routes/refundRoutes';
import dmsRoutes from './server/src/routes/dmsRoutes';
import searchRoutes from './server/src/routes/searchRoutes';
import complianceRoutes from './server/src/routes/complianceRoutes';

import { ReferralService } from './server/src/services/referralService';
import { GovernanceService } from './server/src/services/governanceService';
import { BookingService } from './server/src/services/bookingService';
import { DataCoopService } from './server/src/services/dataCoopService';
import { NettingService } from './server/src/services/nettingService';
import { CoopService } from './server/src/services/coopService';
import { RegionalMetricsService } from './server/src/services/regionalMetricsService';
import { IrsVerificationService } from './server/src/services/irsVerificationService';
import { StateStandingService } from './server/src/services/stateStandingService';
import { FfiecGeocodingService } from './server/src/services/ffiecGeocodingService';
import { FeatureFlagService } from './server/src/services/featureFlagService';
import { sendNonprofitDailyDigest } from './server/src/services/emailService';
import { prisma } from './server/src/lib/prisma';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Ensure all schema columns exist before handling any requests
  await ensureColumns();

  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // ── Security headers ───────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  // ── CORS ───────────────────────────────────────────────────────
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));

  // ── Rate limiting ──────────────────────────────────────────────
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 200 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in a few minutes.' },
  });
  app.use('/api/', apiLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 20 : 100,
    message: { error: 'Too many auth attempts. Please try again later.' },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // ── Trust proxy (needed behind reverse proxy / Railway / Render) ─
  if (isProd) app.set('trust proxy', 1);

  // ── Static files (serve EARLY, before other middleware) ──────────
  if (isProd) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  // Stripe Webhook needs raw body - must be before express.json()
  app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
  app.use('/api/catalog/webhook/stripe', express.raw({ type: 'application/json' }));

  app.use(express.json());
  app.use('/api/email', emailRoutes);

  // ══════════════════════════════════════════════════════════════
  // API Routes
  // ══════════════════════════════════════════════════════════════
  app.use('/api/auth', authRoutes);
  app.use('/api/email', emailRoutes);
  app.use('/api/neighbor', neighborRoutes);
  app.use('/api/merchant', merchantRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/nonprofit', nonprofitRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/netting', nettingRoutes);
  app.use('/api/coop', coopRoutes);
  app.use('/api/credits', creditRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/data-coop', dataCoopRoutes);
  app.use('/api/cdfi', cdfiRoutes);
  app.use('/api/impact', impactRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/feed', feedRoutes);
  app.use('/api/community-fund', communityFundRoutes);
  app.use('/api/benefits', benefitRoutes);
  app.use('/api/supply-chain', supplyChainRoutes);
  app.use('/api/admin/impact', adminImpactRoutes);
  app.use('/api/municipal', municipalRoutes);
  app.use('/api/beta', betaRoutes);
  app.use('/api/catalog', catalogRoutes);
  app.use('/api/affiliate', affiliateRoutes);
  app.use('/api/governance', governanceRoutes);
  app.use('/api/transactions', refundRoutes);
  app.use('/api/dms', dmsRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/compliance', complianceRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Good Circles API is running', version: '1.0.0-beta' });
  });


  // ══════════════════════════════════════════════════════════════
  // Static files & SPA fallback (MUST come after API routes)
  // ══════════════════════════════════════════════════════════════
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
        res.sendFile(path.join(distPath, 'index.html'));
      } else {
        next();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // Error handler (MUST be last middleware)
  // ══════════════════════════════════════════════════════════════
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Server] Unhandled error:', err.message || err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: isProd ? 'Internal server error' : err.message,
    });
  });

  // ══════════════════════════════════════════════════════════════
  // Start listening
  // ══════════════════════════════════════════════════════════════
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n ┌─────────────────────────────────────────────┐`);
    console.log(` │ Good Circles v1.0.0-beta                    │`);
    console.log(` │ Server running at http://0.0.0.0:${String(PORT).padEnd(10)}│`);
    console.log(` │ Environment: ${(process.env.NODE_ENV || 'development').padEnd(29)}│`);
    console.log(` └─────────────────────────────────────────────┘\n`);

    // Load feature flags and demo mode from DB
    FeatureFlagService.loadFromDb()
      .then(() => console.log('[Server] Feature flags loaded from DB.'))
      .catch(err => console.error('[Server] Feature flag load error:', err));

    // Run background tasks after server starts
    console.log('[Server] Starting background tasks...');

    ReferralService.seedTiers().then(() => {
      console.log('[Server] Referral tiers seeded successfully.');
    }).catch(err => {
      console.error('[Server] Failed to seed referral tiers:', err);
    });

    IrsVerificationService.seedFromPlatformNonprofits().catch(err => {
      console.error('[Server] Failed to seed IRS verification records:', err);
    });

    // IRS EO BMF sync: runs immediately if DB is empty or data is stale,
    // then checks daily and syncs again once the 30-day window elapses.
    IrsVerificationService.syncIfStale().catch(err =>
      console.error('[Server] IRS stale-check error:', err)
    );
    setInterval(() => {
      IrsVerificationService.syncIfStale().catch(err =>
        console.error('[Server] IRS monthly sync error:', err)
      );
    }, 24 * 60 * 60 * 1000);

    // State AG standing: syncs CA registry monthly if CA_AG_REGISTRY_URL is configured
    StateStandingService.syncIfStale().catch(err =>
      console.error('[Server] State standing stale-check error:', err)
    );
    setInterval(() => {
      StateStandingService.syncIfStale().catch(err =>
        console.error('[Server] State standing monthly sync error:', err)
      );
    }, 24 * 60 * 60 * 1000);

    // FFIEC geocoding: nightly batch for merchants missing census tract data (1 req/sec, capped at 100)
    setInterval(() => {
      FfiecGeocodingService.geocodeMissingMerchants().catch(err =>
        console.error('[Server] FFIEC geocoding error:', err)
      );
    }, 24 * 60 * 60 * 1000);

    // Process booking reminders every 15 minutes
    setInterval(async () => {
      try {
        const count = await BookingService.processReminders();
        if (count > 0) console.log(`[Server] Sent ${count} booking reminders.`);
      } catch (err) {
        console.error('[Server] Error processing booking reminders:', err);
      }
    }, 15 * 60 * 1000);

    // Data Coop: Daily Anonymization
    setInterval(async () => {
      try {
        const count = await DataCoopService.collectAnonymizedData();
        if (count > 0) console.log(`[Server] Anonymized ${count} transactions for Data Coop.`);
      } catch (err) {
        console.error('[Server] Error in Data Coop anonymization:', err);
      }
    }, 24 * 60 * 60 * 1000);

    // Data Coop: Weekly Activation Check
    setInterval(async () => {
      try {
        const results = await DataCoopService.evaluateActivationThresholds();
        console.log(`[Server] Evaluated ${results.length} Data Coop activation combinations.`);
      } catch (err) {
        console.error('[Server] Error in Data Coop activation check:', err);
      }
    }, 7 * 24 * 60 * 60 * 1000);

    // Data Coop: Monthly Insight Generation
    setInterval(async () => {
      try {
        await DataCoopService.generateInsights();
        console.log(`[Server] Generated monthly Data Coop insights.`);
      } catch (err) {
        console.error('[Server] Error in Data Coop insight generation:', err);
      }
    }, 24 * 60 * 60 * 1000);

    // Netting: Daily Cycle
    setInterval(async () => {
      try {
        const batch = await NettingService.runNettingCycle();
        if (batch) console.log(`[Server] Netting cycle completed: Batch ${batch.id} (${batch.status})`);
      } catch (err) {
        console.error('[Server] Error in Netting cycle:', err);
      }
    }, 24 * 60 * 60 * 1000);

    // Netting: Weekly Trigger Evaluation
    setInterval(async () => {
      try {
        const activation = await NettingService.evaluateTriggers();
        console.log(`[Server] Evaluated Netting triggers: Active=${activation.isActive}`);
      } catch (err) {
        console.error('[Server] Error evaluating Netting triggers:', err);
      }
    }, 7 * 24 * 60 * 60 * 1000);

    // Coop: Daily Deal Lifecycle
    setInterval(async () => {
      try {
        await CoopService.processDealLifecycles();
        console.log(`[Server] Processed Coop deal lifecycles.`);
      } catch (err) {
        console.error('[Server] Error processing Coop deal lifecycles:', err);
      }
    }, 24 * 60 * 60 * 1000);

    // Coop: Weekly Threshold Evaluation
    setInterval(async () => {
      try {
        await CoopService.evaluateActivationThresholds();
        console.log(`[Server] Evaluated Coop activation thresholds.`);
      } catch (err) {
        console.error('[Server] Error evaluating Coop activation thresholds:', err);
      }
    }, 7 * 24 * 60 * 60 * 1000);

    // Governance: Daily proposal expiry check
    setInterval(async () => {
      try {
        const result = await GovernanceService.expireStaleProposals();
        if (result.count > 0) console.log(`[Server] Expired ${result.count} stale governance proposals.`);
      } catch (err) {
        console.error('[Server] Error expiring governance proposals:', err);
      }
    }, 24 * 60 * 60 * 1000);

    // Nonprofit daily digest: runs once per day, sends digest to nonprofits with donations in last 24h
    const runNonprofitDigest = async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const groups = await prisma.transaction.groupBy({
          by: ['nonprofitId'],
          where: { createdAt: { gte: since } },
          _sum: { nonprofitShare: true },
          _count: { id: true },
        });

        for (const g of groups) {
          const nonprofit = await prisma.nonprofit.findUnique({
            where: { id: g.nonprofitId },
            include: { user: { select: { email: true } } },
          });
          if (!nonprofit || !nonprofit.user.email) continue;

          const topMerchants = await prisma.transaction.groupBy({
            by: ['merchantId'],
            where: { nonprofitId: g.nonprofitId, createdAt: { gte: since } },
            _sum: { nonprofitShare: true },
            orderBy: { _sum: { nonprofitShare: 'desc' } },
            take: 5,
          });
          const merchantIds = topMerchants.map(r => r.merchantId);
          const merchants = await prisma.merchant.findMany({ where: { id: { in: merchantIds } }, select: { id: true, businessName: true } });
          const mMap: Record<string, string> = {};
          merchants.forEach(m => { mMap[m.id] = m.businessName; });

          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const yearStart = new Date(now.getFullYear(), 0, 1);

          const [monthAgg, yearAgg] = await Promise.all([
            prisma.transaction.aggregate({ where: { nonprofitId: g.nonprofitId, createdAt: { gte: monthStart } }, _sum: { nonprofitShare: true } }),
            prisma.transaction.aggregate({ where: { nonprofitId: g.nonprofitId, createdAt: { gte: yearStart } }, _sum: { nonprofitShare: true } }),
          ]);

          await sendNonprofitDailyDigest({
            nonprofitEmail: nonprofit.user.email,
            nonprofitName: nonprofit.orgName,
            donationCount: g._count.id,
            totalAmount: Number(g._sum.nonprofitShare ?? 0),
            topMerchants: topMerchants.map(r => ({ businessName: mMap[r.merchantId] ?? 'Merchant', amount: Number(r._sum.nonprofitShare ?? 0) })),
            monthTotal: Number(monthAgg._sum.nonprofitShare ?? 0),
            yearTotal: Number(yearAgg._sum.nonprofitShare ?? 0),
          });

          await prisma.nonprofitDigestLog.create({
            data: {
              nonprofitId: g.nonprofitId,
              donationCount: g._count.id,
              totalAmount: Number(g._sum.nonprofitShare ?? 0),
            },
          });
        }
        if (groups.length > 0) console.log(`[Server] Sent nonprofit digest to ${groups.length} organization(s).`);
      } catch (err) {
        console.error('[Server] Nonprofit digest error:', err);
      }
    };

    // Run digest daily at ~8am — first run after 10 seconds, then every 24h
    setTimeout(() => {
      runNonprofitDigest();
      setInterval(runNonprofitDigest, 24 * 60 * 60 * 1000);
    }, 10_000);

    // Regional Metrics: Monthly Aggregation
    setInterval(async () => {
      try {
        const period = new Date().toISOString().slice(0, 7);
        await RegionalMetricsService.autoDiscoverRegions();
        await RegionalMetricsService.runAggregation(period);
        console.log(`[Server] Monthly regional metrics aggregation completed for ${period}.`);
      } catch (err) {
        console.error('[Server] Error in regional metrics aggregation:', err);
      }
    }, 24 * 60 * 60 * 1000);
  });
}

// Idempotent schema guard — creates missing tables and columns before the server
// accepts any requests. Safe to run on every deploy (IF NOT EXISTS / count checks).
async function ensureColumns() {
  // ── New tables (added post-launch; prisma db push may not have run) ──────────
  const tableSql = [
    // Feature flags & demo mode
    `CREATE TABLE IF NOT EXISTS "SystemSetting" (
       "key"       TEXT        NOT NULL,
       "value"     TEXT        NOT NULL,
       "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
     )`,

    // Admin audit log
    `CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
       "id"        TEXT        NOT NULL,
       "adminId"   TEXT        NOT NULL,
       "action"    TEXT        NOT NULL,
       "targetId"  TEXT,
       "detail"    TEXT,
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
     )`,

    // Stripe wallet top-up tracking
    `CREATE TABLE IF NOT EXISTS "WalletTopUp" (
       "id"                    TEXT         NOT NULL,
       "userId"                TEXT         NOT NULL,
       "amount"                DECIMAL(10,2) NOT NULL,
       "stripePaymentIntentId" TEXT         NOT NULL,
       "status"                TEXT         NOT NULL DEFAULT 'PENDING',
       "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "completedAt"           TIMESTAMP(3),
       CONSTRAINT "WalletTopUp_pkey"                      PRIMARY KEY ("id"),
       CONSTRAINT "WalletTopUp_stripePaymentIntentId_key" UNIQUE ("stripePaymentIntentId"),
       CONSTRAINT "WalletTopUp_userId_fkey"               FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
     )`,

    // Nonprofit daily digest scheduling
    `CREATE TABLE IF NOT EXISTS "NonprofitDigestLog" (
       "id"            TEXT         NOT NULL,
       "nonprofitId"   TEXT         NOT NULL,
       "sentAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "donationCount" INTEGER      NOT NULL,
       "totalAmount"   DECIMAL(10,2) NOT NULL,
       CONSTRAINT "NonprofitDigestLog_pkey" PRIMARY KEY ("id")
     )`,

    // Affiliate programs
    `CREATE TABLE IF NOT EXISTS "AffiliateProgram" (
       "id"          TEXT         NOT NULL,
       "name"        TEXT         NOT NULL,
       "platform"    TEXT         NOT NULL,
       "trackingId"  TEXT         NOT NULL,
       "baseCommRate" DECIMAL(5,4) NOT NULL DEFAULT 0.04,
       "logoUrl"     TEXT,
       "isActive"    BOOLEAN      NOT NULL DEFAULT true,
       "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT "AffiliateProgram_pkey" PRIMARY KEY ("id")
     )`,

    // Affiliate product listings
    `CREATE TABLE IF NOT EXISTS "AffiliateListing" (
       "id"          TEXT         NOT NULL,
       "programId"   TEXT         NOT NULL,
       "externalId"  TEXT,
       "title"       TEXT         NOT NULL,
       "description" TEXT,
       "imageUrl"    TEXT,
       "price"       DECIMAL(10,2) NOT NULL,
       "affiliateUrl" TEXT        NOT NULL,
       "category"    TEXT         NOT NULL,
       "upc"         TEXT,
       "commRate"    DECIMAL(5,4),
       "isActive"    BOOLEAN      NOT NULL DEFAULT true,
       "createdBy"   TEXT         NOT NULL,
       "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT "AffiliateListing_pkey"      PRIMARY KEY ("id"),
       CONSTRAINT "AffiliateListing_prog_fkey" FOREIGN KEY ("programId") REFERENCES "AffiliateProgram"("id")
     )`,

    // Affiliate click tracking
    `CREATE TABLE IF NOT EXISTS "AffiliateClick" (
       "id"        TEXT         NOT NULL,
       "listingId" TEXT         NOT NULL,
       "userId"    TEXT,
       "userRole"  TEXT,
       "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT "AffiliateClick_pkey"    PRIMARY KEY ("id"),
       CONSTRAINT "AffiliateClick_lst_fkey" FOREIGN KEY ("listingId") REFERENCES "AffiliateListing"("id")
     )`,

    // Affiliate conversion tracking
    `CREATE TABLE IF NOT EXISTS "AffiliateConversion" (
       "id"            TEXT         NOT NULL,
       "listingId"     TEXT         NOT NULL,
       "clickId"       TEXT         UNIQUE,
       "saleAmount"    DECIMAL(10,2) NOT NULL,
       "commRate"      DECIMAL(5,4) NOT NULL,
       "commTotal"     DECIMAL(10,2) NOT NULL,
       "dafShare"      DECIMAL(10,2) NOT NULL,
       "cdfiShare"     DECIMAL(10,2) NOT NULL DEFAULT 0,
       "platformShare" DECIMAL(10,2) NOT NULL,
       "status"        TEXT         NOT NULL DEFAULT 'PENDING',
       "externalRef"   TEXT,
       "confirmedAt"   TIMESTAMP(3),
       "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT "AffiliateConversion_pkey"       PRIMARY KEY ("id"),
       CONSTRAINT "AffiliateConversion_lst_fkey"   FOREIGN KEY ("listingId") REFERENCES "AffiliateListing"("id"),
       CONSTRAINT "AffiliateConversion_click_fkey" FOREIGN KEY ("clickId")   REFERENCES "AffiliateClick"("id")
     )`,
  ];

  for (const sql of tableSql) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err: any) {
      console.error(`[Startup] Table migration failed:\n  ${err.message}`);
    }
  }

  // ── Missing columns on existing tables ───────────────────────────────────────
  const columnSql = [
    `ALTER TABLE "Merchant"         ADD COLUMN IF NOT EXISTS "censusTractId"            TEXT`,
    `ALTER TABLE "Merchant"         ADD COLUMN IF NOT EXISTS "isQualifiedInvestmentArea" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "Merchant"         ADD COLUMN IF NOT EXISTS "censusTractCheckedAt"      TIMESTAMP(3)`,
    `ALTER TABLE "ProductService"      ADD COLUMN IF NOT EXISTS "upc"       TEXT`,
    `ALTER TABLE "AffiliateListing"    ADD COLUMN IF NOT EXISTS "upc"       TEXT`,
    `ALTER TABLE "AffiliateConversion" ADD COLUMN IF NOT EXISTS "cdfiShare" DECIMAL(10,2) NOT NULL DEFAULT 0`,
  ];

  for (const sql of columnSql) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err: any) {
      console.error(`[Startup] Column migration failed:\n  ${err.message}`);
    }
  }

  // ── Seed affiliate demo data if no programs exist ─────────────────────────────
  try {
    const programCount = await prisma.affiliateProgram.count();
    if (programCount === 0) {
      const admin = await prisma.user.findFirst({ where: { role: 'PLATFORM' }, select: { id: true } });
      const adminId = admin?.id ?? 'system';

      const program = await prisma.affiliateProgram.create({
        data: { name: 'Amazon Associates', platform: 'AMAZON', trackingId: 'goodcircles-20', baseCommRate: 0.04, isActive: true },
      });

      await prisma.affiliateListing.createMany({
        data: [
          { programId: program.id, externalId: 'B09G9FPHY6', title: 'Anker 65W USB-C Charging Station (4-Port)', description: 'Fast-charge up to 4 devices simultaneously. Compatible with all USB-C devices.', imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop', price: 35.99, affiliateUrl: 'https://www.amazon.com/dp/B09G9FPHY6?tag=goodcircles-20', category: 'Electronics', commRate: 0.04, isActive: true, createdBy: adminId },
          { programId: program.id, externalId: 'B08N5WRWNW', title: 'Kindle Paperwhite (16 GB) — Waterproof E-Reader', description: 'Adjustable warm light, 6.8" display, weeks of battery life.', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', price: 139.99, affiliateUrl: 'https://www.amazon.com/dp/B08N5WRWNW?tag=goodcircles-20', category: 'Electronics', commRate: 0.04, isActive: true, createdBy: adminId },
          { programId: program.id, externalId: 'B07VGRJDFY', title: 'Patagonia Better Sweater Fleece Jacket', description: 'Made from 100% recycled polyester fleece. Fair Trade Certified.', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', price: 99.00, affiliateUrl: 'https://www.amazon.com/dp/B07VGRJDFY?tag=goodcircles-20', category: 'Clothing', commRate: 0.04, isActive: true, createdBy: adminId },
          { programId: program.id, externalId: 'B09B8YWXDF', title: 'Yoga Mat — Non-Slip, Eco-Friendly, 6mm Thick', description: 'Natural tree rubber base with moisture-wicking top layer. Includes carry strap.', imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', price: 54.99, affiliateUrl: 'https://www.amazon.com/dp/B09B8YWXDF?tag=goodcircles-20', category: 'Sports & Fitness', commRate: 0.04, isActive: true, createdBy: adminId },
          { programId: program.id, externalId: 'B08BHXG144', title: 'Atomic Habits — James Clear (Hardcover)', description: 'The #1 New York Times bestseller on building good habits and breaking bad ones.', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop', price: 18.99, affiliateUrl: 'https://www.amazon.com/dp/B08BHXG144?tag=goodcircles-20', category: 'Books', commRate: 0.045, isActive: true, createdBy: adminId },
          { programId: program.id, externalId: 'B07D4P3D6K', title: 'Vitafusion Extra Strength Vitamin D3 Gummies (120ct)', description: '3000 IU per serving. Peach, blackberry, and strawberry flavors. No artificial flavors.', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', price: 14.49, affiliateUrl: 'https://www.amazon.com/dp/B07D4P3D6K?tag=goodcircles-20', category: 'Health & Wellness', commRate: 0.04, isActive: true, createdBy: adminId },
        ],
      });
      console.log('[Startup] Seeded Amazon Associates affiliate program with 6 demo listings.');
    }
  } catch (err: any) {
    console.error(`[Startup] Affiliate seed failed: ${err.message}`);
  }

  console.log('[Startup] Schema guard complete.');
}

console.log('[Server] Initializing server startup...');
startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});
