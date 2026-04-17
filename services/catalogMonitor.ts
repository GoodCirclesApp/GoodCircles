// =============================================================================
// GoodCircles AI Catalog Upload Tool — COGS Monitoring & Alerting
// =============================================================================
// Real-time and aggregate monitoring for catalog upload operations:
//   - Track COGS per import in real-time (API calls + Claude tokens)
//   - Alert if any import exceeds tier COGS budget by more than 20%
//   - Dashboard metrics: imports/day, avg COGS per tier, success rate, avg time
//   - Monthly COGS report: actual vs projected per tier
//   - Error logging with context for debugging
// =============================================================================

import type { CatalogTier, ApiCostEntry } from '../types/catalog';
import { TIER_CONFIG } from '../types/catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MonitoringMetrics {
  // Summary
  totalImports: number;
  importsToday: number;
  importsThisWeek: number;
  importsThisMonth: number;

  // Success rates
  overallSuccessRate: number;    // Percentage
  successRateThisWeek: number;

  // COGS metrics
  avgCogsPerTier: Record<string, { avgCogs: number; avgMargin: number; count: number }>;
  totalRevenueThisMonth: number;
  totalCogsThisMonth: number;
  overallMarginThisMonth: number;

  // Performance
  avgProcessingTimeMinutes: number;
  activeJobsNow: number;

  // Alerts
  cogsAlerts: CogsAlert[];
}

export interface CogsAlert {
  importId: string;
  merchantId: string;
  tier: CatalogTier;
  budgetUsd: number;
  actualUsd: number;
  overspendPercent: number;
  timestamp: Date;
  resolved: boolean;
}

export interface TierCogsReport {
  tier: CatalogTier;
  period: string;                // e.g., "2026-04"
  importCount: number;
  projectedCogsPerImport: number;
  actualAvgCogs: number;
  minCogs: number;
  maxCogs: number;
  avgMarginPercent: number;
  withinTarget: boolean;
  recommendation: string | null;
}

// ---------------------------------------------------------------------------
// Real-Time COGS Tracking
// ---------------------------------------------------------------------------

// In-memory alert buffer (flushed to DB periodically)
const alertBuffer: CogsAlert[] = [];

/**
 * Track COGS for an import in real-time.
 * Called by the job queue as API calls and AI processing occur.
 * Alerts if spending exceeds the tier's COGS budget by more than 20%.
 */
export function trackImportCogs(
  importId: string,
  merchantId: string,
  tier: CatalogTier,
  costEntries: ApiCostEntry[],
): { totalCost: number; withinBudget: boolean; alert: CogsAlert | null } {
  const totalCost = costEntries.reduce((sum, c) => sum + c.estimatedCostUsd, 0);

  const tierConfig = TIER_CONFIG.find((t) => t.tier === tier);
  const budget = tierConfig?.estimatedPlatformCogs || 60;
  const threshold = budget * 1.2; // 20% over budget

  let alert: CogsAlert | null = null;

  if (totalCost > threshold) {
    alert = {
      importId,
      merchantId,
      tier,
      budgetUsd: budget,
      actualUsd: Math.round(totalCost * 100) / 100,
      overspendPercent: Math.round(((totalCost - budget) / budget) * 100),
      timestamp: new Date(),
      resolved: false,
    };

    alertBuffer.push(alert);

    console.warn(
      `[CatalogMonitor] COGS ALERT: Import ${importId} (${tier}) — ` +
      `$${totalCost.toFixed(2)} actual vs $${budget} budget ` +
      `(${alert.overspendPercent}% over threshold)`
    );
  }

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    withinBudget: totalCost <= threshold,
    alert,
  };
}

/**
 * Get all unresolved COGS alerts.
 */
export function getActiveAlerts(): CogsAlert[] {
  return alertBuffer.filter((a) => !a.resolved);
}

/**
 * Mark an alert as resolved (admin action).
 */
export function resolveAlert(importId: string): void {
  const alert = alertBuffer.find((a) => a.importId === importId && !a.resolved);
  if (alert) {
    alert.resolved = true;
  }
}

// ---------------------------------------------------------------------------
// Dashboard Metrics (DB queries)
// ---------------------------------------------------------------------------

/**
 * Fetch comprehensive monitoring metrics for the admin dashboard.
 */
