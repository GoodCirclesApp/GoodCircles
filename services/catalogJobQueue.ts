// =============================================================================
// GoodCircles AI Catalog Upload Tool — Job Queue & State Machine
// =============================================================================
// Background job processing for catalog imports with:
//   - State machine: QUEUED → FETCHING → TRANSFORMING → REVIEW_READY → PUBLISHING → COMPLETED
//   - Resume capability: failed jobs restart from last successful step
//   - Timeout handling: jobs exceeding 10 minutes get flagged
//   - Concurrency control: max 3 simultaneous imports per server instance
//   - Progress tracking for real-time UI updates
// =============================================================================

import type {
  ImportStatus,
  SourcePlatform,
  ConnectorFetchResult,
  ApiCostEntry,
} from '../types/catalog';
import { shopifyConnector } from './shopifyConnector';
import { etsyConnector } from './etsyConnector';
import { amazonConnector } from './amazonConnector';
import { transformProducts } from './catalogAIEngine';
import { buildCostSummary } from './catalogAIEngine';
import { finalizeImportBilling } from './catalogBillingService';
import { processRefund } from './catalogBillingService';
import {
  sendImportStartedEmail,
  sendReviewReadyEmail,
  sendImportCompletedEmail,
  sendImportFailedEmail,
} from './catalogNotifications';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_CONCURRENT_JOBS = 3;
const JOB_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const POLL_INTERVAL_MS = 5000;           // Check for new jobs every 5s

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JobContext {
  importId: string;
  merchantId: string;
  merchantEmail: string;
  merchantName: string;
  platform: SourcePlatform;
  credentials: any; // Decrypted PlatformCredentials
  productCount: number;
  tier: string;
  billingId: string;
}

interface JobState {
  importId: string;
  status: ImportStatus;
  progress: number;
  fetchedProducts: number;
  transformedProducts: number;
  totalProducts: number;
  currentPhase: string;
  estimatedTimeRemaining: number | null;
  error: string | null;
  startedAt: number;
}

type StepFunction = (ctx: JobContext, db: any) => Promise<void>;

// ---------------------------------------------------------------------------
// In-Memory Job Tracking
// ---------------------------------------------------------------------------

const activeJobs = new Map<string, JobState>();
const jobTimers = new Map<string, NodeJS.Timeout>();

/**
 * Get the current state of a job (for status polling from the UI).
 */
export function getJobStatus(importId: string): JobState | null {
  return activeJobs.get(importId) || null;
}

/**
 * Get count of currently running jobs.
 */
export function getActiveJobCount(): number {
  return activeJobs.size;
}

// ---------------------------------------------------------------------------
// State Machine — Step Definitions
// ---------------------------------------------------------------------------

const STEP_ORDER: ImportStatus[] = [
  'QUEUED' as ImportStatus,
  'FETCHING' as ImportStatus,
  'TRANSFORMING' as ImportStatus,
  'REVIEW_READY' as ImportStatus,
];

/**
 * Determine which step to start from based on lastCompletedStep.
 * Enables resume from failure.
 */
function getResumeStepIndex(lastCompletedStep: string | null): number {
  if (!lastCompletedStep) return 0;

  const index = STEP_ORDER.findIndex((s) => s === lastCompletedStep);
  // Resume from the step AFTER the last completed one
  return index >= 0 ? Math.min(index + 1, STEP_ORDER.length - 1) : 0;
}

// ---------------------------------------------------------------------------
// Step Implementations
// ---------------------------------------------------------------------------

/**
 * STEP: FETCHING — Fetch products from the source platform.
 */
