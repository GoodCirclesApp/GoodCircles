
import React, { useState } from 'react';
import { Community, FiscalPolicy, GovernanceProposal, CategoryOverride } from '../types';
import { PRODUCT_CATEGORIES } from '../constants';

interface Props {
  communities: Community[];
  onUpdatePolicy: (id: string, policy: FiscalPolicy) => void;
}

export const RegionalGovernance: React.FC<Props> = ({ communities, onUpdatePolicy }) => {
  const [selectedId, setSelectedId] = useState(communities[0]?.id);
  const [activeGovernanceTab, setActiveGovernanceTab] = useState<'BASE' | 'CATEGORIES' | 'PROPOSALS'>('BASE');
  
  const community = communities.find(c => c.id === selectedId);

  // Added missing required properties to satisfy GovernanceProposal interface
  const activeProposals: GovernanceProposal[] = community?.activeProposals || [
    {
      id: 'prop-1',
      type: 'RATE_ADJUSTMENT',
      title: 'Increase Impact Floor to 2.5%',
      description: 'Adjustment to ensure community stability during low-margin cycles.',
      proposerId: 'u-admin',
      proposerName: 'System Architect',
      stakeAmount: 1000,
      votesFor: 1420,
      votesAgainst: 310,
      status: 'VOTING',
      expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      consensusThreshold: 0.66
    }
  ];

  const handleUpdate = (field: keyof FiscalPolicy, value: any) => {
    if (!community) return;
    const updated = { ...community.fiscalPolicy, [field]: value };
    onUpdatePolicy(community.id, updated);
  };

  const handleUpdateCategoryOverride = (category: string, field: keyof CategoryOverride, value: number) => {
    if (!community) return;
    const currentOverrides = community.fiscalPolicy.categoryOverrides || {};
    const currentCategory = currentOverrides[category] || {};
    
    const updated: FiscalPolicy = {
      ...community.fiscalPolicy,
      categoryOverrides: {
        ...currentOverrides,
        [category]: { ...currentCategory, [field]: value }
      }
    };
    onUpdatePolicy(community.id, updated);
  };

  if (!community) return null;

  return (
    <div className="bg-white rounded-[4rem] p-12 border border-[#C2A76F]/20 shadow-sm space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
           <h3 className="text-3xl font-black italic uppercase tracking-tighter">Regional Governance</h3>
           <p className="text-slate-400 text-xs font-medium mt-1">Configure localized economic constitutions and dynamic fiscal floors.</p>
        </div>
        <div className="flex gap-4">
           <select 
            value={selectedId} 
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase outline-none focus:ring-4 focus:ring-[#C2A76F]/10"
          >
            {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex bg-slate-50 p-1 rounded-2xl w-fit">
        {(['BASE', 'CATEGORIES', 'PROPOSALS'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveGovernanceTab(tab)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeGovernanceTab === tab ? 'bg-white text-[#7851A9] shadow-sm' : 'text-slate-400'}`}
          >
            {tab === 'BASE' ? 'Global Rates' : tab === 'CATEGORIES' ? 'Category Floors' : 'Proposals'}
          </button>
        ))}
      </div>

      {activeGovernanceTab === 'BASE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-300">
          <PolicyControl 
            label="Neighbor Discount" 
            value={community.fiscalPolicy.discountRate * 100} 
            onChange={(v: number) => handleUpdate('discountRate', v / 100)} 
            unit="%" 
            helper="Direct member savings."
          />
          <PolicyControl 
            label="Nonprofit Donation" 
            value={community.fiscalPolicy.donationRate * 100} 
            onChange={(v: number) => handleUpdate('donationRate', v / 100)} 
            unit="%" 
            helper="Percentage of net profit."
          />
          <PolicyControl 
            label="Platform Fee" 
            value={community.fiscalPolicy.platformFeeRate * 100} 
            onChange={(v: number) => handleUpdate('platformFeeRate', v / 100)} 
            unit="%" 
            helper="Network maintenance cost."
          />
          <PolicyControl 
            label="Local Sales Tax" 
            value={community.fiscalPolicy.taxRate * 100} 
            onChange={(v: number) => handleUpdate('taxRate', v / 100)} 
            unit="%" 
            helper="Jurisdictional tax applied."
          />
        </div>
      )}

      {activeGovernanceTab === 'CATEGORIES' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <header className="max-w-xl">
             <h4 className="text-xl font-black uppercase italic tracking-tighter">Category-Aware Dynamic Overrides</h4>
             <p className="text-slate-500 text-xs mt-1">Adjust floors for industries with differing margin profiles (e.g. Grocery vs Services).</p>
           </header>
           <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
              {PRODUCT_CATEGORIES.map(cat => {
                const rates = {
                  discountRate: community.fiscalPolicy.categoryOverrides?.[cat]?.discountRate ?? community.fiscalPolicy.discountRate,
                  donationRate: community.fiscalPolicy.categoryOverrides?.[cat]?.donationRate ?? community.fiscalPolicy.donationRate,
                };
                return (
                  <div key={cat} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all">
                     <div className="w-1/3">
                        <h5 className="text-xs font-black uppercase text-slate-800">{cat}</h5>
                        {community.fiscalPolicy.categoryOverrides?.[cat] ? (
                          <span className="text-[10px] font-black text-[#C2A76F] uppercase">Custom Policy Active</span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase">Inheriting Region Policy</span>
                        )}
                     </div>
                     <div className="flex gap-10 items-center">
                        <div className="flex flex-col items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</span>
                           <input 
                             type="number" step="1" 
                             value={Math.round(rates.discountRate * 100)} 
                             onChange={(e) => handleUpdateCategoryOverride(cat, 'discountRate', parseInt(e.target.value) / 100)}
                             className="w-16 bg-white border border-slate-200 rounded-lg p-2 text-xs font-black text-center outline-none focus:ring-2 focus:ring-[#7851A9]/20" 
                           />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact</span>
                           <input 
                             type="number" step="1" 
                             value={Math.round(rates.donationRate * 100)} 
                             onChange={(e) => handleUpdateCategoryOverride(cat, 'donationRate', parseInt(e.target.value) / 100)}
                             className="w-16 bg-white border border-slate-200 rounded-lg p-2 text-xs font-black text-center outline-none focus:ring-2 focus:ring-[#7851A9]/20" 
                           />
                        </div>
                        <button 
                          onClick={() => {
                            if (!community.fiscalPolicy.categoryOverrides) return;
                            const { [cat]: _, ...rest } = community.fiscalPolicy.categoryOverrides;
                            onUpdatePolicy(community.id, { ...community.fiscalPolicy, categoryOverrides: rest });
                          }}
                          className="p-2 text-slate-200 hover:text-[#A20021] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {activeGovernanceTab === 'PROPOSALS' && (
        <section className="animate-in fade-in duration-300">
           <div className="flex justify-between items-center mb-10">
              <h4 className="text-2xl font-black italic uppercase tracking-tighter">Active Proposals</h4>
              <button className="bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all">Submit New Proposal</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeProposals.map(prop => {
                const totalVotes = prop.votesFor + prop.votesAgainst;
                const forPercent = totalVotes > 0 ? (prop.votesFor / totalVotes) * 100 : 0;
                return (
                  <div key={prop.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[3rem] group hover:bg-white hover:shadow-xl transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Status: {prop.status}</span>
                        <p className="text-[10px] font-black text-slate-300 uppercase font-accent">ID: {prop.id}</p>
                     </div>
                     <h5 className="text-xl font-black uppercase italic tracking-tighter mb-2">{prop.title}</h5>
                     <p className="text-sm text-slate-500 font-medium italic mb-8">"{prop.description}"</p>
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                           <span className="text-emerald-500">For ({prop.votesFor})</span>
                           <span className="text-slate-300">Against ({prop.votesAgainst})</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${forPercent}%` }}></div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-8">
                        <button className="bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all">Vote For</button>
                        <button className="bg-white border border-slate-200 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all">Vote Against</button>
                     </div>
                  </div>
                );
              })}
           </div>
        </section>
      )}

      <div className="p-10 bg-[#C2A76F]/5 border-2 border-dashed border-[#C2A76F]/20 rounded-[3rem] text-center">
         <p className="text-[10px] font-black text-[#C2A76F] uppercase tracking-widest mb-2 font-accent italic">Governance Integrity Verification</p>
         <p className="text-sm font-medium text-slate-600 italic leading-relaxed max-w-2xl mx-auto">
           "Changes to localized fiscal policy are anchored to their original settlement hash. Only members with an Impact Score &gt; 100 can influence active rate adjustment cycles."
         </p>
      </div>
    </div>
  );
};

const PolicyControl = ({ label, value, onChange, unit, helper }: any) => (
  <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-[#C2A76F]/30 transition-all">
    <div className="flex justify-between items-start">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <span className="text-[10px] font-black text-[#C2A76F]">{value.toFixed(1)}{unit}</span>
    </div>
    <input 
      type="range" 
      min="0" max="50" step="0.5" 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-white rounded-lg appearance-none cursor-pointer accent-black" 
    />
    <p className="text-[10px] text-slate-400 font-medium italic leading-tight px-2">"{helper}"</p>
  </div>
);
