
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TreasuryStats, TreasuryRecommendation } from '../types';
import { generateTreasuryInsights } from '../services/aiReportingService';
import { generateTreasuryRecommendations } from '../services/aiTreasuryService';
import { BrandSubmark } from './BrandAssets';
import { showToast } from '../hooks/toast';

interface Props {
  stats: TreasuryStats;
}

const COLORS = ['#7851A9', '#C2A76F', '#A20021', '#E2E8F0'];

export const TreasuryDashboard: React.FC<Props> = ({ stats }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<TreasuryRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [ins, recs] = await Promise.all([
        generateTreasuryInsights(stats),
        generateTreasuryRecommendations(stats)
      ]);
      setInsights(ins);
      setRecommendations(recs);
      setLoading(false);
    }
    fetchData();
  }, [stats]);

  const handleApply = (id: string) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, isApplied: true } : r));
    showToast('Recommendation queued for Governance Node verification.', 'info');
  };

  const flowData = [
    { name: 'Internal Economy', value: stats.totalInternalVolume, fill: '#7851A9' },
    { name: 'External Inflow', value: stats.totalExternalInflow, fill: '#C2A76F' },
    { name: 'External Outflow', value: stats.totalExternalOutflow, fill: '#A20021' },
  ];

  const pieData = [
    { name: 'Retained Community Wealth', value: stats.totalExternalInflow - stats.totalExternalOutflow },
    { name: 'System Leakage', value: stats.totalExternalOutflow },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-2 h-2 rounded-full bg-[#C2A76F] animate-pulse"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C2A76F] font-accent">Macro-Economic Treasury Node</p>
        </div>
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Sovereign Economy.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-8">Tracking the velocity and retention of community capital through the Good Circles Ledger.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <MultiplierCard label="Money Multiplier" value={`${stats.moneyMultiplier.toFixed(1)}x`} desc="Number of times capital circulates before exiting." />
        <MultiplierCard label="Retention Rate" value={`${(stats.retentionRate * 100).toFixed(1)}%`} desc="Percentage of external inflow kept in the circle." />
        <MultiplierCard label="Circular Velocity" value={stats.circularVelocity.toFixed(2)} desc="Overall health index of the local economy node." />
        <MultiplierCard label="Internal Volume" value={`$${(stats.totalInternalVolume / 1000).toFixed(1)}k`} desc="Total economic activity settled within the GCLA." />
      </div>

      {/* AI Recommendations Hub */}
      <section className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
         <div className="relative z-10 space-y-12">
            <div className="flex justify-between items-center">
               <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[#C2A76F]">AI Agent Steering</h3>
               {loading && <div className="animate-spin w-5 h-5 border-2 border-[#C2A76F] border-t-transparent rounded-full"></div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {recommendations.map(rec => (
                 <div key={rec.id} className={`p-8 rounded-[3rem] border transition-all ${rec.isApplied ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[10px] font-black uppercase text-[#C2A76F] tracking-widest">{rec.type.replace('_', ' ')}</span>
                       <span className="text-[10px] font-bold text-white/40">{Math.round(rec.confidence * 100)}% Conf</span>
                    </div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4">{rec.title}</h4>
                    <p className="text-sm text-white/60 mb-8 leading-relaxed italic">"{rec.description}"</p>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-emerald-400 uppercase">{rec.impactForecast}</span>
                       <button 
                         onClick={() => handleApply(rec.id)}
                         disabled={rec.isApplied}
                         className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rec.isApplied ? 'text-emerald-400 bg-emerald-400/10' : 'bg-[#C2A76F] text-black hover:bg-white'}`}
                       >
                         {rec.isApplied ? 'Implemented' : 'Execute'}
                       </button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
            <BrandSubmark size={240} variant="WHITE" showCrown={false} />
         </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 bg-white p-12 rounded-[4rem] border border-[#CA9CE1]/20 shadow-sm">
           <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-10">Capital Flow Dynamics</h3>
           <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={flowData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                 />
                 <Bar dataKey="value" radius={[20, 20, 0, 0]} barSize={80} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-black text-white p-12 rounded-[4rem] flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
           <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 z-10">Wealth Retention</h3>
           <div className="h-[250px] w-full z-10">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   <Cell fill="#7851A9" />
                   <Cell fill="#1A1A1A" stroke="#333" />
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="text-center z-10 mt-6">
              <p className="text-[10px] font-black uppercase text-white/40 mb-2">Internalized Capital</p>
              <p className="text-4xl font-black italic text-[#C2A76F]">${(stats.totalExternalInflow - stats.totalExternalOutflow).toLocaleString()}</p>
           </div>
           <div className="absolute top-0 right-0 p-12 opacity-5">
             <BrandSubmark size={140} variant="WHITE" showCrown={true} />
           </div>
        </div>
      </div>
    </div>
  );
};

const MultiplierCard = ({ label, value, desc }: { label: string, value: string | number, desc: string }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-[#CA9CE1]/10 shadow-sm space-y-4 hover:shadow-xl hover:border-[#7851A9]/20 transition-all group">
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent">{label}</p>
     <p className="text-5xl font-black italic tracking-tighter text-black group-hover:scale-105 transition-transform origin-left">{value}</p>
     <p className="text-xs text-slate-500 font-medium italic leading-relaxed">"{desc}"</p>
  </div>
);
