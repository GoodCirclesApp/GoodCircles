// =============================================================================
// GoodCircles AI Catalog Upload Tool — Product Review Component
// =============================================================================
// Step 4: Grid view of AI-transformed products with edit capability.
// Side-by-side comparison: original listing vs AI-optimized listing.
// Bulk actions: Accept All, Reject All, Edit Selected.
// Editable fields: title, description, price, COGS, category.
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Edit3, ChevronDown, ChevronUp,
  AlertTriangle, Image as ImageIcon, DollarSign, Tag, Send,
  Check, X, Search, ShieldCheck,
} from 'lucide-react';
import type { SourcePlatform } from '../types/catalog';
import type { PricingBreakdown, ProductFlag } from '../services/catalogAIEngine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogProductReviewProps {
  jobId: string;
  platform: SourcePlatform | null;
  onPublished: (count: number) => void;
}

interface ReviewProduct {
  id: string;
  sourceId: string;
  originalTitle: string;
  originalDescription: string;
  originalPrice: number;
  originalImages: string[];
  originalCategory: string | null;
  aiTitle: string;
  aiDescription: string;
  suggestedCogs: number;
  suggestedPrice: number;
  gcCategory: string;
  flags: ProductFlag[];
  pricingBreakdown: PricingBreakdown;
  status: 'PENDING' | 'AI_PROCESSED' | 'ACCEPTED' | 'REJECTED';
  cogsVerified: boolean;       // merchant has explicitly confirmed the COGS value
  // Merchant edits (overrides AI suggestions)
  editedTitle?: string;
  editedDescription?: string;
  editedCogs?: number;
  editedPrice?: number;
  editedCategory?: string;
}

type FilterOption = 'all' | 'flagged' | 'accepted' | 'rejected' | 'pending';

// ---------------------------------------------------------------------------
// Flag Badge
// ---------------------------------------------------------------------------

