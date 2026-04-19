
import React, { useState, useEffect } from 'react';
import { neighborService } from '../services/neighborService';
import { BrandSubmark } from '../components/BrandAssets';
import { showToast } from '../hooks/toast';

export const ImpactDashboardView: React.FC = () => {
  const [impactData, setImpactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const data = await neighborService.getImpactData();
        setImpactData(data);
      } catch (err) {
        console.error('Failed to fetch impact data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImpact();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-pulse">
        <div className="h-24 bg-slate-100 rounded-3xl w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 bg-slate-100 rounded-[4rem]"></div>
          <div className="h-64 bg-slate-100 rounded-[4rem]"></div>
          <div className="h-64 bg-slate-100 rounded-[4rem]"></div>
        </div>
      </div>
    );
  }

  const totalSaved = impactData?.totalSavedVsRetail ?? 0;
  const totalContributed = impactData?.totalNonprofitContributed ?? 0;
  const capitalKept = impactData?.capitalKeptInternal ?? 0;
  const waivedToInitiatives = impactData?.waivedToInitiatives ?? 0;
  const velocityScore = impactData?.velocityScore ?? 0;
  const txCount = impactData?.transactionCount ?? 0;
  const internalTxCount = impactData?.internalTransactionCount ?? 0;
  const favoriteCategories: string[] = impactData?.favoriteCategories ?? [];
  const hasActivity = txCount > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header>
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">My Impact.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-6">Quantifying your contribution to the community ecosystem.</p>
      </header>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#C2A76F]">Total Saved</p>
            <h3 className="text-6xl font-black italic tracking-tighter">${totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs mt-6 opacity-40 font-medium">Capital retained through platform discounts.</p>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={200} variant="WHITE" showCrown={true} />
          </div>
        </div>

        <div className="bg-[#7851A9] text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-white/60">Nonprofit Contributions</p>
            <h3 className="text-6xl font-black italic tracking-tighter">${totalContributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs mt-6 opacity-40 font-medium">Capital directed to your elected causes.</p>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={200} variant="WHITE" showCrown={true} />
          </div>
        </div>

        <div className="bg-[#C2A76F] text-black p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-black/40">Capital Kept Local</p>
            <h3 className="text-6xl font-black italic tracking-tighter">${capitalKept.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs mt-6 opacity-40 font-medium">Spent via internal wallet — stays in the ecosystem.</p>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={200} variant="BLACK" showCrown={true} />
          </div>
        </div>
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Purchases</p>
          <p className="text-4xl font-black italic tracking-tighter text-black">{txCount}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Internal Payments</p>
          <p className="text-4xl font-black italic tracking-tighter text-[#7851A9]">{internalTxCount}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Waived to Initiatives</p>
          <p className="text-4xl font-black italic tracking-tighter text-[#C2A76F]">${waivedToInitiatives.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Velocity Score</p>
          <div className="flex items-end justify-center gap-1">
            <p className="text-4xl font-black italic tracking-tighter text-emerald-600">{velocityScore}</p>
            <p className="text-xs font-bold text-slate-300 mb-1">/100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border border-[#CA9CE1]/20 p-12 rounded-[4rem] shadow-xl">
          <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Favorite Categories</h4>
          <div className="space-y-6">
            {favoriteCategories.map((cat: string, i: number) => (
              <div key={cat} className="flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-[#7851A9] group-hover:bg-[#7851A9] group-hover:text-white transition-all">0{i+1}</div>
                  <span className="text-xl font-black italic uppercase tracking-tighter">{cat}</span>
                </div>
                <div className="h-1 flex-grow mx-8 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7851A9]" style={{ width: `${100 - (i * 20)}%` }}></div>
                </div>
              </div>
            ))}
            {favoriteCategories.length === 0 && (
              <p className="text-slate-400 italic font-medium">Start shopping to see your favorite categories.</p>
            )}
          </div>
        </div>

        {!hasActivity ? (
          <div className="bg-[#7851A9] text-white p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-6">
            <BrandSubmark size={80} variant="WHITE" showCrown={true} />
            <h4 className="text-3xl font-black italic uppercase tracking-tighter">Start your Good Circle.</h4>
            <p className="text-white/60 text-lg font-medium leading-relaxed">Make your first purchase in the marketplace to begin building your impact record and earning community savings.</p>
            <button onClick={() => {}} className="bg-[#C2A76F] text-black px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all mt-4">Go to Marketplace</button>
          </div>
        ) : (
          <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-6">
            <BrandSubmark size={80} variant="WHITE" showCrown={true} />
            <h4 className="text-3xl font-black italic uppercase tracking-tighter">Your Good Circle is growing.</h4>
            <p className="text-white/60 text-lg font-medium leading-relaxed">Every transaction strengthens the local economy and supports the causes you care about most. Keep going.</p>
            <button onClick={() => showToast('Impact sharing coming soon.', 'info')} className="bg-[#C2A76F] text-black px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all mt-4">Share My Impact</button>
          </div>
        )}
      </div>

      {/* Personal Impact Timeline */}
      <div className="bg-white border border-[#CA9CE1]/20 rounded-[4rem] p-8 sm:p-16 shadow-xl">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h4 className="text-3xl font-black italic uppercase tracking-tighter">Impact Timeline.</h4>
            <p className="text-slate-400 font-medium mt-2">Milestones earned through your Good Circles journey.</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C2A76F] px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            {[txCount >= 1, totalSaved >= 10, totalContributed >= 5, txCount >= 10, totalContributed >= 50, totalSaved >= 100, velocityScore >= 50].filter(Boolean).length} / 7 Unlocked
          </span>
        </div>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
          <div className="space-y-8">
            {[
              { threshold: txCount >= 1,            icon: '✦', color: 'bg-[#7851A9]', title: 'First Purchase', desc: 'You made your first Good Circles transaction — welcome to the circle.', value: null },
              { threshold: totalSaved >= 10,         icon: '↓', color: 'bg-slate-800',  title: '$10 Saved',     desc: `You've kept $${Math.min(totalSaved, 10).toFixed(2)} in your pocket through Circle Rewards.`, value: `$${totalSaved.toFixed(2)} total saved` },
              { threshold: totalContributed >= 5,    icon: '♥', color: 'bg-[#C2A76F]',  title: 'Community Donor', desc: 'Your spending has generated real nonprofit funding — automatically.', value: `$${totalContributed.toFixed(2)} donated` },
              { threshold: txCount >= 10,            icon: '◉', color: 'bg-emerald-500', title: '10 Transactions',  desc: 'Double digits. Every purchase compounds your community footprint.', value: `${txCount} total` },
              { threshold: totalContributed >= 50,   icon: '★', color: 'bg-[#C2A76F]',  title: '$50 to Nonprofits', desc: 'Fifty dollars directed to community causes through your normal spending. Extraordinary.', value: `$${totalContributed.toFixed(2)} donated` },
              { threshold: totalSaved >= 100,        icon: '$', color: 'bg-slate-800',   title: '$100 Saved',    desc: 'A hundred dollars kept in your pocket instead of going to retail markup.', value: `$${totalSaved.toFixed(2)} total` },
              { threshold: velocityScore >= 50,      icon: '⚡', color: 'bg-[#7851A9]',  title: 'High Velocity',  desc: 'Your GC Velocity Score crossed 50 — you\'re a power contributor to the local ecosystem.', value: `Score: ${velocityScore}/100` },
            ].map((m, i) => (
              <div key={i} className={`relative pl-16 transition-opacity duration-500 ${m.threshold ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${m.threshold ? m.color : 'bg-slate-200'}`}>
                  {m.threshold ? m.icon : '○'}
                </div>
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-sm font-black italic uppercase tracking-tighter ${m.threshold ? 'text-black' : 'text-slate-300'}`}>{m.title}</p>
                      <p className={`text-xs font-medium mt-1 leading-relaxed ${m.threshold ? 'text-slate-500' : 'text-slate-300'}`}>{m.desc}</p>
                    </div>
                    {m.threshold && m.value && (
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#7851A9] bg-[#7851A9]/5 px-3 py-1.5 rounded-xl whitespace-nowrap">{m.value}</span>
                    )}
                    {!m.threshold && (
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-100 px-3 py-1.5 rounded-xl whitespace-nowrap">Locked</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
