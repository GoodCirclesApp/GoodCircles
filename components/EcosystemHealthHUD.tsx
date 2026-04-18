
import React from 'react';
import { BrandSubmark } from './BrandAssets';

interface Props {
  totalFeesSaved: number;
  activeNodes: number;
  anomalyRate: number;
  merchantCount?: number;
  nonprofitCount?: number;
}

export const EcosystemHealthHUD: React.FC<Props> = ({ totalFeesSaved, activeNodes, anomalyRate, merchantCount = 0, nonprofitCount = 0 }) => {
  const total = merchantCount + nonprofitCount || 1;
  const merchantPercent = Math.round((merchantCount / total) * 100);
  const nonprofitPercent = Math.round((nonprofitCount / total) * 100);
  const stewardPercent = 100 - merchantPercent - nonprofitPercent;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-1000">
      {/* Wealth Retention Node */}
      <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/5">
        <div className="relative z-10 space-y-8">
           <div>
              <p className="text-[10px] font-black text-[#C2A76F] uppercase tracking-[0.4em] mb-2">Wealth Leakage Prevented</p>
              <p className="text-6xl font-black italic tracking-tighter text-white">${totalFeesSaved.toLocaleString()}</p>
           </div>
           <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
             Capital successfully recaptured from external bank processing networks and retained within local circle nodes.
           </p>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Resilience: Optimal</span>
           </div>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
           <BrandSubmark size={180} variant="WHITE" showCrown={true} />
        </div>
      </div>

      {/* Network Scale Node */}
      <div className="bg-white p-12 rounded-[4rem] border border-[#CA9CE1]/20 shadow-sm flex flex-col justify-between group hover:border-[#7851A9]/30 transition-all">
         <div className="space-y-6">
            <h4 className="text-xl font-black italic uppercase tracking-tighter">Active Mesh Nodes</h4>
            <div className="flex items-baseline gap-2">
               <p className="text-5xl font-black italic text-black">{activeNodes}</p>
               <p className="text-xs font-bold text-slate-300 uppercase">Entities</p>
            </div>
            <div className="space-y-3">
               <HealthBar label="Merchant Nodes" percent={merchantPercent} color="bg-black" />
               <HealthBar label="Nonprofit Nodes" percent={nonprofitPercent} color="bg-[#7851A9]" />
               <HealthBar label="Platform Stewards" percent={stewardPercent > 0 ? stewardPercent : 0} color="bg-[#C2A76F]" />
            </div>
         </div>
      </div>

      {/* Integrity Node */}
      <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 shadow-inner flex flex-col justify-between">
         <div className="space-y-6">
            <h4 className="text-xl font-black italic uppercase tracking-tighter">Integrity Index</h4>
            <div className="flex items-baseline gap-2">
               <p className="text-5xl font-black italic text-emerald-500">{(100 - anomalyRate).toFixed(2)}%</p>
               <p className="text-xs font-bold text-slate-300 uppercase">Verified</p>
            </div>
            <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
              Real-time MSRP/COGS variance across all regional ledgers. 0.00% critical drift detected.
            </p>
         </div>
         <button className="w-full mt-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">View Audit Logs</button>
      </div>
    </div>
  );
};

const HealthBar = ({ label, percent, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);