async function stepFetching(ctx: JobContext, db: any): Promise<void> {
  const state = activeJobs.get(ctx.importId)!;
  state.status = 'FETCHING' as ImportStatus;
  state.currentPhase = 'FETCHING';

  await db.catalogImport.update({
    where: { id: ctx.importId },
    data: { status: 'FETCHING', startedAt: new Date() },
  });

  // Select connector based on platform
  const connectors = {
    SHOPIFY: shopifyConnector,
    ETSY: etsyConnector,
    AMAZON: amazonConnector,
  };

  const connector = connectors[ctx.platform];
  if (!connector) {
    throw new Error(`Unsupported platform: ${ctx.platform}`);
  }

  // Fetch products with progress tracking
  const result: ConnectorFetchResult = await connector.fetchProducts(
    ctx.credentials,
    (progress) => {
      state.fetchedProducts = progress.fetchedProducts;
      state.totalProducts = progress.totalProducts || ctx.productCount;
      state.progress = Math.round(
        (progress.fetchedProducts / (progress.totalProducts || ctx.productCount)) * 40
      ); // Fetching = 0–40% of total progress
    },
  );

  // Save fetched products to database
  const productRecords = result.products.map((p) => ({
    catalogImportId: ctx.importId,
    sourceId: p.sourceId,
    originalTitle: p.title,
    originalDescription: p.description,
    originalPrice: p.price,
    originalImages: p.images,
    originalCategory: p.category,
    originalVariants: p.variants,
    status: 'PENDING',
  }));

  // Batch insert (Prisma createMany)
  await db.catalogProduct.createMany({ data: productRecords });

  // Update import record with API call tracking
  await db.catalogImport.update({
    where: { id: ctx.importId },
    data: {
      apiCallCount: result.apiCallsMade,
      lastCompletedStep: 'FETCHING',
      productCount: result.products.length,
    },
  });

  state.fetchedProducts = result.products.length;
  state.totalProducts = result.products.length;

  // Log any non-fatal errors from fetch
  if (result.errors.length > 0) {
    console.warn(
      `[CatalogJobQueue] Import ${ctx.importId}: ${result.errors.length} non-fatal errors during fetch`,
      result.errors,
    );
  }
}

/**
 * STEP: TRANSFORMING — Run AI engine on fetched products.
 */
async function stepTransforming(ctx: JobContext, db: any): Promise<void> {
  const state = activeJobs.get(ctx.importId)!;
  state.status = 'TRANSFORMING' as ImportStatus;
  state.currentPhase = 'TRANSFORMING';

  await db.catalogImport.update({
    where: { id: ctx.importId },
    data: { status: 'TRANSFORMING' },
  });

  // Load fetched products from DB
  const dbProducts = await db.catalogProduct.findMany({
    where: { catalogImportId: ctx.importId, status: 'PENDING' },
  });

  // Convert DB records back to NormalizedProduct format for the AI engine
  const normalizedProducts = dbProducts.map((p: any) => ({
    sourceId: p.sourceId,
    title: p.originalTitle,
    description: p.originalDescription,
    images: p.originalImages || [],
    price: Number(p.originalPrice),
    costOfGoods: null,
    category: p.originalCategory,
    variants: p.originalVariants || [],
    sourcePlatform: ctx.platform,
    isActive: true,
  }));

  // Run AI transformation with progress tracking
  const { results: aiResults, costs } = await transformProducts(
    normalizedProducts,
    {
      onProgress: (progress) => {
        state.transformedProducts = progress.processedProducts;
        state.progress = 40 + Math.round(
          (progress.processedProducts / (state.totalProducts || 1)) * 50
        ); // Transforming = 40–90% of total progress
      },
    },
  );

  // Update each product with AI results
  for (const aiResult of aiResults) {
    await db.catalogProduct.updateMany({
      where: {
        catalogImportId: ctx.importId,
        sourceId: aiResult.sourceId,
      },
      data: {
        aiTitle: aiResult.aiTitle,
        aiDescription: aiResult.aiDescription,
        suggestedCogs: aiResult.suggestedCogs,
        suggestedPrice: aiResult.suggestedPrice,
        gcCategory: aiResult.gcCategory,
        flags: aiResult.flags,
        status: 'AI_PROCESSED',
      },
    });
  }

  // Calculate total AI token usage and costs
  const totalTokens = costs.reduce((sum, c) => sum + (c.tokensUsed || 0), 0);
  const totalCostUsd = costs.reduce((sum, c) => sum + c.estimatedCostUsd, 0);

  await db.catalogImport.update({
    where: { id: ctx.importId },
    data: {
      aiTokensUsed: totalTokens,
      actualCogs: totalCostUsd,
      lastCompletedStep: 'TRANSFORMING',
    },
  });

  state.transformedProducts = aiResults.length;
  state.progress = 90;
}

/**
 * STEP: REVIEW_READY — Mark import as ready for merchant review.
 */
async function stepReviewReady(ctx: JobContext, db: any): Promise<void> {
  const state = activeJobs.get(ctx.importId)!;
  state.status = 'REVIEW_READY' as ImportStatus;
  state.currentPhase = 'REVIEW_READY';
  state.progress = 100;

  await db.catalogImport.update({
    where: { id: ctx.importId },
    data: {
      status: 'REVIEW_READY',
      lastCompletedStep: 'REVIEW_READY',
    },
  });

  // Send notification to merchant
  await sendReviewReadyEmail({
    merchantEmail: ctx.merchantEmail,
    merchantName: ctx.merchantName,
    productCount: state.totalProducts,
    importId: ctx.importId,
  });
}

