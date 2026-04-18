import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Heart, TrendingUp, Download, Bell, Link, Plus, Trash2,
  Eye, RefreshCw, CheckCircle, AlertCircle, ChevronRight,
  BarChart3, FileText, Webhook, Shield, Zap, ArrowUpRight
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
const apiJson = (path: string, opts?: RequestInit) => apiFetch(path, opts).then(r => r.json());
const apiBlob = (path: string, opts?: RequestInit) => apiFetch(path, opts).then(r => r.blob());

function fmt(n: number) { return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, bg, text }: {
  label: string; value: string; sub?: string; icon: any; bg: string; text: string;
}) => (
  <div className={`${bg} rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-sm`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-white/20`}>
        <Icon size={20} className={text} />
      </div>
      <ArrowUpRight size={16} className={`${text} opacity-40`} />
    </div>
    <div className={`text-3xl sm:text-4xl font-black italic tracking-tighter ${text}`}>{value}</div>
    <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${text} opacity-60`}>{label}</div>
    {sub && <div className={`text-xs mt-2 ${text} opacity-50 font-medium`}>{sub}</div>}
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
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Donor Management.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Real-time donor data, impact updates, and CRM integration.</p>
        </div>
        <button onClick={loadDashboard} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-100 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 font-medium">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Stat Cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-slate-100 rounded-[2rem] h-36 animate-pulse" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Funding"   value={fmt(stats.totalFunding)}              icon={Heart}     bg="bg-[#A20021]"  text="text-white"          sub={`${stats.totalTransactions} transactions`} />
          <StatCard label="This Month"      value={fmt(stats.monthlyFunding)}            icon={TrendingUp} bg="bg-[#7851A9]"  text="text-white"          sub={`${stats.monthlyTransactions} this month`} />
          <StatCard label="Supporters"      value={stats.uniqueDonors.toLocaleString()}  icon={Users}      bg="bg-black"      text="text-[#C2A76F]"      sub="opted-in donors" />
          <StatCard label="Avg per Donor"   value={fmt(stats.avgPerDonor)}              icon={BarChart3}  bg="bg-emerald-50" text="text-emerald-700"     sub="lifetime average" />
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-[#7851A9] text-white shadow-lg shadow-[#7851A9]/20' : 'border border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'OVERVIEW' && <OverviewTab stats={stats} recentUpdates={recentUpdates} />}
      {tab === 'DONORS'   && <DonorsTab />}
      {tab === 'UPDATES'  && <UpdatesTab />}
      {tab === 'EXPORT'   && <ExportTab />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Overview Tab
// ══════════════════════════════════════════════════════════════════════════════

const OverviewTab: React.FC<{ stats: any; recentUpdates: any[] }> = ({ stats, recentUpdates }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

    {/* Recent Donor Activity */}
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Recent Activity</h3>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <Shield size={11} /> Privacy Protected
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {(stats?.recentDonors ?? []).map((d: any, i: number) => (
          <div key={i} className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#7851A9]/10 flex items-center justify-center text-[#7851A9] font-black text-xs shrink-0">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="text-xs font-black text-slate-700">Anonymous Donor</div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{fmtDate(d.createdAt)}</div>
              </div>
            </div>
            <span className="text-base font-black text-emerald-600 italic">{fmt(Number(d.nonprofitShare))}</span>
          </div>
        ))}
        {(!stats?.recentDonors || stats.recentDonors.length === 0) && (
          <div className="px-8 py-16 text-center">
            <Heart size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400 font-medium">No transactions yet.</p>
            <p className="text-xs text-slate-300 mt-1">Share your Good Circles page to attract supporters.</p>
          </div>
        )}
      </div>
    </div>

    {/* Recent Impact Updates */}
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Impact Updates</h3>
        <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Donor Feed</span>
      </div>
      <div className="divide-y divide-slate-50">
        {recentUpdates.map((u: any) => (
          <div key={u.id} className="px-8 py-5">
            <div className="text-xs font-black text-slate-800 mb-1">{u.title}</div>
            <div className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{u.body}</div>
            <div className="text-[10px] text-slate-300 font-medium mt-1.5">{fmtDate(u.createdAt)}</div>
          </div>
        ))}
        {recentUpdates.length === 0 && (
          <div className="px-8 py-16 text-center">
            <Bell size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400 font-medium">No updates posted yet.</p>
            <p className="text-xs text-slate-300 mt-1">Post your first Impact Update to appear in donors' feeds.</p>
          </div>
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
    <div className="space-y-5">

      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          <span className="font-black text-slate-800">{total}</span> donor{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl">
          <Eye size={12} className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Privacy Enforced</span>
        </div>
      </div>

      {error && <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 font-medium">{error}</div>}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              {['Donor', 'Email', 'Total Given', 'Transactions', 'Last Gift'].map(h => (
                <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-8 py-5">
                    <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                  </td>
                </tr>
              ))
            ) : donors.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/70 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#7851A9]/10 flex items-center justify-center text-[#7851A9] font-black text-sm shrink-0">
                      {d.displayName !== 'Anonymous Donor' ? d.displayName[0].toUpperCase() : '?'}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{d.displayName}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">
                  {d.email ?? <span className="text-slate-300 italic text-xs font-medium">private</span>}
                </td>
                <td className="px-8 py-5 font-black text-base text-emerald-600 italic">{fmt(d.totalDonated)}</td>
                <td className="px-8 py-5 text-sm font-bold text-slate-500">{d.transactionCount}</td>
                <td className="px-8 py-5 text-sm text-slate-400 font-medium">{fmtDate(d.lastDonation)}</td>
              </tr>
            ))}
            {!loading && donors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Users size={36} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-sm text-slate-400 font-medium">No donors yet.</p>
                  <p className="text-xs text-slate-300 mt-1">Grow your supporter base by sharing your Good Circles link.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 25 && (
        <div className="flex items-center justify-between">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-5 py-3 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all">
            ← Previous
          </button>
          <span className="text-xs font-bold text-slate-400">Page {page} of {Math.ceil(total / 25)}</span>
          <button disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(p => p + 1)}
            className="px-5 py-3 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all">
            Next →
          </button>
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
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-slate-500 font-medium max-w-md leading-relaxed">
          Impact Updates appear in your supporters' Good Circles feed — keep them engaged with what their everyday shopping makes possible.
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showForm ? 'bg-slate-100 text-slate-600' : 'bg-[#7851A9] text-white hover:bg-black shadow-lg'}`}>
          <Plus size={13} /> Post Update
        </button>
      </div>

      {error && <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 font-medium">{error}</div>}

      {showForm && (
        <div className="bg-[#7851A9]/5 border border-[#7851A9]/20 rounded-[2.5rem] p-8 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-sm font-black uppercase tracking-widest text-[#7851A9]">New Impact Update</h4>
          <DMSField label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="We fed 200 families this month." />
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Body</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4}
              placeholder="Tell your donors what their everyday shopping made possible..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30 resize-none bg-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DMSField label="Image URL (optional)"    value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} placeholder="https://..." />
            <DMSField label="CTA Button Label (opt.)" value={form.ctaLabel} onChange={v => setForm(f => ({ ...f, ctaLabel: v }))} placeholder="Learn More" />
            <DMSField label="CTA URL (optional)"      value={form.ctaUrl}   onChange={v => setForm(f => ({ ...f, ctaUrl: v }))}   placeholder="https://your-site.org/story" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={submit} disabled={saving || !form.title || !form.body}
              className="px-8 py-3.5 bg-[#7851A9] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-40 transition-all shadow-lg">
              {saving ? 'Publishing…' : 'Publish Update'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-8 py-3.5 bg-white text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {updates.map(u => (
          <div key={u.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {u.imageUrl && <img src={u.imageUrl} alt="" className="w-full h-40 object-cover rounded-2xl mb-5" />}
                <h4 className="font-black text-slate-800 text-sm mb-2">{u.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{u.body}</p>
                {u.ctaLabel && u.ctaUrl && (
                  <a href={u.ctaUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black text-[#7851A9] uppercase tracking-widest hover:underline">
                    {u.ctaLabel} <ChevronRight size={10} />
                  </a>
                )}
                <div className="text-[10px] text-slate-300 font-medium mt-3">{fmtDate(u.createdAt)}</div>
              </div>
              <button onClick={() => remove(u.id)} className="p-2.5 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors shrink-0 mt-1">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {updates.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
            <Bell size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400 font-medium">No updates posted yet.</p>
            <p className="text-xs text-slate-300 mt-1">Post your first update to appear in donors' feeds.</p>
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
          format:   exportForm.format,
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

      {/* Batch Export */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
            <FileText size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Batch Export</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">CSV or JSON for Salesforce, HubSpot, Little Green Light</p>
          </div>
        </div>
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">From</label>
              <input type="date" value={exportForm.dateFrom} onChange={e => setExportForm(f => ({ ...f, dateFrom: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">To</label>
              <input type="date" value={exportForm.dateTo} onChange={e => setExportForm(f => ({ ...f, dateTo: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Format</label>
            <div className="flex gap-2">
              {['CSV', 'JSON'].map(f => (
                <button key={f} onClick={() => setExportForm(ef => ({ ...ef, format: f }))}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${exportForm.format === f ? 'bg-[#7851A9] text-white border-transparent shadow-md' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {exportError && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 font-medium">{exportError}</div>
          )}
          <button onClick={runExport} disabled={exporting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] disabled:opacity-40 transition-all shadow-lg">
            <Download size={14} /> {exporting ? 'Generating…' : `Download ${exportForm.format}`}
          </button>
        </div>

        {jobs.length > 0 && (
          <div className="border-t border-slate-50">
            <div className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Export History</div>
            <div className="divide-y divide-slate-50">
              {jobs.slice(0, 5).map(j => (
                <div key={j.id} className="px-8 py-4 flex items-center justify-between">
                  <div className="text-xs text-slate-600 font-medium">{fmtDate(j.createdAt)} · {j.format}</div>
                  <div className="flex items-center gap-3">
                    {j.rowCount != null && <span className="text-[10px] text-slate-400 font-medium">{j.rowCount} rows</span>}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${j.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : j.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
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
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#7851A9]/10 flex items-center justify-center">
            <Webhook size={18} className="text-[#7851A9]" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">CRM Webhook</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Push events to Salesforce, HubSpot, Zapier, or any endpoint</p>
          </div>
        </div>
        <div className="p-8 space-y-5">
          <DMSField label="Endpoint URL" value={webhookForm.url} onChange={v => setWebhookForm(f => ({ ...f, url: v }))} placeholder="https://hooks.zapier.com/..." />

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Events to Send</label>
            <div className="space-y-3">
              {EVENT_OPTIONS.map(ev => (
                <label key={ev} className="flex items-center gap-3 cursor-pointer group">
                  <div onClick={() => toggleEvent(ev)}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all ${webhookForm.events.includes(ev) ? 'bg-[#7851A9] border-[#7851A9]' : 'border-slate-200 group-hover:border-[#CA9CE1]'}`}>
                    {webhookForm.events.includes(ev) && <CheckCircle size={11} className="text-white" />}
                  </div>
                  <span className="text-xs font-mono text-slate-600">{ev}</span>
                </label>
              ))}
            </div>
          </div>

          {hookMsg && (
            <div className={`px-4 py-3 rounded-2xl text-xs font-medium border ${hookMsg.includes('saved') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {hookMsg}
            </div>
          )}

          {webhook?.secret && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Signing Secret (HMAC-SHA256)</div>
              <code className="text-xs font-mono text-slate-700 break-all block">{webhook.secret}</code>
              <div className="text-[10px] text-slate-400 mt-2">
                Verify payloads using the <code className="font-mono bg-slate-100 px-1 rounded">X-GoodCircles-Signature</code> header.
              </div>
            </div>
          )}

          <button onClick={saveHook} disabled={savingHook || !webhookForm.url || webhookForm.events.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] disabled:opacity-40 transition-all shadow-lg">
            <Link size={14} /> {savingHook ? 'Saving…' : webhook ? 'Update Webhook' : 'Register Webhook'}
          </button>

          {webhook?.lastFiredAt && (
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
              <Zap size={11} /> Last fired: {fmtDate(webhook.lastFiredAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Shared field component ─────────────────────────────────────────────────────

const DMSField = ({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <div>
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#7851A9]/30 transition-all" />
  </div>
);
