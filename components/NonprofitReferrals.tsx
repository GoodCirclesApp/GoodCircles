
import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, TrendingUp, Users, DollarSign, Trophy } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const BONUS_TIERS = [
  { name: 'Activation', threshold: '$7,500', bonus: '$500' },
  { name: 'Established', threshold: '$25,000', bonus: '$1,000' },
  { name: 'High Volume', threshold: '$75,000', bonus: '$2,500' },
  { name: 'Anchor Merchant', threshold: '$150,000', bonus: '$5,000' },
];

interface ReferralInfo {
  referralLink: string;
  totalReferrals: number;
  totalEarnings: number;
  referredMerchants: {
    id: string;
    name: string;
    status: string;
    earnings: number;
    currentTier: string;
  }[];
}

export const NonprofitReferrals: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ReferralInfo>('/nonprofit/referral-info')
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  const referralLink = info?.referralLink ?? '';

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Hero banner */}
      <div className="bg-black text-white p-6 sm:p-12 rounded-2xl sm:rounded-[4rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-16 opacity-10 hidden sm:block">
          <Users size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter mb-4 sm:mb-6">Grow the Ecosystem, Increase Your Impact.</h3>
          <p className="text-slate-400 font-medium mb-6 sm:mb-10 leading-relaxed italic text-sm sm:text-base">
            Refer local merchants to the Good Circles network. As their transactions generate nonprofit funding, your organization earns milestone bonuses — up to $5,000 per referred merchant — paid from the platform's fee revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-white/10 p-2 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-md">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent border-none text-white text-xs font-medium px-4 sm:px-6 py-3 sm:py-0 flex-1 focus:ring-0 min-w-0 truncate"
            />
            <button
              onClick={handleCopy}
              disabled={!referralLink}
              className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] hover:text-white transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Bonus Tiers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-900">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          <h3 className="text-lg sm:text-2xl font-bold">Milestone Bonus Tiers</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {BONUS_TIERS.map((tier, i) => (
            <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-1 sm:space-y-2">
              <h4 className="font-bold text-zinc-900 text-sm sm:text-base">{tier.name}</h4>
              <p className="text-xs sm:text-sm text-zinc-500">Funding: {tier.threshold}</p>
              <div className="pt-1 sm:pt-2">
                <span className="text-lg sm:text-xl font-bold text-emerald-600">{tier.bonus}</span>
                <span className="text-[10px] sm:text-xs text-zinc-400 ml-1">bonus</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl">
              <Users size={20} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Referrals</h4>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            {loading ? '—' : `${info?.totalReferrals ?? 0} Merchant${(info?.totalReferrals ?? 0) !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl">
              <DollarSign size={20} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bonuses Earned</h4>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            {loading ? '—' : `$${(info?.totalEarnings ?? 0).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Referred Merchants Table */}
      <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-10 border-b border-slate-50">
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Referred Merchants</h3>
          <p className="text-slate-400 text-xs font-medium">Tracking your network growth and milestone bonuses</p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400 font-medium">Loading…</div>
          ) : !info || info.referredMerchants.length === 0 ? (
            <div className="p-10 text-center text-slate-400 italic font-medium">No referred merchants yet. Share your referral link to get started.</div>
          ) : (
            <table className="w-full text-left min-w-[550px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-5 sm:px-10 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                  <th className="px-5 sm:px-10 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 sm:px-10 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</th>
                  <th className="px-5 sm:px-10 py-4 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bonus Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {info.referredMerchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 sm:px-10 py-5 sm:py-8 font-bold text-slate-900 text-sm sm:text-base">{m.name}</td>
                    <td className="px-5 sm:px-10 py-5 sm:py-8">
                      <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 sm:px-10 py-5 sm:py-8 font-black text-[#7851A9] text-sm sm:text-base">{m.currentTier}</td>
                    <td className="px-5 sm:px-10 py-5 sm:py-8 font-black text-sm sm:text-base">${m.earnings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
