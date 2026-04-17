// =============================================================================
// GoodCircles AI Catalog Upload Tool — Main Orchestration View
// =============================================================================
// 5-step self-service flow:
//   Step 1: Platform Selection (OAuth connect)
//   Step 2: Tier Selection & Payment
//   Step 3: Import Progress (fetch + AI processing)
//   Step 4: Review & Edit (AI-transformed products)
//   Step 5: Publish (confirm and push to storefront)
//
// Named export required for lazy loading in App.tsx.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { CatalogPlatformConnect } from '../components/CatalogPlatformConnect';
import { CatalogTierSelector } from '../components/CatalogTierSelector';
import { CatalogImportProgress } from '../components/CatalogImportProgress';
import { CatalogProductReview } from '../components/CatalogProductReview';
import type {
  SourcePlatform,
  ConnectorScanResult,
  CatalogTier,
  TierConfig,
} from '../types/catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadStep = 'connect' | 'tier' | 'progress' | 'review' | 'publish';

interface CatalogUploadState {
  currentStep: UploadStep;
  platform: SourcePlatform | null;
  scanResult: ConnectorScanResult | null;
  selectedTier: TierConfig | null;
  importJobId: string | null;
  paymentConfirmed: boolean;
  publishedCount: number;
}

const STEP_ORDER: UploadStep[] = ['connect', 'tier', 'progress', 'review', 'publish'];

const STEP_LABELS: Record<UploadStep, string> = {
  connect: 'Connect Platform',
  tier: 'Select Plan',
  progress: 'Importing',
  review: 'Review Products',
  publish: 'Published',
};

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep }: { currentStep: UploadStep }) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 px-2">
      {STEP_ORDER.map((step, i) => {
        const isActive = i === currentIndex;
        const isComplete = i < currentIndex;

        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div
                className={`h-0.5 w-4 sm:w-8 mx-1 sm:mx-2 transition-colors ${
                  isComplete ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                    : isComplete
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 whitespace-nowrap ${
                  isActive ? 'text-purple-600 font-semibold' : 'text-gray-400'
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Publish Confirmation Step
// ---------------------------------------------------------------------------

function PublishStep({
  publishedCount,
  platform,
  onGoToStorefront,
}: {
  publishedCount: number;
  platform: SourcePlatform | null;
  onGoToStorefront: () => void;
}) {
  return (
    <div className="text-center py-8 sm:py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
      </motion.div>

      <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">
        Your Storefront Is Live!
      </h2>
      <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
        {publishedCount} product{publishedCount !== 1 ? 's' : ''} from{' '}
        {platform || 'your store'} have been published to your GoodCircles
        storefront and are now visible to your community.
      </p>

      <button
        onClick={onGoToStorefront}
        className="px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-purple-700 transition-colors"
      >
        View Your Storefront
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export function CatalogUploadView() {
  const [state, setState] = useState<CatalogUploadState>({
    currentStep: 'connect',
    platform: null,
    scanResult: null,
    selectedTier: null,
    importJobId: null,
    paymentConfirmed: false,
    publishedCount: 0,
  });

  // Step navigation
  const goToStep = useCallback((step: UploadStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  // Step 1 → 2: Platform connected, scan complete
  const handlePlatformConnected = useCallback(
    (platform: SourcePlatform, scanResult: ConnectorScanResult) => {
      setState((prev) => ({
        ...prev,
        platform,
        scanResult,
        currentStep: 'tier',
      }));
    },
    [],
  );

  // Step 2 → 3: Tier selected, payment confirmed
  const handleTierConfirmed = useCallback(
    (tier: TierConfig, jobId: string) => {
      setState((prev) => ({
        ...prev,
        selectedTier: tier,
        importJobId: jobId,
        paymentConfirmed: true,
        currentStep: 'progress',
      }));
    },
    [],
  );

  // Step 3 → 4: Import complete, ready for review
  const handleImportComplete = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: 'review' }));
  }, []);

  // Step 4 → 5: Products published
  const handlePublished = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      publishedCount: count,
      currentStep: 'publish',
    }));
  }, []);

  // Navigate to merchant storefront
  const handleGoToStorefront = useCallback(() => {
    // In the real app, this would use store.setActiveView('marketplace')
    // or navigate to the merchant's public storefront
    console.log('Navigate to storefront');
  }, []);

  // Go back one step
  const handleBack = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    if (currentIndex > 0) {
      // Only allow going back to connect or tier steps
      const prevStep = STEP_ORDER[currentIndex - 1];
      if (prevStep === 'connect' || prevStep === 'tier') {
        goToStep(prevStep);
      }
    }
  }, [state.currentStep, goToStep]);

  const canGoBack =
    state.currentStep === 'tier' ||
    (state.currentStep === 'connect' && false); // Can't go back from first step

  // Animation variants for step transitions
  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            {canGoBack && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h1 className="text-2xl sm:text-5xl font-bold text-gray-900">
                Catalog Upload
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-500 ml-0 sm:ml-10">
            Import your products from Shopify, Etsy, or Amazon with AI-optimized
            listings
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <StepIndicator currentStep={state.currentStep} />
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {state.currentStep === 'connect' && (
              <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-sm border border-gray-100 p-4 sm:p-8">
                <CatalogPlatformConnect
                  onConnected={handlePlatformConnected}
                />
              </div>
            )}

            {state.currentStep === 'tier' && state.scanResult && (
              <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-sm border border-gray-100 p-4 sm:p-8">
                <CatalogTierSelector
                  scanResult={state.scanResult}
                  onTierConfirmed={handleTierConfirmed}
                />
              </div>
            )}

            {state.currentStep === 'progress' && state.importJobId && (
              <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-sm border border-gray-100 p-4 sm:p-8">
                <CatalogImportProgress
                  jobId={state.importJobId}
                  productCount={state.scanResult?.productCount || 0}
                  onComplete={handleImportComplete}
                />
              </div>
            )}

            {state.currentStep === 'review' && state.importJobId && (
              <CatalogProductReview
                jobId={state.importJobId}
                platform={state.platform}
                onPublished={handlePublished}
              />
            )}

            {state.currentStep === 'publish' && (
              <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-sm border border-gray-100 p-4 sm:p-8">
                <PublishStep
                  publishedCount={state.publishedCount}
                  platform={state.platform}
                  onGoToStorefront={handleGoToStorefront}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CatalogUploadView;
