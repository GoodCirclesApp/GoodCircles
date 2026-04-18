
import React, { useState, useEffect } from 'react';
import { merchantService } from '../services/merchantService';
import { Heart, Shield, Check, ArrowRight, Plus, Users, Zap, TrendingDown, Star } from 'lucide-react';
import { showToast } from '../hooks/toast';

export const MerchantBenefits: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PROGRAMS' | 'ENROLLED' | 'SAVINGS'>('PROGRAMS');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await merchantService.getBenefitsPrograms();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to fetch benefits programs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (programId: string) => {
    if (!confirm('Are you sure you want to enroll in this program?')) return;
    try {
      await merchantService.enrollInBenefit(programId);
      showToast('Enrollment successful. You will be contacted for next steps.', 'success');
      setActiveTab('ENROLLED');
    } catch (err) {
      console.error('Failed to enroll in benefit', err);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[3rem]" />)}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Collective Benefits Node.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Access high-quality benefits at co-op rates for you and your employees.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit">
          <TabButton active={activeTab === 'PROGRAMS'} onClick={() => setActiveTab('PROGRAMS')} label="Available Programs" />
          <TabButton active={activeTab === 'ENROLLED'} onClick={() => setActiveTab('ENROLLED')} label="My Coverage" />
          <TabButton active={activeTab === 'SAVINGS'} onClick={() => setActiveTab('SAVINGS')} label="Benefits Savings" />
        </div>
      </div>

      {activeTab === 'PROGRAMS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map(p => (
            <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#7851A9] group-hover:bg-[#7851A9] group-hover:text-white transition-all">
                  <Heart size={24} />
                </div>
                <span className="px-4 py-1.5 bg-[#7851A9]/10 text-[#7851A9] rounded-full text-[10px] font-black uppercase tracking-widest">Save {p.savings}</span>
              </div>
              
              <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">{p.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Coverage: {p.coverage}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Monthly Cost</span>
                  <span className="text-black">{p.cost}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Collective Rate</span>
                  <span>Market Rate: $600+</span>
                </div>
              </div>

              <button 
                onClick={() => handleEnroll(p.id)}
                className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Enroll Now <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ENROLLED' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm text-center space-y-8">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
            <Shield size={40} />
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Active Coverage.</h3>
            <p className="text-slate-400 font-medium">You are currently enrolled in the Community Health Plan. Your coverage is active and verified.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 text-left max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black uppercase italic tracking-tighter">Community Health Plan</h4>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Enrolled Since</p>
                <p className="text-sm font-black italic">Jan 1, 2026</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Monthly Cost</p>
                <p className="text-sm font-black italic">$450.00</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Next Renewal</p>
                <p className="text-sm font-black italic">Jan 1, 2027</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Group ID</p>
                <p className="text-sm font-black italic">GC-HEALTH-001</p>
              </div>
            </div>
            <button className="mt-8 w-full py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">View Full Policy</button>
          </div>
        </div>
      )}

      {activeTab === 'SAVINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Benefits Savings Velocity</h3>
            <div className="space-y-6">
              {[
                { date: 'Mar 1', program: 'Community Health Plan', savings: 150.00 },
                { date: 'Feb 1', program: 'Community Health Plan', savings: 150.00 },
                { date: 'Jan 1', program: 'Community Health Plan', savings: 150.00 }
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{s.program}</p>
                      <p className="text-[10px] font-medium text-slate-400">{s.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black italic text-emerald-500">-${s.savings.toFixed(2)}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Monthly Savings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-black p-10 rounded-[4rem] text-white shadow-2xl flex flex-col justify-center text-center space-y-6 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Total Benefits Savings</p>
              <h4 className="text-5xl font-black italic tracking-tighter uppercase mt-2">$450.00</h4>
              <p className="text-xs text-slate-400 font-medium mt-6 italic">By participating in collective benefits, you have reduced your overhead by $1,800 annually.</p>
            </div>
            <div className="absolute -right-20 -bottom-20 opacity-10">
              <Star size={300} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{label}</button>
);