function FlagBadge({ flag }: { flag: ProductFlag }) {
  const colors = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs rounded-full border ${colors[flag.severity]}`}
      title={flag.message}
    >
      <AlertTriangle className="w-3 h-3" />
      {flag.type.replace(/_/g, ' ')}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Pricing Breakdown Display
// ---------------------------------------------------------------------------

function PricingBreakdownCard({ breakdown }: { breakdown: PricingBreakdown }) {
  return (
    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl text-xs sm:text-sm space-y-1.5">
      <div className="flex justify-between">
        <span className="text-gray-500">Your Cost (COGS)</span>
        <span className="font-medium text-gray-900">${breakdown.merchantCogs.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Suggested Price</span>
        <span className="font-semibold text-purple-700">${breakdown.suggestedRetailPrice.toFixed(2)}</span>
      </div>
      <div className="border-t border-gray-200 pt-1.5 mt-1.5">
        <div className="flex justify-between text-gray-400">
          <span>Member Discount</span>
          <span>-${breakdown.gcDiscount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Nonprofit Contribution</span>
          <span>-${breakdown.nonprofitContribution.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Platform Fee (1%)</span>
          <span>-${breakdown.platformFee.toFixed(2)}</span>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-1.5">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Your Profit</span>
          <span
            className={`font-bold ${
              breakdown.merchantNetProfit > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ${breakdown.merchantNetProfit.toFixed(2)}
            <span className="text-xs ml-1">({breakdown.merchantMarginPercent.toFixed(1)}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single Product Card
// ---------------------------------------------------------------------------

function ProductCard({
  product,
  onAccept,
  onReject,
  onEdit,
  onVerifyCogs,
}: {
  product: ReviewProduct;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (edits: Partial<ReviewProduct>) => void;
  onVerifyCogs: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    title: product.editedTitle || product.aiTitle,
    description: product.editedDescription || product.aiDescription,
    cogs: product.editedCogs ?? product.suggestedCogs,
    price: product.editedPrice ?? product.suggestedPrice,
    category: product.editedCategory || product.gcCategory,
  });

  const displayTitle = product.editedTitle || product.aiTitle;
  const displayDescription = product.editedDescription || product.aiDescription;
  const currentCogs = product.editedCogs ?? product.suggestedCogs;
  const hasFlags = product.flags.length > 0;
  const isAccepted = product.status === 'ACCEPTED';
  const isRejected = product.status === 'REJECTED';

  const handleSaveEdits = () => {
    // Saving a new COGS value resets verification — merchant must re-verify
    const cogsChanged = editValues.cogs !== currentCogs;
    onEdit({
      editedTitle: editValues.title,
      editedDescription: editValues.description,
      editedCogs: editValues.cogs,
      editedPrice: editValues.price,
      editedCategory: editValues.category,
      ...(cogsChanged ? { cogsVerified: false } : {}),
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-[2rem] border-2 overflow-hidden transition-all ${
        isAccepted
          ? 'border-green-200 bg-green-50/30'
          : isRejected
          ? 'border-red-200 bg-red-50/30 opacity-60'
          : hasFlags
          ? 'border-amber-200 bg-amber-50/20'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Product Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Image thumbnail */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
            {product.originalImages.length > 0 ? (
              <img
                src={product.originalImages[0]}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-300" />
              </div>
            )}
          </div>

          {/* Title + Category */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
              {displayTitle}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Tag className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{product.gcCategory}</span>
            </div>
            {/* Flags */}
            {hasFlags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.flags.map((flag, i) => (
                  <FlagBadge key={i} flag={flag} />
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className="text-base sm:text-lg font-bold text-gray-900">
              ${(product.editedPrice ?? product.suggestedPrice).toFixed(2)}
            </div>
            {product.originalPrice !== (product.editedPrice ?? product.suggestedPrice) && (
              <div className="text-xs text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* COGS Verification — required before accepting */}
        <div className={`mt-3 flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium ${
          product.cogsVerified
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <span className="flex items-center gap-1.5">
            {product.cogsVerified
              ? <><ShieldCheck className="w-3.5 h-3.5" /> COGS verified — ${currentCogs.toFixed(2)}</>
              : <><AlertTriangle className="w-3.5 h-3.5" /> Verify your cost: AI suggests ${currentCogs.toFixed(2)}</>
            }
          </span>
          {!product.cogsVerified && (
            <button
              onClick={onVerifyCogs}
              className="ml-2 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-amber-600 transition-colors"
            >
              Verify
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={onAccept}
            disabled={!product.cogsVerified}
            title={!product.cogsVerified ? 'Verify COGS before accepting' : undefined}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              isAccepted
                ? 'bg-green-500 text-white'
                : product.cogsVerified
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            {isAccepted ? 'Accepted' : 'Accept'}
          </button>

          <button
            onClick={onReject}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              isRejected
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <X className="w-4 h-4" />
            {isRejected ? 'Rejected' : 'Reject'}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center py-2 px-3 rounded-xl text-xs sm:text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded: Side-by-side comparison */}
      <AnimatePresence>
        {isExpanded && !isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original */}
              <div>
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Original Listing
                </h5>
                <p className="text-sm font-medium text-gray-700 mb-1">{product.originalTitle}</p>
                <p className="text-xs text-gray-500 mb-2 line-clamp-4">
                  {product.originalDescription || 'No description'}
                </p>
                <p className="text-sm font-semibold text-gray-600">
                  ${product.originalPrice.toFixed(2)}
                </p>
                {product.originalCategory && (
                  <p className="text-xs text-gray-400 mt-1">{product.originalCategory}</p>
                )}
              </div>

              {/* AI-Optimized */}
              <div>
                <h5 className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">
                  AI-Optimized
                </h5>
                <p className="text-sm font-medium text-gray-700 mb-1">{displayTitle}</p>
                <p className="text-xs text-gray-500 mb-2 line-clamp-4">{displayDescription}</p>
                <PricingBreakdownCard breakdown={product.pricingBreakdown} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Mode */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 sm:p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={editValues.title}
                  onChange={(e) => setEditValues((v) => ({ ...v, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">COGS ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editValues.cogs}
                    onChange={(e) => setEditValues((v) => ({ ...v, cogs: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editValues.price}
                    onChange={(e) => setEditValues((v) => ({ ...v, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={editValues.category}
                    onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Review Component
// ---------------------------------------------------------------------------

export function CatalogProductReview({ jobId, platform, onPublished }: CatalogProductReviewProps) {
  const [products, setProducts] = useState<ReviewProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const token = localStorage.getItem('gc_access_token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`/api/catalog/import/${jobId}/products`, { headers });
        if (response.ok) {
          const data = await response.json();
          // Ensure cogsVerified defaults to false for products that don't have it
          const products = (data.products || []).map((p: any) => ({ ...p, cogsVerified: p.cogsVerified ?? false }));
          setProducts(products);
        }
      } catch (err) {
        console.error('[CatalogProductReview] Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [jobId]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply status filter
    if (filter === 'flagged') {
      result = result.filter((p) => p.flags.length > 0);
    } else if (filter === 'accepted') {
      result = result.filter((p) => p.status === 'ACCEPTED');
    } else if (filter === 'rejected') {
      result = result.filter((p) => p.status === 'REJECTED');
    } else if (filter === 'pending') {
      result = result.filter((p) => p.status !== 'ACCEPTED' && p.status !== 'REJECTED');
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.aiTitle.toLowerCase().includes(q) ||
          p.originalTitle.toLowerCase().includes(q) ||
          p.gcCategory.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, filter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const accepted = products.filter((p) => p.status === 'ACCEPTED').length;
    const rejected = products.filter((p) => p.status === 'REJECTED').length;
    const flagged = products.filter((p) => p.flags.length > 0).length;
    const pending = products.length - accepted - rejected;
    const unverifiedAccepted = products.filter((p) => p.status === 'ACCEPTED' && !p.cogsVerified).length;
    return { accepted, rejected, flagged, pending, total: products.length, unverifiedAccepted };
  }, [products]);

  // Actions
  const updateProduct = useCallback((productId: string, updates: Partial<ReviewProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
    );
  }, []);

  const authHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('gc_access_token');
    const h: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, []);

  const handleAccept = useCallback(
    (productId: string) => {
      updateProduct(productId, { status: 'ACCEPTED' });
      fetch(`/api/catalog/import/${jobId}/products/${productId}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ status: 'ACCEPTED' }),
      }).catch(console.error);
    },
    [jobId, updateProduct, authHeaders],
  );

  const handleReject = useCallback(
    (productId: string) => {
      updateProduct(productId, { status: 'REJECTED' });
      fetch(`/api/catalog/import/${jobId}/products/${productId}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ status: 'REJECTED' }),
      }).catch(console.error);
    },
    [jobId, updateProduct, authHeaders],
  );

  const handleEdit = useCallback(
    (productId: string, edits: Partial<ReviewProduct>) => {
      updateProduct(productId, edits);
      const token = localStorage.getItem('gc_access_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch(`/api/catalog/import/${jobId}/products/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(edits),
      }).catch(console.error);
    },
    [jobId, updateProduct],
  );

  const handleVerifyCogs = useCallback(
    (productId: string) => {
      updateProduct(productId, { cogsVerified: true });
      const token = localStorage.getItem('gc_access_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch(`/api/catalog/import/${jobId}/products/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ cogsVerified: true }),
      }).catch(console.error);
    },
    [jobId, updateProduct],
  );

  // Bulk actions
  const handleBulkAcceptAll = useCallback(() => {
    // Only accept products that have verified COGS
    const eligibleIds = products
      .filter((p) => p.status !== 'ACCEPTED' && p.status !== 'REJECTED' && p.cogsVerified)
      .map((p) => p.id);

    if (eligibleIds.length === 0) return;

    setProducts((prev) =>
      prev.map((p) => eligibleIds.includes(p.id) ? { ...p, status: 'ACCEPTED' as const } : p),
    );
    fetch(`/api/catalog/import/${jobId}/bulk-action`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ action: 'accept', productIds: eligibleIds }),
    }).catch(console.error);
  }, [products, jobId, authHeaders]);

  const handleBulkRejectAll = useCallback(() => {
    const pendingIds = products
      .filter((p) => p.status !== 'ACCEPTED' && p.status !== 'REJECTED')
      .map((p) => p.id);

    setProducts((prev) =>
      prev.map((p) => pendingIds.includes(p.id) ? { ...p, status: 'REJECTED' as const } : p),
    );
    fetch(`/api/catalog/import/${jobId}/bulk-action`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ action: 'reject', productIds: pendingIds }),
    }).catch(console.error);
  }, [products, jobId, authHeaders]);

  // Publish
  const handlePublish = useCallback(async () => {
    const acceptedCount = products.filter((p) => p.status === 'ACCEPTED').length;
    if (acceptedCount === 0 || counts.unverifiedAccepted > 0) return;

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/catalog/import/${jobId}/publish`, {
        method: 'POST', headers: authHeaders(),
      });
      if (response.ok) {
        onPublished(acceptedCount);
      }
    } catch (err) {
      console.error('[CatalogProductReview] Publish failed:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [products, counts.unverifiedAccepted, jobId, onPublished, authHeaders]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header + Summary */}
      <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-sm border border-gray-100 p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Review Your Products
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {counts.total} products imported &middot;{' '}
              <span className="text-green-600">{counts.accepted} accepted</span> &middot;{' '}
              <span className="text-red-500">{counts.rejected} rejected</span> &middot;{' '}
              <span className="text-gray-600">{counts.pending} pending</span>
            </p>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleBulkAcceptAll}
              disabled={products.filter(p => p.status !== 'ACCEPTED' && p.status !== 'REJECTED' && p.cogsVerified).length === 0}
              title="Accepts only COGS-verified products"
              className="px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-40"
            >
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Accept Verified
            </button>
            <button
              onClick={handleBulkRejectAll}
              disabled={counts.pending === 0}
              className="px-3 sm:px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-40"
            >
              <XCircle className="w-4 h-4 inline mr-1" />
              Reject All
            </button>
          </div>
        </div>

        {/* Filter + Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(
              [
                { key: 'all', label: `All (${counts.total})` },
                { key: 'pending', label: `Pending (${counts.pending})` },
                { key: 'flagged', label: `Flagged (${counts.flagged})` },
                { key: 'accepted', label: `Accepted (${counts.accepted})` },
                { key: 'rejected', label: `Rejected (${counts.rejected})` },
              ] as { key: FilterOption; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === key
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAccept={() => handleAccept(product.id)}
            onReject={() => handleReject(product.id)}
            onEdit={(edits) => handleEdit(product.id, edits)}
            onVerifyCogs={() => handleVerifyCogs(product.id)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No products match the current filter.</p>
        </div>
      )}

      {/* Publish Bar */}
      {counts.accepted > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 sm:px-8 z-50"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {counts.accepted - counts.unverifiedAccepted} of {counts.accepted} product{counts.accepted !== 1 ? 's' : ''} ready to publish
              </p>
              {counts.unverifiedAccepted > 0 && (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {counts.unverifiedAccepted} accepted product{counts.unverifiedAccepted !== 1 ? 's' : ''} need COGS verification
                </p>
              )}
              {counts.pending > 0 && counts.unverifiedAccepted === 0 && (
                <p className="text-xs text-gray-500">
                  {counts.pending} product{counts.pending !== 1 ? 's' : ''} still pending review
                </p>
              )}
            </div>
            <button
              onClick={handlePublish}
              disabled={isPublishing || counts.unverifiedAccepted > 0}
              title={counts.unverifiedAccepted > 0 ? 'Verify COGS on all accepted products first' : undefined}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
              {isPublishing ? 'Publishing...' : 'Publish to Storefront'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CatalogProductReview;
