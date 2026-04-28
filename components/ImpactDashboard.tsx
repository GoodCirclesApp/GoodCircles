import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, ShoppingBag, Briefcase, Heart, Shield, MapPin, ExternalLink, Activity } from 'lucide-react';

export const ImpactDashboard: React.FC<{ regionId?: string, isMunicipal?: boolean, token?: string }> = ({ regionId, isMunicipal, token }) => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [region, setRegion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [regionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = '';
      let headers: any = {};

      if (isMunicipal && token) {
        url = '/api/municipal/dashboard';
        headers = { 'x-municipal-token': token };
      } else if (regionId) {
        url = `/api/admin/impact/regions/${regionId}/dashboard`;
      } else {
        url = '/api/admin/impact/platform-wide';
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Data fetch failed');
      
      const data = await res.json();

      if (regionId || isMunicipal) {
        // Safety check: ensure metrics is always an array
        setMetrics(Array.isArray(data?.metrics) ? data.metrics : []);
        setRegion(data?.region || null);
      } else {
        setMetrics(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch impact metrics:', err);
      setMetrics([]); // Fallback to empty list so it doesn't crash
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-black uppercase animate-pulse">Loading Impact Data...</div>;
  
  // If no data, show a friendly message instead of crashing
  if (!metrics || metrics.length === 0) {
    return (
      <div className="p-12 text-center bg-white border-2 border-black rounded-[3rem]">
        <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="font-black uppercase tracking-widest">No metrics available yet.</p>
        <p className="text-slate-400 text-sm">Data will appear here once the first aggregation runs.</p>
      </div>
    );
  }

  // Double safety for the "Latest" calculation
  const latest = metrics[metrics.length - 1] || {};

  const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
    <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 space-y-4 shadow-xl">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <h3 className="text-3xl font-black italic uppercase leading-none">{value}</h3>
        {subValue && <p className="text-xs font-bold text-slate-500">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
            {isMunicipal ? `${region?.cityName || 'Municipal'} Impact` : regionId ? `${region?.name || 'Regional'} Impact` : 'Platform Impact'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={ShoppingBag} 
          label="Total GTV" 
          value={`$${Number(latest.totalGtv || 0).toLocaleString()}`} 
          subValue={`${latest.totalTransactions || 0} Transactions`}
          color="bg-black"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Local Retention" 
          value={`$${Number(latest.totalLocalSpendRetained || 0).toLocaleString()}`} 
          subValue={`${(latest.internalPaymentPct || 0).toFixed(1)}% Internal`}
          color="bg-[#7851A9]"
        />
        <StatCard 
          icon={Heart} 
          label="Nonprofit Funding" 
          value={`$${Number(latest.totalNonprofitFunding || 0).toLocaleString()}`} 
          color="bg-[#A20021]"
        />
        <StatCard 
          icon={Briefcase} 
          label="Jobs Supported" 
          value={Math.round(latest.totalJobsSupported || 0)} 
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border-2 border-black rounded-[3rem] p-10 h-[400px]">
           <h2 className="text-2xl font-black italic uppercase mb-4">GTV Growth</h2>
           <ResponsiveContainer width="100%" height="80%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" />
                <Line type="monotone" dataKey="totalGtv" stroke="#7851A9" strokeWidth={4} />
              </LineChart>
           </ResponsiveContainer>
        </div>
        <div className="bg-white border-2 border-black rounded-[3rem] p-10 h-[400px]">
           <h2 className="text-2xl font-black italic uppercase mb-4">Active Users</h2>
           <ResponsiveContainer width="100%" height="80%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Bar dataKey="merchantsActive" fill="#000" />
                <Bar dataKey="consumersActive" fill="#7851A9" />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
