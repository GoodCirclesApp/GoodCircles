
import React, { useMemo, useState } from 'react';
import { Order, Community } from '../types';
import { MOCK_COMMUNITIES, MOCK_NONPROFITS } from '../constants';
import { BrandSubmark } from './BrandAssets';

interface Props {
  orders: Order[];
}

type TabType = 'COMMUNITIES' | 'BUSINESSES' | 'NEIGHBORS' | 'NONPROFITS';

export const ImpactLeaderboard: React.FC<Props> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState<TabType>('COMMUNITIES');

  const communityRankings = useMemo(() => {
    const fundingMap = new Map<string, number>();
    orders.forEach(o => {
      const current = fundingMap.get(o.communityId) || 0;
      fundingMap.set(o.communityId, current + (o.accounting?.donationAmount ?? 0));
    });

    return MOCK_COMMUNITIES.map(c => {
      const totalFunding = fundingMap.get(c.id) || 0;
      return {
        ...c,
        totalFunding,
        perMemberImpact: totalFunding / c.memberCount
      };
    }).sort((a, b) => b.perMemberImpact - a.perMemberImpact);
  }, [orders]);

  const businessRankings = useMemo(() => {
    const merchantMap = new Map<string, { name: string, total: number }>();
    orders.forEach(o => {
      o.items.forEach(item => {
        const m = merchantMap.get(item.product.merchantId) || { name: item.product.merchantName, total: 0 };
        // In this simplified logic, we attribute the donation portion of the item to the merchant
        // Here we use the proportion of this order's total donation based on this item's subtotal share.
        const itemSubtotal = item.product.price * (1 - 0.10) * item.quantity;
        const proportion = o.subtotal > 0 ? itemSubtotal / o.subtotal : 0;
        m.total += (o.accounting?.donationAmount ?? 0) * proportion;
        merchantMap.set(item.product.merchantId, m);
      });
    });

    return Array.from(merchantMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [orders]);

  const neighborRankings = useMemo(() => {
    const neighborMap = new Map<string, { name: string, total: number }>();
    orders.forEach(o => {
      const c = neighborMap.get(o.neighborId) || { name: o.neighborName || 'Anonymous', total: 0 };
      c.total += (o.accounting?.donationAmount ?? 0);
      neighborMap.set(o.neighborId, c);
    });

    return Array.from(neighborMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [orders]);

  const nonprofitRankings = useMemo(() => {
    const nonprofitMap = new Map<string, { name: string, total: number }>();
    
    // Initialize with mock nonprofits to ensure they show up even with 0 impact
    MOCK_NONPROFITS.forEach(np => {
      nonprofitMap.set(np.id, { name: np.name, total: 0 });
    });

    orders.forEach(o => {
      const np = nonprofitMap.get(o.selectedNonprofitId);
      if (np) {
        np.total += (o.accounting?.donationAmount ?? 0);
      } else {
        // Fallback for dynamically added nonprofits if any
        nonprofitMap.set(o.selectedNonprofitId, { name: `Nonprofit ${o.selectedNonprofitId}`, total: (o.accounting?.donationAmount ?? 0) });
      }
    });

    return Array.from(nonprofitMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [orders]);

  const currentList = useMemo(() => {
    if (activeTab === 'COMMUNITIES') return communityRankings;
    if (activeTab === 'BUSINESSES') return businessRankings;
    if (activeTab === 'NEIGHBORS') return neighborRankings;
    return nonprofitRankings;
  }, [activeTab, communityRankings, businessRankings, neighborRankings, nonprofitRankings]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-[4rem] border border-[#CA9CE1]/30 shadow-xl overflow-hidden animate-in fade-in duration-700">
      <div className="p-5 sm:p-12 md:p-16 border-b border-[#CA9CE1]/10 flex flex-col lg:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tighter italic uppercase mb-4">Impact Leaderboards.</h2>
          <p className="text-slate-500 font-medium max-w-lg">Friendly competition driving real-world community funding. See who leads the circle.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl sm:rounded-[2.5rem] overflow-x-auto scrollbar-hide max-w-full">
          {(['COMMUNITIES', 'BUSINESSES', 'NEIGHBORS', 'NONPROFITS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'COMMUNITIES' ? 'Cities' : tab === 'BUSINESSES' ? 'Merchants' : tab === 'NEIGHBORS' ? 'Neighbors' : 'Nonprofits'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-12 md:p-16">
        <div className="space-y-4">
          {activeTab === 'COMMUNITIES' && communityRankings.map((c, i) => (
            <RankRow 
              key={c.id} 
              rank={i + 1} 
              name={c.name} 
              metricLabel="Impact / Member" 
              metricValue={`$${c.perMemberImpact.toFixed(4)}`} 
              subMetric={`$${c.totalFunding.toFixed(2)} Total Funding`}
              progress={(c.perMemberImpact / (communityRankings[0]?.perMemberImpact || 1)) * 100}
            />
          ))}
          {activeTab === 'BUSINESSES' && businessRankings.map((m, i) => (
            <RankRow 
              key={m.id} 
              rank={i + 1} 
              name={m.name} 
              metricLabel="Donated" 
              metricValue={`$${m.total.toFixed(2)}`} 
              progress={(m.total / (businessRankings[0]?.total || 1)) * 100}
            />
          ))}
          {activeTab === 'NEIGHBORS' && neighborRankings.map((u, i) => (
            <RankRow 
              key={u.id} 
              rank={i + 1} 
              name={u.name} 
              metricLabel="Impact Generated" 
              metricValue={`$${u.total.toFixed(2)}`} 
              progress={(u.total / (neighborRankings[0]?.total || 1)) * 100}
            />
          ))}
          {activeTab === 'NONPROFITS' && nonprofitRankings.map((n, i) => (
            <RankRow 
              key={n.id} 
              rank={i + 1} 
              name={n.name} 
              metricLabel="Funds Raised" 
              metricValue={`$${n.total.toFixed(2)}`} 
              progress={(n.total / (nonprofitRankings[0]?.total || 1)) * 100}
            />
          ))}
          
          {currentList.length === 0 && (
            <div className="py-20 text-center opacity-40">
              <BrandSubmark size={80} color="#CA9CE1" className="mx-auto mb-6" showCrown={false} />
              <p className="font-bold text-slate-400">The first settlement of the year is yet to be recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RankRow = ({ rank, name, metricLabel, metricValue, subMetric, progress }: { rank: number, name: string, metricLabel: string, metricValue: string, subMetric?: string, progress: number, key?: any }) => {
  const isTop3 = rank <= 3;
  const rankColor = rank === 1 ? 'bg-[#C2A76F]' : rank === 2 ? 'bg-[#C0C0C0]' : rank === 3 ? 'bg-[#CD7F32]' : 'bg-slate-100';
  const textColor = isTop3 ? 'text-white' : 'text-slate-400';

  return (
    <div className="flex items-center gap-3 sm:gap-8 p-4 sm:p-8 bg-white border border-[#CA9CE1]/10 rounded-2xl sm:rounded-[2.5rem] hover:shadow-2xl hover:border-[#7851A9]/30 transition-all group">
      <div className={`w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-xl italic ${rankColor} ${textColor} shadow-inner`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-3 sm:mb-4 gap-1 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="text-base sm:text-2xl font-black text-black tracking-tighter uppercase truncate">{name}</h4>
            {subMetric && <p className="text-[10px] sm:text-[10px] font-black text-[#7851A9] uppercase tracking-widest mt-1 font-accent">{subMetric}</p>}
          </div>
          <div className="sm:text-right shrink-0">
            <p className="text-[10px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent mb-0.5 sm:mb-1">{metricLabel}</p>
            <p className="text-base sm:text-2xl font-black text-black tracking-tighter">{metricValue}</p>
          </div>
        </div>
        <div className="w-full h-2 sm:h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
          <div
            className="h-full bg-black group-hover:bg-[#7851A9] transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
