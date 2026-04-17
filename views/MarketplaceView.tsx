import React, { useState, useEffect } from 'react';
import { Product, UserRole, FiscalPolicy, CartItem } from '../types';
import { getEffectiveRates } from '../utils/financeEngine';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AffiliateProductCard, AffiliateListingData } from '../components/AffiliateProductCard';
import { UniversalSearch } from '../components/UniversalSearch';

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
}

export const MarketplaceView: React.FC<Props> = ({ products, cart, effectiveRole, selectedNonprofitName, onProductClick, onShopperClick, regionName, policy, pagination }) => {
  const [affiliateListings, setAffiliateListings] = useState<AffiliateListingData[]>([]);

  useEffect(() => {
    fetch('/api/affiliate/listings')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAffiliateListings(data); })
      .catch(() => {});
  }, []);

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
                 <span className="text-[8px] font-black text-[#7851A9] uppercase tracking-widest">{pagination.totalProducts} Listings</span>
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
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Node Location: {regionName}</p>
        </div>
      </div>
      
      {products.length === 0 ? (
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
              return (
                <div key={p.id} onClick={() => onProductClick(p)} className="group bg-white rounded-2xl sm:rounded-[3rem] border border-[#CA9CE1]/20 overflow-hidden hover:shadow-2xl transition-all cursor-pointer relative">
                  <div className="relative">
                    <img src={p.imageUrl} className="w-full aspect-square object-cover" alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop'; }} />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                         <p className="text-[8px] font-black text-[#7851A9] uppercase">{rates.discountRate * 100}% Reward</p>
                      </div>
                      {cartItem && (
                        <div className="bg-[#7851A9] text-white px-3 py-1.5 rounded-xl shadow-lg animate-in zoom-in">
                          <p className="text-[8px] font-black uppercase tracking-widest">{cartItem.quantity} In Basket</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 sm:p-8">
                    <p className="text-[8px] sm:text-[10px] font-black text-[#7851A9] uppercase">{p.category}</p>
                    <h4 className="text-sm sm:text-lg font-black text-black mb-2 sm:mb-4 leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-3xl font-black italic">{policy.symbol}{(p.price * (1 - rates.discountRate)).toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-slate-300 line-through">{policy.symbol}{p.price.toFixed(2)}</span>
                    </div>
                    {p.merchantName && (
                      <p className="text-[10px] text-slate-400 font-medium mt-3">by {p.merchantName}</p>
                    )}
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
  // Calculate which page numbers to show
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) pages.push('...');
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalProducts);

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      {/* Page info */}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Showing {startItem}–{endItem} of {totalProducts} listings
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-[#7851A9]/10 hover:text-[#7851A9]'
          }`}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, i) => (
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-300 font-bold">…</span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  page === currentPage
                    ? 'bg-[#7851A9] text-white shadow-lg shadow-[#7851A9]/20'
                    : 'text-slate-500 hover:bg-[#7851A9]/10 hover:text-[#7851A9]'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-[#7851A9]/10 hover:text-[#7851A9]'
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
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}:</span>
    <span className="text-[8px] font-black text-black uppercase tracking-widest">{value}</span>
  </div>
);
