import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import {
  isMockModeEnabled,
  getMockProductsByPlatform,
  getMockImportRecordsByMerchant,
  getMockBillingData,
  createMockImportRecord,
} from '../mocks/catalogMockData';

const router = Router();
const prisma = new PrismaClient();

// ── Auth guard — resolves JWT → Merchant record ───────────────────────────────
const requireMerchant = [
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const merchant = await prisma.merchant.findUnique({ where: { userId: req.user!.id } });
      if (!merchant) return res.status(403).json({ error: 'Merchant profile not found' });
      (req as any).merchant = merchant;
      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
];

// ── GoodCircles Revenue Split pricing breakdown ───────────────────────────────
// Flow: MSRP × 0.90 = consumer price; net profit = consumer price − COGS
// Nonprofit = 10% of net profit; Platform = 1% of net profit; Merchant = COGS + 89%
function buildGCPricingBreakdown(msrp: number, cogs: number) {
  const gcDiscount = msrp * 0.10;
  const consumerPrice = msrp - gcDiscount;
  const netProfit = consumerPrice - cogs;
  const nonprofitContribution = netProfit * 0.10;
  const platformFee = netProfit * 0.01;
  const merchantProfit = netProfit * 0.89;
  const merchantMarginPercent = consumerPrice > 0
    ? (merchantProfit / consumerPrice) * 100
    : 0;

  return {
    merchantCogs: r2(cogs),
    suggestedRetailPrice: r2(consumerPrice),
    gcDiscount: r2(gcDiscount),
    nonprofitContribution: r2(nonprofitContribution),
    platformFee: r2(platformFee),
    merchantNetProfit: r2(merchantProfit),
    merchantMarginPercent: r1(merchantMarginPercent),
  };
}

function r2(n: number) { return Math.round(n * 100) / 100; }
function r1(n: number) { return Math.round(n * 10) / 10; }

const MEMBER_DISCOUNT = 0.10;

// ── Mock review products (used in mock mode) ──────────────────────────────────
const MOCK_REVIEW_PRODUCTS = [
  {
    id: 'review_001', sourceId: 'gid://shopify/Product/1',
    originalTitle: 'Sustainable Bamboo Cutting Board',
    originalDescription: 'Eco-friendly bamboo cutting board made from sustainable sources.',
    originalPrice: 24.99, originalImages: ['https://placehold.co/400x400/e2e8f0/475569?text=Bamboo+Board'],
    originalCategory: 'Kitchen Tools',
    aiTitle: 'Sustainable Bamboo Cutting Board — Eco-Friendly Kitchen Essential',
    aiDescription: 'Premium eco-friendly cutting board crafted from sustainably harvested bamboo. Durable, naturally antibacterial, and perfect for everyday meal prep.',
    suggestedCogs: 8.50, suggestedPrice: 26.99, gcCategory: 'Home & Garden', flags: [],
    pricingBreakdown: buildGCPricingBreakdown(26.99, 8.50),
    status: 'AI_PROCESSED' as const, cogsVerified: false,
  },
  {
    id: 'review_002', sourceId: 'gid://shopify/Product/2',
    originalTitle: 'Organic Cotton T-Shirt',
    originalDescription: '100% organic cotton comfort fit t-shirt.',
    originalPrice: 34.99, originalImages: ['https://placehold.co/400x400/e2e8f0/475569?text=Cotton+Tee'],
    originalCategory: 'Clothing',
    aiTitle: 'Organic Cotton Premium T-Shirt — Fair Trade Certified',
    aiDescription: 'Ultra-soft 100% organic cotton t-shirt with a relaxed comfort fit. Ethically produced and fair-trade certified.',
    suggestedCogs: 12.00, suggestedPrice: 36.99, gcCategory: 'Fashion & Apparel', flags: [],
    pricingBreakdown: buildGCPricingBreakdown(36.99, 12.00),
    status: 'AI_PROCESSED' as const, cogsVerified: false,
  },
  {
    id: 'review_003', sourceId: 'gid://shopify/Product/3',
    originalTitle: 'Reusable Beeswax Food Wraps (3-Pack)',
    originalDescription: 'Set of 3 beeswax wraps in small, medium, and large sizes.',
    originalPrice: 18.99, originalImages: ['https://placehold.co/400x400/e2e8f0/475569?text=Beeswax+Wraps'],
    originalCategory: 'Kitchen',
    aiTitle: 'Reusable Beeswax Food Wraps — 3-Pack Eco Bundle',
    aiDescription: 'Eliminate single-use plastic with these natural beeswax food wraps. Set of 3 sizes perfect for covering bowls, wrapping sandwiches, and keeping produce fresh.',
    suggestedCogs: 6.25, suggestedPrice: 19.99, gcCategory: 'Home & Garden', flags: [],
    pricingBreakdown: buildGCPricingBreakdown(19.99, 6.25),
    status: 'AI_PROCESSED' as const, cogsVerified: false,
  },
  {
    id: 'review_004', sourceId: 'gid://shopify/Product/4',
    originalTitle: 'Stainless Steel Water Bottle',
    originalDescription: 'Double-wall insulated water bottle, 32oz.',
    originalPrice: 29.99, originalImages: ['https://placehold.co/400x400/e2e8f0/475569?text=Water+Bottle'],
    originalCategory: 'Drinkware',
    aiTitle: 'Insulated Stainless Steel Water Bottle — 32oz',
    aiDescription: 'Keep drinks cold for 24 hours or hot for 12 with this double-wall vacuum insulated stainless steel bottle. BPA-free, leak-proof, and built to last.',
    suggestedCogs: 9.75, suggestedPrice: 31.99, gcCategory: 'Health & Wellness',
    flags: [{ type: 'CATEGORY_MISMATCH', severity: 'warning' as const, message: 'Original category "Drinkware" mapped to "Health & Wellness" — verify this is correct.' }],
    pricingBreakdown: buildGCPricingBreakdown(31.99, 9.75),
    status: 'AI_PROCESSED' as const, cogsVerified: false,
  },
];

