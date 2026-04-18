
import React from 'react';
import { Product, Nonprofit, CartItem } from '../types';
import { BrandSubmark } from '../components/BrandAssets';

interface Props {
  nonprofits: Nonprofit[];
  allProducts: Product[];
  cart: CartItem[];
  onFulfill: (product: Product, nonprofit: Nonprofit) => void;
}

export const CommunityNeedsView: React.FC<Props> = ({ nonprofits, allProducts, cart, onFulfill }) => {
  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-2 h-2 rounded-full bg-[#A20021] animate-ping"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A20021] font-accent">Direct Asset Funding Active</p>
        </div>
        <h2 className="text-3xl sm:text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Community Needs.</h2>
        <p className="text-slate-500 text-base sm:text-2xl font-medium mt-4 sm:mt-8">Fund specific assets directly for nonprofits. 100% transparent delivery.</p>
      </header>

      {nonprofits.every(np => !allProducts.some(p => np.wishlistProductIds?.includes(p.id))) && (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <div>
            <p className="text-xl font-black italic uppercase tracking-tighter text-slate-800">No Active Needs</p>
            <p className="text-sm text-slate-400 font-medium mt-2 max-w-sm">Local nonprofits haven't published any resource requests yet. Check back soon.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {nonprofits.map(np => {
          const wishlist = allProducts.filter(p => np.wishlistProductIds?.includes(p.id));
          if (wishlist.length === 0) return null;

          return (
            <section key={np.id} className="bg-white rounded-2xl sm:rounded-[4rem] border border-[#CA9CE1]/20 p-4 sm:p-12 md:p-16 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="flex items-center gap-6">
                  <img src={np.logoUrl} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
                  <div>
                    <h3 className="text-xl sm:text-3xl font-black italic tracking-tighter uppercase">{np.name}</h3>
                    <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest font-accent">Current Resource Gaps</p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Requests</p>
                  <p className="text-xl font-black italic">{wishlist.length} Assets</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  return (
                    <div key={product.id} className="group bg-slate-50 rounded-2xl sm:rounded-[3rem] border border-slate-100 p-4 sm:p-8 hover:bg-white hover:border-[#7851A9]/30 transition-all hover:shadow-xl relative">
                      <div className="relative mb-6">
                        <img src={product.imageUrl} className="w-full aspect-square rounded-[2rem] object-cover shadow-md" />
                        {cartItem && (
                          <div className="absolute top-4 right-4 bg-[#A20021] text-white px-3 py-1.5 rounded-xl shadow-lg animate-in zoom-in">
                            <p className="text-[10px] font-black uppercase tracking-widest">{cartItem.quantity} In Basket</p>
                          </div>
                        )}
                      </div>
                      <h4 className="text-xl font-black text-black truncate mb-2">{product.name}</h4>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 italic">"{product.description}"</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Goal</p>
                        <p className="text-2xl font-black italic">${product.price.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => onFulfill(product, np)}
                        className="bg-black text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-[#A20021] transition-all shadow-lg active:scale-95"
                      >
                        Fulfill Need
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  </div>
);
};
