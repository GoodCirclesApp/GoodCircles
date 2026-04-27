
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Globe, TrendingUp, Target, Zap } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const CATEGORY_COLORS = ['#7851A9', '#A20021', '#000000', '#94a3b8', '#C2A76F', '#34D399'];

interface AnalyticsData {
  topCategories: { name: string; value: number }[];
  geographicCoverage: number;
  avgContribution: number;
}

interface StatsData {
  trend: { month: string; amount: number }[];
}

export const NonprofitAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<AnalyticsData>('/nonprofit/analytics'),
      apiClient.get<StatsData>('/nonprofit/stats'),
    ])
      .then(([a, s]) => { setAnalytics(a); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryData = analytics?.topCategories.map((c, i) => ({
    ...c,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  })) ?? [];

  const totalCategoryValue = categoryData.reduce((s, c) => s + c.value, 0) || 1;

  const growthData = stats?.trend ?? [];

  if (loading) {
    return (
      <div className="space-y-10">
        {[1, 2].map(i => (
          <div key={i} className="h-64 bg-slate-50 rounded-[3rem] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Distribution */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Category Distribution</h3>
              <p className="text-slate-400 text-xs font-medium">Top contributing merchant sectors</p>
            </div>
            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
              <Zap size={20} />
            </div>
          </div>
          {categoryData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm font-medium italic">
              No transactions yet — data will appear after first purchases.
            </div>
          ) : (
            <div className="h-[300px] flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-4">
                {categoryData.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-black transition-colors">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black">{Math.round((cat.value / totalCategoryValue) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6-Month Donation Trend */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">6-Month Trend</h3>
              <p className="text-slate-400 text-xs font-medium">Monthly donation totals</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Donations']}
                />
                <Bar dataKey="amount" fill="#7851A9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Geographic Coverage</p>
            <p className="text-xl font-black">{analytics?.geographicCoverage ?? 0} State{(analytics?.geographicCoverage ?? 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Contribution</p>
            <p className="text-xl font-black">${(analytics?.avgContribution ?? 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Categories</p>
            <p className="text-xl font-black">{categoryData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
