// =============================================================================
// GoodCircles AI Catalog Upload Tool — Tier Selection Component
// =============================================================================
// Displays the 4 pricing tiers with auto-detection of the merchant's tier
// based on actual product count from the connector scan.
// Shows value proposition, per-product cost, and initiates payment.
// =============================================================================

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import type { ConnectorScanResult, TierConfig, CatalogTier } from '../types/catalog';
import { TIER_CONFIG, determineTier } from '../types/catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogTierSelectorProps {
  scanResult: ConnectorScanResult;
  onTierConfirmed: (tier: TierConfig, jobId: string) => void;
}

// ---------------------------------------------------------------------------
// Tier Card
// ---------------------------------------------------------------------------

const TIER_FEATURES: Record<string, string[]> = {
  STARTER: [
    'Up to 50 products',
    'AI-optimized descriptions',
    'Smart COGS suggestions',
    'Category auto-mapping',
  ],
  GROWTH: [
    'Up to 250 products',
    'AI-optimized descriptions',
    'Smart COGS suggestions',
    'Category auto-mapping',
    'Bulk review tools',
  ],
  PROFESSIONAL: [
    'Up to 1,000 products',
    'AI-optimized descriptions',
    'Smart COGS suggestions',
    'Category auto-mapping',
    'Bulk review tools',
    'Priority processing',
  ],
  ENTERPRISE: [
    'Unlimited products',
    'AI-optimized descriptions',
    'Smart COGS suggestions',
    'Category auto-mapping',
    'Bulk review tools',
    'Priority processing',
    'Dedicated support',
  ],
};

function TierCard({
  tier,
  productCount,
  isRecommended,
  isSelected,
  onSelect,
}: {
  tier: TierConfig;
  productCount: number;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const perProduct = (tier.fee / Math.max(productCount, tier.minProducts)).toFixed(2);
  const features = TIER_FEATURES[tier.tier] || TIER_FEATURES.STARTER;
  const maxLabel = tier.maxProducts ? tier.maxProducts.toLocaleString() : '1,000+';

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex flex-col p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 text-left transition-all w-full ${
        isSelected
          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
          : isRecommended
          ? 'border-purple-300 bg-white shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
            <Star className="w-3 h-3" />
            Recommended
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
        {tier.tier.charAt(0) + tier.tier.slice(1).toLowerCase()}
      </h3>

      {/* Product Range */}
      <p className="text-xs sm:text-sm text-gray-500 mb-3">
        {tier.minProducts.toLocaleString()}&ndash;{maxLabel} products
      </p>

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl sm:text-4xl font-bold text-gray-900">${tier.fee}</span>
        <span className="text-sm text-gray-400 ml-1">one-time</span>
      </div>

      {/* Per-product cost */}
      {isRecommended && (
        <div className="mb-4 px-3 py-2 bg-purple-100 rounded-xl">
          <p className="text-sm font-medium text-purple-800">
            Import your {productCount.toLocaleString()} product{productCount !== 1 ? 's' : ''} for
            just ${tier.fee}
          </p>
          <p className="text-xs text-purple-600 mt-0.5">
            That&apos;s ${perProduct} per product
          </p>
        </div>
      )}

      {/* Features */}
      <ul className="flex-1 space-y-2 mb-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
            <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Select Button */}
      <div
        className={`w-full py-2.5 sm:py-3 rounded-xl text-center text-sm font-semibold transition-colors ${
          isSelected
            ? 'bg-purple-600 text-white'
            : isRecommended
            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CatalogTierSelector({ scanResult, onTierConfirmed }: CatalogTierSelectorProps) {
  const recommendedTier = useMemo(
    () => determineTier(scanResult.productCount),
    [scanResult.productCount],
  );

  const [selectedTier, setSelectedTier] = useState<TierConfig>(recommendedTier);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);

    try {
      // Call checkout endpoint (handles both mock and real modes)
      const response = await fetch('/api/catalog/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier.tier,
          productCount: scanResult.productCount,
          platform: scanResult.platform,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      if (data.mockMode) {
        // Mock mode: backend created dynamic import record, use returned ID
        console.log('[Catalog] Mock mode: Checkout returned jobId', data.jobId);
        onTierConfirmed(selectedTier, data.jobId || data.importId);
      } else {
        // Real mode: Stripe checkout
        // If Stripe redirects for payment, the webhook will trigger import start.
        // In production: window.location.href = data.checkoutUrl;
        onTierConfirmed(selectedTier, data.jobId);
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setIsProcessing(false);
    }
  }, [selectedTier, scanResult, onTierConfirmed]);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          {scanResult.productCount.toLocaleString()} product{scanResult.productCount !== 1 ? 's' : ''} found
          in {scanResult.shopName}
        </div>

        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choose Your Import Plan
        </h2>
        <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto">
          One-time fee to import and AI-optimize your entire catalog.
          Your tier is based on your current product count.
        </p>
      </div>

      {/* Tier Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {TIER_CONFIG.map((tier) => (
          <TierCard
            key={tier.tier}
            tier={tier}
            productCount={scanResult.productCount}
            isRecommended={tier.tier === recommendedTier.tier}
            isSelected={tier.tier === selectedTier.tier}
            onSelect={() => setSelectedTier(tier)}
          />
        ))}
      </div>

      {/* Confirm Button */}
      <div className="text-center">
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              Continue to Payment
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4" />
          Secure payment via Stripe. Full refund if import fails.
        </div>
      </div>
    </div>
  );
}

export default CatalogTierSelector;