// In-memory tracker for mock import progression
const mockImportTracker: Record<string, { createdAt: number; totalProducts: number }> = {};

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/catalog/connect/:platform
 * Mock mode: returns product list. Live mode: returns OAuth redirect URL.
 */
router.get('/connect/:platform', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const platform = (req.params.platform as string).toUpperCase();
    if (isMockModeEnabled()) {
      const mockProducts = getMockProductsByPlatform(platform as any);
      return res.json({ mockMode: true, platform, productCount: mockProducts.length, products: mockProducts });
    }
    res.json({ authUrl: `https://oauth.${platform.toLowerCase()}.com/authorize` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to connect' });
  }
});

/**
 * POST /api/catalog/scan
 */
router.post('/scan', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const { platform } = req.body;
    if (isMockModeEnabled()) {
      const mockProducts = getMockProductsByPlatform(platform as any);
      return res.json({ mockMode: true, productCount: mockProducts.length, tierRecommendation: 'STARTER' });
    }
    res.json({ productCount: 0 });
  } catch (err: any) {
    res.status(500).json({ error: 'Scan failed' });
  }
});

/**
 * POST /api/catalog/checkout
 * Creates CatalogImport + CatalogBilling records and returns the import ID.
 */
router.post('/checkout', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const { tier, platform, productCount } = req.body;
    const merchant = (req as any).merchant;

    const tierFees: Record<string, number> = {
      STARTER: 7500, GROWTH: 15000, PROFESSIONAL: 30000, ENTERPRISE: 50000,
    };
    const fee = tierFees[tier] ?? 7500;

    if (isMockModeEnabled()) {
      const mockImport = createMockImportRecord(merchant.id, platform, productCount || 0, tier);
      return res.json({ mockMode: true, importId: mockImport.id, jobId: mockImport.id, fee: fee / 100 });
    }

    // Live mode: persist to DB
    const catalogImport = await prisma.catalogImport.create({
      data: {
        merchantId: merchant.id,
        sourcePlatform: platform,
        tier,
        productCount: productCount || 0,
        status: 'QUEUED',
      },
    });

    await prisma.catalogBilling.create({
      data: {
        importId: catalogImport.id,
        merchantId: merchant.id,
        tier,
        productCount: productCount || 0,
        amountCharged: fee,
        idempotencyKey: `gc_catalog_${merchant.id}_${catalogImport.id}`,
        status: 'PENDING',
      },
    });

    res.json({ importId: catalogImport.id, jobId: catalogImport.id, fee: fee / 100 });
  } catch (err: any) {
    console.error('[Catalog] Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

/**
 * GET /api/catalog/import/:importId/status
 */
router.get('/import/:importId/status', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const importId = String(req.params.importId);

    if (isMockModeEnabled()) {
      if (!mockImportTracker[importId]) {
        mockImportTracker[importId] = { createdAt: Date.now(), totalProducts: 50 };
      }
      const tracker = mockImportTracker[importId];
      const elapsed = Date.now() - tracker.createdAt;
      const total = tracker.totalProducts;

      let status: string, progress: number, fetchedProducts: number,
        transformedProducts: number, estimatedTimeRemaining: number | null;

      if (elapsed < 3000) {
        status = 'QUEUED'; progress = 5; fetchedProducts = 0; transformedProducts = 0; estimatedTimeRemaining = 15;
      } else if (elapsed < 8000) {
        const p = (elapsed - 3000) / 5000;
        status = 'FETCHING'; progress = 10 + Math.round(p * 40);
        fetchedProducts = Math.round(p * total); transformedProducts = 0;
        estimatedTimeRemaining = Math.max(1, Math.round((14000 - elapsed) / 1000));
      } else if (elapsed < 14000) {
        const p = (elapsed - 8000) / 6000;
        status = 'TRANSFORMING'; progress = 50 + Math.round(p * 40);
        fetchedProducts = total; transformedProducts = Math.round(p * total);
        estimatedTimeRemaining = Math.max(1, Math.round((14000 - elapsed) / 1000));
      } else {
        status = 'REVIEW_READY'; progress = 100; fetchedProducts = total;
        transformedProducts = total; estimatedTimeRemaining = null;
      }

      return res.json({ status, progress, fetchedProducts, transformedProducts, totalProducts: total, currentPhase: status, estimatedTimeRemaining, error: null });
    }

    const record = await prisma.catalogImport.findUnique({ where: { id: importId } });
    if (!record) return res.status(404).json({ error: 'Import not found' });

    const productCount = await prisma.catalogProduct.count({ where: { importId } });
    const transformedCount = await prisma.catalogProduct.count({ where: { importId, status: { not: 'PENDING' } } });

    const statusMap: Record<string, number> = { QUEUED: 5, FETCHING: 30, TRANSFORMING: 70, REVIEW_READY: 100, PUBLISHING: 95, COMPLETED: 100, FAILED: 0 };
    const progress = statusMap[record.status] ?? 0;

    res.json({ status: record.status, progress, fetchedProducts: productCount, transformedProducts: transformedCount, totalProducts: record.productCount, currentPhase: record.status, estimatedTimeRemaining: null, error: record.status === 'FAILED' ? 'Import failed' : null });
  } catch (err: any) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

/**
 * GET /api/catalog/import/:importId/products
 */
router.get('/import/:importId/products', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const importId = String(req.params.importId);

    if (isMockModeEnabled()) {
      return res.json({ products: MOCK_REVIEW_PRODUCTS });
    }

    const dbProducts = await prisma.catalogProduct.findMany({
      where: { importId },
      orderBy: { createdAt: 'asc' },
    });

    const products = dbProducts.map((p) => ({
      id: p.id,
      sourceId: p.sourceId,
      originalTitle: p.originalTitle,
      originalDescription: p.originalDescription,
      originalPrice: p.originalPrice,
      originalImages: [],
      originalCategory: p.originalCategory,
      aiTitle: p.merchantTitle || p.originalTitle,
      aiDescription: p.merchantDescription || p.originalDescription || '',
      suggestedCogs: p.merchantCogs ?? (p.originalPrice * 0.5),
      suggestedPrice: p.merchantPrice ?? p.originalPrice,
      gcCategory: p.merchantCategory || p.aiCategory || 'General',
      flags: [],
      pricingBreakdown: buildGCPricingBreakdown(
        p.merchantPrice ?? p.originalPrice,
        p.merchantCogs ?? p.originalPrice * 0.5,
      ),
      status: p.status,
      cogsVerified: p.cogsVerified,
    }));

    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: 'Products fetch failed' });
  }
});

