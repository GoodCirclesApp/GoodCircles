import React, { useState, useEffect } from 'react';
import { Product, UserRole, FiscalPolicy, CartItem } from '../types';
import { getEffectiveRates } from '../utils/financeEngine';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { AffiliateProductCard, AffiliateListingData } from '../components/AffiliateProductCard';
import { UniversalSearch } from '../components/UniversalSearch';
import { MerchantStoriesSection } from '../components/MerchantStoriesSection';
import { motion, AnimatePresence } from 'framer-motion';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface Props {
  products: Product[];
  cart: CartItem[];
  effectiveRole: UserRole;
  selectedNonprofitName: string;
  onProductClick: (p: Product) => void;
  onShopperClick: () => void;
  regionName: string;
  policy: FiscalPolicy;
  pagination?: PaginationInfo;
  isLoading?: boolean;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
}

export const MarketplaceView: React.FC<Props> = ({
  products, cart, effectiveRole, selectedNonprofitName, onProductClick, onShopperClick,
  regionName, policy, pagination, isLoading, wishlistIds = [], onToggleWishlist,
}) => {
  const [affiliateListings, setAffiliateListings] = useState<AffiliateListingData[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/affiliate/listings')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAffiliateListings(data); })
      .catch(() => {});
  }, []);

  // Track newly-added cart item for pulse animation
  const prevCartRef = React.useRef<CartItem[]>([]);
  useEffect(() => {
    const prevIds = new Set(prevCartRef.current.map(c => c.product.id));
    const newItem = cart.find(c => !prevIds.has(c.product.id));
    if (newItem) {
      setRecentlyAdded(newItem.product.id);
      setTimeout(() => setRecentlyAdded(null), 800);
    }
    prevCartRef.current = cart;
  }, [cart]);

  const nonprofitAbbr = selectedNonprofitName
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0])
    .join('') || '♥';

  if (effectiveRole === 'PLATFORM') return null;

  return (
    <div className="space-y-8 sm:space-y-16 overflow-x-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-end gap-4 sm:gap-10">
        <div className="max-w-4xl w-full">
          <div className="flex flex-wrap items-center gap-3 mb-6">
             <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl border border-white/10 shadow-xl">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">{regionName} Economy</p>
             </div>
             <ConstitutionBadge label="Standard Discount" value={`${Math.round(policy.discountRate * 100)}%`} />
             <ConstitutionBadge label="Standard Donation" value={`${Math.round(policy.donationRate * 100)}%`} />
             <ConstitutionBadge label="Platform Fee" value={`${(policy.platformFeeRate * 100).toFixed(1)}%`} />
             {pagination && pagination.totalProducts > 0 && (
               <div className="px-4 py-2 bg-[#7851A9]/10 border border-[#7851A9]/20 rounded-xl">
                 <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">{pagination.totalProducts} Listings</span>
               </div>
             )}
          </div>
          <h2 className="text-4xl sm:text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Ethical Commerce.</h2>
          <p className="text-slate-500 text-base sm:text-2xl font-medium mt-4 sm:mt-8 leading-relaxed">
            Optimized discounts for you. High-integrity profit for <span className="text-black font-black">{selectedNonprofitName}</span>.
          </p>
          <div className="mt-6 sm:mt-8">
            <UniversalSearch
              onSelectProduct={p => onProductClick(p as any)}
              placeholder="Search local merchants, services, products…"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
           <button onClick={onShopperClick} className="bg-black text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl hover:bg-[#7851A9] transition-all">✨ AI Personal Shopper</button>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Node Location: {regionName}</p>
        </div>
      </div>

      <MerchantStoriesSection />

      {isLoading && products.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-[3rem] border border-[#CA9CE1]/20 overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-100" />
              <div className="p-3 sm:p-8 space-y-3">
                <div className="h-2 bg-slate-100 rounded-full w-1/3" />
                <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                <div className="h-6 bg-slate-100 rounded-full w-2/5 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
           <p className="text-slate-400 font-bold italic uppercase tracking-widest">No listings found in the {regionName} node.</p>
           <p className="text-slate-300 text-xs mt-2">Try bridging to another Metropolitan Statistical Area.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {products.map(p => {
              const rates = getEffectiveRates(p.category, policy);
              const cartItem = cart.find(item => item.product.id === p.id);
              const donationAmt = p.price * (1 - rates.discountRate) * rates.donationRate;
              const isWishlisted = wishlistIds.includes(p.id);
              const justAdded = recentlyAdded === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => onProductClick(p)}
                  className="group bg-white rounded-2xl sm:rounded-[3rem] border border-[#CA9CE1]/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer relative"
                >
                  <div className="relative">
                    <img
                      src={p.imageUrl}
                      className="w-full aspect-square object-cover"
                      alt={p.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop'; }}
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                      {/* Nonprofit impact badge (replaces generic "10% Reward") */}
                      <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-[#C2A76F]/30 shadow-sm flex items-center gap-1.5">
                        <span className="text-[#C2A76F]">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                          </svg>
                        </span>
                        <p className="text-[9px] font-black text-slate-700 uppercase">${donationAmt.toFixed(2)} → {nonprofitAbbr}</p>
                      </div>
                      {/* Cart badge */}
                      <AnimatePresence>
                        {cartItem && (
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: justAdded ? [1, 1.15, 1] : 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#7851A9] text-white px-2.5 py-1.5 rounded-xl shadow-lg"
                          >
                            <p className="text-[9px] font-black uppercase tracking-widest">{cartItem.quantity} In Basket</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Wishlist heart — shown on hover */}
                    {onToggleWishlist && (
                      <button
                        onClick={e => { e.stopPropagation(); onToggleWishlist(p.id); }}
                        className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md"
                        title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart
                          size={14}
                          className={`transition-colors duration-200 ${isWishlisted ? 'fill-[#A20021] text-[#A20021]' : 'text-slate-400'}`}
                        />
                      </button>
                    )}
                  </div>

                  <div className="p-3 sm:p-8">
                    <p className="text-[10px] sm:text-[10px] font-black text-[#7851A9] uppercase">{p.category}</p>
                    <h4
                      className="text-sm sm:text-lg font-black text-black mb-2 sm:mb-4 leading-tight"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {p.name}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-3xl font-black italic">{policy.symbol}{(p.price * (1 - rates.discountRate)).toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-slate-300 line-through">{policy.symbol}{p.price.toFixed(2)}</span>
                    </div>
                    {p.merchantName && (
                      <p className="text-[10px] text-slate-400 font-medium mt-3">by {p.merchantName}</p>
                    )}
                    {/* Glass-Box Pricing — reveals on hover */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex h-1.5 rounded-full overflow-hidden w-full">
                        <div className="bg-slate-800 transition-all duration-500" style={{ width: `${((1 - rates.discountRate) * (1 - rates.donationRate - rates.platformFeeRate)) * 100}%` }} />
                        <div className="bg-[#C2A76F]" style={{ width: `${(1 - rates.discountRate) * rates.donationRate * 100}%` }} />
                        <div className="bg-[#7851A9]" style={{ width: `${rates.discountRate * 100}%` }} />
                        <div className="bg-slate-200 flex-1" />
                      </div>
                      <div className="flex gap-3 mt-1.5 flex-wrap">
                        <span className="text-[8px] font-black uppercase tracking-wide text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 inline-block" />Merchant</span>
                        <span className="text-[8px] font-black uppercase tracking-wide text-[#C2A76F] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#C2A76F] inline-block" />{nonprofitAbbr}</span>
                        <span className="text-[8px] font-black uppercase tracking-wide text-[#7851A9] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#7851A9] inline-block" />Your Savings</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination {...pagination} />
          )}
        </>
      )}

      {/* Affiliate Partner Listings */}
      {affiliateListings.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100" />
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Also Available From Partners</p>
            </div>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <p className="text-center text-xs text-slate-400 font-medium -mt-2">
            External purchases generate affiliate commissions — 50% benefits our donor advised fund, 50% supports platform operations.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {affiliateListings.map(listing => (
              <AffiliateProductCard key={listing.id} listing={listing} currencySymbol={policy.symbol} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Pagination Component ─────────────────────────────
const Pagination: React.FC<PaginationInfo> = ({ currentPage, totalPages, totalProducts, pageSize, goToPage, nextPage, prevPage }) => {
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalProducts);

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Showing {startItem}–{endItem} of {totalProducts} listings
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-[#7851A9]/10 hover:text-[#7851A9]'
          }`}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, i) => (
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-300 font-bold">…</span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  page === currentPage ? 'bg-[#7851A9] text-white shadow-lg shadow-[#7851A9]/20' : 'text-slate-500 hover:bg-[#7851A9]/10 hover:text-[#7851A9]'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-[#7851A9]/10 hover:text-[#7851A9]'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const ConstitutionBadge = ({ label, value }: { label: string, value: string }) => (
  <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex gap-2">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}:</span>
    <span className="text-[10px] font-black text-black uppercase tracking-widest">{value}</span>
  </div>
);
