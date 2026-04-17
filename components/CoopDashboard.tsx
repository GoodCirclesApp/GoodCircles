import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';

interface CoopStatus {
  merchantCount: number;
  crossCategoryActive: boolean;
  crossCategoryProgress: number;
  categoryProgress: {
    category: string;
    count: number;
    threshold: number;
    isActive: boolean;
    regionId: string;
  };
  activeGroups: any[];
}

export const CoopDashboard: React.FC = () => {
  const { currentUser } = useGoodCirclesStore();
  const [status, setStatus] = useState<CoopStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/coop/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch coop status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cooperative Purchasing</h1>
          <p className="text-slate-500 mt-1">Leverage collective buying power to reduce your overhead.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
          <Users className="w-4 h-4" />
          <span>{status.merchantCount} Active Merchants</span>
        </div>
      </div>

      {/* Activation Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cross-Category Co-op */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            {status.crossCategoryActive ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
            ) : (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">Monitoring</span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-slate-900">Platform-Wide Co-op</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            General business savings: Insurance, software, office supplies, and more.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-600">Activation Threshold</span>
              <span className="text-slate-900">{status.merchantCount} / 200 Merchants</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(status.crossCategoryProgress, 100)}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Activates platform-wide when 200 verified merchants are active.
            </p>
          </div>
        </motion.div>

        {/* Category-Specific Co-op */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Target className="w-6 h-6" />
            </div>
            {status.categoryProgress.isActive ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
            ) : (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">Monitoring</span>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-slate-900">{status.categoryProgress.category} Co-op</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            Industry-specific deals: Specialized equipment, raw materials, and services.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-600">Regional Density ({status.categoryProgress.regionId})</span>
              <span className="text-slate-900">{status.categoryProgress.count} / {status.categoryProgress.threshold} Merchants</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((status.categoryProgress.count / status.categoryProgress.threshold) * 100, 100)}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Activates when 75 merchants of your type join in this region.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Deals Section (Only if groups are active) */}
      {status.activeGroups.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Active Purchasing Groups</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {status.activeGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{group.name}</h4>
                      <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{group.coopType.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    Browse Deals
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">System in Monitoring Mode</h3>
            <p className="text-slate-500">
              We're currently tracking merchant density in your area. Once thresholds are met, 
              cooperative buying power will automatically activate for your business.
            </p>
            <div className="pt-4">
              <button className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
                Invite Peer Merchants
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900">Lower Unit Costs</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            By pooling orders with other merchants, you access wholesale pricing usually reserved for major corporations.
          </p>
        </div>
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900">Vetted Suppliers</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Our platform admins vet every supplier for quality, reliability, and ethical business practices.
          </p>
        </div>
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900">Auto-Activation</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            No complex setup required. The system monitors your industry's growth and activates when the math works.
          </p>
        </div>
      </div>
    </div>
  );
};
