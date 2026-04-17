// =============================================================================
// GoodCircles AI Catalog Upload Tool — Cost Simulation & Validation
// =============================================================================
// Simulates Claude API costs per tier to validate that the tiered pricing
// structure maintains 88–90% gross margins.
//
// Run this module to get a cost projection table:
//   npx ts-node services/catalogCostSimulator.ts
// =============================================================================

import {
  estimateAICosts,
  BATCH_SIZE_CATEGORY,
  BATCH_SIZE_DESCRIPTION,
  COST_PER_1M_INPUT_HAIKU,
  COST_PER_1M_OUTPUT_HAIKU,
  COST_PER_1M_INPUT_SONNET,
  COST_PER_1M_OUTPUT_SONNET,
} from './catalogAIEngine';
import { estimateShopifyApiCalls } from './shopifyConnector';
import { estimateEtsyApiCalls } from './etsyConnector';
import { estimateAmazonApiCalls } from './amazonConnector';
import { TIER_CONFIG, CatalogTier } from '../types/catalog';

// ---------------------------------------------------------------------------
// Detailed Cost Model
// ---------------------------------------------------------------------------

interface TierCostProjection {
  tier: string;
  productCount: number;
  fee: number;

  // Platform API calls (all free, but tracked for operational visibility)
  shopifyApiCalls: number;
  etsyApiCalls: number;
  amazonApiCalls: number;

  // Claude API costs (the actual COGS)
  haikuCalls: number;
  sonnetCalls: number;
  haikuCostUsd: number;
  sonnetCostUsd: number;
  totalAiCostUsd: number;

  // Total COGS and margins
  totalPlatformCogs: number;
  grossMarginUsd: number;
  grossMarginPercent: number;
  withinTarget: boolean;
}

/**
 * Run a detailed cost simulation for a given product count.
 *
 * Token estimates per product (conservative, based on real-world testing):
 *
 * Category mapping (Haiku, batches of 20):
 *   Input:  ~800 tokens per product (title + truncated description + category)
 *   Output: ~50 tokens per product (sourceId + gcCategory JSON)
 *
 * Description rewrite + pricing (Sonnet, batches of 10):
 *   Input:  ~1,200 tokens per product (full product data + system prompt share)
 *   Output: ~300 tokens per product (aiTitle + aiDescription + pricing + flags)
 */
