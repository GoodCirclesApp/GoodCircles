// =============================================================================
// GoodCircles AI Catalog Upload Tool — Billing & Payment Service
// =============================================================================
// Handles:
//   1. Tier determination and enforcement based on product count
//   2. Stripe Checkout session creation for one-time catalog upload fee
//   3. Webhook processing for payment confirmation → triggers import start
//   4. Billing status tracking (PENDING → PAID → PROCESSING → COMPLETED)
//   5. Refund logic: auto-refund on complete failure, prorated on partial
//   6. Idempotency to prevent duplicate charges
//   7. Revenue tracking for financial model validation
//
// Integrates with the existing GoodCircles Stripe setup (stripe 20.4.1).
// =============================================================================

import Stripe from 'stripe';
import type {
  CatalogTier,
  TierConfig,
  BillingStatus,
  SourcePlatform,
} from '../types/catalog';
import { determineTier, TIER_CONFIG } from '../types/catalog';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const WEBHOOK_SECRET = process.env.STRIPE_CATALOG_WEBHOOK_SECRET!;
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://goodcircles-production.up.railway.app';

// Grace period: hold payment for 24 hours if merchant disconnects mid-import
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CatalogBillingRecord {
  id: string;
  catalogImportId: string;
  merchantId: string;
  tier: CatalogTier;
  productCount: number;
  amountCharged: number;         // In cents (Stripe uses smallest currency unit)
  amountChargedDisplay: number;  // In dollars for display
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  idempotencyKey: string;
  status: BillingStatus;
  actualCogs: number | null;
  grossMargin: number | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: Date;
  paidAt: Date | null;
  completedAt: Date | null;
}

export interface CheckoutRequest {
  merchantId: string;
  tier: CatalogTier;
  productCount: number;
  platform: SourcePlatform;
  catalogImportId: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
  billingId: string;
  jobId: string;
}

export interface RevenueEntry {
  billingId: string;
  merchantId: string;
  tier: CatalogTier;
  productCount: number;
  amountPaid: number;
  cogsActual: number | null;
  grossMargin: number | null;
  platform: SourcePlatform;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Idempotency Key Generation
// ---------------------------------------------------------------------------

/**
 * Generate a unique idempotency key for a merchant + import session.
 * Prevents duplicate charges if the merchant refreshes or retries checkout.
 */
function generateIdempotencyKey(merchantId: string, catalogImportId: string): string {
  return `gc_catalog_${merchantId}_${catalogImportId}`;
}

// ---------------------------------------------------------------------------
// Tier Validation
// ---------------------------------------------------------------------------

/**
 * Validate and enforce tier pricing based on actual product count.
 * A merchant with 51 products MUST be charged $150 (Growth), not $75 (Starter).
 * No grandfathering — tier is always based on current catalog size.
 */
export function validateTierForProductCount(
  requestedTier: CatalogTier,
  productCount: number,
): { valid: boolean; correctTier: TierConfig; message: string | null } {
  const correctTier = determineTier(productCount);

  if (requestedTier !== correctTier.tier) {
    return {
      valid: false,
      correctTier,
      message: `Product count ${productCount} requires the ${correctTier.tier} tier ($${correctTier.fee}), not ${requestedTier}.`,
    };
  }

  return { valid: true, correctTier, message: null };
}

// ---------------------------------------------------------------------------
// Checkout Session Creation
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout session for the catalog upload fee.
 * Uses idempotency key to prevent duplicate charges.
 *
 * The checkout session includes metadata for webhook processing:
 *   - catalogImportId: links payment to import job
 *   - merchantId: links payment to merchant
 *   - tier: validates correct pricing
 *   - productCount: for revenue tracking
 */
export async function createCheckoutSession(
  request: CheckoutRequest,
  // Prisma client injected for database operations
  db: any,
): Promise<CheckoutResponse> {
  // Validate tier matches product count
  const validation = validateTierForProductCount(request.tier, request.productCount);
  if (!validation.valid) {
    throw new Error(validation.message!);
  }

  const tierConfig = validation.correctTier;
  const idempotencyKey = generateIdempotencyKey(request.merchantId, request.catalogImportId);

  // Check for existing billing record (idempotency)
  const existing = await db.catalogBilling.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    if (existing.status === 'PAID' || existing.status === 'PROCESSING' || existing.status === 'COMPLETED') {
      throw new Error('This import has already been paid for.');
    }

    // If PENDING, return the existing checkout session
    if (existing.stripeCheckoutSessionId) {
      const session = await stripe.checkout.sessions.retrieve(existing.stripeCheckoutSessionId);
      if (session.status === 'open') {
        return {
          checkoutUrl: session.url!,
          sessionId: session.id,
          billingId: existing.id,
          jobId: request.catalogImportId,
        };
      }
      // Session expired — create a new one below
    }
  }

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tierConfig.fee * 100, // Stripe uses cents
            product_data: {
              name: `GoodCircles Catalog Import — ${tierConfig.tier}`,
              description: `Import ${request.productCount} products from ${request.platform} with AI-optimized descriptions and pricing`,
              metadata: {
                tier: tierConfig.tier,
                productCount: String(request.productCount),
              },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        catalogImportId: request.catalogImportId,
        merchantId: request.merchantId,
        tier: tierConfig.tier,
        productCount: String(request.productCount),
        platform: request.platform,
        idempotencyKey,
      },
      success_url: `${APP_BASE_URL}/merchant/catalog-upload?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${APP_BASE_URL}/merchant/catalog-upload?status=cancelled`,
      expires_at: 1800, // 30 minutes
    },
    {
      idempotencyKey: `checkout_${idempotencyKey}`,
    },
  );

  // Create or update billing record
  const billingRecord = await db.catalogBilling.upsert({
    where: { idempotencyKey },
    create: {
      catalogImportId: request.catalogImportId,
      merchantId: request.merchantId,
      tier: tierConfig.tier,
      productCount: request.productCount,
      amountCharged: tierConfig.fee * 100,
      stripeCheckoutSessionId: session.id,
      idempotencyKey,
      status: 'PENDING',
    },
    update: {
      stripeCheckoutSessionId: session.id,
      status: 'PENDING',
    },
  });

  return {
    checkoutUrl: session.url!,
    sessionId: session.id,
    billingId: billingRecord.id,
    jobId: request.catalogImportId,
  };
}

