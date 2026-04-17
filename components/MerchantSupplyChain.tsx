
import React, { useState, useEffect } from 'react';
import { merchantService } from '../services/merchantService';
import { Truck, Search, ArrowRight, Check, AlertCircle, Plus, Zap, TrendingDown, Shield } from 'lucide-react';

export const MerchantSupplyChain: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [suppliers, setSuppliers] = useState([
    { id: 'sup-1', name: 'Sysco', category: 'Food & Beverage', spend: '$2,400/mo' },
    { id: 'sup-2', name: 'Amazon Business', category: 'Office Supplies', spend: '$450/mo' }
  ]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await merchantService.getSupplyChainMatches();
      setMatches(data);
    } catch (err) {
      console.error('Failed to fetch supply chain matches', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[3rem]" />)}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Supply Chain Node.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Audit your external spend and transition to on-platform local partners.</p>
        </div>
        <button 
          onClick={() => setIsAddingSupplier(true)}
          className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Declare Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">External Spend Audit</h3>
            <div className="space-y-4">
              {suppliers.map(s => (
                <div key={s.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{s.name}</p>
                      <p className="text-[10px] font-medium text-slate-400">{s.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black italic text-black">{s.spend}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Monthly Volume</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Suggested On-Platform Matches</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                <Zap size={10} className="animate-pulse" /> Sentinel AI Active
              </div>
            </div>
            <div className="space-y-6">
              {matches.map(m => (
                <div key={m.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 relative overflow-hidden group hover:border-[#7851A9] transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.currentSupplier}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-lg font-black uppercase italic tracking-tighter text-[#7851A9]">{m.suggestedMatch}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 max-w-md italic">Transitioning to this local partner will keep capital within the community and reduce your logistics carbon footprint.</p>
                    </div>
                    <div className="flex gap-8 text-center">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Potential Savings</p>
                        <p className="text-2xl font-black italic text-emerald-500">{m.potentialSavings}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Impact Score</p>
                        <p className="text-2xl font-black italic text-[#7851A9]">{m.impactScore}%</p>
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all">
                      View Proposal
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield size={200} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#7851A9] p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">Savings Calculator</h4>
              <p className="text-white/60 text-xs font-medium mb-8">Estimate your annual savings by transitioning your supply chain.</p>
              <div className="space-y-6">
                <div className="p-6 bg-white/10 rounded-3xl border border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Estimated Annual Savings</p>
                  <p className="text-4xl font-black italic">$4,120.00</p>
                </div>
                <div className="p-6 bg-white/10 rounded-3xl border border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Community Capital Kept</p>
                  <p className="text-4xl font-black italic">$34,200.00</p>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
                Run Full Audit
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 opacity-10">
              <TrendingDown size={300} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Shield size={16} className="text-[#7851A9]" /> Supply Integrity
            </h4>
            <p className="text-[10px] font-medium text-slate-400 italic mb-6">Your supply chain is currently 32% local. Transitioning to suggested matches will increase this to 85%.</p>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-[#7851A9] w-[32%]" />
              <div className="h-full bg-[#7851A9]/30 w-[53%]" />
            </div>
            <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-widest">
              <span className="text-[#7851A9]">32% Current</span>
              <span className="text-slate-400">85% Potential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
