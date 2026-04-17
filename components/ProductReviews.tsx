
import React, { useState } from 'react';
import { Product, Review } from '../types';
import { moderateReview } from '../services/geminiService';
import { BrandSubmark } from './BrandAssets';

interface Props {
  product: Product;
  reviews: Review[];
  onAddReview: (review: Review) => void;
  canReview: boolean;
}

const BRAND_RED = '#A20021';
const BRAND_PURPLE = '#7851A9';
const BRAND_GOLD = '#C2A76F';

export const ProductReviews: React.FC<Props> = ({ product, reviews, onAddReview, canReview }) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productReviews = reviews.filter(r => r.productId === product.id && r.status === 'APPROVED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const moderation = await moderateReview(text);

    if (moderation.approved) {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId: product.id,
        neighborId: 'neighbor-1',
        rating,
        text,
        date: new Date().toISOString(),
        status: 'APPROVED'
      };
      onAddReview(newReview);
      setText('');
      setRating(5);
      setShowForm(false);
    } else {
      setError(moderation.reason || "This review does not align with our sophisticated community standards.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-12 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#CA9CE1]/20 pb-4">
        <h4 className="text-2xl font-black text-black tracking-tighter italic uppercase">Community Insights ({productReviews.length})</h4>
        {canReview && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="text-[#7851A9] font-black text-[10px] uppercase tracking-[0.2em] hover:text-black transition-colors font-accent"
          >
            Record Your Experience
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#CA9CE1]/5 p-10 rounded-[3rem] border border-[#CA9CE1]/20 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-accent">Impact Satisfaction</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform active:scale-90 ${star <= rating ? 'text-[#C2A76F]' : 'text-slate-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <BrandSubmark size={40} color={BRAND_PURPLE} />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-accent">Narrative Statement</label>
            <textarea
              className="w-full px-6 py-5 border border-[#CA9CE1]/20 rounded-2xl bg-white placeholder-slate-400 text-sm font-medium focus:ring-4 focus:ring-[#7851A9]/10 outline-none min-h-[120px] transition-all"
              placeholder="Describe the utility and community impact of this purchase..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="text-[#A20021] text-[10px] font-black uppercase tracking-widest bg-[#A20021]/10 px-4 py-2 rounded-xl">{error}</p>}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-black text-white font-black px-10 py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-50 hover:bg-[#7851A9] transition-all"
            >
              {isSubmitting ? 'Verifying Integrity...' : 'Publish Insight'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] px-6 font-accent"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {productReviews.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-[3rem] border border-[#CA9CE1]/10">
            <p className="text-slate-400 text-sm font-bold italic">No certified insights recorded yet. Lead the conversation.</p>
          </div>
        ) : (
          productReviews.map(rev => (
            <div key={rev.id} className="p-10 bg-white border border-[#CA9CE1]/10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all border-l-8 border-l-[#7851A9] group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-lg ${star <= rev.rating ? 'text-[#C2A76F]' : 'text-slate-100'}`}>★</span>
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-accent">{new Date(rev.date).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-700 text-lg font-medium leading-relaxed mb-6">{rev.text}</p>
              <div className="flex items-center gap-3">
                 <div className="w-5 h-5 flex items-center justify-center text-[#A20021]">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" /></svg>
                 </div>
                 <p className="text-[10px] font-black text-[#A20021] uppercase tracking-[0.3em] font-accent">Verified Impact Member</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