// ---------------------------------------------------------------------------
// Webhook Handling
// ---------------------------------------------------------------------------

/**
 * Process Stripe webhook events for catalog upload payments.
 * Called from server/src/routes/catalogRoutes.ts webhook endpoint.
 *
 * Events handled:
 *   - checkout.session.completed → payment confirmed, trigger import start
 *   - checkout.session.expired → clean up pending billing record
 */
export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string,
  db: any,
): Promise<{ action: 'START_IMPORT' | 'SESSION_EXPIRED' | 'IGNORED'; catalogImportId?: string }> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const idempotencyKey = metadata.idempotencyKey;

    if (!idempotencyKey) {
      return { action: 'IGNORED' };
    }

    // Update billing record to PAID
    const billing = await db.catalogBilling.update({
      where: { idempotencyKey },
      data: {
        status: 'PAID',
        stripePaymentIntentId: session.payment_intent as string,
        paidAt: new Date(),
      },
    });

    // Update the import job status to trigger processing
    await db.catalogImport.update({
      where: { id: metadata.catalogImportId },
      data: { status: 'QUEUED' },
    });

    // Log revenue entry
    await logRevenueEntry(db, {
      billingId: billing.id,
      merchantId: metadata.merchantId,
      tier: metadata.tier as CatalogTier,
      productCount: parseInt(metadata.productCount, 10),
      amountPaid: billing.amountCharged / 100, // Convert cents to dollars
      cogsActual: null, // Updated after import completes
      grossMargin: null,
      platform: metadata.platform as SourcePlatform,
      timestamp: new Date(),
    });

    return { action: 'START_IMPORT', catalogImportId: metadata.catalogImportId };
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const idempotencyKey = session.metadata?.idempotencyKey;

    if (idempotencyKey) {
      await db.catalogBilling.update({
        where: { idempotencyKey },
        data: { status: 'PENDING' }, // Reset so they can try again
      });
    }

    return { action: 'SESSION_EXPIRED' };
  }

  return { action: 'IGNORED' };
}

// ---------------------------------------------------------------------------
// Refund Logic
// ---------------------------------------------------------------------------

/**
 * Process a refund for a failed catalog import.
 *
 * Refund rules:
 *   - Complete failure (0 products imported): full refund
 *   - Partial failure: prorated credit based on products actually imported
 *   - GoodCircles error (not merchant error): free retry allowed
 */
