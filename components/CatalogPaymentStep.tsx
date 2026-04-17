// =============================================================================
// GoodCircles AI Catalog Upload Tool — Payment Step Component
// =============================================================================
// Displays order summary with tier details, per-product cost breakdown,
// Terms of Service acknowledgment, and initiates Stripe Checkout.
// Shown between tier selection and import progress.
// =============================================================================

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, ShieldCheck, Receipt, ArrowRight, Check,
  ExternalLink, RefreshCw, AlertTriangle, Store, ShoppingBag, Package,
} from 'lucide-react';
import type { TierConfig, SourcePlatform, ConnectorScanResult } from '../types/catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogPaymentStepProps {
  scanResult: ConnectorScanResult;
  selectedTier: TierConfig;
  onPaymentConfirmed: (jobId: string) => void;
  onBack: () => void;
}

type PaymentState = 'review' | 'processing' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Platform Icon Helper
// ---------------------------------------------------------------------------

function PlatformIcon({ platform }: { platform: SourcePlatform }) {
  switch (platform) {
    case 'SHOPIFY' as SourcePlatform:
      return <Store className="w-4 h-4 text-green-600" />;
    case 'ETSY' as SourcePlatform:
      return <ShoppingBag className="w-4 h-4 text-orange-600" />;
    case 'AMAZON' as SourcePlatform:
      return <Package className="w-4 h-4 text-amber-600" />;
    default:
      return <Store className="w-4 h-4 text-gray-600" />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CatalogPaymentStep({
  scanResult,
  selectedTier,
  onPaymentConfirmed,
  onBack,
}: CatalogPaymentStepProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('review');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const perProduct = useMemo(
    () => (selectedTier.fee / scanResult.productCount).toFixed(2),
    [selectedTier.fee, scanResult.productCount],
  );

  const tierLabel = useMemo(
    () => selectedTier.tier.charAt(0) + selectedTier.tier.slice(1).toLowerCase(),
    [selectedTier.tier],
  );

  // Initiate Stripe Checkout
  const handlePayment = useCallback(async () => {
    if (!tosAccepted) return;
    setPaymentState('processing');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/catalog/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier.tier,
          productCount: scanResult.productCount,
          platform: scanResult.platform,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Payment initiation failed: ${response.status}`);
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // If no redirect (e.g., test mode or wallet balance payment),
      // treat as immediate confirmation
      setPaymentState('success');
      setTimeout(() => {
        onPaymentConfirmed(data.jobId);
      }, 1500);
    } catch (err: any) {
      setPaymentState('error');
      setErrorMessage(err.message || 'Payment failed. Please try again.');
    }
  }, [tosAccepted, selectedTier, scanResult, onPaymentConfirmed]);

  return (
    <div className="max-w-lg mx-auto">
      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-200 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm mb-1">
            <Receipt className="w-4 h-4" />
            Order Summary
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Catalog Import — {tierLabel}
          </h3>
        </div>

        {/* Details */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-4">
          {/* Platform + Product Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={scanResult.platform} />
              <span className="text-sm text-gray-700">{scanResult.shopName}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {scanResult.productCount.toLocaleString()} product{scanResult.productCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Line Items */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Import {scanResult.productCount.toLocaleString()} products from {scanResult.platform}
              </span>
              <span className="font-medium text-gray-900">${selectedTier.fee}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              <span>Per-product cost</span>
              <span>${perProduct} / product</span>
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              <span>AI description optimization</span>
              <span className="text-green-600">Included</span>
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              <span>Smart COGS &amp; pricing suggestions</span>
              <span className="text-green-600">Included</span>
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              <span>Category auto-mapping</span>
              <span className="text-green-600">Included</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Total */}
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                ${selectedTier.fee}
              </span>
              <span className="text-sm text-gray-400 ml-1">one-time</span>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              Full refund guaranteed if the import fails completely. Prorated credit for
              partial imports. Free retry on platform errors.
            </p>
          </div>
        </div>
      </div>

      {/* Terms of Service */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                tosAccepted
                  ? 'bg-purple-600 border-purple-600'
                  : 'border-gray-300 group-hover:border-gray-400'
              }`}
            >
              {tosAccepted && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            I agree to the{' '}
            <a href="/terms/catalog-upload" className="text-purple-600 underline hover:text-purple-800">
              Catalog Upload Terms of Service
            </a>{' '}
            and understand that this is a one-time fee for importing and AI-optimizing
            my product catalog. The 1% platform fee on ongoing sales is separate.
          </span>
        </label>
      </div>

      {/* Payment Button */}
      <div className="space-y-3">
        <button
          onClick={handlePayment}
          disabled={!tosAccepted || paymentState === 'processing' || paymentState === 'success'}
          className={`w-full flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all ${
            paymentState === 'success'
              ? 'bg-green-500 text-white'
              : !tosAccepted
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : paymentState === 'processing'
              ? 'bg-purple-400 text-white cursor-wait'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98]'
          }`}
        >
          {paymentState === 'processing' ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : paymentState === 'success' ? (
            <>
              <Check className="w-5 h-5" />
              Payment Confirmed!
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${selectedTier.fee} &mdash; Start Import
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Back button */}
        {paymentState !== 'processing' && paymentState !== 'success' && (
          <button
            onClick={onBack}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to plan selection
          </button>
        )}
      </div>

      {/* Error State */}
      {paymentState === 'error' && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Payment Failed</p>
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            <button
              onClick={() => {
                setPaymentState('review');
                setErrorMessage(null);
              }}
              className="mt-2 text-xs text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </motion.div>
      )}

      {/* Security footer */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
        <ShieldCheck className="w-4 h-4" />
        Secure payment processed by Stripe. GoodCircles never sees your card details.
      </div>
    </div>
  );
}

export default CatalogPaymentStep;
