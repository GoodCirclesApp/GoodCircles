
import React, { useState } from 'react';
import { Product, User } from '../types';
import { PRODUCT_CATEGORIES } from '../constants';
import { auditMSRP, benchmarkCOGS } from '../services/aiAuditService';
import { BrandSubmark } from './BrandAssets';

interface Props {
  merchant: User;
  products: Product[];
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const MerchantProductManager: React.FC<Props> = ({ merchant, products, onAddProduct, onDeleteProduct }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cogs: '',
    category: PRODUCT_CATEGORIES[0],
    type: 'PRODUCT' as const,
    imageUrl: 'https://picsum.photos/seed/product/400/400'
  });

  const merchantProducts = products.filter(p => p.merchantId === merchant.id || p.merchantName === merchant.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const price = parseFloat(formData.price);
    const cogs = parseFloat(formData.cogs);

    // AI Audit Sequence
    const [msrpAudit, cogsAudit] = await Promise.all([
      auditMSRP(formData.name, formData.category, price),
      benchmarkCOGS(formData.name, formData.category, cogs, price * 0.9)
    ]);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price,
      cogs,
      category: formData.category,
      type: formData.type as any,
      merchantId: merchant.id,
      merchantName: merchant.name,
      imageUrl: formData.imageUrl,
      msrpAuditStatus: msrpAudit.status,
      cogsAuditStatus: cogsAudit.status
    };

    onAddProduct(newProduct);
    setIsLoading(false);
    setIsAdding(false);
    setFormData({ name: '', description: '', price: '', cogs: '', category: PRODUCT_CATEGORIES[0], type: 'PRODUCT', imageUrl: 'https://picsum.photos/seed/product/400/400' });
    
    if (msrpAudit.status === 'FLAGGED') {
      alert("Note: Price Sentinel has flagged this MSRP as high compared to market averages. A Governance review may be triggered.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">My Marketplace Assets</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Manage your active listings and verify their 10/10/1 integrity.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-xl transition-all"
        >
          Create New Listing
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-[4rem] p-12 md:p-16 space-y-8 shadow-2xl animate-in zoom-in border border-[#CA9CE1]/20">
            <header className="flex justify-between items-start">
               <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">New Asset Node.</h3>
                  <p className="text-slate-400 text-xs font-medium">Assets are audited by Sentinel AI for MSRP/COGS transparency.</p>
               </div>
               <button type="button" onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-black transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InputBlock label="Product Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. Artisanal Espresso" />
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Market Taxonomy</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                  >
                     {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Asset Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                  >
                     <option value="PRODUCT">PHYSICAL PRODUCT</option>
                     <option value="SERVICE">SERVICE / BOOKING</option>
                  </select>
               </div>
               <InputBlock label="MSRP ($)" type="number" value={formData.price} onChange={v => setFormData({...formData, price: v})} placeholder="0.00" />
               <InputBlock label="Cost of Goods (COGS)" type="number" value={formData.cogs} onChange={v => setFormData({...formData, cogs: v})} placeholder="0.00" />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Listing Narrative</label>
               <textarea 
                required 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3} 
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium outline-none" 
                placeholder="Explain the utility of this asset..."
               />
            </div>

            <div className="p-6 bg-[#7851A9]/5 rounded-3xl border border-[#7851A9]/10 flex gap-4 items-center">
               <div className="text-emerald-600 animate-pulse"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 .3l7.834 4.6a1 1 0 01.5 1.175l-1.3 4.1a1.01 1.01 0 01-.01.03l-1.6 5.1a1 1 0 01-1.56.59l-3.36-2.52-3.36 2.52a1 1 0 01-1.56-.59l-1.6-5.1-.01-.03-1.3-4.1a1 1 0 01.5-1.175zM10 12.333l2.84 2.13 1.16-3.7L10 8.167l-3.999 2.6 1.16 3.7L10 12.333z" /></svg></div>
               <p className="text-[9px] font-black text-[#7851A9] uppercase leading-relaxed italic">
                 Sentinel Audit Active: Your MSRP will be benchmarked against global metropolitan averages.
               </p>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all"
            >
              {isLoading ? 'Verifying Integrity Hash...' : 'Deploy Asset Listing'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {merchantProducts.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
            <p className="text-slate-400 font-bold italic">No active asset nodes. Start your first 10/10/1 listing.</p>
          </div>
        ) : (
          merchantProducts.map(p => {
            const salePrice = p.price * 0.9;
            const netProfit = salePrice - p.cogs;
            const impact = netProfit * 0.1;
            const finalMerchantNet = netProfit - impact - (netProfit * 0.01);

            return (
              <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="flex gap-6 mb-8">
                  <img src={p.imageUrl} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md" />
                  <div className="min-w-0">
                    <h4 className="text-xl font-black truncate italic uppercase tracking-tighter">{p.name}</h4>
                    <p className="text-[10px] font-black text-[#7851A9] uppercase mt-1">{p.category}</p>
                    <div className="flex gap-2 mt-2">
                       <StatusBadge status={p.msrpAuditStatus} label="MSRP" />
                       <StatusBadge status={p.cogsAuditStatus} label="COGS" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Target Sale Price</span>
                    <span className="text-black">${salePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>COGS (Audit Confirmed)</span>
                    <span className="text-black">${p.cogs.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Estimated Net Pay</span>
                    <span className="text-emerald-500 text-lg italic">${finalMerchantNet.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-xl text-[9px] font-black uppercase hover:text-black">Edit Listing</button>
                  <button onClick={() => onDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Deactivate</button>
                </div>
                
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
                   <BrandSubmark size={60} color="#000" showCrown={false} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const InputBlock = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <input 
      type={type} required value={value} onChange={e => onChange(e.target.value)}
      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#7851A9]/10 transition-all"
      placeholder={placeholder}
    />
  </div>
);

const StatusBadge = ({ status, label }: any) => (
  <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
    status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : status === 'FLAGGED' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
  }`}>
    {label}: {status}
  </span>
);
