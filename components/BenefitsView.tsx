import React, { useState, useEffect } from 'react';
import { useIdentityStore } from '../hooks/useIdentityStore';
import { Shield, CheckCircle, Lock, TrendingDown, Users, Activity } from 'lucide-react';

export const BenefitsView: React.FC = () => {
  const { currentUser } = useIdentityStore();
  const [eligibility, setEligibility] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEligibility();
  }, []);

  const fetchEligibility = async () => {
    try {
      const res = await fetch('/api/benefits/merchant/eligibility');
      const data = await res.json();
      setEligibility(data);
      
      if (data.thresholdMet) {
        fetchPrograms();
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Failed to fetch benefits eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/benefits/programs');
      const data = await res.json();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    }
  };

  const fetchEnrollments = async () => {
    if (!currentUser?.merchantId) return;
    try {
      const res = await fetch(`/api/benefits/merchant/${currentUser.merchantId}`);
      const data = await res.json();
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  const handleEnroll = async (programId: string) => {
    if (!currentUser?.merchantId) return;
    try {
      const res = await fetch(`/api/benefits/programs/${programId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: currentUser.merchantId })
      });
      if (res.ok) {
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  if (loading) return <div className="p-12 text-center font-black uppercase tracking-widest animate-pulse">Loading Benefits...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12 font-sans overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-6xl font-black tracking-tighter italic uppercase">Aggregated Benefits</h1>
          <p className="text-slate-500 font-medium max-w-xl">Group-negotiated insurance and retirement rates for the entire Good Circles merchant community.</p>
        </div>
        
        <div className="bg-black text-white px-5 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] flex items-center gap-4 sm:gap-6 shadow-2xl">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Monthly Savings</p>
            <p className="text-xl sm:text-3xl font-black italic">${enrollments?.totalMonthlySavings || 0}</p>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-[#7851A9]" />
        </div>
      </div>

      {!eligibility?.thresholdMet ? (
        <div className="bg-white border-2 border-black rounded-2xl sm:rounded-[3rem] p-5 sm:p-12 space-y-10 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7851A9]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-3xl font-black italic uppercase">System Locked</h2>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Threshold: 200 Active Merchants</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-sm font-black uppercase tracking-widest">Network Density Progress</p>
              <p className="text-2xl font-black italic">{eligibility?.merchantCount} / 200</p>
            </div>
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden border border-black/5">
              <div 
                className="h-full bg-gradient-to-r from-[#7851A9] to-black transition-all duration-1000"
                style={{ width: `${eligibility?.progressPct}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
              <Shield className="w-10 h-10 text-[#7851A9]" />
              <h3 className="text-xl font-black italic uppercase">Estimated Savings</h3>
              <p className="text-slate-600 font-medium">At 200 merchants, group health insurance saves an estimated <span className="text-black font-black">20% vs individual rates</span>.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
              <Users className="w-10 h-10 text-[#7851A9]" />
              <h3 className="text-xl font-black italic uppercase">Why 200?</h3>
              <p className="text-slate-600 font-medium">Meaningful insurance group rates require a minimum merchant density to negotiate effectively with providers.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map(program => {
            const isEnrolled = enrollments?.enrollments.some((e: any) => e.programId === program.id);
            const savings = program.individualRateMonthly - program.groupRateMonthly;
            
            return (
              <div key={program.id} className="bg-white border-2 border-black rounded-[2.5rem] p-8 space-y-6 hover:shadow-2xl transition-all group relative overflow-hidden">
                {isEnrolled && (
                  <div className="absolute top-6 right-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7851A9]">{program.type.replace('_', ' ')}</p>
                  <h3 className="text-2xl font-black italic uppercase leading-none">{program.providerName}</h3>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Group Rate</p>
                    <p className="text-xl font-black italic">${program.groupRateMonthly}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Individual Rate</p>
                    <p className="text-sm font-bold line-through text-slate-300">${program.individualRateMonthly}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Monthly Savings</p>
                    <p className="text-lg font-black italic text-emerald-500">${savings}</p>
                  </div>
                </div>

                <button 
                  onClick={() => !isEnrolled && handleEnroll(program.id)}
                  disabled={isEnrolled}
                  className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isEnrolled 
                      ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                      : 'bg-black text-white hover:bg-[#7851A9]'
                  }`}
                >
                  {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-[#7851A9]/5 rounded-2xl sm:rounded-[3rem] p-5 sm:p-12 border border-[#7851A9]/10">
        <div className="flex items-center gap-4 mb-6">
          <Activity className="w-6 h-6 text-[#7851A9]" />
          <h2 className="text-xl font-black italic uppercase">Enrollment Transparency</h2>
        </div>
        <p className="text-slate-600 font-medium leading-relaxed">
          The Good Circles platform acts as an enrollment facilitator and broker. We aggregate our community's collective bargaining power to negotiate the best possible rates with insurance providers. Good Circles does NOT underwrite, administer, or assume insurance risk. All policies are held directly with the respective providers.
        </p>
      </div>
    </div>
  );
};