/**
 * PUT /api/catalog/import/:importId/products/:productId
 * Update status, merchant edits, and COGS verification.
 */
router.put('/import/:importId/products/:productId', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const importId = String(req.params.importId);
    const productId = String(req.params.productId);
    const updates = req.body;

    if (isMockModeEnabled()) {
      return res.json({ success: true, productId, ...updates });
    }

    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.editedTitle !== undefined) updateData.merchantTitle = updates.editedTitle;
    if (updates.editedDescription !== undefined) updateData.merchantDescription = updates.editedDescription;
    if (updates.editedPrice !== undefined) updateData.merchantPrice = updates.editedPrice;
    if (updates.editedCategory !== undefined) updateData.merchantCategory = updates.editedCategory;
    if (updates.editedCogs !== undefined) updateData.merchantCogs = updates.editedCogs;
    if (updates.cogsVerified !== undefined) updateData.cogsVerified = updates.cogsVerified;

    await prisma.catalogProduct.update({ where: { id: productId }, data: updateData });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Product update failed' });
  }
});

/**
 * POST /api/catalog/import/:importId/bulk-action
 */
router.post('/import/:importId/bulk-action', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const importId = String(req.params.importId);
    const { action, productIds } = req.body;

    if (isMockModeEnabled()) {
      return res.json({ success: true, action, updated: productIds?.length || 0 });
    }

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    await prisma.catalogProduct.updateMany({
      where: { importId, id: { in: productIds || [] } },
      data: { status: newStatus },
    });

    res.json({ success: true, action, updated: productIds?.length || 0 });
  } catch (err: any) {
    res.status(500).json({ error: 'Bulk action failed' });
  }
});

