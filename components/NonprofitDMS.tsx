import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Heart, TrendingUp, Download, Bell, Link, Plus, Trash2,
  Settings, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, ChevronRight,
  Calendar, BarChart3, FileText, Webhook
} from 'lucide-react';

// ── API helpers ───────────────────────────────────────────────────────────────

const token = () => localStorage.getItem('gc_access_token');
const apiFetch = async (path: string, opts?: RequestInit) => {
  const res = await fetch(`/api/dms${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res;
};
const apiJson  = (path: string, opts?: RequestInit) => apiFetch(path, opts).then(r => r.json());
const apiBlob  = (path: string, opts?: RequestInit) => apiFetch(path, opts).then(r => r.blob());

function fmt(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }

// ── Reusable stat card ────────────────────────────────────────────────────────

const Stat = ({ label, value, sub, icon: Icon, color = '#7851A9' }: { label: string; value: string; sub?: string; icon: any; color?: string }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-xl" style={{ backgroundColor: color + '15' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-2xl font-black tracking-tight" style={{ color }}>{value}</div>
    {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
  </div>
);

// ── Tab types ─────────────────────────────────────────────────────────────────

type Tab = 'OVERVIEW' | 'DONORS' | 'UPDATES' | 'EXPORT';

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════

export const NonprofitDMS: React.FC = () => {
  const [tab, setTab] = useState<Tab>('OVERVIEW');
  const [stats, setStats] = useState<any>(null);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiJson('/dashboard');
      setStats(data.stats);
      setRecentUpdates(data.recentUpdates ?? []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview',      icon: BarChart3 },
    { id: 'DONORS',   label: 'Donor CRM',     icon: Users },
    { id: 'UPDATES',  label: 'Impact Updates', icon: Bell },
    { id: 'EXPORT',   label: 'Export & CRM',  icon: Download },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">Donor Management System</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time donor data, impact updates, and CRM integration — all in one place.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total Funding"     value={fmt(stats.totalFunding)}    icon={Heart}     color="#A20021" sub={`${stats.totalTransactions} transactions`} />
          <Stat label="This Month"        value={fmt(stats.monthlyFunding)}  icon={TrendingUp} color="#7851A9" sub={`${stats.monthlyTransactions} this month`} />
          <Stat label="Unique Donors"     value={stats.uniqueDonors.toLocaleString()} icon={Users} color="#C2A76F" sub="opted-in supporters" />
          <Stat label="Avg / Donor"       value={fmt(stats.avgPerDonor)}     icon={BarChart3}  color="#34D399" sub="lifetime average" />
        </div>
      )}
      {loading && !stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 h-28 animate-pulse" />)}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-[#7851A9] text-white shadow-lg shadow-[#7851A9]/20' : 'text-slate-400 hover:bg-slate-50'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'OVERVIEW'  && <OverviewTab stats={stats} recentUpdates={recentUpdates} onRefresh={loadDashboard} />}
      {tab === 'DONORS'    && <DonorsTab />}
      {tab === 'UPDATES'   && <UpdatesTab />}
      {tab === 'EXPORT'    && <ExportTab />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Overview Tab
// ══════════════════════════════════════════════════════════════════════════════

const OverviewTab: React.FC<{ stats: any; recentUpdates: any[]; onRefresh: () => void }> = ({ stats, recentUpdates, onRefresh }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Recent Donor Activity */}
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Recent Donor Activity</h3>
        <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><RefreshCw size={14} /></button>
      </div>
      <div className="divide-y divide-slate-50">
        {(stats?.recentDonors ?? []).map((d: any, i: number) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#7851A9]/10 flex items-center justify-center text-[#7851A9] font-black text-xs">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Anonymous Donor</div>
                <div className="text-[10px] text-slate-400">{fmtDate(d.createdAt)}</div>
              </div>
            </div>
            <span className="text-sm font-black text-[#34D399]">{fmt(Number(d.nonprofitShare))}</span>
          </div>
        ))}
        {(!stats?.recentDonors || stats.recentDonors.length === 0) && (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">No transactions yet. Share your Good Circles page to attract donors.</div>
        )}
      </div>
    </div>

    {/* Recent Impact Updates */}
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Recent Impact Updates</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {recentUpdates.map((u: any) => (
          <div key={u.id} className="px-6 py-4">
            <div className="text-xs font-bold text-slate-700 mb-1">{u.title}</div>
            <div className="text-[11px] text-slate-500 line-clamp-2">{u.body}</div>
            <div className="text-[10px] text-slate-300 mt-1">{fmtDate(u.createdAt)}</div>
          </div>
        ))}
        {recentUpdates.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">Post your first Impact Update to appear in donors' feeds.</div>
        )}
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// Donors Tab
// ══════════════════════════════════════════════════════════════════════════════

const DonorsTab: React.FC = () => {
  const [donors, setDonors] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (p: number) => {
    setLoading(true); setError('');
    try {
      const data = await apiJson(`/donors?page=${p}&pageSize=25`);
      setDonors(data.donors ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{total} donor{total !== 1 ? 's' : ''} · names and emails shown only for opted-in donors</p>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Eye size={12} /> Privacy Protected
        </div>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {['Donor', 'Email', 'Total Donated', 'Transactions', 'Last Gift'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : donors.map(d => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#7851A9]/10 flex items-center justify-center text-[#7851A9] font-black text-xs">
                      {d.displayName !== 'Anonymous Donor' ? d.displayName[0] : '?'}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{d.displayName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.email ?? <span className="text-slate-300 italic text-xs">private</span>}</td>
                <td className="px-6 py-4 font-black text-sm text-[#34D399]">{fmt(d.totalDonated)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.transactionCount}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{fmtDate(d.lastDonation)}</td>
              </tr>
            ))}
            {!loading && donors.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">No donors yet. Grow your supporter base by sharing your Good Circles link.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 25 && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40">← Previous</button>
          <span>Page {page} of {Math.ceil(total / 25)}</span>
          <button disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Impact Updates Tab
// ══════════════════════════════════════════════════════════════════════════════

const UpdatesTab: React.FC = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', body: '', imageUrl: '', ctaLabel: '', ctaUrl: '' });

  const load = async () => {
    setError('');
    try { setUpdates(await apiJson('/updates')); }
    catch (e: any) { setError(e.message); }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSaving(true); setError('');
    try {
      const body: any = { title: form.title, body: form.body };
      if (form.imageUrl) body.imageUrl = form.imageUrl;
      if (form.ctaLabel) body.ctaLabel = form.ctaLabel;
      if (form.ctaUrl)   body.ctaUrl   = form.ctaUrl;
      await apiJson('/updates', { method: 'POST', body: JSON.stringify(body) });
      setForm({ title: '', body: '', imageUrl: '', ctaLabel: '', ctaUrl: '' });
      setShowForm(false);
      load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    try { await apiJson(`/updates/${id}`, { method: 'DELETE' }); load(); }
    catch (e: any) { setError((e as any).message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Impact Updates appear in your donors' Good Circles feed — keep them engaged with your mission.</p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#7851A9] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#6a3d9a] transition-colors">
          <Plus size={14} /> Post Update
        </button>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="bg-[#7851A9]/5 border border-[#7851A9]/20 rounded-2xl p-6 space-y-4">
          <h4 className="font-black text-sm uppercase tracking-widest text-[#7851A9]">New Impact Update</h4>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="We fed 200 families this month." />
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Body</label>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Tell your donors what their everyday shopping made possible..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30 resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Image URL (optional)"    value={form.imageUrl}  onChange={v => setForm(f => ({ ...f, imageUrl: v }))} placeholder="https://..." />
              <Field label="CTA Button Label (opt.)" value={form.ctaLabel}  onChange={v => setForm(f => ({ ...f, ctaLabel: v }))} placeholder="Learn More" />
              <Field label="CTA URL (optional)"      value={form.ctaUrl}    onChange={v => setForm(f => ({ ...f, ctaUrl: v }))}   placeholder="https://your-site.org/story" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={submit} disabled={saving || !form.title || !form.body}
              className="px-6 py-2.5 bg-[#7851A9] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#6a3d9a] disabled:opacity-40 transition-colors">
              {saving ? 'Posting…' : 'Publish Update'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {updates.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {u.imageUrl && <img src={u.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-4" />}
                <h4 className="font-bold text-slate-800 text-sm mb-1">{u.title}</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">{u.body}</p>
                {u.ctaLabel && u.ctaUrl && (
                  <a href={u.ctaUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-[10px] font-black text-[#7851A9] uppercase tracking-widest hover:underline">
                    {u.ctaLabel} <ChevronRight size={10} />
                  </a>
                )}
                <div className="text-[10px] text-slate-300 mt-2">{fmtDate(u.createdAt)}</div>
              </div>
              <button onClick={() => remove(u.id)} className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {updates.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            No updates yet. Post your first update to appear in donors' feeds.
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Export & CRM Tab
// ══════════════════════════════════════════════════════════════════════════════

const ExportTab: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [webhook, setWebhook] = useState<any>(null);
  const [webhookForm, setWebhookForm] = useState({ url: '', events: ['donation.received', 'milestone.reached'] as string[] });
  const [savingHook, setSavingHook] = useState(false);
  const [hookMsg, setHookMsg] = useState('');
  const [exportForm, setExportForm] = useState({
    format: 'CSV',
    dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    dateTo:   new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    apiJson('/exports/history').then(setJobs).catch(() => {});
    apiJson('/webhook').then(h => { if (h) { setWebhook(h); setWebhookForm({ url: h.url, events: h.events }); } }).catch(() => {});
  }, []);

  const runExport = async () => {
    setExporting(true); setExportError('');
    try {
      const blob = await apiBlob('/exports', {
        method: 'POST',
        body: JSON.stringify({
          format: exportForm.format,
          dateFrom: new Date(exportForm.dateFrom).toISOString(),
          dateTo:   new Date(exportForm.dateTo + 'T23:59:59').toISOString(),
        }),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gc-donors-${Date.now()}.${exportForm.format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      apiJson('/exports/history').then(setJobs).catch(() => {});
    } catch (e: any) { setExportError(e.message); }
    finally { setExporting(false); }
  };

  const saveHook = async () => {
    setSavingHook(true); setHookMsg('');
    try {
      const h = await apiJson('/webhook', { method: 'POST', body: JSON.stringify(webhookForm) });
      setWebhook(h);
      setHookMsg('Webhook saved. Copy your signing secret to verify payloads.');
    } catch (e: any) { setHookMsg((e as any).message); }
    finally { setSavingHook(false); }
  };

  const EVENT_OPTIONS = ['donation.received', 'export.complete', 'milestone.reached'];
  const toggleEvent = (ev: string) =>
    setWebhookForm(f => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev],
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Export Tool */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl"><FileText size={16} className="text-amber-600" /></div>
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Batch Export</h3>
            <p className="text-[10px] text-slate-400">Download donor data as CSV or JSON for Salesforce, HubSpot, or Little Green Light</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">From</label>
              <input type="date" value={exportForm.dateFrom} onChange={e => setExportForm(f => ({ ...f, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">To</label>
              <input type="date" value={exportForm.dateTo} onChange={e => setExportForm(f => ({ ...f, dateTo: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Format</label>
            <div className="flex gap-2">
              {['CSV', 'JSON'].map(f => (
                <button key={f} onClick={() => setExportForm(ef => ({ ...ef, format: f }))}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${exportForm.format === f ? 'bg-[#7851A9] text-white border-transparent' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {exportError && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{exportError}</div>}
          <button onClick={runExport} disabled={exporting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#7851A9] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#6a3d9a] disabled:opacity-40 transition-colors">
            <Download size={14} /> {exporting ? 'Generating…' : `Download ${exportForm.format}`}
          </button>
        </div>

        {/* Export History */}
        {jobs.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Export History</div>
            <div className="divide-y divide-slate-50">
              {jobs.slice(0, 5).map(j => (
                <div key={j.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="text-xs text-slate-600">{fmtDate(j.createdAt)} · {j.format}</div>
                  <div className="flex items-center gap-2">
                    {j.rowCount != null && <span className="text-[10px] text-slate-400">{j.rowCount} rows</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${j.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : j.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {j.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CRM Webhook */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-xl"><Webhook size={16} className="text-[#7851A9]" /></div>
          <div>
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">CRM Webhook</h3>
            <p className="text-[10px] text-slate-400">Push events to Salesforce, HubSpot, Little Green Light, or any endpoint</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Endpoint URL" value={webhookForm.url} onChange={v => setWebhookForm(f => ({ ...f, url: v }))} placeholder="https://hooks.zapier.com/..." />

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Events to Send</label>
            <div className="space-y-2">
              {EVENT_OPTIONS.map(ev => (
                <label key={ev} className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => toggleEvent(ev)}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${webhookForm.events.includes(ev) ? 'bg-[#7851A9] border-[#7851A9]' : 'border-slate-300'}`}>
                    {webhookForm.events.includes(ev) && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className="text-xs font-mono text-slate-600">{ev}</span>
                </label>
              ))}
            </div>
          </div>

          {hookMsg && (
            <div className={`px-3 py-2 rounded-lg text-xs font-medium ${hookMsg.includes('saved') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {hookMsg}
            </div>
          )}

          {webhook?.secret && (
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signing Secret (HMAC-SHA256)</div>
              <code className="text-xs font-mono text-slate-700 break-all">{webhook.secret}</code>
              <div className="text-[9px] text-slate-400 mt-1">Verify incoming payloads using the <code>X-GoodCircles-Signature</code> header.</div>
            </div>
          )}

          <button onClick={saveHook} disabled={savingHook || !webhookForm.url || webhookForm.events.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#7851A9] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#6a3d9a] disabled:opacity-40 transition-colors">
            <Link size={14} /> {savingHook ? 'Saving…' : webhook ? 'Update Webhook' : 'Register Webhook'}
          </button>

          {webhook?.lastFiredAt && (
            <div className="text-[10px] text-slate-400 text-center">Last fired: {fmtDate(webhook.lastFiredAt)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Shared field component ─────────────────────────────────────────────────────

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
  </div>
);
