
import React, { useState, useEffect } from 'react';
import { Order, Nonprofit } from '../types';
import { BrandLogo, BrandSubmark } from './BrandAssets';
import { generateInvoiceNarrative } from '../services/geminiService';

interface Props {
  order: Order;
  nonprofit: Nonprofit;
  onClose: () => void;
}

export const ImpactInvoice: React.FC<Props> = ({ order, nonprofit, onClose }) => {
  const [narrative, setNarrative] = useState<string>('Generating impact narrative...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNarrative() {
      const text = await generateInvoiceNarrative(order, nonprofit);
      setNarrative(text);
      setLoading(false);
    }
    fetchNarrative();
  }, [order, nonprofit]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-full overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
        
        {/* Invoice Body */}
        <div className="p-12 md:p-16 space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <BrandLogo variant="BLACK" size="240px" className="transform -translate-x-1" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Impact Certificate</p>
              <p className="text-lg font-black tracking-widest text-black">#{order.id?.slice(-8).toUpperCase() || 'N/A'}</p>
              <p className="text-xs font-bold text-slate-500 mt-1">{new Date(order.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>

          {/* AI Narrative Section */}
          <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mb-4 font-accent">Impact Statement</p>
               <p className={`text-xl md:text-2xl font-black italic tracking-tighter leading-tight ${loading ? 'animate-pulse text-slate-300' : 'text-slate-900'}`}>
                 "{narrative}"
               </p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BrandSubmark size={64} color="#000" />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Settlement Details</h4>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-black">{item.product.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity} | Merchant: {item.product.merchantName}</p>
                </div>
                <p className="text-sm font-black tracking-tight">${(item.product.price * (order.isDiscountWaived ? 1 : 0.9) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Calculation Summary */}
          <div className="pt-8 border-t border-slate-100 space-y-4">
            <SummaryRow label="Gross Market Total" value={`$${order.totalMsrp.toFixed(2)}`} />
            {order.isDiscountWaived ? (
              <SummaryRow label="10% Circle Discount" value="WAIVED (Contributed to Community)" color="text-emerald-500" />
            ) : (
              <SummaryRow label="10% Circle Discount" value={`-$${order.totalDiscount.toFixed(2)}`} color="text-[#A20021]" />
            )}
            <SummaryRow label="Tax (8.25%)" value={`$${order.tax.toFixed(2)}`} />
            {order.cardFee > 0 && <SummaryRow label="Card Processing Surcharge (3%)" value={`$${order.cardFee.toFixed(2)}`} />}
            {order.internalFee > 0 && <SummaryRow label="Internal Maintenance Fee (0.5%)" value={`$${order.internalFee.toFixed(2)}`} color="text-[#C2A76F]" />}
            <div className="flex justify-between items-center pt-6 mt-2 border-t-2 border-black">
               <p className="text-xl font-black uppercase tracking-widest italic">Net Amount Paid</p>
               <p className="text-4xl font-black tracking-tighter italic">${order.totalPaid.toFixed(2)}</p>
            </div>
          </div>

          {/* The 10/10/1 Transparency Pillar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
             <ImpactBox 
               label="Community Contribution" 
               value={`$${order.accounting.donationAmount.toFixed(2)}`} 
               desc={order.isDiscountWaived 
                 ? `Includes your waived 10% discount, funding community initiatives via ${nonprofit.name}.`
                 : `10% of profit directly funds community initiatives at ${nonprofit.name}.`}
               color="text-[#7851A9]"
             />
             <ImpactBox 
               label="Community Wealth Retained" 
               value={`$${order.accounting.feesSaved.toFixed(2)}`} 
               desc="Capital recaptured from external bank networks back into the circle."
               color="text-emerald-500"
             />
          </div>

          {/* Footer / Verification */}
          <div className="pt-12 flex flex-col items-center text-center space-y-8">
             <div className="bg-slate-50 px-10 py-4 rounded-2xl inline-block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Immutable Verification Hash</p>
                <p className="text-[10px] font-mono font-bold tracking-widest text-slate-900">GC-SETTLE-${order.id?.toUpperCase() || 'N/A'}</p>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all"
                >
                  Print / Save PDF
                </button>
                <button 
                  onClick={onClose}
                  className="bg-slate-100 text-slate-500 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Close Document
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, color = "text-slate-500" }: { label: string, value: string, color?: string }) => (
  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
    <p className="text-slate-400">{label}</p>
    <p className={color}>{value}</p>
  </div>
);

const ImpactBox = ({ label, value, desc, color }: { label: string, value: string, desc: string, color: string }) => (
  <div className="p-8 border border-slate-100 rounded-[2rem] space-y-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</p>
    <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase">{desc}</p>
  </div>
);
