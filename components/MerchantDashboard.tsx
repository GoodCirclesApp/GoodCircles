
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { merchantService } from '../services/merchantService';
import { DollarSign, TrendingUp, Heart, Shield, Percent, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const MerchantDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, c, t] = await Promise.all([
          merchantService.getDashboardMetrics(),
          merchantService.getRevenueChartData(),
          merchantService.getTransactions()
        ]);
        setMetrics(m);
        setChartData(c);
        setTransactions(t.slice(0, 5)); // Only show recent 5
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Sales', value: metrics?.totalSales, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', note: undefined },
    { label: 'Net Revenue', value: metrics?.netRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', note: undefined },
    { label: 'Discounts Given', value: metrics?.discountsGiven, icon: Percent, color: 'text-amber-600', bg: 'bg-amber-50', note: 'Tax deductible' },
    { label: 'Nonprofit Donations', value: metrics?.nonprofitContributions, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', note: 'Tax deductible' },
    { label: 'Processing Saved', value: metrics?.processingFeesSaved, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50', note: undefined },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              <card.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
            <p className="text-2xl font-black italic mt-1">${(card.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            {card.note && <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{card.note}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Revenue Velocity (30D)</h3>
            {chartData.length > 0 && (
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">Live Data</span>
              </div>
            )}
          </div>
          <div className="h-48 sm:h-80">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                <div>
                  <p className="text-sm font-black italic uppercase tracking-tighter text-slate-300">No revenue data yet</p>
                  <p className="text-xs text-slate-300 font-medium mt-1">Your first sales will appear here</p>
                </div>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7851A9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7851A9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800 }} 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} hide={window.innerWidth < 640} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1rem' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7851A9" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Recent Activity</h3>
          <div className="space-y-6">
            {transactions.length === 0 ? (
              <p className="text-slate-400 text-sm italic py-12 text-center">No recent transactions.</p>
            ) : (
              transactions.map((t, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${t.grossAmount > 0 ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {t.grossAmount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate uppercase tracking-tight">{t.productService?.name || 'Platform Transaction'}</p>
                    <p className="text-[10px] font-medium text-slate-400">{format(new Date(t.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black italic">${t.grossAmount.toFixed(2)}</p>
                    <p className="text-[10px] font-black text-[#7851A9] uppercase">Net: ${t.merchantNet.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-8 py-4 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};
