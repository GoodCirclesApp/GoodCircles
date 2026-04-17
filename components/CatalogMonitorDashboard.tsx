// =============================================================================
// GoodCircles AI Catalog Upload Tool — Admin Monitoring Dashboard
// =============================================================================
// Admin-only component displaying:
//   - Import volume (today / week / month)
//   - Success rate
//   - Avg COGS per tier with margin health
//   - Revenue summary
//   - Active COGS alerts
//   - Monthly COGS vs projected comparison
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, DollarSign, AlertTriangle,
  CheckCircle, XCircle, Clock, RefreshCw, BarChart3, Shield,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (mirrored from catalogMonitor.ts)
// ---------------------------------------------------------------------------

interface MonitoringMetrics {
  totalImports: number;
  importsToday: number;
  importsThisWeek: number;
  importsThisMonth: number;
  overallSuccessRate: number;
  successRateThisWeek: number;
  avgCogsPerTier: Record<string, { avgCogs: number; avgMargin: number; count: number }>;
  totalRevenueThisMonth: number;
  totalCogsThisMonth: number;
  overallMarginThisMonth: number;
  avgProcessingTimeMinutes: number;
  activeJobsNow: number;
  cogsAlerts: Array<{
    importId: string;
    merchantId: string;
    tier: string;
    budgetUsd: number;
    actualUsd: number;
    overspendPercent: number;
    timestamp: string;
    resolved: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// Metric Card
// ---------------------------------------------------------------------------

function MetricCard({
  icon,
  label,
  value,
  subValue,
  color = 'purple',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color?: 'purple' | 'green' | 'blue' | 'amber' | 'red';
}) {
  const colors = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-xs sm:text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</div>
      {subValue && (
        <p className="text-xs text-gray-400 mt-1">{subValue}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tier COGS Table
// ---------------------------------------------------------------------------

function TierCogsTable({
  avgCogsPerTier,
}: {
  avgCogsPerTier: MonitoringMetrics['avgCogsPerTier'];
}) {
  const tiers = [
    { key: 'STARTER', label: 'Starter', fee: 75, targetMargin: 89 },
    { key: 'GROWTH', label: 'Growth', fee: 150, targetMargin: 90 },
    { key: 'PROFESSIONAL', label: 'Professional', fee: 300, targetMargin: 88 },
    { key: 'ENTERPRISE', label: 'Enterprise', fee: 500, targetMargin: 88 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-purple-500" />
        COGS by Tier
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-500 font-medium">Tier</th>
              <th className="text-right py-2 text-gray-500 font-medium">Fee</th>
              <th className="text-right py-2 text-gray-500 font-medium">Avg COGS</th>
              <th className="text-right py-2 text-gray-500 font-medium">Margin</th>
              <th className="text-right py-2 text-gray-500 font-medium">Imports</th>
              <th className="text-center py-2 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => {
              const data = avgCogsPerTier[tier.key] || { avgCogs: 0, avgMargin: 0, count: 0 };
              const isHealthy = data.count === 0 || data.avgMargin >= tier.targetMargin;

              return (
                <tr key={tier.key} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{tier.label}</td>
                  <td className="py-3 text-right text-gray-600">${tier.fee}</td>
                  <td className="py-3 text-right text-gray-600">
                    {data.count > 0 ? `$${data.avgCogs.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 text-right">
                    <span className={data.count > 0
                      ? isHealthy ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
                      : 'text-gray-400'
                    }>
                      {data.count > 0 ? `${data.avgMargin.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-500">{data.count}</td>
                  <td className="py-3 text-center">
                    {data.count === 0 ? (
                      <span className="text-gray-300">—</span>
                    ) : isHealthy ? (
                      <CheckCircle className="w-4 h-4 text-green-500 inline" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 inline" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alerts Panel
// ---------------------------------------------------------------------------

function AlertsPanel({
  alerts,
  onResolve,
}: {
  alerts: MonitoringMetrics['cogsAlerts'];
  onResolve: (importId: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          COGS Alerts
        </h3>
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl p-3">
          <CheckCircle className="w-4 h-4" />
          No active alerts. All imports within budget.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        COGS Alerts ({alerts.length})
      </h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.importId}
            className="flex items-start justify-between p-3 bg-red-50 border border-red-100 rounded-xl"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                {alert.tier} — {alert.overspendPercent}% over budget
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                ${alert.actualUsd.toFixed(2)} actual vs ${alert.budgetUsd.toFixed(2)} budget
              </p>
              <p className="text-xs text-red-400 mt-0.5">
                Import: {alert.importId.slice(0, 8)}... | {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onResolve(alert.importId)}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Resolve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export function CatalogMonitorDashboard() {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/catalog/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('[CatalogMonitorDashboard] Failed to fetch metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const handleResolveAlert = useCallback(async (importId: string) => {
    await fetch(`/api/admin/catalog/alerts/${importId}/resolve`, { method: 'POST' });
    fetchMetrics();
  }, [fetchMetrics]);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Catalog Upload Monitoring
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          icon={<Activity className="w-4 h-4" />}
          label="Today"
          value={String(metrics.importsToday)}
          subValue={`${metrics.importsThisWeek} this week`}
          color="purple"
        />
        <MetricCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="This Month"
          value={String(metrics.importsThisMonth)}
          subValue={`${metrics.totalImports} total`}
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle className="w-4 h-4" />}
          label="Success Rate"
          value={`${metrics.overallSuccessRate}%`}
          subValue={`${metrics.successRateThisWeek}% this week`}
          color={metrics.overallSuccessRate >= 95 ? 'green' : 'amber'}
        />
        <MetricCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Revenue (Month)"
          value={`$${metrics.totalRevenueThisMonth.toLocaleString()}`}
          subValue={`$${metrics.totalCogsThisMonth.toFixed(2)} COGS`}
          color="green"
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Margin (Month)"
          value={`${metrics.overallMarginThisMonth}%`}
          subValue="Target: 88–90%"
          color={metrics.overallMarginThisMonth >= 88 ? 'green' : 'red'}
        />
        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Avg Time"
          value={`${metrics.avgProcessingTimeMinutes}m`}
          subValue={`${metrics.activeJobsNow} active now`}
          color="blue"
        />
      </div>

      {/* COGS Table + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TierCogsTable avgCogsPerTier={metrics.avgCogsPerTier} />
        <AlertsPanel alerts={metrics.cogsAlerts} onResolve={handleResolveAlert} />
      </div>
    </div>
  );
}

export default CatalogMonitorDashboard;
