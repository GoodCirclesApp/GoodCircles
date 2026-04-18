
import React, { useState, useMemo } from 'react';
import { MerchantConsortium, User } from '../types';
import { BrandSubmark } from './BrandAssets';
import { showToast } from '../hooks/toast';

export const ConsortiumManager: React.FC = () => {
  const [consortiums, setConsortiums] = useState<MerchantConsortium[]>([
    { id: 'con-1', name: 'Downtown Hospitality Group', category: 'Dining', memberCount: 12, combinedVolume: 125000, targetCOGS_Reduction: 0.12, description: 'Pooling purchase power for sustainable food suppliers.' },
    { id: 'con-2', name: 'Metro Tech Alliance', category: 'Electronics', memberCount: 8, combinedVolume: 450000, targetCOGS_Reduction: 0.08, description: 'Bulk sourcing of recycled hardware nodes.' }
  ]);

  const [isJoining, setIsJoining] = useState<string | null>(null);

  const handleJoin = (id: string) => {
    setIsJoining(id);
    setTimeout(() => {
      setConsortiums(prev => prev.map(c => c.id === id ? { ...c, memberCount: c.memberCount + 1 } : c));
      setIsJoining(null);
      showToast('Application for Volume Pooling submitted. Verifying historical node integrity...', 'info');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-[4rem] p-12 border border-[#CA9CE1]/20 shadow-sm space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-[#7851A9] animate-pulse"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7851A9] font-accent">Scaling Consortium Node v1.0</p>
          </div>
          <h3 className="text-4xl font-black italic uppercase tracking-tighter">Collective Bargaining.</h3>
          <p className="text-slate-500 font-medium text-lg mt-6 leading-relaxed italic">Pool your settlement volume with other local nodes to negotiate lower COGS from external wholesalers. Lower COGS = Higher Community Impact.</p>
        </div>
        <button className="bg-black text-white px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-xl transition-all">Form New Consortium</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {consortiums.map(con => (
          <div key={con.id} className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] group hover:bg-white hover:border-[#7851A9]/30 hover:shadow-2xl transition-all relative overflow-hidden">
             <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="text-[10px] font-black uppercase text-[#7851A9] tracking-widest bg-[#7851A9]/5 px-3 py-1 rounded-lg">{con.category}</span>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter mt-4">{con.name}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Target Reduction</p>
                      <p className="text-3xl font-black text-emerald-500 italic">{(con.targetCOGS_Reduction * 100).toFixed(0)}%</p>
                   </div>
                </div>
                
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed">"{con.description}"</p>

                <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-100">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Active Nodes</p>
                      <p className="text-xl font-black italic">{con.memberCount}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Combined Volume</p>
                      <p className="text-xl font-black italic">${(con.combinedVolume / 1000).toFixed(0)}k+</p>
                   </div>
                </div>

                <button 
                  onClick={() => handleJoin(con.id)}
                  disabled={isJoining === con.id}
                  className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isJoining === con.id ? 'Analyzing Node Data...' : 'Join Scaling Group'}
                </button>
             </div>
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <BrandSubmark size={120} color="#000" showCrown={false} />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
