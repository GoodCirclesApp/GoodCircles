// =============================================================================
// GoodCircles AI Catalog Upload Tool — Import Progress Component
// =============================================================================
// Step 3: Real-time progress bar showing fetch + AI processing status.
// Polls the job status endpoint and displays phase-specific messaging.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Download, Sparkles, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogImportProgressProps {
  jobId: string;
  productCount: number;
  onComplete: () => void;
}

interface JobStatus {
  status: 'QUEUED' | 'FETCHING' | 'TRANSFORMING' | 'REVIEW_READY' | 'PUBLISHING' | 'COMPLETED' | 'FAILED';
  progress: number;          // 0–100
  fetchedProducts: number;
  transformedProducts: number;
  totalProducts: number;
  currentPhase: string;
  estimatedTimeRemaining: number | null; // seconds
  error: string | null;
}

const PHASE_CONFIG: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  QUEUED: {
    icon: <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-purple-500" />,
    label: 'Preparing',
    description: 'Setting up your import...',
  },
  FETCHING: {
    icon: <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />,
    label: 'Fetching Products',
    description: 'Downloading your catalog from the platform...',
  },
  TRANSFORMING: {
    icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />,
    label: 'AI Processing',
    description: 'Optimizing descriptions and pricing for your community marketplace...',
  },
  REVIEW_READY: {
    icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />,
    label: 'Ready for Review',
    description: 'Your products have been imported and optimized!',
  },
  FAILED: {
    icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />,
    label: 'Import Failed',
    description: 'Something went wrong during the import.',
  },
};

const POLL_INTERVAL_MS = 3000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CatalogImportProgress({ jobId, productCount, onComplete }: CatalogImportProgressProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus>({
    status: 'QUEUED',
    progress: 0,
    fetchedProducts: 0,
    transformedProducts: 0,
    totalProducts: productCount,
    currentPhase: 'QUEUED',
    estimatedTimeRemaining: null,
    error: null,
  });

  const [isRetrying, setIsRetrying] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Poll job status
  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/catalog/import/${jobId}/status`);
      if (!response.ok) return;

      const data: JobStatus = await response.json();
      setJobStatus(data);

      // Stop polling on terminal states
      if (data.status === 'REVIEW_READY' || data.status === 'COMPLETED') {
        if (pollRef.current) clearInterval(pollRef.current);
        // Auto-advance after a brief pause
        setTimeout(onComplete, 1500);
      }

      if (data.status === 'FAILED') {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (err) {
      console.error('[CatalogImportProgress] Poll failed:', err);
    }
  }, [jobId, onComplete]);

  // Start polling on mount
  useEffect(() => {
    pollStatus(); // Initial fetch
    pollRef.current = setInterval(pollStatus, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollStatus]);

  // Retry a failed import
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/catalog/import/${jobId}/resume`, {
        method: 'POST',
      });
      if (response.ok) {
        setJobStatus((prev) => ({ ...prev, status: 'QUEUED', error: null, progress: prev.progress }));
        pollRef.current = setInterval(pollStatus, POLL_INTERVAL_MS);
      }
    } catch (err) {
      console.error('[CatalogImportProgress] Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [jobId, pollStatus]);

  const phase = PHASE_CONFIG[jobStatus.status] || PHASE_CONFIG.QUEUED;
  const isFailed = jobStatus.status === 'FAILED';
  const isActive = !isFailed && jobStatus.status !== 'REVIEW_READY' && jobStatus.status !== 'COMPLETED';

  // Format time remaining
  const timeRemaining = jobStatus.estimatedTimeRemaining
    ? jobStatus.estimatedTimeRemaining > 60
      ? `${Math.ceil(jobStatus.estimatedTimeRemaining / 60)} min remaining`
      : `${jobStatus.estimatedTimeRemaining}s remaining`
    : null;

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8">
      {/* Phase Icon + Label */}
      <div className="text-center mb-8">
        <motion.div
          key={jobStatus.status}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center"
        >
          {phase.icon}
        </motion.div>

        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
          {phase.label}
        </h3>
        <p className="text-sm sm:text-base text-gray-500">
          {phase.description}
        </p>
      </div>

      {/* Progress Bar */}
      {isActive && (
        <div className="mb-6">
          <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-2">
            <span>{Math.round(jobStatus.progress)}% complete</span>
            {timeRemaining && <span>{timeRemaining}</span>}
          </div>

          <div className="h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${jobStatus.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Phase-specific details */}
      {jobStatus.status === 'FETCHING' && (
        <div className="text-center text-sm text-gray-500">
          <p>
            Fetched{' '}
            <span className="font-semibold text-gray-700">
              {jobStatus.fetchedProducts.toLocaleString()}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-700">
              {jobStatus.totalProducts.toLocaleString()}
            </span>{' '}
            products
          </p>
        </div>
      )}

      {jobStatus.status === 'TRANSFORMING' && (
        <div className="text-center text-sm text-gray-500">
          <p>
            AI-optimized{' '}
            <span className="font-semibold text-gray-700">
              {jobStatus.transformedProducts.toLocaleString()}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-700">
              {jobStatus.totalProducts.toLocaleString()}
            </span>{' '}
            products
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Rewriting descriptions and calculating optimal pricing for your community...
          </p>
        </div>
      )}

      {/* Ready state */}
      {jobStatus.status === 'REVIEW_READY' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-green-600 font-medium">
            All {jobStatus.totalProducts.toLocaleString()} products are ready for your review!
          </p>
          <p className="text-xs text-gray-400 mt-1">Loading review screen...</p>
        </motion.div>
      )}

      {/* Error state */}
      {isFailed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <p className="text-sm text-red-800 font-medium mb-2">
            {jobStatus.error || 'The import encountered an error.'}
          </p>
          {jobStatus.fetchedProducts > 0 && (
            <p className="text-xs text-red-600 mb-3">
              {jobStatus.fetchedProducts} of {jobStatus.totalProducts} products were fetched before
              the error. You can resume from where it stopped.
            </p>
          )}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Resuming...' : 'Resume Import'}
          </button>
        </motion.div>
      )}

      {/* Animated dots for active states */}
      {isActive && (
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CatalogImportProgress;
