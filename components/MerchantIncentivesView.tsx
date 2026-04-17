import React, { useState, useEffect } from 'react';
import { useIdentityStore } from '../hooks/useIdentityStore';
import { Shield, CheckCircle, Lock, TrendingUp, MapPin, ExternalLink, Activity, Info } from 'lucide-react';

export const MerchantIncentivesView: React.FC = () => {
  const { currentUser } = useIdentityStore();
  const [incentives, setIncentives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncentives();
  }, []);

  const fetchIncentives = async () => {
    if (!currentUser?.merchantId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/municipal/merchant-incentives/${currentUser.merchantId}`);
      if (res.ok) {
        const data = await res.json();
        setIncentives(data);
      }
    } catch (err) {
      console.error('Failed to fetch incentives:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-black uppercase tracking-widest animate-pulse">Checking Eligibility...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12 font-sans overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-6xl font-black tracking-tighter italic uppercase leading-none">Municipal Incentives</h1>
          <p className="text-slate-500 font-medium max-w-xl">Exclusive benefits and supports provided by your local municipality for participating in the Good Circles network.</p>
        </div>
      </div>

      {incentives.length === 0 ? (
        <div className="bg-white border-2 border-black rounded-[3rem] p-16 text-center space-y-8 shadow-xl">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-12 h-12 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase">No Active Partnerships</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto">Your municipality hasn't activated a Good Circles partnership yet, or you don't meet the current eligibility criteria for available incentives.</p>
          </div>
          <div className="pt-8 border-t border-slate-100 max-w-lg mx-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">How to activate?</p>
            <p className="text-sm text-slate-400 italic">Encourage your local economic development office to join the Good Circles network to unlock these benefits for all local merchants.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {incentives.map(incentive => (
            <div key={incentive.id} className="bg-white border-2 border-black rounded-[2.5rem] p-8 space-y-6 hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#7851A9]/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7851A9]">{incentive.incentiveType.replace('_', ' ')}</p>
                  <h3 className="text-2xl font-black italic uppercase leading-none">{incentive.description}</h3>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eligibility Criteria Met</p>
                </div>
                <p className="text-sm font-bold text-slate-600">
                  You qualify for this incentive based on your recent platform activity and regional merchant status.
                </p>
              </div>

              <button className="w-full py-5 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all flex items-center justify-center gap-2">
                Claim Incentive <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#7851A9]/5 rounded-[3rem] p-12 border border-[#7851A9]/10">
        <div className="flex items-center gap-4 mb-6">
          <Activity className="w-6 h-6 text-[#7851A9]" />
          <h2 className="text-xl font-black italic uppercase">The Power of Partnership</h2>
        </div>
        <p className="text-slate-600 font-medium leading-relaxed">
          Municipal partnerships allow local governments to directly support the businesses that build community wealth. By providing incentives like streamlined permitting or tax abatements to Good Circles merchants, cities can accelerate the transition to a more resilient, local-first economy.
        </p>
      </div>
    </div>
  );
};