export async function processRefund(
  billingId: string,
  reason: 'COMPLETE_FAILURE' | 'PARTIAL_FAILURE' | 'PLATFORM_ERROR',
  importedProductCount: number,
  totalProductCount: number,
  db: any,
): Promise<{ refundAmount: number; message: string }> {
  const billing = await db.catalogBilling.findUnique({ where: { id: billingId } });

  if (!billing) {
    throw new Error(`Billing record not found: ${billingId}`);
  }

  if (billing.status === 'REFUNDED' || billing.status === 'REFUND_REQUESTED') {
    throw new Error('Refund already processed or pending for this billing record.');
  }

  if (!billing.stripePaymentIntentId) {
    throw new Error('No payment intent found — cannot issue refund.');
  }

  let refundAmountCents: number;
  let message: string;

  switch (reason) {
    case 'COMPLETE_FAILURE':
      // Full refund
      refundAmountCents = billing.amountCharged;
      message = `Full refund of $${(refundAmountCents / 100).toFixed(2)} issued. Your import failed before any products were processed.`;
      break;

    case 'PARTIAL_FAILURE':
      // Prorated: charge only for products actually imported
      const importedRatio = importedProductCount / totalProductCount;
      const chargedForImported = Math.round(billing.amountCharged * importedRatio);
      refundAmountCents = billing.amountCharged - chargedForImported;
      message = `Partial refund of $${(refundAmountCents / 100).toFixed(2)} issued. ${importedProductCount} of ${totalProductCount} products were imported. You were charged $${(chargedForImported / 100).toFixed(2)} for the imported products.`;
      break;

    case 'PLATFORM_ERROR':
      // Full refund + allow free retry
      refundAmountCents = billing.amountCharged;
      message = `Full refund of $${(refundAmountCents / 100).toFixed(2)} issued due to a platform error. You can retry your import for free.`;
      break;

    default:
      throw new Error(`Unknown refund reason: ${reason}`);
  }

  // Issue Stripe refund
  await stripe.refunds.create({
    payment_intent: billing.stripePaymentIntentId,
    amount: refundAmountCents,
    reason: 'requested_by_customer',
    metadata: {
      billingId,
      refundReason: reason,
      importedProducts: String(importedProductCount),
      totalProducts: String(totalProductCount),
    },
  });

  // Update billing record
  await db.catalogBilling.update({
    where: { id: billingId },
    data: {
      status: 'REFUNDED',
      refundAmount: refundAmountCents,
      refundReason: reason,
    },
  });

  return {
    refundAmount: refundAmountCents / 100,
    message,
  };
}

// ---------------------------------------------------------------------------
// Post-Import Billing Update
// ---------------------------------------------------------------------------

/**
 * Called after an import completes to record actual COGS and margin.
 * This data feeds into the financial model for pricing adjustments.
 */
export async function finalizeImportBilling(
  billingId: string,
  actualCogsUsd: number,
  db: any,
): Promise<void> {
  const billing = await db.catalogBilling.findUnique({ where: { id: billingId } });
  if (!billing) return;

  const amountPaidUsd = billing.amountCharged / 100;
  const grossMargin = amountPaidUsd > 0
    ? ((amountPaidUsd - actualCogsUsd) / amountPaidUsd) * 100
    : 0;

  await db.catalogBilling.update({
    where: { id: billingId },
    data: {
      status: 'COMPLETED',
      actualCogs: Math.round(actualCogsUsd * 100), // Store in cents
      grossMargin: Math.round(grossMargin * 100) / 100,
      completedAt: new Date(),
    },
  });

  // Update the revenue entry with actual COGS
  await db.catalogRevenue.updateMany({
    where: { billingId },
    data: {
      cogsActual: actualCogsUsd,
      grossMargin: Math.round(grossMargin * 100) / 100,
    },
  });

  // Alert if margin is below target
  const tierConfig = TIER_CONFIG.find((t) => t.tier === billing.tier);
  if (tierConfig && grossMargin < tierConfig.targetMargin * 100) {
    console.warn(
      `[CatalogBilling] MARGIN ALERT: ${billing.tier} import ${billingId} — ` +
      `actual margin ${grossMargin.toFixed(1)}% below target ${(tierConfig.targetMargin * 100).toFixed(1)}%. ` +
      `COGS: $${actualCogsUsd.toFixed(2)}, Fee: $${amountPaidUsd.toFixed(2)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Revenue Tracking
// ---------------------------------------------------------------------------

/**
 * Log a revenue entry for the financial model dashboard.
 * Tracked: merchant_id, tier, product_count, amount_paid, cogs_actual, gross_margin
 */
async function logRevenueEntry(db: any, entry: RevenueEntry): Promise<void> {
  await db.catalogRevenue.create({
    data: {
      billingId: entry.billingId,
      merchantId: entry.merchantId,
      tier: entry.tier,
      productCount: entry.productCount,
      amountPaid: entry.amountPaid,
      cogsActual: entry.cogsActual,
      grossMargin: entry.grossMargin,
      platform: entry.platform,
      timestamp: entry.timestamp,
    },
  });
}

/**
 * Get billing history for a merchant.
 */
export async function getMerchantBillingHistory(
  merchantId: string,
  db: any,
): Promise<CatalogBillingRecord[]> {
  return db.catalogBilling.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' },
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  generateIdempotencyKey,
  logRevenueEntry,
};

export default {
  createCheckoutSession,
  handleStripeWebhook,
  processRefund,
  finalizeImportBilling,
  validateTierForProductCount,
  getMerchantBillingHistory,
};
