import React, { useState } from 'react';
import { ExternalLink, ShoppingBag } from 'lucide-react';

export interface AffiliateListingData {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  category: string;
  affiliateUrl: string;
  program: {
    name: string;
    platform: string;
    logoUrl?: string | null;
  };
}

interface Props {
  listing: AffiliateListingData;
  currencySymbol?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  AMAZON:  'bg-amber-50 text-amber-700 border-amber-200',
  ETSY:    'bg-orange-50 text-orange-700 border-orange-200',
  CUSTOM:  'bg-slate-50 text-slate-600 border-slate-200',
};

export const AffiliateProductCard: React.FC<Props> = ({ listing, currencySymbol = '$' }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    setClicked(true);
    try {
      const token = localStorage.getItem('gc_access_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/affiliate/click/${listing.id}`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      window.open(data.affiliateUrl ?? listing.affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(listing.affiliateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setClicked(false);
    }
  };

  const colorClass = PLATFORM_COLORS[listing.program.platform] ?? PLATFORM_COLORS.CUSTOM;
  const price = Number(listing.price);

  return (
    <div className="group bg-white rounded-2xl sm:rounded-[3rem] border border-amber-100 overflow-hidden hover:shadow-2xl transition-all relative flex flex-col">
      {/* Affiliate badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${colorClass}`}>
          <ExternalLink size={9} />
          {listing.program.name}
        </span>
      </div>

      {/* Image */}
      <div className="relative">
        <img
          src={listing.imageUrl ?? 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop'}
          className="w-full aspect-square object-cover"
          alt={listing.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop';
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <p className="text-[8px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest">{listing.category}</p>
        <h4
          className="text-sm sm:text-base font-black text-black mb-2 leading-tight mt-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {listing.title}
        </h4>

        <div className="flex items-baseline gap-2 mt-auto mb-4">
          <span className="text-lg sm:text-2xl font-black italic text-black">
            {currencySymbol}{price.toFixed(2)}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">est. retail</span>
        </div>

        <button
          onClick={handleClick}
          disabled={clicked}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all"
        >
          <ShoppingBag size={12} />
          {clicked ? 'Opening...' : `Shop on ${listing.program.name}`}
          <ExternalLink size={10} />
        </button>
      </div>
    </div>
  );
};
