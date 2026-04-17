
import React from 'react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onUpdateProduct: (p: Product) => void;
}

export const ComplianceAudit: React.FC<Props> = ({ products, onUpdateProduct }) => {
  const suspiciousProducts = products.filter(p => p.cogsAuditStatus === 'SUSPICIOUS' || p.msrpAuditStatus === 'FLAGGED');

  const handleFreeze = (product: Product) => {
    onUpdateProduct({
      ...product,
      // Fix: 'REJECTED' is now assignable as cogsAuditStatus because types.ts was updated to include this value
      cogsAuditStatus: 'REJECTED' // This removes it from Neighbor views immediately
    });
    alert(`Asset "${product.name}" has been frozen from the active marketplace pending manual review.`);
  };

  return (
    <div className="bg-white rounded-[4rem] p-12 border border-[#A20021]/20 shadow-sm space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">AI Integrity Exceptions</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Real-time heuristics monitoring for MSRP hiking and COGS profit-hiding.</p>
        </div>
        <span className="bg-red-50 text-red-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Active Audit Flags: {suspiciousProducts.length}</span>
      </div>
      <div className="space-y-6">
        {suspiciousProducts.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-400 font-bold italic">System Integrity Verified. No exceptions found.</p>
          </div>
        ) : (
          suspiciousProducts.map(p => (
            <div key={p.id} className="p-10 bg-red-50/30 border border-red-100 rounded-[3rem] flex items-center justify-between group hover:bg-red-50 transition-all shadow-sm">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <img src={p.imageUrl} className="w-24 h-24 rounded-[2.5rem] object-cover grayscale group-hover:grayscale-0 transition-all shadow-md" />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">{p.name}</h4>
                  <p className="text-slate-500 font-medium text-xs">Merchant Entity: <span className="text-black font-black">{p.merchantName}</span></p>
                  <div className="flex gap-4 mt-6">
                    {p.cogsAuditStatus === 'SUSPICIOUS' && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">Suspicious COGS Pattern</div>
                    )}
                    {p.msrpAuditStatus === 'FLAGGED' && (
                      <div className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">MSRP Market Anomaly</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-accent">Calculated Net Margin</p>
                   <p className="text-3xl font-black text-red-500 italic leading-none">{(((p.price * 0.9 - p.cogs) / (p.price * 0.9)) * 100).toFixed(1)}%</p>
                </div>
                <button 
                  onClick={() => handleFreeze(p)}
                  className="bg-black text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl active:scale-95"
                >
                  Freeze Asset Listing
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