function simulateTierCosts(productCount: number, tier: CatalogTier, fee: number): TierCostProjection {
  // Platform API costs (all $0 — tracked for operational purposes)
  const shopify = estimateShopifyApiCalls(productCount);
  const etsy = estimateEtsyApiCalls(productCount);
  const amazon = estimateAmazonApiCalls(productCount);

  // AI costs
  const haikuBatches = Math.ceil(productCount / BATCH_SIZE_CATEGORY);
  const sonnetBatches = Math.ceil(productCount / BATCH_SIZE_DESCRIPTION);

  // Token calculations
  // System prompt overhead: ~500 tokens input per call (amortized across batch)
  const systemPromptTokens = 500;

  // Haiku: category mapping
  const haikuInputPerBatch = systemPromptTokens + (Math.min(productCount, BATCH_SIZE_CATEGORY) * 800);
  const haikuOutputPerBatch = Math.min(productCount, BATCH_SIZE_CATEGORY) * 50;
  const totalHaikuInput = haikuBatches * haikuInputPerBatch;
  const totalHaikuOutput = haikuBatches * haikuOutputPerBatch;

  // Sonnet: description + pricing
  const sonnetInputPerBatch = systemPromptTokens + (Math.min(productCount, BATCH_SIZE_DESCRIPTION) * 1200);
  const sonnetOutputPerBatch = Math.min(productCount, BATCH_SIZE_DESCRIPTION) * 300;
  const totalSonnetInput = sonnetBatches * sonnetInputPerBatch;
  const totalSonnetOutput = sonnetBatches * sonnetOutputPerBatch;

  // Cost calculations
  const haikuCost =
    (totalHaikuInput / 1_000_000) * COST_PER_1M_INPUT_HAIKU +
    (totalHaikuOutput / 1_000_000) * COST_PER_1M_OUTPUT_HAIKU;

  const sonnetCost =
    (totalSonnetInput / 1_000_000) * COST_PER_1M_INPUT_SONNET +
    (totalSonnetOutput / 1_000_000) * COST_PER_1M_OUTPUT_SONNET;

  const totalAiCost = haikuCost + sonnetCost;
  // Platform APIs are free; total COGS = AI costs only
  const totalPlatformCogs = totalAiCost;
  const grossMarginUsd = fee - totalPlatformCogs;
  const grossMarginPercent = (grossMarginUsd / fee) * 100;

  return {
    tier,
    productCount,
    fee,
    shopifyApiCalls: shopify.callCount,
    etsyApiCalls: etsy.callCount,
    amazonApiCalls: amazon.callCount,
    haikuCalls: haikuBatches,
    sonnetCalls: sonnetBatches,
    haikuCostUsd: round2(haikuCost),
    sonnetCostUsd: round2(sonnetCost),
    totalAiCostUsd: round2(totalAiCost),
    totalPlatformCogs: round2(totalPlatformCogs),
    grossMarginUsd: round2(grossMarginUsd),
    grossMarginPercent: round2(grossMarginPercent),
    withinTarget: grossMarginPercent >= 88,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Run Simulation
// ---------------------------------------------------------------------------

export function runFullSimulation(): TierCostProjection[] {
  const scenarios = [
    // Test at tier boundaries and midpoints
    { count: 25, tier: CatalogTier.STARTER, fee: 75 },
    { count: 50, tier: CatalogTier.STARTER, fee: 75 },
    { count: 51, tier: CatalogTier.GROWTH, fee: 150 },
    { count: 150, tier: CatalogTier.GROWTH, fee: 150 },
    { count: 250, tier: CatalogTier.GROWTH, fee: 150 },
    { count: 251, tier: CatalogTier.PROFESSIONAL, fee: 300 },
    { count: 500, tier: CatalogTier.PROFESSIONAL, fee: 300 },
    { count: 1000, tier: CatalogTier.PROFESSIONAL, fee: 300 },
    { count: 1001, tier: CatalogTier.ENTERPRISE, fee: 500 },
    { count: 2000, tier: CatalogTier.ENTERPRISE, fee: 500 },
    { count: 5000, tier: CatalogTier.ENTERPRISE, fee: 500 },
  ];

  return scenarios.map((s) => simulateTierCosts(s.count, s.tier, s.fee));
}

// ---------------------------------------------------------------------------
// CLI output (run directly)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const results = runFullSimulation();

  console.log('\n=== GoodCircles Catalog Upload — Cost Simulation ===\n');
  console.log('Token costs (per 1M tokens):');
  console.log(`  Haiku  — Input: $${COST_PER_1M_INPUT_HAIKU}, Output: $${COST_PER_1M_OUTPUT_HAIKU}`);
  console.log(`  Sonnet — Input: $${COST_PER_1M_INPUT_SONNET}, Output: $${COST_PER_1M_OUTPUT_SONNET}`);
  console.log(`  Batch sizes — Category: ${BATCH_SIZE_CATEGORY}, Description: ${BATCH_SIZE_DESCRIPTION}\n`);

  console.log('%-14s %6s %6s %6s %6s %8s %8s %8s %8s %6s %s',
    'Tier', 'Count', 'Fee', 'Haiku$', 'Son$', 'AI COGS', 'Margin$', 'Margin%', 'Budget', 'OK?', '');

  console.log('-'.repeat(100));

  for (const r of results) {
    const status = r.withinTarget ? 'YES' : 'NO !!!';
    const tierBudget = TIER_CONFIG.find(t => t.tier === r.tier)?.estimatedPlatformCogs || 0;
    console.log(
      '%-14s %6d $%5d $%5.2f $%5.2f  $%6.2f  $%6.2f  %5.1f%%   $%5d   %s',
      r.tier, r.productCount, r.fee,
      r.haikuCostUsd, r.sonnetCostUsd,
      r.totalPlatformCogs, r.grossMarginUsd, r.grossMarginPercent,
      tierBudget, status
    );
  }

  console.log('\n=== Platform API Calls (all free) ===\n');
  console.log('%-14s %6s %10s %10s %10s', 'Tier', 'Count', 'Shopify', 'Etsy', 'Amazon');
  console.log('-'.repeat(60));
  for (const r of results) {
    console.log('%-14s %6d %10d %10d %10d',
      r.tier, r.productCount, r.shopifyApiCalls, r.etsyApiCalls, r.amazonApiCalls);
  }

  // Summary
  const anyOverBudget = results.some(r => !r.withinTarget);
  console.log(`\n${anyOverBudget ? '⚠️  WARNING: Some tiers exceed the 88% margin target!' : '✅ All tiers within 88-90% gross margin targets.'}\n`);
}

export { simulateTierCosts };
export default runFullSimulation;
