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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
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

console.log('[Server] Initializing server startup...');
startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});
