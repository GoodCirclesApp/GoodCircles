// =============================================================================
// GoodCircles AI Catalog Upload Tool — AI Transformation & COGS Engine
// =============================================================================
// Uses Claude API (Anthropic) to:
//   1. Rewrite product descriptions for GoodCircles community marketplace tone
//   2. Suggest optimal COGS and retail pricing for the local market model
//   3. Map source platform categories → GoodCircles taxonomy
//   4. Flag products needing attention (missing images, pricing outliers, etc.)
//
// Cost control strategy:
//   - Batch up to 20 products per Claude API call
//   - Use Haiku for category mapping + simple transforms (cheaper)
//   - Use Sonnet for description rewrites + pricing analysis (better quality)
//   - Track token usage per import for real-time COGS monitoring
// =============================================================================

import type {
  NormalizedProduct,
  CatalogTier,
  ApiCostEntry,
  ImportCostSummary,
} from '../types/catalog';
import { TIER_CONFIG } from '../types/catalog';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_VERSION = '2023-06-01';

// Model selection
const MODEL_HAIKU = 'claude-haiku-4-5-20251001';
const MODEL_SONNET = 'claude-sonnet-4-6';

// Batch sizing — larger batches = fewer API calls = lower cost
const BATCH_SIZE_CATEGORY = 50;    // Max products per Haiku call (category mapping, compact output)
const BATCH_SIZE_DESCRIPTION = 15; // Max products per Sonnet call (description rewrite + pricing)
// For small catalogs below this threshold, skip Haiku entirely and fold category into Sonnet
const SMALL_CATALOG_THRESHOLD = BATCH_SIZE_DESCRIPTION;

// Token cost estimates (per 1M tokens, as of April 2026)
const COST_PER_1M_INPUT_HAIKU = 0.80;
const COST_PER_1M_OUTPUT_HAIKU = 4.00;
const COST_PER_1M_INPUT_SONNET = 3.00;
const COST_PER_1M_OUTPUT_SONNET = 15.00;

// Retry configuration
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 2000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AITransformResult {
  sourceId: string;
  aiTitle: string;
  aiDescription: string;
  suggestedCogs: number;
  suggestedPrice: number;
  gcCategory: string;
  flags: ProductFlag[];
  pricingBreakdown: PricingBreakdown;
}

