
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Oct', amount: 1200 },
  { month: 'Nov', amount: 1900 },
  { month: 'Dec', amount: 1500 },
  { month: 'Jan', amount: 2800 },
  { month: 'Feb', amount: 2400 },
  { month: 'Mar', amount: 3200 },
];

export const NonprofitDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Funding" 
          value="$42,850" 
          trend="+12.5%" 
          trendUp={true} 
          icon={DollarSign} 
          color="emerald" 
        />
        <StatCard 
          label="This Month" 
          value="$3,200" 
          trend="+8.2%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="indigo" 
        />
        <StatCard 
          label="Supporters" 
          value="1,240" 
          trend="+5.4%" 
          trendUp={true} 
          icon={Users} 
          color="violet" 
        />
        <StatCard 
          label="Merchants" 
          value="86" 
          trend="-2.1%" 
          trendUp={false} 
          icon={ShoppingBag} 
          color="rose" 
        />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Funding Trend</h3>
            <p className="text-slate-400 text-xs font-medium">Month-over-month contribution growth</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl">6 Months</button>
            <button className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl">1 Year</button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7851A9" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#7851A9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#7851A9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, trendUp, icon: Icon, color }: any) => {
  const colorClasses: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
};
