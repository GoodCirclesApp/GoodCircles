import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Lock, 
  Unlock, 
  Users, 
  TrendingUp, 
  PieChart, 
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface CoopStatus {
  isMember: boolean;
  optedInAt: string | null;
  statuses: {
    category: string;
    regionId: string | null;
    currentCount: number;
    thresholdRequired: number;
    thresholdMet: boolean;
    insightsAvailable: boolean;
  }[];
}

interface Insight {
  id: string;
  category: string;
  metricName: string;
  metricValue: number;
  period: string;
  statisticalConfidence: number;
}

export const DataCoopDashboard: React.FC = () => {
  const [status, setStatus] = useState<CoopStatus | null>(null);
  const [insights, setInsights] = useState<Record<string, Insight[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statusRes = await fetch('/api/data-coop/status');
      if (!statusRes.ok) throw new Error('Failed to fetch status');
      const statusData = await statusRes.ok ? await statusRes.json() : null;
      setStatus(statusData);

      if (statusData) {
        const insightsMap: Record<string, Insight[]> = {};
        for (const s of statusData.statuses) {
          if (s.insightsAvailable && statusData.isMember) {
            const insightsRes = await fetch(`/api/data-coop/insights?category=${encodeURIComponent(s.category)}&regionId=${s.regionId || ''}`);
            if (insightsRes.ok) {
              insightsMap[s.category] = await insightsRes.json();
            }
          }
        }
        setInsights(insightsMap);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async () => {
    try {
      const res = await fetch('/api/data-coop/join', { method: 'POST' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to join coop:', err);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave the Data Coop? You will lose free access to market insights.')) return;
    try {
      const res = await fetch('/api/data-coop/leave', { method: 'POST' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to leave coop:', err);
    }
  };

  const handlePurchase = async (category: string, regionId: string | null) => {
    try {
      const res = await fetch('/api/data-coop/insights/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, regionId })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to purchase premium access:', err);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851A9]"></div></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Merchant Data Cooperative</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Share anonymized sales trends to receive free market intelligence. 
            Insights unlock automatically when enough merchants in your category participate.
          </p>
        </div>
        {!status?.isMember ? (
          <button 
            onClick={handleJoin}
            className="px-8 py-4 bg-[#7851A9] text-white rounded-2xl font-bold hover:bg-[#634191] transition-all shadow-lg shadow-[#7851A9]/20 flex items-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            Join Data Cooperative
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Active Member
            </span>
            <button onClick={handleLeave} className="text-xs text-slate-400 hover:text-red-500 font-medium underline underline-offset-4">Leave Coop</button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {status?.statuses.map((s) => (
            <motion.div 
              key={s.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-600">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{s.category} Insights</h3>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Region: {s.regionId || 'Global'}</p>
                    </div>
                  </div>
                  {s.insightsAvailable ? (
                    <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                  ) : (
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">Dormant</span>
                  )}
                </div>

                {!s.insightsAvailable ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-2xl font-black text-slate-900">{s.currentCount} <span className="text-slate-400 text-sm font-bold">/ {s.thresholdRequired}</span></p>
                          <p className="text-xs text-slate-500 font-medium mt-1">Merchants opted-in</p>
                        </div>
                        <p className="text-xs font-black text-[#7851A9] uppercase tracking-widest">
                          {s.thresholdRequired - s.currentCount} more to unlock
                        </p>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.currentCount / s.thresholdRequired) * 100}%` }}
                          className="h-full bg-[#7851A9] rounded-full"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed italic">
                      "We collect and anonymize your data from day one, but we only surface insights when category density makes them statistically meaningful and protects individual privacy."
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {status.isMember || insights[s.category] ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {insights[s.category]?.map((insight) => (
                          <div key={insight.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{insight.metricName.replace(/_/g, ' ')}</p>
                            <p className="text-2xl font-black text-slate-900">
                              {insight.metricName.includes('VALUE') || insight.metricName.includes('VOLUME') ? `$${insight.metricValue.toLocaleString()}` : insight.metricValue}
                            </p>
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-[10px] text-slate-400 font-medium">Period: {insight.period}</span>
                              <span className="text-[10px] text-emerald-600 font-bold">Confidence: {(insight.statisticalConfidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                        {(!insights[s.category] || insights[s.category].length === 0) && (
                          <div className="col-span-2 p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                            <p className="text-sm text-slate-500">Insights are being generated for the current period. Check back soon.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-[#7851A9]/5 rounded-[2rem] border border-dashed border-[#7851A9]/20">
                        <Lock className="w-10 h-10 text-[#7851A9] mx-auto mb-4 opacity-40" />
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Insights Locked</h4>
                        <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                          Join the Data Cooperative to unlock free category insights, or purchase premium access for this category.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <button onClick={handleJoin} className="px-6 py-3 bg-[#7851A9] text-white rounded-xl font-bold text-sm">Join for Free Access</button>
                          <button onClick={() => handlePurchase(s.category, s.regionId)} className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-sm">Purchase Premium ($25)</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Privacy First
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Anonymization:</strong> All transaction data is stripped of merchant and consumer identifiers before storage.
                </p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Aggregation:</strong> Individual records are never queryable. We only store and display high-level aggregates.
                </p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Density Guards:</strong> Insights only surface when at least 10 merchants participate, preventing reverse-engineering.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#7851A9]" />
              Available Metrics
            </h3>
            <div className="space-y-4">
              <MetricItem label="Avg Transaction Value" desc="Benchmark your pricing against category averages." />
              <MetricItem label="Demand Trends" desc="Track MoM growth across your industry." />
              <MetricItem label="Seasonal Patterns" desc="Anticipate peaks based on historical data." />
              <MetricItem label="Price Sensitivity" desc="Understand how price changes impact volume." />
              <MetricItem label="Consumer Frequency" desc="Benchmark your customer retention rates." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricItem = ({ label, desc }: { label: string, desc: string }) => (
  <div className="group">
    <p className="text-xs font-bold text-slate-900 group-hover:text-[#7851A9] transition-colors">{label}</p>
    <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
  </div>
);

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