export async function getMonitoringMetrics(db: any): Promise<MonitoringMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total imports
  const totalImports = await db.catalogImport.count();

  // Imports by time period
  const importsToday = await db.catalogImport.count({
    where: { createdAt: { gte: todayStart } },
  });

  const importsThisWeek = await db.catalogImport.count({
    where: { createdAt: { gte: weekStart } },
  });

  const importsThisMonth = await db.catalogImport.count({
    where: { createdAt: { gte: monthStart } },
  });

  // Success rates
  const completedTotal = await db.catalogImport.count({ where: { status: 'COMPLETED' } });
  const failedTotal = await db.catalogImport.count({ where: { status: 'FAILED' } });
  const overallSuccessRate = (completedTotal + failedTotal) > 0
    ? (completedTotal / (completedTotal + failedTotal)) * 100
    : 100;

  const completedThisWeek = await db.catalogImport.count({
    where: { status: 'COMPLETED', completedAt: { gte: weekStart } },
  });
  const failedThisWeek = await db.catalogImport.count({
    where: { status: 'FAILED', createdAt: { gte: weekStart } },
  });
  const successRateThisWeek = (completedThisWeek + failedThisWeek) > 0
    ? (completedThisWeek / (completedThisWeek + failedThisWeek)) * 100
    : 100;

  // Avg COGS per tier
  const avgCogsPerTier: Record<string, { avgCogs: number; avgMargin: number; count: number }> = {};
  for (const tierConfig of TIER_CONFIG) {
    const billingRecords = await db.catalogBilling.findMany({
      where: { tier: tierConfig.tier, status: 'COMPLETED', actualCogs: { not: null } },
      select: { actualCogs: true, grossMargin: true },
    });

    if (billingRecords.length > 0) {
      const avgCogs = billingRecords.reduce((sum: number, r: any) => sum + Number(r.actualCogs) / 100, 0) / billingRecords.length;
      const avgMargin = billingRecords.reduce((sum: number, r: any) => sum + Number(r.grossMargin || 0), 0) / billingRecords.length;
      avgCogsPerTier[tierConfig.tier] = {
        avgCogs: Math.round(avgCogs * 100) / 100,
        avgMargin: Math.round(avgMargin * 100) / 100,
        count: billingRecords.length,
      };
    } else {
      avgCogsPerTier[tierConfig.tier] = {
        avgCogs: tierConfig.estimatedPlatformCogs,
        avgMargin: tierConfig.targetMargin * 100,
        count: 0,
      };
    }
  }

  // Revenue this month
  const revenueThisMonth = await db.catalogRevenue.aggregate({
    where: { timestamp: { gte: monthStart } },
    _sum: { amountPaid: true, cogsActual: true },
  });
  const totalRevenueThisMonth = Number(revenueThisMonth._sum?.amountPaid || 0);
  const totalCogsThisMonth = Number(revenueThisMonth._sum?.cogsActual || 0);
  const overallMarginThisMonth = totalRevenueThisMonth > 0
    ? ((totalRevenueThisMonth - totalCogsThisMonth) / totalRevenueThisMonth) * 100
    : 0;

  // Average processing time
  const completedImports = await db.catalogImport.findMany({
    where: { status: 'COMPLETED', startedAt: { not: null }, completedAt: { not: null } },
    select: { startedAt: true, completedAt: true },
    take: 50,
    orderBy: { completedAt: 'desc' },
  });

  let avgProcessingTimeMinutes = 0;
  if (completedImports.length > 0) {
    const totalMs = completedImports.reduce((sum: number, imp: any) => {
      return sum + (new Date(imp.completedAt).getTime() - new Date(imp.startedAt).getTime());
    }, 0);
    avgProcessingTimeMinutes = Math.round((totalMs / completedImports.length / 60000) * 10) / 10;
  }

  // Active jobs
  const { getActiveJobCount } = await import('./catalogJobQueue');
  const activeJobsNow = getActiveJobCount();

  return {
    totalImports,
    importsToday,
    importsThisWeek,
    importsThisMonth,
    overallSuccessRate: Math.round(overallSuccessRate * 10) / 10,
    successRateThisWeek: Math.round(successRateThisWeek * 10) / 10,
    avgCogsPerTier,
    totalRevenueThisMonth: Math.round(totalRevenueThisMonth * 100) / 100,
    totalCogsThisMonth: Math.round(totalCogsThisMonth * 100) / 100,
    overallMarginThisMonth: Math.round(overallMarginThisMonth * 10) / 10,
    avgProcessingTimeMinutes,
    activeJobsNow,
    cogsAlerts: getActiveAlerts(),
  };
}

