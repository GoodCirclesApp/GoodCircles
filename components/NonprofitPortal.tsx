import React, { useState } from 'react';
import { Nonprofit, Order, Product } from '../types';
import { AccountingDashboard } from './AccountingDashboard';
import { GlobalStats } from '../hooks/useGoodCirclesStore';
import { MOCK_PRODUCTS } from '../constants';
import { StatementLedger } from './StatementLedger';
import { BrandSubmark } from './BrandAssets';
import { generatePressRelease } from '../services/aiReportingService';
import { NonprofitAdvisor } from './NonprofitAdvisor';
import { showToast } from '../hooks/toast';

interface Props {
  nonprofit: Nonprofit;
  orders: Order[];
  onUpdateProfile: (updated: Nonprofit) => void;
  globalStats: GlobalStats;
}

export const NonprofitPortal: React.FC<Props> = ({ nonprofit, orders, onUpdateProfile, globalStats }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'HISTORY' | 'PROFILE' | 'WISHLIST' | 'STORIES' | 'MEDIA'>('DASHBOARD');
  const [prText, setPrText] = useState<string | null>(null);
  const [isGeneratingPR, setIsGeneratingPR] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  const filteredOrders = orders.filter(o => o.selectedNonprofitId === nonprofit.id);
  const totalRaised = filteredOrders.reduce((sum, o) => sum + o.accounting.donationAmount, 0);

  const handleGeneratePR = async () => {
    setIsGeneratingPR(true);
    const text = await generatePressRelease(nonprofit.name, totalRaised, filteredOrders.length);
    setPrText(text);
    setIsGeneratingPR(false);
  };

  const toggleWishlistItem = (productId: string) => {
    const current = nonprofit.wishlistProductIds || [];
    const updated = current.includes(productId) 
      ? current.filter(id => id !== productId)
      : [...current, productId];
    
    onUpdateProfile({ ...nonprofit, wishlistProductIds: updated });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row items-center justify-between bg-white p-8 rounded-[3rem] border border-[#CA9CE1]/30 shadow-sm gap-6">
        <div className="flex items-center gap-6">
          <img src={nonprofit.logoUrl} className="w-20 h-20 rounded-full object-cover border-4 border-[#CA9CE1]/20 shadow-md" />
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{nonprofit.name}</h2>
            <p className="text-[#7851A9] text-xs font-black uppercase tracking-widest font-accent mt-2">Impact Hub</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] overflow-x-auto scrollbar-hide max-w-full">
          {(['DASHBOARD', 'HISTORY', 'PROFILE', 'WISHLIST', 'STORIES', 'MEDIA'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-[#7851A9] shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'DASHBOARD' && <AccountingDashboard orders={filteredOrders} role="NONPROFIT" globalStats={globalStats} />}

      {activeTab === 'HISTORY' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-3xl font-black italic uppercase tracking-tighter">Contribution Statements</h3>
             <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest font-accent">Audit-Ready Ledger</p>
           </div>
           <StatementLedger orders={filteredOrders} role="NONPROFIT" />
        </div>
      )}

      {activeTab === 'MEDIA' && (
        <div className="space-y-10 animate-in slide-in-from-top-4">
           <header className="max-w-xl">
             <h3 className="text-3xl font-black italic uppercase tracking-tighter">Impact Media Center</h3>
             <p className="text-slate-500 font-medium mt-2">Automated press kits and social proof for your community funding milestones.</p>
           </header>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                 <div className="bg-white p-10 rounded-[3rem] border border-[#CA9CE1]/20 shadow-sm space-y-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent">Current Achievement</p>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#7851A9] uppercase">Total Raised</p>
                      <p className="text-4xl font-black italic tracking-tighter">${totalRaised.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={handleGeneratePR}
                      disabled={isGeneratingPR || totalRaised === 0}
                      className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl disabled:opacity-30"
                    >
                      {isGeneratingPR ? 'Drafting Release...' : 'Generate Press Release'}
                    </button>
                 </div>
              </div>
              
              <div className="md:col-span-2">
                 {prText ? (
                   <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in">
                      <div className="absolute top-0 right-0 p-12 opacity-5"><BrandSubmark size={120} color="#000" /></div>
                      <div className="prose prose-slate max-w-none relative z-10">
                         <div className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap italic">
                           {prText}
                         </div>
                      </div>
                      <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                         <button onClick={() => { navigator.clipboard.writeText(prText); showToast('Copied to clipboard.', 'info'); }} className="bg-slate-100 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Copy to Clipboard</button>
                         <button onClick={() => window.print()} className="bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Share with Local Media</button>
                      </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem] opacity-40">
                      <BrandSubmark size={80} color="#CA9CE1" className="mb-6" />
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-xs italic">Awaiting milestone completion to generate media kit.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'STORIES' && (
        <div className="bg-white rounded-[4rem] p-12 border border-[#CA9CE1]/20 shadow-sm space-y-10 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Impact Proof-of-Work</h3>
            <button className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all">Post New Update</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(nonprofit.impactStories || []).map(story => (
              <div key={story.id} className="group bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-xl transition-all shadow-sm">
                <div className="h-56 overflow-hidden">
                  <img src={story.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                </div>
                <div className="p-10">
                  <p className="text-[10px] font-black text-[#7851A9] uppercase mb-2 font-accent tracking-widest">{new Date(story.date).toLocaleDateString()}</p>
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{story.title}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{story.description}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'WISHLIST' && (
        <div className="bg-white rounded-[4rem] p-12 border border-[#CA9CE1]/20 shadow-sm animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Strategic Asset Wishlist</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected: {nonprofit.wishlistProductIds?.length || 0} Assets</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_PRODUCTS.map(p => {
              const isOnWishlist = nonprofit.wishlistProductIds?.includes(p.id);
              return (
                <div key={p.id} className={`p-8 rounded-[3rem] border transition-all group ${isOnWishlist ? 'bg-[#7851A9]/5 border-[#7851A9]' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                  <img src={p.imageUrl} className="w-full aspect-square rounded-[2rem] object-cover mb-6 shadow-md" />
                  <h4 className="text-[10px] font-black uppercase truncate mb-1">{p.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{p.category}</p>
                  <button 
                    onClick={() => toggleWishlistItem(p.id)}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                      isOnWishlist 
                        ? 'bg-[#A20021] text-white hover:bg-black' 
                        : 'bg-white text-slate-500 hover:bg-black hover:text-white'
                    }`}
                  >
                    {isOnWishlist ? 'Remove from Requests' : 'Add to Requests'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* AI Nonprofit Advisor */}
      <button
        onClick={() => setIsAdvisorOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#7851A9] hover:bg-[#6a3f9a] text-white font-bold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors"
        title="Open AI Advisor"
      >
        <span className="text-lg">🤖</span>
        <span className="hidden sm:inline text-sm">AI Advisor</span>
      </button>
      <NonprofitAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        nonprofitProfile={nonprofit}
        orders={orders}
      />
    </div>
  );
};
