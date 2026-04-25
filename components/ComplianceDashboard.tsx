import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle2, Clock, AlertCircle, FileText, Globe, Download, Plus, RefreshCw } from 'lucide-react';

const BASE = '/api/compliance';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('gc_auth_token') || ''}`,
});

async function safeFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    const data = await res.json();
    if (!res.ok) {
      console.error('[Compliance] API error', res.status, data);
      return null;
    }
    return data as T;
  } catch (err) {
    console.error('[Compliance] Fetch failed', url, err);
    return null;
  }
}

const JURISDICTION_COLOR: Record<string, string> = {
  FEDERAL: 'bg-slate-800 text-white',
  WYOMING: 'bg-amber-100 text-amber-800',
  MISSISSIPPI: 'bg-blue-100 text-blue-800',
  ALABAMA: 'bg-red-100 text-red-800',
  LOUISIANA: 'bg-purple-100 text-purple-800',
  FLORIDA: 'bg-orange-100 text-orange-800',
  GEORGIA: 'bg-teal-100 text-teal-800',
  INTERNAL: 'bg-emerald-100 text-emerald-800',
};

const CATEGORY_LABEL: Record<string, string> = {
  ANNUAL_REPORT: 'Annual Report',
  CCV_FILING: 'CCV Filing',
  TAX: 'Tax',
  MISSION: 'Mission',
  REGULATORY: 'Regulatory',
};

function DeadlineStatusBadge({ dueDate, completedAt }: { dueDate: string; completedAt: string | null }) {
  if (completedAt) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Complete
      </span>
    );
  }
  const daysUntil = differenceInDays(new Date(dueDate), new Date());
  if (daysUntil < 0) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-full">
        <AlertCircle className="w-3 h-3" /> Overdue
      </span>
    );
  }
  if (daysUntil <= 30) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
        <Clock className="w-3 h-3" /> Due in {daysUntil}d
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
      <Clock className="w-3 h-3" /> {format(new Date(dueDate), 'MMM d')}
    </span>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="py-10 text-center space-y-2">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
      <p className="text-sm font-black text-red-600">Failed to load data</p>
      <p className="text-[10px] text-slate-400 font-medium">{message}</p>
    </div>
  );
}

// ── Deadline Calendar Tab ─────────────────────────────────────────────────────

function DeadlineCalendar() {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const data = await safeFetch<any[]>(`${BASE}/deadlines`, { headers: authHeaders() });
    if (Array.isArray(data)) {
      setDeadlines(data);
    } else {
      setDeadlines([]);
      if (data === null) setError('Could not load deadlines. The compliance tables may not be set up yet.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markComplete = async (id: string) => {
    setMarkingId(id);
    await safeFetch(`${BASE}/deadlines/${id}/complete`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    await load();
    setMarkingId(null);
  };

  if (loading) return <div className="py-12 text-center text-slate-400 text-xs font-bold">Loading deadlines...</div>;
  if (error) return <ErrorBanner message={error} />;

  const pending = deadlines.filter(d => !d.completedAt);
  const completed = deadlines.filter(d => d.completedAt);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Overdue</p>
          <p className="text-3xl font-black text-red-600">{pending.filter(d => differenceInDays(new Date(d.dueDate), new Date()) < 0).length}</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Due ≤30 Days</p>
          <p className="text-3xl font-black text-amber-600">{pending.filter(d => { const n = differenceInDays(new Date(d.dueDate), new Date()); return n >= 0 && n <= 30; }).length}</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Completed</p>
          <p className="text-3xl font-black text-emerald-600">{completed.length}</p>
        </div>
      </div>

      {pending.length === 0 && completed.length === 0 && (
        <div className="py-10 text-center text-slate-400 text-xs font-bold">No compliance deadlines loaded yet.</div>
      )}

      <div className="space-y-3">
        {pending.map(d => (
          <div key={d.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-start gap-4 hover:border-slate-200 transition-all">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${JURISDICTION_COLOR[d.jurisdiction] || 'bg-slate-100 text-slate-600'}`}>
                  {d.jurisdiction}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                  {CATEGORY_LABEL[d.category] || d.category}
                </span>
                <DeadlineStatusBadge dueDate={d.dueDate} completedAt={d.completedAt} />
              </div>
              <p className="text-sm font-black text-black">{d.title}</p>
              {d.description && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{d.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {d.agencyUrl && (
                <a href={d.agencyUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-[#7851A9] transition-colors" title="Open agency website">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {!d.completedAt && (
                <button
                  onClick={() => markComplete(d.id)}
                  disabled={markingId === d.id}
                  className="px-3 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all"
                >
                  {markingId === d.id ? '...' : 'Mark Done'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <details className="group">
          <summary className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-black transition-colors">
            {completed.length} Completed Deadlines
          </summary>
          <div className="mt-3 space-y-2">
            {completed.map(d => (
              <div key={d.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 opacity-60">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-600 flex-1">{d.title}</span>
                <span className="text-[9px] text-slate-400">{format(new Date(d.completedAt), 'MMM d, yyyy')}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ── Mission Report Tab ────────────────────────────────────────────────────────

function MissionReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    safeFetch<any>(`${BASE}/mission-report`, { headers: authHeaders() })
      .then(data => {
        if (data && data.period) {
          setReport(data);
        } else {
          setError('Could not generate mission report. The compliance tables may not be set up yet.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-slate-400 text-xs font-bold">Generating mission report...</div>;
  if (error || !report) return <ErrorBanner message={error || 'No report data available.'} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Mission Multiplier Report</p>
          <h3 className="text-2xl font-black italic text-black uppercase tracking-tighter">{report.period}</h3>
          <p className="text-xs text-slate-400 font-medium">{report.periodStart} → {report.periodEnd}</p>
        </div>
        {report.missionMultiplierMet === null
          ? <div className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-500">No Transactions Yet</div>
          : <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${report.missionMultiplierMet ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {report.missionMultiplierMet ? '✓ 10:1 Met' : '✗ 10:1 Not Met'}
            </div>
        }
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Gross Transaction Volume</p>
          <p className="text-2xl font-black text-black">${Number(report.totalGrossTransactionVolume || 0).toLocaleString()}</p>
        </div>
        <div className="p-5 bg-[#C2A76F]/10 rounded-2xl border border-[#C2A76F]/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#C2A76F] mb-1">Total Nonprofit Donations</p>
          <p className="text-2xl font-black text-black">${Number(report.totalNonprofitDonations || 0).toLocaleString()}</p>
        </div>
        <div className="p-5 bg-[#7851A9]/5 rounded-2xl border border-[#7851A9]/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] mb-1">Platform Profit Share (1%)</p>
          <p className="text-2xl font-black text-black">${Number(report.totalPlatformProfitShare || 0).toLocaleString()}</p>
          {Number(report.totalProcessingFees || 0) > 0 && (
            <p className="text-[9px] text-slate-400 font-medium mt-1">+ ${Number(report.totalProcessingFees).toLocaleString()} processing fees</p>
          )}
        </div>
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mission Multiplier Ratio</p>
          <p className="text-2xl font-black text-black">{report.missionMultiplierRatio != null ? `${report.missionMultiplierRatio}:1` : '—'}</p>
          <p className="text-[9px] text-slate-400 font-medium">Target: {report.missionMultiplierTarget}</p>
        </div>
      </div>

      {report.note && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{report.note}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `mission-report-${String(report.period).replace(' ', '-')}.json`; a.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#7851A9] transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Export for Minute Book
        </button>
      </div>
    </div>
  );
}

// ── Tax Reporting Tab ─────────────────────────────────────────────────────────

function TaxReporting() {
  const [data, setData] = useState<any>(null);
  const [informData, setInformData] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [tab, setTab] = useState<'1099k' | 'inform'>('1099k');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [r1, r2] = await Promise.all([
      safeFetch<any>(`${BASE}/1099k?year=${year}`, { headers: authHeaders() }),
      safeFetch<any>(`${BASE}/inform-act?year=${year + 1}`, { headers: authHeaders() }),
    ]);
    if (r1 === null && r2 === null) {
      setError('Could not load tax data. The compliance tables may not be set up yet.');
    }
    setData(r1);
    setInformData(r2);
    setLoading(false);
  };

  useEffect(() => { load(); }, [year]);

  const downloadCsv = async () => {
    const res = await fetch(`${BASE}/1099k/export?year=${year}`, { headers: authHeaders() });
    const csv = await res.text();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `1099k-${year}.csv`; a.click();
  };

  const markVerified = async (merchantId: string) => {
    await safeFetch(`${BASE}/inform-act/${merchantId}/verify?year=${year + 1}`, { method: 'POST', headers: authHeaders() });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button onClick={() => setTab('1099k')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === '1099k' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}>1099-K</button>
          <button onClick={() => setTab('inform')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === 'inform' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}>INFORM Act</button>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold">
          {[0, 1, 2].map(i => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)}
        </select>
        <button onClick={load} className="p-2 text-slate-400 hover:text-black transition-colors"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {loading && <div className="py-8 text-center text-slate-400 text-xs font-bold">Loading...</div>}
      {!loading && error && <ErrorBanner message={error} />}

      {!loading && !error && tab === '1099k' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchants Requiring 1099-K</p>
              <p className="text-3xl font-black text-black">{data?.count ?? 0}</p>
              <p className="text-[10px] text-slate-400 font-medium">for tax year {data?.taxYear ?? year}</p>
            </div>
            {(data?.count ?? 0) > 0 && (
              <button onClick={downloadCsv} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#7851A9] transition-all">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            )}
          </div>

          {Array.isArray(data?.merchants) && data.merchants.map((m: any) => (
            <div key={m.merchantId} className="p-4 bg-white border border-slate-100 rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-black">{m.merchant?.businessName}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{m.merchant?.user?.email} · EIN: {m.merchant?.taxId || 'Not on file'}</p>
                  <p className="text-xs font-black text-[#C2A76F] mt-1">Gross Sales: ${Number(m.grossSales).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  {m.notifiedAt
                    ? <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Notified {format(new Date(m.notifiedAt), 'MMM d')}</span>
                    : <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Not Notified</span>
                  }
                </div>
              </div>
            </div>
          ))}

          {(data?.count ?? 0) === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs font-bold">No merchants crossed the $600 threshold for {data?.taxYear ?? year}.</div>
          )}
        </div>
      )}

      {!loading && !error && tab === 'inform' && (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">High-Volume Sellers Requiring INFORM Act Verification</p>
            <p className="text-3xl font-black text-black">{informData?.count ?? 0}</p>
          </div>
          {Array.isArray(informData?.merchants) && informData.merchants.map((m: any) => (
            <div key={m.merchantId} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-start justify-between">
              <div>
                <p className="text-sm font-black text-black">{m.merchant?.businessName}</p>
                <p className="text-[10px] text-slate-400 font-medium">{m.transactionCount} transactions · ${Number(m.grossRevenue).toLocaleString()} revenue</p>
              </div>
              <div className="text-right space-y-1">
                {m.verifiedAt
                  ? <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full block">Verified</span>
                  : (
                    <button onClick={() => markVerified(m.merchantId)} className="text-[9px] font-black text-white bg-black px-3 py-1 rounded-full hover:bg-[#7851A9] transition-all">
                      Mark Verified
                    </button>
                  )
                }
              </div>
            </div>
          ))}
          {(informData?.count ?? 0) === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs font-bold">No high-volume sellers requiring verification for {year + 1}.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── IRS Verification Tab ──────────────────────────────────────────────────────

function IrsVerification() {
  const [ein, setEin] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    safeFetch<any[]>(`${BASE}/irs/sync-logs`, { headers: authHeaders() })
      .then(data => { if (Array.isArray(data)) setLogs(data); });
  }, []);

  const checkEin = async () => {
    if (!ein.trim()) return;
    setLoading(true);
    setSearched(false);
    const data = await safeFetch<any>(`${BASE}/irs/check/${encodeURIComponent(ein.trim())}`, { headers: authHeaders() });
    setResult(data);
    setSearched(true);
    setLoading(false);
  };

  const triggerSync = async () => {
    setSyncing(true);
    const data = await safeFetch<any>(`${BASE}/irs/sync`, { method: 'POST', headers: authHeaders() });
    alert(data?.message || 'Sync triggered.');
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Check Nonprofit EIN</p>
        <div className="flex gap-3">
          <input
            value={ein}
            onChange={e => setEin(e.target.value)}
            placeholder="XX-XXXXXXX"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-[#7851A9]/20"
          />
          <button onClick={checkEin} disabled={loading} className="px-5 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#7851A9] disabled:opacity-50 transition-all">
            {loading ? '...' : 'Check'}
          </button>
        </div>
        {searched && !result && (
          <div className="p-4 rounded-xl border bg-amber-50 border-amber-200">
            <p className="text-xs font-black uppercase tracking-widest text-amber-700">
              ⚠ Lookup unavailable
            </p>
            <p className="text-[10px] text-amber-700 font-medium mt-1">
              The IRS verification table is not set up yet. This will resolve after the next Railway deploy runs <code>prisma db push</code>.
            </p>
          </div>
        )}
        {result && (
          <div className={`p-4 rounded-xl border ${result.verified ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-xs font-black uppercase tracking-widest ${result.verified ? 'text-emerald-700' : 'text-red-700'}`}>
              {result.verified ? '✓ Verified' : result.isRevoked ? '✗ Revoked' : '✗ Not Found'}
            </p>
            {result.legalName && <p className="text-sm font-black text-black mt-1">{result.legalName}</p>}
            {result.note && <p className="text-[10px] text-slate-600 font-medium mt-1">{result.note}</p>}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Logs</p>
          <button onClick={triggerSync} disabled={syncing} className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#7851A9] disabled:opacity-50 transition-all">
            <RefreshCw className="w-3 h-3" /> {syncing ? 'Syncing...' : 'Trigger Sync'}
          </button>
        </div>
        {logs.length === 0
          ? <p className="text-[10px] text-slate-400 font-medium">No sync logs yet.</p>
          : logs.map(log => (
            <div key={log.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <div className="flex-1">
                <p className="text-[10px] font-black text-black">{log.status} — {log.recordsTotal} records</p>
                <p className="text-[9px] text-slate-400">{format(new Date(log.syncDate), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Main Compliance Dashboard ─────────────────────────────────────────────────

const TABS = [
  { id: 'deadlines', label: 'Filing Calendar' },
  { id: 'mission', label: 'Mission Report' },
  { id: 'tax', label: 'Tax Reporting' },
  { id: 'irs', label: 'IRS Verification' },
] as const;

type TabId = typeof TABS[number]['id'];

export const ComplianceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('deadlines');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mb-1">Admin — Compliance Center</p>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black">L3C Compliance Dashboard</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Filing deadlines, CCV compliance, 1099-K tracking, and IRS nonprofit verification.
        </p>
      </div>

      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 min-w-fit px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === t.id ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-black'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'deadlines' && <DeadlineCalendar />}
        {activeTab === 'mission' && <MissionReport />}
        {activeTab === 'tax' && <TaxReporting />}
        {activeTab === 'irs' && <IrsVerification />}
      </div>
    </div>
  );
};