export interface ProductFlag {
  type: 'MISSING_IMAGES' | 'INCOMPLETE_DESCRIPTION' | 'PRICING_OUTLIER' | 'LOW_MARGIN' | 'MISSING_CATEGORY' | 'DUPLICATE_SUSPECTED';
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface PricingBreakdown {
  merchantCogs: number;           // Merchant's cost of goods
  suggestedRetailPrice: number;   // What the customer pays
  communityPremium: number;       // Premium above COGS (configurable, default 15–25%)
  gcDiscount: number;             // GoodCircles member discount (category-dependent)
  nonprofitContribution: number;  // Donation to selected nonprofit
  platformFee: number;            // 1% GoodCircles platform fee
  merchantNetProfit: number;      // What the merchant takes home
  merchantMarginPercent: number;  // Merchant margin as percentage
}

export interface BatchTransformResult {
  products: AITransformResult[];
  tokensUsed: { inputTokens: number; outputTokens: number };
  model: string;
  callCount: number;
}

export interface TransformProgress {
  totalProducts: number;
  processedProducts: number;
  currentPhase: 'CATEGORY_MAPPING' | 'DESCRIPTION_PRICING';
  estimatedCostSoFar: number;
}

// GoodCircles category-specific fiscal rates (from constants.ts)
const GC_FISCAL_RATES: Record<string, { discount: number; donation: number; platformFee: number }> = {
  'Groceries & Staples':     { discount: 0.05, donation: 0.05, platformFee: 0.005 },
  'Health & Wellness':       { discount: 0.08, donation: 0.08, platformFee: 0.01 },
  'Professional Services':   { discount: 0.15, donation: 0.12, platformFee: 0.015 },
  'Arts & Culture':          { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Tech Services':           { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Home & Garden':           { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Fashion & Apparel':       { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Food & Dining':           { discount: 0.08, donation: 0.08, platformFee: 0.008 },
  'Education & Tutoring':    { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Beauty & Personal Care':  { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Handmade & Crafts':       { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Electronics':             { discount: 0.08, donation: 0.08, platformFee: 0.01 },
  'Books & Media':           { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Sports & Outdoors':       { discount: 0.10, donation: 0.10, platformFee: 0.01 },
  'Pet Supplies':            { discount: 0.10, donation: 0.08, platformFee: 0.01 },
  // Default for unmapped categories
  'General':                 { discount: 0.10, donation: 0.10, platformFee: 0.01 },
};

const GC_CATEGORIES = Object.keys(GC_FISCAL_RATES);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call the Anthropic Messages API with retry + exponential backoff.
 */
async function callClaude(
  model: string,
  systemPrompt: string,
  userMessage: string,
  retryCount = 0,
): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_API_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  // Handle rate limiting and server errors
  if (response.status === 429 || response.status >= 500) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Claude API error ${response.status} after ${MAX_RETRIES} retries`);
    }
    const backoff = BASE_BACKOFF_MS * Math.pow(2, retryCount);
    console.warn(`[CatalogAIEngine] Claude ${response.status}. Retrying in ${backoff}ms (attempt ${retryCount + 1})`);
    await sleep(backoff);
    return callClaude(model, systemPrompt, userMessage, retryCount + 1);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const textContent = data.content?.find((c: any) => c.type === 'text');

  return {
    content: textContent?.text || '',
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: data.usage?.output_tokens || 0,
  };
}

/**
 * Parse JSON from Claude's response, handling potential markdown code fences.
 */
function parseClaudeJson<T>(text: string): T {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
}

/**
 * Split an array into batches of a given size.
 */
function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

// ---------------------------------------------------------------------------
// Prompt Templates
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_CATEGORY_MAPPING = `You are a product categorization assistant for GoodCircles, a community marketplace platform. Your job is to map product categories from external platforms (Shopify, Etsy, Amazon) into the GoodCircles taxonomy.

GoodCircles categories:
${GC_CATEGORIES.map((c) => `- ${c}`).join('\n')}

Rules:
- Always pick the single best-matching GoodCircles category
- If uncertain, use "General"
- Consider the product title, description, and source category together
- Be consistent: similar products should map to the same category

Respond with a JSON array of objects, one per product, in the exact order provided:
[{ "sourceId": "...", "gcCategory": "..." }, ...]`;

const SYSTEM_PROMPT_DESCRIPTION_PRICING = `You are an AI product listing optimizer for GoodCircles, a community marketplace that connects local merchants, neighbors, and nonprofits. Every purchase on GoodCircles supports local community impact.

Your job is to:
1. Rewrite product titles and descriptions for the GoodCircles marketplace tone
2. Suggest optimal COGS (cost of goods) and retail pricing for the local community model
3. Flag any issues with the product data

WRITING TONE:
- Community-oriented: emphasize local sourcing, supporting neighbors, community impact
- Warm and authentic: avoid corporate/generic marketplace language
- Value-focused: highlight quality and craftsmanship over price
- Concise: descriptions should be 2-4 sentences, not walls of text

PRICING LOGIC:
- suggestedCogs: the merchant's estimated cost basis. If the original price looks like retail, suggest COGS at 40-60% of that price (varies by category). If the product already has costOfGoods data, use that.
- suggestedPrice: the MSRP (list price). Set it so MSRP × 0.9 (what the consumer pays after member discount) exceeds suggestedCogs, yielding positive net profit.
- The platform takes 1% of net profit and donates 10% of net profit to a nonprofit — do not build these into the price; the system calculates them automatically.

FLAGS (include when applicable):
- MISSING_IMAGES: product has 0 images
- INCOMPLETE_DESCRIPTION: original description is empty or under 10 words
- PRICING_OUTLIER: suggested price differs from original by more than 40%
- LOW_MARGIN: net profit (MSRP × 0.9 − COGS) would be under 10% of consumer price
- MISSING_CATEGORY: source category was empty or unmappable

Respond with a JSON array of objects, one per product, in the exact order provided:
[{
  "sourceId": "...",
  "aiTitle": "...",
  "aiDescription": "...",
  "suggestedCogs": 0.00,
  "suggestedPrice": 0.00,
  "flags": [{ "type": "...", "severity": "info|warning|error", "message": "..." }]
}, ...]`;

// Combined prompt for small catalogs — does category + description + pricing in one Sonnet call
const SYSTEM_PROMPT_COMBINED = `You are an AI product listing optimizer for GoodCircles, a community marketplace that connects local merchants, neighbors, and nonprofits.

Your job is to:
1. Map each product to the best-fitting GoodCircles category
2. Rewrite product titles and descriptions for the GoodCircles marketplace tone
3. Suggest optimal COGS and retail pricing
4. Flag any issues

GOODCIRCLES CATEGORIES:
${GC_CATEGORIES.map((c) => `- ${c}`).join('\n')}

WRITING TONE: Community-oriented, warm, concise (2–4 sentences). Avoid corporate language.

PRICING LOGIC:
- suggestedCogs: 40–60% of original price if no costOfGoods provided, else use existing data.
- suggestedPrice: MSRP such that MSRP × 0.9 (consumer price after member discount) exceeds suggestedCogs.

FLAGS: MISSING_IMAGES, INCOMPLETE_DESCRIPTION, PRICING_OUTLIER (>40% from original), LOW_MARGIN (<10% net margin), MISSING_CATEGORY.

Respond with a JSON array, one object per product, in the exact input order:
[{
  "sourceId": "...",
  "gcCategory": "...",
  "aiTitle": "...",
  "aiDescription": "...",
  "suggestedCogs": 0.00,
  "suggestedPrice": 0.00,
  "flags": [{ "type": "...", "severity": "info|warning|error", "message": "..." }]
}, ...]`;

// ---------------------------------------------------------------------------
// Phase 1: Category Mapping (Haiku — cheap + fast)
// ---------------------------------------------------------------------------

async function batchCategoryMapping(
  products: NormalizedProduct[],
): Promise<{ mappings: Map<string, string>; costs: ApiCostEntry[] }> {
  const mappings = new Map<string, string>();
  const costs: ApiCostEntry[] = [];
  const batches = batchArray(products, BATCH_SIZE_CATEGORY);

  for (const batch of batches) {
    const userMessage = JSON.stringify(
      batch.map((p) => ({
        sourceId: p.sourceId,
        title: p.title,
        description: p.description.slice(0, 200), // Truncate to save tokens
        sourceCategory: p.category,
        sourcePlatform: p.sourcePlatform,
      }))
    );

    try {
      const result = await callClaude(MODEL_HAIKU, SYSTEM_PROMPT_CATEGORY_MAPPING, userMessage);
      const parsed = parseClaudeJson<Array<{ sourceId: string; gcCategory: string }>>(result.content);

      for (const item of parsed) {
        const validCategory = GC_CATEGORIES.includes(item.gcCategory) ? item.gcCategory : 'General';
        mappings.set(item.sourceId, validCategory);
      }

      const inputCost = (result.inputTokens / 1_000_000) * COST_PER_1M_INPUT_HAIKU;
      const outputCost = (result.outputTokens / 1_000_000) * COST_PER_1M_OUTPUT_HAIKU;

      costs.push({
        service: 'claude_haiku',
        callCount: 1,
        tokensUsed: result.inputTokens + result.outputTokens,
        estimatedCostUsd: inputCost + outputCost,
        timestamp: new Date(),
      });
    } catch (err: any) {
      console.error(`[CatalogAIEngine] Category mapping batch failed: ${err.message}`);
      // Fallback: assign "General" to all products in this batch
      for (const p of batch) {
        mappings.set(p.sourceId, 'General');
      }
    }
  }

  return { mappings, costs };
}

// ---------------------------------------------------------------------------
// Combined Phase (Sonnet — small catalogs only, skips separate Haiku call)
// Category mapping + description rewrite + pricing in a single API call.
// ---------------------------------------------------------------------------

async function combinedTransform(
  products: NormalizedProduct[],
  communityPremiumRate: number,
): Promise<{ results: AITransformResult[]; costs: ApiCostEntry[] }> {
  const userMessage = JSON.stringify(
    products.map((p) => ({
      sourceId: p.sourceId,
      title: p.title,
      description: p.description.slice(0, 500),
      originalPrice: p.price,
      costOfGoods: p.costOfGoods,
      category: p.category,
      imageCount: p.images.length,
      sourcePlatform: p.sourcePlatform,
      communityPremiumRate,
    }))
  );

  try {
    const result = await callClaude(MODEL_SONNET, SYSTEM_PROMPT_COMBINED, userMessage);
    const parsed = parseClaudeJson<Array<{
      sourceId: string;
      gcCategory: string;
      aiTitle: string;
      aiDescription: string;
      suggestedCogs: number;
      suggestedPrice: number;
      flags: ProductFlag[];
    }>>(result.content);

    const inputCost = (result.inputTokens / 1_000_000) * COST_PER_1M_INPUT_SONNET;
    const outputCost = (result.outputTokens / 1_000_000) * COST_PER_1M_OUTPUT_SONNET;

    const costs: ApiCostEntry[] = [{
      service: 'claude_sonnet',
      callCount: 1,
      tokensUsed: result.inputTokens + result.outputTokens,
      estimatedCostUsd: inputCost + outputCost,
      timestamp: new Date(),
    }];

    const results: AITransformResult[] = parsed.map((item) => {
      const gcCategory = GC_CATEGORIES.includes(item.gcCategory) ? item.gcCategory : 'General';
      return {
        sourceId: item.sourceId,
        aiTitle: item.aiTitle,
        aiDescription: item.aiDescription,
        suggestedCogs: item.suggestedCogs,
        suggestedPrice: item.suggestedPrice,
        gcCategory,
        flags: item.flags || [],
        pricingBreakdown: calculatePricingBreakdown(item.suggestedCogs, item.suggestedPrice, gcCategory),
      };
    });

    return { results, costs };
  } catch (err: any) {
    console.error(`[CatalogAIEngine] Combined transform failed: ${err.message}`);
    // Fallback: use original data
    const results: AITransformResult[] = products.map((p) => {
      const gcCategory = 'General';
      const fallbackCogs = p.costOfGoods || p.price * 0.5;
      const fallbackPrice = p.price || fallbackCogs * (1 + communityPremiumRate);
      return {
        sourceId: p.sourceId,
        aiTitle: p.title,
        aiDescription: p.description,
        suggestedCogs: fallbackCogs,
        suggestedPrice: fallbackPrice,
        gcCategory,
        flags: [{ type: 'INCOMPLETE_DESCRIPTION', severity: 'warning', message: 'AI processing failed. Original data used.' }],
        pricingBreakdown: calculatePricingBreakdown(fallbackCogs, fallbackPrice, gcCategory),
      };
    });
    return { results, costs: [] };
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Description Rewrite + Pricing (Sonnet — higher quality)
// ---------------------------------------------------------------------------

async function batchDescriptionPricing(
  products: NormalizedProduct[],
  categoryMappings: Map<string, string>,
  communityPremiumRate: number,
): Promise<{ results: AITransformResult[]; costs: ApiCostEntry[] }> {
  const allResults: AITransformResult[] = [];
  const costs: ApiCostEntry[] = [];
  const batches = batchArray(products, BATCH_SIZE_DESCRIPTION);

  for (const batch of batches) {
    const userMessage = JSON.stringify(
      batch.map((p) => ({
        sourceId: p.sourceId,
        title: p.title,
        description: p.description.slice(0, 500), // More context for quality rewrites
        originalPrice: p.price,
        costOfGoods: p.costOfGoods,
        category: p.category,
        gcCategory: categoryMappings.get(p.sourceId) || 'General',
        imageCount: p.images.length,
        sourcePlatform: p.sourcePlatform,
        communityPremiumRate,
      }))
    );

    try {
      const result = await callClaude(MODEL_SONNET, SYSTEM_PROMPT_DESCRIPTION_PRICING, userMessage);
      const parsed = parseClaudeJson<Array<{
        sourceId: string;
        aiTitle: string;
        aiDescription: string;
        suggestedCogs: number;
        suggestedPrice: number;
        flags: ProductFlag[];
      }>>(result.content);

      for (const item of parsed) {
        const gcCategory = categoryMappings.get(item.sourceId) || 'General';
        const breakdown = calculatePricingBreakdown(
          item.suggestedCogs,
          item.suggestedPrice,
          gcCategory,
        );

        allResults.push({
          sourceId: item.sourceId,
          aiTitle: item.aiTitle,
          aiDescription: item.aiDescription,
          suggestedCogs: item.suggestedCogs,
          suggestedPrice: item.suggestedPrice,
          gcCategory,
          flags: item.flags || [],
          pricingBreakdown: breakdown,
        });
      }

      const inputCost = (result.inputTokens / 1_000_000) * COST_PER_1M_INPUT_SONNET;
      const outputCost = (result.outputTokens / 1_000_000) * COST_PER_1M_OUTPUT_SONNET;

      costs.push({
        service: 'claude_sonnet',
        callCount: 1,
        tokensUsed: result.inputTokens + result.outputTokens,
        estimatedCostUsd: inputCost + outputCost,
        timestamp: new Date(),
      });
    } catch (err: any) {
      console.error(`[CatalogAIEngine] Description/pricing batch failed: ${err.message}`);
      // Fallback: use original data with no AI enhancement
      for (const p of batch) {
        const gcCategory = categoryMappings.get(p.sourceId) || 'General';
        const fallbackCogs = p.costOfGoods || p.price * 0.5;
        const fallbackPrice = p.price || fallbackCogs * (1 + communityPremiumRate);
        const breakdown = calculatePricingBreakdown(fallbackCogs, fallbackPrice, gcCategory);

        allResults.push({
          sourceId: p.sourceId,
          aiTitle: p.title,
          aiDescription: p.description,
          suggestedCogs: fallbackCogs,
          suggestedPrice: fallbackPrice,
          gcCategory,
          flags: [{
            type: 'INCOMPLETE_DESCRIPTION',
            severity: 'warning',
            message: 'AI processing failed for this product. Original data used. You can request a free re-process.',
          }],
          pricingBreakdown: breakdown,
        });
      }
    }
  }

  return { results: allResults, costs };
}

// ---------------------------------------------------------------------------
// Pricing Breakdown Calculator
// ---------------------------------------------------------------------------

/**
 * Calculate the full GoodCircles pricing breakdown for a product.
 *
 * Flow (matches transactionService.ts calculateDistribution):
 *   MSRP                = retailPrice (what merchant lists)
 *   Member discount     = MSRP × discountRate
 *   Consumer pays       = MSRP × (1 − discountRate)   ← effectiveRevenue
 *   Net profit          = effectiveRevenue − COGS
 *   Nonprofit donation  = netProfit × donationRate     (category-specific)
 *   Platform fee        = netProfit × platformFeeRate  (category-specific)
 *   Merchant profit     = netProfit × (1 − donation − platformFee)
 */
export function calculatePricingBreakdown(
  cogs: number,
  retailPrice: number,   // MSRP
  gcCategory: string,
): PricingBreakdown {
  const rates = GC_FISCAL_RATES[gcCategory] || GC_FISCAL_RATES['General'];

  const gcDiscount = retailPrice * rates.discount;            // discount off MSRP
  const effectiveRevenue = retailPrice - gcDiscount;          // what consumer pays
  const netProfit = effectiveRevenue - cogs;                  // net profit
  const nonprofitContribution = netProfit * rates.donation;   // % of net profit
  const platformFee = netProfit * rates.platformFee;          // % of net profit
  const merchantShare = 1 - rates.donation - rates.platformFee;
  const merchantNetProfit = netProfit * merchantShare;        // merchant profit above COGS

  const merchantMarginPercent = effectiveRevenue > 0
    ? (merchantNetProfit / effectiveRevenue) * 100
    : 0;

  const communityPremium = effectiveRevenue - cogs; // = netProfit

  return {
    merchantCogs: round2(cogs),
    suggestedRetailPrice: round2(effectiveRevenue), // consumer-facing price
    communityPremium: round2(communityPremium),
    gcDiscount: round2(gcDiscount),
    nonprofitContribution: round2(nonprofitContribution),
    platformFee: round2(platformFee),
    merchantNetProfit: round2(merchantNetProfit),
    merchantMarginPercent: round2(merchantMarginPercent),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Cost Tracking
// ---------------------------------------------------------------------------

/**
 * Calculate estimated Claude API costs for a given product count and tier.
 * Used for pre-import COGS projections.
 */
export function estimateAICosts(productCount: number): {
  haikuCalls: number;
  sonnetCalls: number;
  estimatedCostUsd: number;
} {
  // Small catalogs use a single combined Sonnet call — no Haiku phase
  if (productCount <= SMALL_CATALOG_THRESHOLD) {
    const inputTokens = 1400 * productCount;
    const outputTokens = 400 * productCount;
    const sonnetCost =
      (inputTokens / 1_000_000) * COST_PER_1M_INPUT_SONNET +
      (outputTokens / 1_000_000) * COST_PER_1M_OUTPUT_SONNET;
    return { haikuCalls: 0, sonnetCalls: 1, estimatedCostUsd: round2(sonnetCost) };
  }

  const haikuCalls = Math.ceil(productCount / BATCH_SIZE_CATEGORY);
  const sonnetCalls = Math.ceil(productCount / BATCH_SIZE_DESCRIPTION);

  const avgHaikuInputTokens = 600 * Math.min(productCount, BATCH_SIZE_CATEGORY);
  const avgHaikuOutputTokens = 40 * Math.min(productCount, BATCH_SIZE_CATEGORY);
  const avgSonnetInputTokens = 1200 * Math.min(productCount, BATCH_SIZE_DESCRIPTION);
  const avgSonnetOutputTokens = 350 * Math.min(productCount, BATCH_SIZE_DESCRIPTION);

  const haikuCost = haikuCalls * (
    (avgHaikuInputTokens / 1_000_000) * COST_PER_1M_INPUT_HAIKU +
    (avgHaikuOutputTokens / 1_000_000) * COST_PER_1M_OUTPUT_HAIKU
  );

  const sonnetCost = sonnetCalls * (
    (avgSonnetInputTokens / 1_000_000) * COST_PER_1M_INPUT_SONNET +
    (avgSonnetOutputTokens / 1_000_000) * COST_PER_1M_OUTPUT_SONNET
  );

  return {
    haikuCalls,
    sonnetCalls,
    estimatedCostUsd: round2(haikuCost + sonnetCost),
  };
}

/**
 * Build an import cost summary from accumulated cost entries.
 */
export function buildCostSummary(
  importId: string,
  tier: CatalogTier,
  platformApiCosts: ApiCostEntry[],
  aiCosts: ApiCostEntry[],
): ImportCostSummary {
  const totalCostUsd = round2(
    [...platformApiCosts, ...aiCosts].reduce((sum, c) => sum + c.estimatedCostUsd, 0)
  );

  const tierConfig = TIER_CONFIG.find((t) => t.tier === tier);
  const tierBudgetUsd = tierConfig?.estimatedPlatformCogs || 60;
  const fee = tierConfig?.fee || 500;

  return {
    importId,
    tier,
    platformApiCosts,
    aiCosts,
    totalCostUsd,
    tierBudgetUsd,
    withinBudget: totalCostUsd <= tierBudgetUsd * 1.2, // 20% buffer
    marginPercentage: round2(((fee - totalCostUsd) / fee) * 100),
  };
}

// ---------------------------------------------------------------------------
// Main Transform Pipeline
// ---------------------------------------------------------------------------

export interface TransformOptions {
  /** Community premium rate above COGS (default: 0.20 = 20%) */
  communityPremiumRate?: number;
  /** Progress callback for UI updates */
  onProgress?: (progress: TransformProgress) => void;
}

/**
 * Transform an array of normalized products through the AI pipeline.
 *
 * Phase 1 (Haiku): Category mapping — cheap, fast
 * Phase 2 (Sonnet): Description rewrite + pricing — higher quality
 *
 * Returns AI-enhanced product data with pricing breakdowns and flags.
 */
export async function transformProducts(
  products: NormalizedProduct[],
  options: TransformOptions = {},
): Promise<{ results: AITransformResult[]; costs: ApiCostEntry[] }> {
  const { communityPremiumRate = 0.20, onProgress } = options;

  if (products.length === 0) {
    return { results: [], costs: [] };
  }

  // Small catalogs: skip Haiku entirely — fold category mapping into a single Sonnet call.
  // Saves 1+ API call per import for the majority of merchants.
  if (products.length <= SMALL_CATALOG_THRESHOLD) {
    if (onProgress) {
      onProgress({ totalProducts: products.length, processedProducts: 0, currentPhase: 'DESCRIPTION_PRICING', estimatedCostSoFar: 0 });
    }
    const { results, costs } = await combinedTransform(products, communityPremiumRate);
    if (onProgress) {
      onProgress({ totalProducts: products.length, processedProducts: results.length, currentPhase: 'DESCRIPTION_PRICING', estimatedCostSoFar: round2(costs.reduce((s, c) => s + c.estimatedCostUsd, 0)) });
    }
    return { results, costs };
  }

  const allCosts: ApiCostEntry[] = [];

  // Phase 1: Category mapping (Haiku — cheap, batches of 50)
  if (onProgress) {
    onProgress({ totalProducts: products.length, processedProducts: 0, currentPhase: 'CATEGORY_MAPPING', estimatedCostSoFar: 0 });
  }

  const { mappings, costs: categoryCosts } = await batchCategoryMapping(products);
  allCosts.push(...categoryCosts);

  // Phase 2: Description rewrite + pricing (Sonnet — batches of 15)
  if (onProgress) {
    onProgress({ totalProducts: products.length, processedProducts: 0, currentPhase: 'DESCRIPTION_PRICING', estimatedCostSoFar: round2(allCosts.reduce((s, c) => s + c.estimatedCostUsd, 0)) });
  }

  const { results, costs: descCosts } = await batchDescriptionPricing(products, mappings, communityPremiumRate);
  allCosts.push(...descCosts);

  if (onProgress) {
    onProgress({ totalProducts: products.length, processedProducts: results.length, currentPhase: 'DESCRIPTION_PRICING', estimatedCostSoFar: round2(allCosts.reduce((s, c) => s + c.estimatedCostUsd, 0)) });
  }

  return { results, costs: allCosts };
}

// ---------------------------------------------------------------------------
// Exported for testing / monitoring
// ---------------------------------------------------------------------------

export {
  SYSTEM_PROMPT_CATEGORY_MAPPING,
  SYSTEM_PROMPT_DESCRIPTION_PRICING,
  GC_FISCAL_RATES,
  GC_CATEGORIES,
  BATCH_SIZE_CATEGORY,
  BATCH_SIZE_DESCRIPTION,
  COST_PER_1M_INPUT_HAIKU,
  COST_PER_1M_OUTPUT_HAIKU,
  COST_PER_1M_INPUT_SONNET,
  COST_PER_1M_OUTPUT_SONNET,
};

export default transformProducts;
