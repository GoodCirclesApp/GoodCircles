
import React, { useMemo, useState, useEffect } from 'react';
import { Product, Review, Order } from '../types';
import { ProductReviews } from './ProductReviews';
import { GC_DISCOUNT_RATE } from '../constants';
import { BrandSubmark } from './BrandAssets';
import { format, addDays } from 'date-fns';

interface Props {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onAddToWishlist: (productId: string) => void;
  reviews: Review[];
  onAddReview: (review: Review) => void;
  orders: Order[];
}

export const ProductDetailModal: React.FC<Props> = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onAddToWishlist,
  reviews,
  onAddReview,
  orders
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (product?.type === 'SERVICE' && selectedDate) {
      fetch(`/api/marketplace/listings/${product.id}/availability?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setAvailableSlots(data.availableSlots || []);
          setSelectedSlot(null);
        })
        .catch(err => console.error('Failed to fetch availability:', err));
    }
  }, [product?.id, product?.type, selectedDate]);

  const handleBook = async () => {
    if (!product || !selectedSlot) return;
    setIsBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: product.id,
          scheduledDate: selectedDate,
          scheduledTime: selectedSlot,
          durationMinutes: 60, // Default duration
        }),
      });
      if (response.ok) {
        alert('Booking request sent! The merchant will confirm shortly.');
        onClose();
      } else {
        const error = await response.json();
        alert(`Booking failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while booking.');
    } finally {
      setIsBooking(false);
    }
  };

  // Safeguard #5: Verified Purchase Enforcement
  // Check if neighbor-1 (mock user) has a settled order for this product
  const hasPurchased = useMemo(() => {
    if (!product) return false;
    return orders.some(order => 
      order.neighborId === 'neighbor-1' && 
      order.items.some(item => item.product.id === product.id)
    );
  }, [orders, product?.id]);

  if (!product) return null;

  const discountedPrice = product.price * (1 - GC_DISCOUNT_RATE);

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-full sm:h-[90vh] rounded-none sm:rounded-[4rem] flex flex-col lg:flex-row overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* Visual Gallery */}
        <div className="lg:w-1/2 bg-slate-100 relative">
          <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
          <button 
            onClick={onClose} 
            className="absolute top-8 left-8 p-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white transition-all border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        {/* Info & Reviews */}
        <div className="lg:w-1/2 flex flex-col h-full bg-white">
          <div className="p-5 sm:p-12 overflow-y-auto flex-1 space-y-6 sm:space-y-10 custom-scrollbar">
            <header>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-[#CA9CE1]/10 text-[#7851A9] text-[9px] font-black uppercase tracking-widest rounded-full">{product.category}</span>
                <span className="px-4 py-1.5 bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full">Merchant: {product.merchantName}</span>
                <span className="px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">{product.type}</span>
              </div>
              <h2 className="text-5xl font-black text-black tracking-tighter leading-tight italic uppercase mb-6">{product.name}</h2>
              <div className="flex items-baseline gap-6 mb-8">
                <span className="text-5xl font-black text-black tracking-tighter">${discountedPrice.toFixed(2)}</span>
                <span className="text-xl text-slate-300 line-through font-bold">${product.price.toFixed(2)}</span>
                <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest bg-[#7851A9]/5 px-3 py-1 rounded-lg">-10% Circle Reward</span>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">{product.description}</p>
            </header>

            {product.type === 'PRODUCT' ? (
              <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Quantity</p>
                <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-6 py-3 hover:bg-slate-50 text-slate-400 font-black text-xl transition-colors"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) setQuantity(Math.max(1, val));
                    }}
                    className="w-20 py-3 text-lg font-black border-x border-slate-200 text-center outline-none focus:bg-slate-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-6 py-3 hover:bg-slate-50 text-slate-400 font-black text-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 p-5 sm:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Date</p>
                  <input 
                    type="date" 
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Slots</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableSlots.length > 0 ? (
                      availableSlots.map(slot => (
                        <button 
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSlot === slot ? 'bg-[#7851A9] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:border-[#7851A9]'}`}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-3 text-[10px] text-slate-400 font-bold italic py-4 text-center">No slots available for this date.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 sticky bottom-0 bg-white pt-4 sm:pt-0 border-t border-slate-100 sm:border-0 -mx-5 px-5 sm:mx-0 sm:px-0 pb-4 sm:pb-0">
              {product.type === 'PRODUCT' ? (
                <button 
                  onClick={() => { onAddToCart(product, quantity); onClose(); }}
                  className="bg-black text-white font-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-[10px] uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl"
                >
                  Add {quantity} to Basket
                </button>
              ) : (
                <button 
                  onClick={handleBook}
                  disabled={!selectedSlot || isBooking}
                  className="bg-black text-white font-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-[10px] uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl disabled:opacity-50"
                >
                  {isBooking ? 'Booking...' : 'Request Booking'}
                </button>
              )}
              <button 
                onClick={() => onAddToWishlist(product.id)}
                className="bg-white border-2 border-slate-200 text-slate-400 font-black py-5 rounded-3xl text-[10px] uppercase tracking-widest hover:border-[#7851A9] hover:text-[#7851A9] transition-all"
              >
                Save to Wishlist
              </button>
            </div>

            <ProductReviews product={product} reviews={reviews} onAddReview={onAddReview} canReview={hasPurchased} />
          </div>

          <footer className="p-10 border-t border-[#CA9CE1]/20 bg-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <BrandSubmark size={40} color="#7851A9" />
               <div>
                 <p className="text-[8px] font-black text-[#7851A9] uppercase tracking-widest">Impact Certified Listing</p>
                 <p className="text-[10px] font-black text-black">10% Profit Disbursed to Community</p>
               </div>
             </div>
             <button onClick={onClose} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-black">Close Details</button>
          </footer>
        </div>
      </div>
    </div>
  );
};
