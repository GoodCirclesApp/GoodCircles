
import React, { useState, useEffect } from 'react';
import { neighborService } from '../services/neighborService';
import { BrandSubmark } from '../components/BrandAssets';

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

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header>
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">My Impact.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-6">Quantifying your contribution to the community ecosystem.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#C2A76F]">Total Saved</p>
            <h3 className="text-6xl font-black italic tracking-tighter">${impactData?.totalSaved?.toLocaleString() || '0'}</h3>
            <p className="text-xs mt-6 opacity-40 font-medium">Capital retained through platform discounts.</p>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={200} variant="WHITE" showCrown={true} />
          </div>
        </div>

        <div className="bg-[#7851A9] text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-white/60">Nonprofit Contributions</p>
            <h3 className="text-6xl font-black italic tracking-tighter">${impactData?.totalContributed?.toLocaleString() || '0'}</h3>
            <p className="text-xs mt-6 opacity-40 font-medium">Capital directed to your elected causes.</p>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={200} variant="WHITE" showCrown={true} />
          </div>
        </div>

        <div className="bg-[#C2A76F] text-black p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-black/40">Community Fund</p>
            <h3 className="text-6xl font-black italic tracking-tighter">${impactData?.totalCommunityFundInvested?.toLocaleString() || '0'}</h3>
            <p className="text-xs mt-6 opacity-40 font-medium">Capital invested in local initiatives.</p>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={200} variant="BLACK" showCrown={true} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border border-[#CA9CE1]/20 p-12 rounded-[4rem] shadow-xl">
          <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Favorite Categories</h4>
          <div className="space-y-6">
            {impactData?.favoriteCategories?.map((cat: string, i: number) => (
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
            {(!impactData?.favoriteCategories || impactData.favoriteCategories.length === 0) && (
              <p className="text-slate-400 italic font-medium">Start shopping to see your favorite categories.</p>
            )}
          </div>
        </div>

        <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-6">
          <BrandSubmark size={80} variant="WHITE" showCrown={true} />
          <h4 className="text-3xl font-black italic uppercase tracking-tighter">Your Good Circle is growing.</h4>
          <p className="text-white/60 text-lg font-medium leading-relaxed">Every transaction strengthens the local economy and supports the causes you care about most. Keep going.</p>
          <button className="bg-[#C2A76F] text-black px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all mt-4">Share My Impact</button>
        </div>
      </div>
    </div>
  );
};
