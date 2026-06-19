import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { nonprofitService } from '../services/nonprofitService';

interface Stats {
  totalFunding: number;
  monthlyFunding: number;
  transactionCount: number;
  uniqueSupporters: number;
  uniqueMerchants: number;
  trend: { month: string; amount: number }[];
}

const money = (n: number) => '$' + (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

export const NonprofitDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    nonprofitService
      .getStats()
      .then((d: any) => setStats(d))
      .catch(() => setError('Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
        </div>
        <div className="h-[300px] bg-slate-100 rounded-[2.5rem]" />
      </div>
    );
  }

  if (error || !stats) {
    return <div className="p-6 bg-red-50 text-red-600 text-sm font-bold rounded-2xl" role="alert">{error || 'No data available.'}</div>;
  }

  const hasActivity = stats.totalFunding > 0;
  const trend = stats.trend ?? [];
  const cur = trend.length ? trend[trend.length - 1].amount : 0;
  const prev = trend.length > 1 ? trend[trend.length - 2].amount : 0;
  const momPct = prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;

  return (
    <div className="space-y-8">
      {!hasActivity && (
        <div className="bg-gradient-to-br from-[#7851A9]/5 to-[#CA9CE1]/5 border border-[#CA9CE1]/30 rounded-[2rem] p-6">
          <p className="text-sm font-black text-[#7851A9] uppercase tracking-tight">Your impact dashboard is ready</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            It activates with your community's first transaction. Under the live model, roughly <strong>10% of each
            sale's net profit</strong> routes to your organization automatically — about <strong>$5 on a $100 sale</strong>,
            with no fundraiser. The numbers below fill in as neighbors who elected your cause start shopping.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Funding" value={money(stats.totalFunding)} icon={DollarSign} color="emerald" />
        <StatCard label="This Month" value={money(stats.monthlyFunding)} icon={TrendingUp} color="indigo" trend={momPct} />
        <StatCard label="Supporters" value={stats.uniqueSupporters.toLocaleString()} icon={Users} color="violet" />
        <StatCard label="Merchants" value={stats.uniqueMerchants.toLocaleString()} icon={ShoppingBag} color="rose" />
      </div>

      {hasActivity && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="mb-8">
            <h3 className="text-lg font-black uppercase tracking-tight">Funding Trend</h3>
            <p className="text-slate-400 text-xs font-medium">Month-over-month contributions (last 6 months)</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7851A9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#7851A9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="amount" stroke="#7851A9" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }: { label: string; value: string; icon: any; color: string; trend?: number | null }) => {
  const colorClasses: Record<string, string> = {
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
        {typeof trend === 'number' && (
          <div className={`flex items-center gap-1 text-[10px] font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
};
