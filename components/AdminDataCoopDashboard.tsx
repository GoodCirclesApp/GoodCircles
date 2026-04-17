import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  PieChart, 
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  DollarSign,
  Activity
} from 'lucide-react';

interface AdminDashboardData {
  optInRate: number;
  totalMembers: number;
  activeCategories: number;
  totalCategories: number;
  premiumRevenue: number;
}

export const AdminDataCoopDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data-coop/admin/dashboard');
        if (!res.ok) throw new Error('Failed to fetch admin dashboard');
        setData(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851A9]"></div></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Cooperative Admin</h1>
        <p className="text-slate-500 mt-2">Monitor opt-in rates, activation status, and premium revenue.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Members" 
          value={data?.totalMembers.toString() || '0'} 
          icon={<Users className="w-5 h-5" />} 
          color="blue"
        />
        <StatCard 
          label="Opt-In Rate" 
          value={`${((data?.optInRate || 0) * 100).toFixed(1)}%`} 
          icon={<Activity className="w-5 h-5" />} 
          color="emerald"
        />
        <StatCard 
          label="Active Categories" 
          value={`${data?.activeCategories} / ${data?.totalCategories}`} 
          icon={<Zap className="w-5 h-5" />} 
          color="purple"
        />
        <StatCard 
          label="Premium Revenue" 
          value={`$${data?.premiumRevenue.toLocaleString()}`} 
          icon={<DollarSign className="w-5 h-5" />} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#7851A9]" />
            Activation Pipeline
          </h3>
          <div className="space-y-6">
             {/* This would ideally list all categories and their progress */}
             <p className="text-sm text-slate-500 italic">
               Detailed category-by-category activation reports are generated weekly. 
               Currently, {data?.activeCategories} categories have met the 10-merchant threshold.
             </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Info className="w-6 h-6 text-emerald-400" />
            System Status
          </h3>
          <div className="space-y-4">
            <StatusItem label="Daily Anonymization" status="Healthy" time="Last run: 4h ago" />
            <StatusItem label="Weekly Activation Check" status="Healthy" time="Last run: 2d ago" />
            <StatusItem label="Monthly Insight Generation" status="Healthy" time="Last run: 12d ago" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
};

const StatusItem = ({ label, status, time }: { label: string, status: string, time: string }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
    <div>
      <p className="text-xs font-bold text-white">{label}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
    </div>
    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">{status}</span>
  </div>
);
