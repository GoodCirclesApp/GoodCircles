
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { BrandSubmark } from './BrandAssets';

interface Props {
  orders?: any[];
  currentUserId?: string;
}

type TabType = 'COMMUNITIES' | 'BUSINESSES' | 'NEIGHBORS' | 'NONPROFITS';

interface LeaderboardData {
  cities: { city: string; state: string; totalDonated: number; transactionCount: number }[];
  merchants: { id: string; businessName: string; totalDonated: number }[];
  neighbors: { userId: string; displayName: string; totalDonated: number; isCurrentUser: boolean }[];
  nonprofits: { id: string; orgName: string; totalReceived: number }[];
}

export const ImpactLeaderboard: React.FC<Props> = ({ currentUserId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('COMMUNITIES');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<LeaderboardData>('/leaderboard')
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const cities = data?.cities ?? [];
  const merchants = data?.merchants ?? [];
  const neighbors = data?.neighbors ?? [];
  const nonprofits = data?.nonprofits ?? [];

  const currentList = (() => {
    if (activeTab === 'COMMUNITIES') return cities;
    if (activeTab === 'BUSINESSES') return merchants;
    if (activeTab === 'NEIGHBORS') return neighbors;
    return nonprofits;
  })();

  const topValue = (() => {
    if (activeTab === 'COMMUNITIES') return cities[0]?.totalDonated ?? 1;
    if (activeTab === 'BUSINESSES') return merchants[0]?.totalDonated ?? 1;
    if (activeTab === 'NEIGHBORS') return neighbors[0]?.totalDonated ?? 1;
    return nonprofits[0]?.totalReceived ?? 1;
  })();

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
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'COMMUNITIES' && cities.map((c, i) => (
              <RankRow
                key={`${c.city}-${c.state}`}
                rank={i + 1}
                name={`${c.city}, ${c.state}`}
                metricLabel="Donated"
                metricValue={`$${c.totalDonated.toFixed(2)}`}
                subMetric={`${c.transactionCount} transactions`}
                progress={(c.totalDonated / topValue) * 100}
                index={i}
                isCurrentUser={false}
              />
            ))}
            {activeTab === 'BUSINESSES' && merchants.map((m, i) => (
              <RankRow
                key={m.id}
                rank={i + 1}
                name={m.businessName}
                metricLabel="Donated"
                metricValue={`$${m.totalDonated.toFixed(2)}`}
                progress={(m.totalDonated / topValue) * 100}
                index={i}
                isCurrentUser={false}
              />
            ))}
            {activeTab === 'NEIGHBORS' && neighbors.map((u, i) => (
              <RankRow
                key={u.userId}
                rank={i + 1}
                name={u.displayName}
                metricLabel="Impact Generated"
                metricValue={`$${u.totalDonated.toFixed(2)}`}
                progress={(u.totalDonated / topValue) * 100}
                index={i}
                isCurrentUser={u.isCurrentUser}
                spotsFromTop={u.isCurrentUser && i > 0 ? i : undefined}
              />
            ))}
            {activeTab === 'NONPROFITS' && nonprofits.map((n, i) => (
              <RankRow
                key={n.id}
                rank={i + 1}
                name={n.orgName}
                metricLabel="Funds Raised"
                metricValue={`$${n.totalReceived.toFixed(2)}`}
                progress={(n.totalReceived / topValue) * 100}
                index={i}
                isCurrentUser={false}
              />
            ))}

            {currentList.length === 0 && (
              <div className="py-20 text-center opacity-40">
                <BrandSubmark size={80} color="#CA9CE1" className="mx-auto mb-6" showCrown={false} />
                <p className="font-bold text-slate-400">The first settlement of the year is yet to be recorded.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RankRow = ({
  rank, name, metricLabel, metricValue, subMetric, progress, index, isCurrentUser, spotsFromTop
}: {
  rank: number;
  name: string;
  metricLabel: string;
  metricValue: string;
  subMetric?: string;
  progress: number;
  index: number;
  isCurrentUser: boolean;
  spotsFromTop?: number;
}) => {
  const isTop3 = rank <= 3;
  const rankColor = rank === 1 ? 'bg-[#C2A76F]' : rank === 2 ? 'bg-[#C0C0C0]' : rank === 3 ? 'bg-[#CD7F32]' : 'bg-slate-100';
  const textColor = isTop3 ? 'text-white' : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
    >
      <div className={`flex items-center gap-3 sm:gap-8 p-4 sm:p-8 border rounded-2xl sm:rounded-[2.5rem] hover:shadow-2xl transition-all group relative ${
        isCurrentUser
          ? 'bg-[#7851A9]/5 border-[#7851A9]/30 ring-2 ring-[#7851A9]/20'
          : 'bg-white border-[#CA9CE1]/10 hover:border-[#7851A9]/30'
      }`}>
        {isCurrentUser && (
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#7851A9] text-white text-[8px] font-black uppercase tracking-widest rounded-full">
            You
          </div>
        )}
        <div className={`w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-xl italic ${rankColor} ${textColor} shadow-inner`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-3 sm:mb-4 gap-1 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h4 className="text-base sm:text-2xl font-black text-black tracking-tighter uppercase truncate">{name}</h4>
              {subMetric && <p className="text-[10px] sm:text-[10px] font-black text-[#7851A9] uppercase tracking-widest mt-1 font-accent">{subMetric}</p>}
              {isCurrentUser && spotsFromTop !== undefined && spotsFromTop > 0 && (
                <p className="text-[10px] font-black text-[#C2A76F] uppercase tracking-widest mt-1">{spotsFromTop} spot{spotsFromTop !== 1 ? 's' : ''} from #1 — keep going!</p>
              )}
            </div>
            <div className="sm:text-right shrink-0">
              <p className="text-[10px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent mb-0.5 sm:mb-1">{metricLabel}</p>
              <p className="text-base sm:text-2xl font-black text-black tracking-tighter">{metricValue}</p>
            </div>
          </div>
          <div className="w-full h-2 sm:h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
            <motion.div
              className={`h-full rounded-full ${isCurrentUser ? 'bg-[#7851A9]' : 'bg-black group-hover:bg-[#7851A9]'} transition-colors duration-500`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.07 + 0.2, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