// ---------------------------------------------------------------------------
// Monthly COGS Report
// ---------------------------------------------------------------------------

/**
 * Generate a monthly COGS report comparing actual vs projected costs per tier.
 * Feeds back into the financial model for pricing adjustments.
 */
export async function generateMonthlyCOGSReport(
  year: number,
  month: number,
  db: any,
): Promise<TierCogsReport[]> {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const period = `${year}-${String(month).padStart(2, '0')}`;

  const reports: TierCogsReport[] = [];

  for (const tierConfig of TIER_CONFIG) {
    const billingRecords = await db.catalogBilling.findMany({
      where: {
        tier: tierConfig.tier,
        status: 'COMPLETED',
        completedAt: { gte: monthStart, lt: monthEnd },
        actualCogs: { not: null },
      },
      select: { actualCogs: true, grossMargin: true, amountCharged: true },
    });

    if (billingRecords.length === 0) {
      reports.push({
        tier: tierConfig.tier as CatalogTier,
        period,
        importCount: 0,
        projectedCogsPerImport: tierConfig.estimatedPlatformCogs,
        actualAvgCogs: 0,
        minCogs: 0,
        maxCogs: 0,
        avgMarginPercent: tierConfig.targetMargin * 100,
        withinTarget: true,
        recommendation: null,
      });
      continue;
    }

    const costsUsd = billingRecords.map((r: any) => Number(r.actualCogs) / 100);
    const margins = billingRecords.map((r: any) => Number(r.grossMargin || 0));

    const avgCogs = costsUsd.reduce((a: number, b: number) => a + b, 0) / costsUsd.length;
    const minCogs = Math.min(...costsUsd);
    const maxCogs = Math.max(...costsUsd);
    const avgMargin = margins.reduce((a: number, b: number) => a + b, 0) / margins.length;
    const withinTarget = avgMargin >= tierConfig.targetMargin * 100;

    let recommendation: string | null = null;
    if (!withinTarget) {
      const deficit = (tierConfig.targetMargin * 100) - avgMargin;
      if (deficit > 5) {
        recommendation = `CRITICAL: Avg margin ${avgMargin.toFixed(1)}% is ${deficit.toFixed(1)}pp below target. Consider increasing ${tierConfig.tier} tier pricing or reducing AI batch costs.`;
      } else {
        recommendation = `Avg margin ${avgMargin.toFixed(1)}% is slightly below target. Monitor next month; may need pricing adjustment.`;
      }
    } else if (avgCogs < tierConfig.estimatedPlatformCogs * 0.6) {
      recommendation = `COGS significantly below projection ($${avgCogs.toFixed(2)} vs $${tierConfig.estimatedPlatformCogs}). Consider adding more AI processing or reducing tier pricing for competitive advantage.`;
    }

    reports.push({
      tier: tierConfig.tier as CatalogTier,
      period,
      importCount: billingRecords.length,
      projectedCogsPerImport: tierConfig.estimatedPlatformCogs,
      actualAvgCogs: Math.round(avgCogs * 100) / 100,
      minCogs: Math.round(minCogs * 100) / 100,
      maxCogs: Math.round(maxCogs * 100) / 100,
      avgMarginPercent: Math.round(avgMargin * 10) / 10,
      withinTarget,
      recommendation,
    });
  }

  return reports;
}

// ---------------------------------------------------------------------------
// Error Logging
// ---------------------------------------------------------------------------

/**
 * Log an error with full context for debugging.
 * Called from the job queue and connector services.
 */
export async function logError(
  db: any,
  context: {
    importId?: string;
    service: string;
    operation: string;
    error: Error;
    metadata?: Record<string, any>;
  },
): Promise<void> {
  const entry = {
    importId: context.importId || null,
    service: context.service,
    operation: context.operation,
    errorType: context.error.name,
    errorMessage: context.error.message,
    stackTrace: context.error.stack?.slice(0, 1000),
    metadata: context.metadata || {},
    timestamp: new Date(),
  };

  console.error(`[CatalogMonitor] Error in ${context.service}.${context.operation}:`, entry);

  // Persist to DB for admin review
  try {
    await db.catalogErrorLog?.create({ data: entry });
  } catch {
    // If the error log table doesn't exist yet, just console log
    console.error('[CatalogMonitor] Could not persist error log to DB');
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default {
  trackImportCogs,
  getActiveAlerts,
  resolveAlert,
  getMonitoringMetrics,
  generateMonthlyCOGSReport,
  logError,
};