/**
 * POST /api/catalog/import/:importId/publish
 * Enforces COGS verification + margin validation before writing to ProductService.
 */
router.post('/import/:importId/publish', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const importId = String(req.params.importId);
    const merchant = (req as any).merchant;

    if (isMockModeEnabled()) {
      return res.json({
        success: true, publishedCount: MOCK_REVIEW_PRODUCTS.length, importId,
        message: `Successfully published ${MOCK_REVIEW_PRODUCTS.length} products to your storefront.`,
      });
    }

    // Fetch all accepted products
    const accepted = await prisma.catalogProduct.findMany({
      where: { importId, status: 'ACCEPTED' },
    });

    if (accepted.length === 0) {
      return res.status(400).json({ error: 'No accepted products to publish' });
    }

    // Gate 1: all accepted products must have COGS verified
    const unverified = accepted.filter((p) => !p.cogsVerified);
    if (unverified.length > 0) {
      return res.status(400).json({
        error: `${unverified.length} product(s) have unverified COGS. Please verify all costs before publishing.`,
        unverifiedIds: unverified.map((p) => p.id),
      });
    }

    // Gate 2: margin validation — price × 0.9 must exceed COGS
    const invalidMargin: string[] = [];
    for (const p of accepted) {
      const finalPrice = p.merchantPrice ?? p.originalPrice;
      const finalCogs = p.merchantCogs ?? p.originalPrice * 0.5;
      if (finalPrice * (1 - MEMBER_DISCOUNT) <= finalCogs) {
        invalidMargin.push(p.id);
      }
    }
    if (invalidMargin.length > 0) {
      return res.status(400).json({
        error: `${invalidMargin.length} product(s) have insufficient margin. Price × 0.9 must exceed COGS.`,
        invalidIds: invalidMargin,
      });
    }

    // Publish: create ProductService records
    const published: string[] = [];
    for (const p of accepted) {
      const finalPrice = p.merchantPrice ?? p.originalPrice;
      const finalCogs = p.merchantCogs ?? p.originalPrice * 0.5;
      const finalTitle = p.merchantTitle || p.originalTitle;
      const finalDescription = p.merchantDescription || p.originalDescription || '';
      const finalCategory = p.merchantCategory || p.aiCategory || 'General';

      const product = await prisma.productService.create({
        data: {
          merchantId: merchant.id,
          name: finalTitle,
          description: finalDescription,
          price: finalPrice,
          cogs: finalCogs,
          category: finalCategory,
          type: 'PRODUCT',
          isActive: true,
          isClearance: false,
        },
      });

      await prisma.catalogProduct.update({
        where: { id: p.id },
        data: { status: 'PUBLISHED', publishedProductId: product.id, finalPrice, finalCogs, finalTitle, finalDescription, finalCategory },
      });

      published.push(product.id);
    }

    await prisma.catalogImport.update({ where: { id: importId }, data: { status: 'COMPLETED', completedAt: new Date() } });

    res.json({ success: true, publishedCount: published.length, importId, message: `Successfully published ${published.length} products to your storefront.` });
  } catch (err: any) {
    console.error('[Catalog] Publish error:', err);
    res.status(500).json({ error: 'Publish failed' });
  }
});

/**
 * GET /api/catalog/imports
 */
router.get('/imports', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const merchant = (req as any).merchant;
    if (isMockModeEnabled()) {
      return res.json(getMockImportRecordsByMerchant(merchant.id));
    }
    const imports = await prisma.catalogImport.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(imports);
  } catch (err: any) {
    res.status(500).json({ error: 'Imports list failed' });
  }
});

/**
 * GET /api/catalog/billing/history
 */
router.get('/billing/history', ...requireMerchant, async (req: AuthRequest, res: Response) => {
  try {
    const merchant = (req as any).merchant;
    if (isMockModeEnabled()) {
      return res.json(getMockBillingData(merchant.id));
    }
    const billing = await prisma.catalogBilling.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(billing);
  } catch (err: any) {
    res.status(500).json({ error: 'Billing history failed' });
  }
});

/**
 * POST /api/catalog/webhook/stripe
 * Stripe webhook for payment confirmation (raw body required — registered in server.ts)
 */
router.post('/webhook/stripe', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const event = typeof payload === 'string' ? JSON.parse(payload) : payload;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const importId = session.metadata?.importId;
      if (importId) {
        await prisma.catalogBilling.updateMany({
          where: { importId },
          data: { status: 'PAID', stripeCheckoutSessionId: session.id, paidAt: new Date() },
        });
        await prisma.catalogImport.updateMany({
          where: { id: importId },
          data: { status: 'FETCHING', startedAt: new Date() },
        });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('[Catalog] Stripe webhook error:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