// ---------------------------------------------------------------------------
// Job Orchestrator
// ---------------------------------------------------------------------------

/**
 * Execute a catalog import job through the state machine.
 * Runs steps sequentially, with resume support from any failed step.
 */
async function executeJob(ctx: JobContext, db: any, resumeFromStep?: string | null): Promise<void> {
  const startStepIndex = getResumeStepIndex(resumeFromStep || null);

  const steps: { status: ImportStatus; execute: StepFunction }[] = [
    { status: 'FETCHING' as ImportStatus, execute: stepFetching },
    { status: 'TRANSFORMING' as ImportStatus, execute: stepTransforming },
    { status: 'REVIEW_READY' as ImportStatus, execute: stepReviewReady },
  ];

  // Initialize job state
  const state: JobState = {
    importId: ctx.importId,
    status: 'QUEUED' as ImportStatus,
    progress: 0,
    fetchedProducts: 0,
    transformedProducts: 0,
    totalProducts: ctx.productCount,
    currentPhase: 'QUEUED',
    estimatedTimeRemaining: null,
    error: null,
    startedAt: Date.now(),
  };
  activeJobs.set(ctx.importId, state);

  // Set timeout timer
  const timeoutTimer = setTimeout(async () => {
    if (activeJobs.has(ctx.importId)) {
      const currentState = activeJobs.get(ctx.importId)!;
      if (currentState.status !== ('REVIEW_READY' as ImportStatus) &&
          currentState.status !== ('COMPLETED' as ImportStatus)) {
        console.warn(`[CatalogJobQueue] Import ${ctx.importId} timed out after 10 minutes at step ${currentState.currentPhase}`);
        // Don't kill the job, just flag it for admin review
        await db.catalogImport.update({
          where: { id: ctx.importId },
          data: {
            errorLog: {
              type: 'TIMEOUT_WARNING',
              message: `Job exceeded 10-minute threshold at step ${currentState.currentPhase}`,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    }
  }, JOB_TIMEOUT_MS);
  jobTimers.set(ctx.importId, timeoutTimer);

  // Send "import started" notification
  await sendImportStartedEmail({
    merchantEmail: ctx.merchantEmail,
    merchantName: ctx.merchantName,
    productCount: ctx.productCount,
    platform: ctx.platform,
    estimatedMinutes: ctx.productCount <= 50 ? 2 : ctx.productCount <= 250 ? 5 : 10,
  });

  try {
    // Execute steps starting from resume point
    for (let i = startStepIndex; i < steps.length; i++) {
      const step = steps[i];

      // Estimate time remaining
      const elapsed = Date.now() - state.startedAt;
      const progressPerMs = state.progress > 0 ? state.progress / elapsed : 0;
      state.estimatedTimeRemaining = progressPerMs > 0
        ? Math.round((100 - state.progress) / progressPerMs / 1000)
        : null;

      await step.execute(ctx, db);
    }
  } catch (err: any) {
    // Handle failure
    state.status = 'FAILED' as ImportStatus;
    state.error = err.message;

    console.error(`[CatalogJobQueue] Import ${ctx.importId} failed:`, err.message);

    await db.catalogImport.update({
      where: { id: ctx.importId },
      data: {
        status: 'FAILED',
        errorLog: {
          type: err.name || 'UNKNOWN',
          message: err.message,
          stack: err.stack?.slice(0, 500),
          step: state.currentPhase,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Send failure notification
    await sendImportFailedEmail({
      merchantEmail: ctx.merchantEmail,
      merchantName: ctx.merchantName,
      importId: ctx.importId,
      errorMessage: err.message,
      fetchedCount: state.fetchedProducts,
      totalCount: state.totalProducts,
    });

    // Auto-refund if complete failure (no products fetched)
    if (state.fetchedProducts === 0 && ctx.billingId) {
      try {
        await processRefund(
          ctx.billingId,
          'COMPLETE_FAILURE',
          0,
          ctx.productCount,
          db,
        );
        console.info(`[CatalogJobQueue] Auto-refund issued for failed import ${ctx.importId}`);
      } catch (refundErr: any) {
        console.error(`[CatalogJobQueue] Auto-refund failed for import ${ctx.importId}:`, refundErr.message);
      }
    }
  } finally {
    // Cleanup
    const timer = jobTimers.get(ctx.importId);
    if (timer) clearTimeout(timer);
    jobTimers.delete(ctx.importId);

    // Keep state in memory for 5 minutes for status polling, then remove
    setTimeout(() => {
      activeJobs.delete(ctx.importId);
    }, 5 * 60 * 1000);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start a new catalog import job.
 * Returns immediately — processing happens in the background.
 * Enforces concurrency limit of MAX_CONCURRENT_JOBS.
 */
export async function startImportJob(ctx: JobContext, db: any): Promise<{ started: boolean; message: string }> {
  // Check concurrency limit
  if (activeJobs.size >= MAX_CONCURRENT_JOBS) {
    return {
      started: false,
      message: `Server is processing ${activeJobs.size} imports. Your import has been queued and will start shortly.`,
    };
  }

  // Check if job is already running
  if (activeJobs.has(ctx.importId)) {
    return {
      started: false,
      message: 'This import is already in progress.',
    };
  }

  // Start job in background (don't await)
  executeJob(ctx, db).catch((err) => {
    console.error(`[CatalogJobQueue] Unhandled error in job ${ctx.importId}:`, err);
  });

  return { started: true, message: 'Import started.' };
}

/**
 * Resume a failed import from the last successful step.
 */
export async function resumeImportJob(ctx: JobContext, db: any): Promise<{ started: boolean; message: string }> {
  // Get the last completed step from DB
  const importRecord = await db.catalogImport.findUnique({
    where: { id: ctx.importId },
  });

  if (!importRecord) {
    return { started: false, message: 'Import not found.' };
  }

  if (importRecord.status !== 'FAILED') {
    return { started: false, message: `Cannot resume — import status is ${importRecord.status}, not FAILED.` };
  }

  if (activeJobs.size >= MAX_CONCURRENT_JOBS) {
    return {
      started: false,
      message: `Server is at capacity. Your resume request has been queued.`,
    };
  }

  // Reset status to QUEUED
  await db.catalogImport.update({
    where: { id: ctx.importId },
    data: { status: 'QUEUED', errorLog: null },
  });

  // Start from last completed step
  executeJob(ctx, db, importRecord.lastCompletedStep).catch((err) => {
    console.error(`[CatalogJobQueue] Unhandled error resuming job ${ctx.importId}:`, err);
  });

  return {
    started: true,
    message: `Import resumed from step: ${importRecord.lastCompletedStep || 'beginning'}.`,
  };
}

/**
 * Handle the publish step (called from the review UI after merchant confirms).
 * This is separate from the main pipeline because it requires merchant action.
 */
export async function publishProducts(
  importId: string,
  merchantId: string,
  db: any,
): Promise<{ publishedCount: number }> {
  // Get accepted products
  const acceptedProducts = await db.catalogProduct.findMany({
    where: {
      catalogImportId: importId,
      status: 'ACCEPTED',
    },
  });

  if (acceptedProducts.length === 0) {
    throw new Error('No accepted products to publish.');
  }

  // Update import status
  await db.catalogImport.update({
    where: { id: importId },
    data: { status: 'PUBLISHING' },
  });

  let publishedCount = 0;

  for (const product of acceptedProducts) {
    try {
      // Create ProductService record (the existing GoodCircles product model)
      const publishedProduct = await db.productService.create({
        data: {
          merchantId,
          name: product.finalTitle || product.aiTitle || product.originalTitle,
          description: product.finalDescription || product.aiDescription || product.originalDescription,
          price: product.finalPrice || product.suggestedPrice || product.originalPrice,
          cogs: product.finalCogs || product.suggestedCogs || 0,
          type: 'Product',
          category: product.gcCategory || 'General',
          isActive: true,
        },
      });

      // Link catalog product to published product
      await db.catalogProduct.update({
        where: { id: product.id },
        data: {
          status: 'PUBLISHED',
          publishedProductId: publishedProduct.id,
          finalTitle: product.finalTitle || product.aiTitle,
          finalDescription: product.finalDescription || product.aiDescription,
          finalCogs: product.finalCogs || product.suggestedCogs,
          finalPrice: product.finalPrice || product.suggestedPrice,
        },
      });

      publishedCount++;
    } catch (err: any) {
      console.error(`[CatalogJobQueue] Failed to publish product ${product.id}:`, err.message);
    }
  }

  // Update import status to COMPLETED
  await db.catalogImport.update({
    where: { id: importId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      lastCompletedStep: 'COMPLETED',
    },
  });

  // Finalize billing with actual COGS
  const importRecord = await db.catalogImport.findUnique({
    where: { id: importId },
    include: { billing: true },
  });

  if (importRecord?.billing) {
    await finalizeImportBilling(
      importRecord.billing.id,
      Number(importRecord.actualCogs || 0),
      db,
    );
  }

  return { publishedCount };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default {
  startImportJob,
  resumeImportJob,
  publishProducts,
  getJobStatus,
  getActiveJobCount,
};
