
import React from 'react';
import { Product } from '../types';
import { GC_DISCOUNT_RATE } from '../constants';
import { BrandSubmark } from './BrandAssets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
}

export const WishlistDrawer: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  wishlistIds, 
  products, 
  onAddToCart, 
  onRemoveFromWishlist 
}) => {
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));
  const potentialSavings = wishlistProducts.reduce((sum, p) => sum + (p.price * GC_DISCOUNT_RATE), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-[#CA9CE1]/30">
        <div className="p-10 border-b border-[#CA9CE1]/20 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#000000] tracking-tighter italic uppercase">Impact Wishlist.</h2>
            <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mt-2 font-accent">Preparing your future philanthropy</p>
          </div>
          <button onClick={onClose} className="p-4 text-slate-300 hover:text-[#000000] transition-colors bg-slate-50 rounded-2xl border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {wishlistProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
              <BrandSubmark size={120} color="#CA9CE1" className="opacity-20" />
              <p className="text-slate-400 font-bold text-lg">Your impact circle is open for new saved items.</p>
              <button onClick={onClose} className="text-[#7851A9] font-black text-[10px] uppercase tracking-[0.2em] hover:underline font-accent">Return to Catalog</button>
            </div>
          ) : (
            <>
              <div className="bg-[#A20021]/5 p-10 rounded-[3rem] border border-[#A20021]/10 mb-8 relative overflow-hidden group">
                <p className="text-[10px] font-black text-[#A20021] uppercase tracking-[0.2em] mb-2 font-accent">Reserved Community Savings</p>
                <p className="text-5xl font-black text-[#A20021] tracking-tighter group-hover:scale-105 transition-transform">${potentialSavings.toFixed(2)}</p>
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <BrandSubmark size={48} color="#A20021" />
                </div>
              </div>
              
              <div className="space-y-6">
                {wishlistProducts.map(product => (
                  <div key={product.id} className="flex gap-8 bg-white p-8 rounded-[3rem] border border-[#CA9CE1]/20 group transition-all hover:border-[#7851A9] hover:shadow-xl shadow-sm">
                    <img src={product.imageUrl} className="w-24 h-24 rounded-3xl object-cover shadow-md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-[#000000] truncate text-xl leading-tight tracking-tight">{product.name}</h4>
                        <button onClick={() => onRemoveFromWishlist(product.id)} className="text-slate-300 hover:text-[#A20021] transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mt-2 font-accent">{product.category}</p>
                      <div className="flex items-center justify-between mt-6">
                        <p className="text-2xl font-black text-[#000000] tracking-tighter">${(product.price * (1 - GC_DISCOUNT_RATE)).toFixed(2)}</p>
                        <button 
                          onClick={() => { onAddToCart(product); onRemoveFromWishlist(product.id); }}
                          className="bg-[#000000] text-white font-black px-6 py-3 rounded-2xl text-[9px] uppercase tracking-[0.2em] hover:bg-[#7851A9] transition-all"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
