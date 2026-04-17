
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
    { label: 'Total Sales', value: metrics?.totalSales, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Net Revenue', value: metrics?.netRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Nonprofit Impact', value: metrics?.nonprofitContributions, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Platform Fees', value: metrics?.platformFees, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Processing Saved', value: metrics?.processingFeesSaved, icon: Percent, color: 'text-amber-600', bg: 'bg-amber-50' },
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
            <p className="text-2xl font-black italic mt-1">${card.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Revenue Velocity (30D)</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">+12.5% vs last month</span>
            </div>
          </div>
          <div className="h-48 sm:h-80">
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
                    <p className="text-[9px] font-black text-[#7851A9] uppercase">Net: ${t.merchantNet.toFixed(2)}</p>
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
