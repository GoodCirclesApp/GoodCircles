import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ExternalLink, ShoppingBag, MapPin, Tag,
  Loader2, Store, ChevronRight, AlertCircle, SlidersHorizontal
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InternalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  cogs: number;
  type: 'PRODUCT' | 'SERVICE';
  category: string;
  resultType: 'INTERNAL';
  merchant: {
    id: string;
    businessName: string;
    isVerified: boolean;
    regionId: string | null;
  };
}

interface AffiliateProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  affiliateUrl: string;
  category: string;
  resultType: 'AFFILIATE';
  program: {
    name: string;
    platform: string;
    logoUrl: string | null;
  };
}

interface SearchResults {
  query: string;
  internal: InternalProduct[];
  affiliate: AffiliateProduct[];
  totals: { internal: number; affiliate: number; combined: number };
}

interface Props {
  onSelectProduct?: (product: InternalProduct) => void;
  placeholder?: string;
  className?: string;
}

const CATEGORIES = [
  'All', 'Dining', 'Groceries', 'Home Maintenance', 'Professional Services',
  'Health & Pharmacy', 'Fitness', 'Transportation', 'Entertainment',
  'Education', 'Wellness', 'Retail',
];

// ─── Component ────────────────────────────────────────────────────────────────

export const UniversalSearch: React.FC<Props> = ({
  onSelectProduct,
  placeholder = 'Search for anything — food, services, products…',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const doSearch = useCallback(async (q: string, cat: string, min: string, max: string) => {
    if (!q.trim()) { setResults(null); return; }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q });
      if (cat && cat !== 'All') params.set('category', cat);
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);

      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data: SearchResults = await res.json();
      setResults(data);
    } catch (err: any) {
      setError('Could not load results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val, selectedCategory, minPrice, maxPrice), 320);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    doSearch(query, cat, minPrice, maxPrice);
  };

  const handleFilterApply = () => {
    doSearch(query, selectedCategory, minPrice, maxPrice);
    setShowFilters(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectInternal = (p: InternalProduct) => {
    onSelectProduct?.(p);
    setIsOpen(false);
  };

  const handleAffiliateClick = async (listing: AffiliateProduct) => {
    try {
      const token = localStorage.getItem('gc_auth_token');
      if (token) {
        await fetch(`/api/affiliate/click/${listing.id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* non-blocking */ }
    window.open(listing.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const hasResults = results && (results.internal.length > 0 || results.affiliate.length > 0);
  const noResults = results && results.totals.combined === 0 && query.trim();

  return (
    <div ref={panelRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 transition-all shadow-sm ${isOpen ? 'border-[#7851A9] shadow-[#7851A9]/15 shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}>
        {isLoading
          ? <Loader2 size={18} className="text-[#7851A9] animate-spin shrink-0" />
          : <Search size={18} className="text-slate-400 shrink-0" />}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowFilters(f => !f); setIsOpen(true); }}
            className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-[#7851A9]/10 text-[#7851A9]' : 'text-slate-400 hover:text-slate-600'}`}
            title="Filters"
          >
            <SlidersHorizontal size={15} />
          </button>
          {query && (
            <button onClick={handleClear} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={15} />
            </button>
          )}
          <span className="hidden sm:block text-[10px] text-slate-300 font-mono border border-slate-200 px-1.5 py-0.5 rounded">⌘K</span>
        </div>
      </div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (query.trim() || showFilters) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
            style={{ maxHeight: '80vh' }}
          >
            {/* Filters Panel */}
            {showFilters && (
              <div className="border-b border-slate-100 p-4 bg-slate-50/60">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filters</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${selectedCategory === cat ? 'bg-[#7851A9] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#7851A9]/40'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min $"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-24 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#7851A9]"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max $"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-24 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#7851A9]"
                  />
                  <button
                    onClick={handleFilterApply}
                    className="px-4 py-1.5 bg-[#7851A9] text-white text-xs font-bold rounded-xl hover:bg-[#6841A0] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="overflow-y-auto" style={{ maxHeight: showFilters ? '50vh' : '70vh' }}>
              {error && (
                <div className="flex items-center gap-2 p-4 text-red-600 text-sm">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              {isLoading && !results && (
                <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Searching…
                </div>
              )}

              {noResults && (
                <div className="py-10 text-center">
                  <p className="text-slate-500 text-sm font-medium">No results for "{query}"</p>
                  <p className="text-slate-400 text-xs mt-1">Try a different word or category</p>
                </div>
              )}

              {/* Internal Results */}
              {results && results.internal.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                    <Store size={13} className="text-[#7851A9]" />
                    <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">
                      Local Merchants — {results.totals.internal} result{results.totals.internal !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 h-px bg-[#7851A9]/15 ml-1" />
                  </div>
                  <div className="divide-y divide-slate-50">
                    {results.internal.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectInternal(p)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#7851A9]/10 flex items-center justify-center shrink-0">
                          <ShoppingBag size={16} className="text-[#7851A9]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin size={9} />
                              {p.merchant.businessName}
                            </span>
                            <span className="text-[10px] text-slate-300">·</span>
                            <span className="text-[10px] text-slate-400">
                              <Tag size={9} className="inline mr-0.5" />
                              {p.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-slate-800">${p.price.toFixed(2)}</p>
                          <p className="text-[9px] text-emerald-600 font-bold">Save ${(p.price * 0.10).toFixed(2)}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-[#7851A9] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                  {results.totals.internal > results.internal.length && (
                    <p className="text-[10px] text-slate-400 text-center py-2 border-t border-slate-50">
                      +{results.totals.internal - results.internal.length} more local results
                    </p>
                  )}
                </div>
              )}

              {/* Affiliate Results */}
              {results && results.affiliate.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                    <ExternalLink size={13} className="text-amber-500" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                      External Partners — {results.totals.affiliate} result{results.totals.affiliate !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 h-px bg-amber-100 ml-1" />
                    <span className="text-[9px] text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                      Commission supports nonprofits
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {results.affiliate.map(a => (
                      <button
                        key={a.id}
                        onClick={() => handleAffiliateClick(a)}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-amber-50/40 transition-colors text-left group"
                      >
                        {a.imageUrl
                          ? <img src={a.imageUrl} alt={a.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100" />
                          : (
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                              <ExternalLink size={14} className="text-amber-400" />
                            </div>
                          )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{a.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-amber-600 font-semibold">{a.program.name}</span>
                            <span className="text-[10px] text-slate-300">·</span>
                            <span className="text-[10px] text-slate-400">{a.category}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-slate-800">${a.price.toFixed(2)}</p>
                          <p className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5 justify-end">
                            <ExternalLink size={8} /> Shop externally
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer hint */}
              {hasResults && (
                <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">
                    Local products save you 10% and fund local nonprofits directly.
                  </p>
                  <p className="text-[10px] text-slate-300">Esc to close</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
