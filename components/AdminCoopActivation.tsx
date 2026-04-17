import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  AlertCircle,
  BarChart3,
  MapPin,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface ActivationTracking {
  id: string;
  checkDate: string;
  category: string | null;
  regionId: string | null;
  merchantCount: number;
  threshold: number;
  isMet: boolean;
}

interface AdminImpact {
  totalSavings: number;
  activeGroupsCount: number;
  totalDeals: number;
  byCategory: Array<{ category: string; savings: number; count: number }>;
  byRegion: Array<{ regionId: string; savings: number; count: number }>;
}

export const AdminCoopActivation: React.FC = () => {
  const [tracking, setTracking] = useState<ActivationTracking[]>([]);
  const [impact, setImpact] = useState<AdminImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchData = async () => {
    try {
      const [trackingRes, impactRes] = await Promise.all([
        fetch('/api/admin/activation'),
        fetch('/api/admin/impact')
      ]);

      if (trackingRes.ok) setTracking(await trackingRes.json());
      if (impactRes.ok) setImpact(await impactRes.json());
    } catch (error) {
      console.error('Failed to fetch admin coop data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const response = await fetch('/api/admin/evaluate', { method: 'POST' });
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to trigger evaluation:', error);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Co-op Activation Control</h1>
          <p className="text-slate-500 mt-1">Monitor thresholds and platform-wide impact.</p>
        </div>
        <button 
          onClick={handleEvaluate}
          disabled={evaluating}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
          {evaluating ? 'Evaluating...' : 'Trigger Manual Evaluation'}
        </button>
      </div>

      {/* Impact Stats */}
      {impact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Platform Savings</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-900">${impact.totalSavings.toLocaleString()}</h3>
              <span className="text-emerald-600 text-sm font-bold flex items-center">
                <ArrowUpRight className="w-4 h-4" />
                +12%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Groups</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{impact.activeGroupsCount}</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed Deals</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{impact.totalDeals}</h3>
          </div>
        </div>
      )}

      {/* Activation Tracking Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Activation Threshold Logs</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Weekly Evaluation Cycle</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Check Date</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Density</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tracking.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(log.checkDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">
                        {log.category || 'Platform-Wide'}
                      </span>
                      {log.regionId && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {log.regionId}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${log.isMet ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          style={{ width: `${Math.min((log.merchantCount / log.threshold) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {log.merchantCount} / {log.threshold}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.isMet ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Threshold Met
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" />
                        Monitoring
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Impact Breakdown */}
      {impact && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Impact by Category
            </h3>
            <div className="space-y-6">
              {impact.byCategory.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-900">{cat.category}</span>
                    <span className="text-emerald-600 font-bold">${cat.savings.toLocaleString()} saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min((cat.savings / (impact.totalSavings || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{cat.count} deals</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Impact by Region
            </h3>
            <div className="space-y-6">
              {impact.byRegion.map((reg) => (
                <div key={reg.regionId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-900">Region {reg.regionId}</span>
                    <span className="text-emerald-600 font-bold">${reg.savings.toLocaleString()} saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min((reg.savings / (impact.totalSavings || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{reg.count} deals</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
