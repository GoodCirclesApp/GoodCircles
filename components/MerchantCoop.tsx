
import React, { useState, useEffect } from 'react';
import { merchantService } from '../services/merchantService';
import { ShoppingBag, Users, TrendingDown, ArrowRight, Check, AlertCircle, Plus, Search } from 'lucide-react';
import { showToast } from '../hooks/toast';

export const MerchantCoop: React.FC = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DEALS' | 'GROUPS' | 'SAVINGS'>('DEALS');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const data = await merchantService.getCoopDeals();
      setDeals(data);
    } catch (err) {
      console.error('Failed to fetch coop deals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async (dealId: string) => {
    const quantity = prompt('Enter quantity to commit:');
    if (!quantity || isNaN(Number(quantity))) return;
    try {
      await merchantService.commitToCoopDeal(dealId, Number(quantity));
      showToast('Commitment secured. You will be notified when the deal activates.', 'success');
      fetchDeals();
    } catch (err) {
      console.error('Failed to commit to deal', err);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[3rem]" />)}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Co-op Purchasing Hub.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Leverage collective volume to lower COGS and increase net profit.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit">
          <TabButton active={activeTab === 'DEALS'} onClick={() => setActiveTab('DEALS')} label="Active Deals" />
          <TabButton active={activeTab === 'GROUPS'} onClick={() => setActiveTab('GROUPS')} label="My Groups" />
          <TabButton active={activeTab === 'SAVINGS'} onClick={() => setActiveTab('SAVINGS')} label="Savings History" />
        </div>
      </div>

      {activeTab === 'DEALS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.map(deal => (
            <div key={deal.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#7851A9] group-hover:bg-[#7851A9] group-hover:text-white transition-all">
                  <ShoppingBag size={24} />
                </div>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Save {deal.discount}</span>
              </div>
              
              <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">{deal.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Supplier: {deal.supplier}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Volume Progress</span>
                  <span className="text-black">{Math.round((deal.currentCommitted / deal.minQuantity) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7851A9]" style={{ width: `${(deal.currentCommitted / deal.minQuantity) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>{deal.currentCommitted} committed</span>
                  <span>Goal: {deal.minQuantity}</span>
                </div>
              </div>

              <button 
                onClick={() => handleCommit(deal.id)}
                className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Commit Quantity <ArrowRight size={14} />
              </button>
            </div>
          ))}
          
          <div className="bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4 group hover:border-[#7851A9] transition-all cursor-pointer">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 group-hover:text-[#7851A9] transition-all">
              <Plus size={32} />
            </div>
            <h4 className="text-lg font-black italic uppercase tracking-tighter">Propose New Deal</h4>
            <p className="text-[10px] font-medium text-slate-400 max-w-[200px]">Have a supplier you want to bring to the co-op? Propose a collective deal.</p>
          </div>
        </div>
      )}

      {activeTab === 'GROUPS' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm text-center space-y-8">
          <div className="w-24 h-24 bg-[#7851A9]/10 text-[#7851A9] rounded-[2.5rem] flex items-center justify-center mx-auto">
            <Users size={40} />
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Collective Nodes.</h3>
            <p className="text-slate-400 font-medium">You are not currently part of any purchasing groups. Join a group to unlock higher volume discounts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 text-left hover:border-[#7851A9] transition-all cursor-pointer group">
              <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">Local Roasters Guild</h4>
              <p className="text-[10px] font-medium text-slate-400 mb-6">8 members • Focused on green bean sourcing and packaging.</p>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] group-hover:underline">Request to Join</button>
            </div>
            <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 text-left hover:border-[#7851A9] transition-all cursor-pointer group">
              <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">Main St. Retailers</h4>
              <p className="text-[10px] font-medium text-slate-400 mb-6">15 members • Shared logistics and marketing services.</p>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] group-hover:underline">Request to Join</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SAVINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Savings Velocity</h3>
            <div className="space-y-6">
              {[
                { date: 'Mar 15', deal: 'Bulk Coffee Beans', savings: 145.20, status: 'COMPLETED' },
                { date: 'Feb 28', deal: 'Eco-Packaging', savings: 89.50, status: 'COMPLETED' },
                { date: 'Jan 12', deal: 'Organic Milk', savings: 210.00, status: 'COMPLETED' }
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{s.deal}</p>
                      <p className="text-[10px] font-medium text-slate-400">{s.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black italic text-emerald-500">-${s.savings.toFixed(2)}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">COGS Reduction</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-black p-10 rounded-[4rem] text-white shadow-2xl flex flex-col justify-center text-center space-y-6 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Total Co-op Savings</p>
              <h4 className="text-5xl font-black italic tracking-tighter uppercase mt-2">$1,245.70</h4>
              <p className="text-xs text-slate-400 font-medium mt-6 italic">By leveraging collective volume, you have increased your net profit margin by 4.2% this year.</p>
            </div>
            <div className="absolute -right-20 -bottom-20 opacity-10">
              <TrendingDown size={300} />
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
