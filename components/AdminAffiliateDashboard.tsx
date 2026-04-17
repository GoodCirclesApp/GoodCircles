import React, { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, ExternalLink, DollarSign, TrendingUp, Heart, Percent } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

const authHeaders = () => {
  const token = localStorage.getItem('gc_access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiFetch = async (path: string, opts?: RequestInit) => {
  const r = await fetch(`/api/affiliate${path}`, { headers: authHeaders(), ...opts });
  const json = await r.json();
  if (!r.ok) throw new Error(json?.error ?? `Request failed (${r.status})`);
  return json;
};

// ── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, sub }: { title: string; value: string; icon: React.ReactNode; sub?: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100">
    <div className="flex justify-between items-start mb-3">
      <div className="p-2 bg-amber-50 rounded-xl text-amber-600">{icon}</div>
    </div>
    <div className="text-2xl font-black">{value}</div>
    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{title}</div>
    {sub && <div className="text-[10px] text-slate-300 mt-1">{sub}</div>}
  </div>
);

// ── Programs tab ──────────────────────────────────────────────────────────────

const ProgramsTab = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', platform: 'AMAZON', trackingId: '', baseCommRate: 0.04, logoUrl: '' });

  const load = () => apiFetch('/programs?all=true').then(d => setPrograms(Array.isArray(d) ? d : [])).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    await apiFetch('/programs', {
      method: 'POST',
      body: JSON.stringify({ ...form, baseCommRate: Number(form.baseCommRate) }),
    });
    setShowForm(false);
    setForm({ name: '', platform: 'AMAZON', trackingId: '', baseCommRate: 0.04, logoUrl: '' });
    load();
  };

  const toggle = async (id: string, isActive: boolean) => {
    await apiFetch(`/programs/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    load();
  };

  return (
    <div className="space-y-6">
      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Manage affiliate partner programs. Each program can have multiple listings.</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
          <Plus size={14} /> Add Program
        </button>
      </div>

      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <h4 className="font-black text-sm uppercase tracking-widest text-amber-800">New Affiliate Program</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Program Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Amazon Associates" />
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Platform</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300">
                {['AMAZON', 'ETSY', 'CUSTOM'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <Field label="Tracking / Associate Tag" value={form.trackingId} onChange={v => setForm(f => ({ ...f, trackingId: v }))} placeholder="goodcircles-20" />
            <Field label="Default Commission Rate (0–1)" type="number" value={String(form.baseCommRate)} onChange={v => setForm(f => ({ ...f, baseCommRate: Number(v) }))} placeholder="0.04" />
            <Field label="Logo URL (optional)" value={form.logoUrl} onChange={v => setForm(f => ({ ...f, logoUrl: v }))} placeholder="https://..." />
          </div>
          <div className="flex gap-3">
            <button onClick={submit} className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600">Save Program</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {['Program', 'Platform', 'Tracking ID', 'Comm. Rate', 'Listings', 'Status', ''].map(h => (
                <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {programs.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-sm">{p.name}</td>
                <td className="px-6 py-4 text-xs font-black text-amber-600 uppercase">{p.platform}</td>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">{p.trackingId}</td>
                <td className="px-6 py-4 text-sm font-bold">{(Number(p.baseCommRate) * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-sm text-slate-500">{p._count?.listings ?? 0}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggle(p.id, p.isActive)} className="text-slate-400 hover:text-amber-600 transition-colors">
                    {p.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">No programs yet. Add your first affiliate partner above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Listings tab ──────────────────────────────────────────────────────────────

const ListingsTab = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    programId: '', title: '', description: '', imageUrl: '',
    price: '', affiliateUrl: '', category: '', commRate: '',
  });

  const load = () => Promise.all([
    apiFetch('/listings/admin').then(d => setListings(Array.isArray(d) ? d : [])),
    apiFetch('/programs?all=false').then(d => setPrograms(Array.isArray(d) ? d : [])),
  ]).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    const body: any = { ...form, price: Number(form.price) };
    if (form.commRate) body.commRate = Number(form.commRate);
    else delete body.commRate;
    await apiFetch('/listings', { method: 'POST', body: JSON.stringify(body) });
    setShowForm(false);
    setForm({ programId: '', title: '', description: '', imageUrl: '', price: '', affiliateUrl: '', category: '', commRate: '' });
    load();
  };

  const toggle = async (id: string, isActive: boolean) => {
    await apiFetch(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    load();
  };

  return (
    <div className="space-y-6">
      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Individual affiliate product listings shown in the marketplace.</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
          <Plus size={14} /> Add Listing
        </button>
      </div>

      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <h4 className="font-black text-sm uppercase tracking-widest text-amber-800">New Affiliate Listing</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Program</label>
              <select value={form.programId} onChange={e => setForm(f => ({ ...f, programId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300">
                <option value="">Select program...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <Field label="Product Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Product name" />
            <Field label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="Electronics" />
            <Field label="Price (USD)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="49.99" />
            <Field label="Affiliate URL (full tracking link)" value={form.affiliateUrl} onChange={v => setForm(f => ({ ...f, affiliateUrl: v }))} placeholder="https://amzn.to/..." />
            <Field label="Image URL (optional)" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} placeholder="https://..." />
            <Field label="Commission Rate Override (optional, 0–1)" type="number" value={form.commRate} onChange={v => setForm(f => ({ ...f, commRate: v }))} placeholder="Leave blank to use program default" />
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 h-20 resize-none"
                placeholder="Short product description..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={submit} className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600">Save Listing</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {['Product', 'Program', 'Category', 'Price', 'Clicks', 'Conversions', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listings.map(l => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {l.imageUrl && <img src={l.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />}
                    <div>
                      <div className="font-bold text-sm">{l.title}</div>
                      <a href={l.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-500 hover:underline flex items-center gap-1">
                        <ExternalLink size={9} /> Affiliate link
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-black text-amber-600 uppercase">{l.program?.platform}</td>
                <td className="px-5 py-4 text-sm text-slate-500">{l.category}</td>
                <td className="px-5 py-4 font-bold text-sm">${Number(l.price).toFixed(2)}</td>
                <td className="px-5 py-4 text-sm text-slate-500">{l._count?.clicks ?? 0}</td>
                <td className="px-5 py-4 text-sm text-slate-500">{l._count?.conversions ?? 0}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${l.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {l.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => toggle(l.id, l.isActive)} className="text-slate-400 hover:text-amber-600 transition-colors">
                    {l.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">No affiliate listings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Conversions tab ───────────────────────────────────────────────────────────

const ConversionsTab = () => {
  const [conversions, setConversions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [form, setForm] = useState({ listingId: '', saleAmount: '', externalRef: '' });

  const load = () => Promise.all([
    apiFetch('/conversions').then(d => setConversions(Array.isArray(d) ? d : [])),
    apiFetch('/stats').then(d => { if (d && !d.error) setStats(d); }),
    apiFetch('/listings/admin').then(d => setListings(Array.isArray(d) ? d : [])),
  ]).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    await apiFetch('/conversions', {
      method: 'POST',
      body: JSON.stringify({ ...form, saleAmount: Number(form.saleAmount) }),
    });
    setShowForm(false);
    setForm({ listingId: '', saleAmount: '', externalRef: '' });
    load();
  };

  return (
    <div className="space-y-8">
      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{error}</div>}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="DAF Balance" value={`$${Number(stats.dafBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={<Heart size={18} />} sub="50% of commissions → donor advised fund" />
          <StatCard title="Platform Revenue" value={`$${Number(stats.platformRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={<DollarSign size={18} />} sub="50% of commissions → operations & scaling" />
          <StatCard title="Total Commissions" value={`$${Number(stats.totalCommissions).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={<TrendingUp size={18} />} sub={`from $${Number(stats.totalSaleVolume).toLocaleString()} in referred sales`} />
          <StatCard title="Conversion Rate" value={`${(stats.conversionRate * 100).toFixed(1)}%`}
            icon={<Percent size={18} />} sub={`${stats.totalClicks.toLocaleString()} clicks tracked`} />
        </div>
      )}

      <div className="flex justify-between items-center">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-700">Record Conversion</h4>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
          <Plus size={14} /> Log Conversion
        </button>
      </div>

      {showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <p className="text-xs text-amber-700 font-medium">Record a confirmed affiliate sale. Commission is auto-calculated and split 50/50 between the donor advised fund and platform revenue.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Affiliate Listing</label>
              <select value={form.listingId} onChange={e => setForm(f => ({ ...f, listingId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300">
                <option value="">Select listing...</option>
                {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
            <Field label="Sale Amount (USD)" type="number" value={form.saleAmount} onChange={v => setForm(f => ({ ...f, saleAmount: v }))} placeholder="100.00" />
            <Field label="Partner Order Ref (optional)" value={form.externalRef} onChange={v => setForm(f => ({ ...f, externalRef: v }))} placeholder="AMZ-ORDER-123" />
          </div>
          <div className="flex gap-3">
            <button onClick={submit} className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600">Record Conversion</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {['Product', 'Partner', 'Sale', 'Commission', 'DAF (50%)', 'Platform (50%)', 'Ref', 'Date'].map(h => (
                <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {conversions.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-sm">{c.listing?.title ?? '—'}</td>
                <td className="px-5 py-4 text-xs font-black text-amber-600 uppercase">{c.listing?.program?.name ?? '—'}</td>
                <td className="px-5 py-4 font-bold text-sm">${Number(c.saleAmount).toFixed(2)}</td>
                <td className="px-5 py-4 text-sm text-slate-600">${Number(c.commTotal).toFixed(2)} <span className="text-slate-400">({(Number(c.commRate) * 100).toFixed(1)}%)</span></td>
                <td className="px-5 py-4 text-sm font-bold text-rose-600">${Number(c.dafShare).toFixed(2)}</td>
                <td className="px-5 py-4 text-sm font-bold text-emerald-600">${Number(c.platformShare).toFixed(2)}</td>
                <td className="px-5 py-4 text-xs text-slate-400 font-mono">{c.externalRef ?? '—'}</td>
                <td className="px-5 py-4 text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {conversions.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">No conversions recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────

type Tab = 'PROGRAMS' | 'LISTINGS' | 'CONVERSIONS';

export const AdminAffiliateDashboard: React.FC = () => {
  const [tab, setTab] = useState<Tab>('PROGRAMS');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'PROGRAMS',    label: 'Partner Programs' },
    { id: 'LISTINGS',    label: 'Affiliate Listings' },
    { id: 'CONVERSIONS', label: 'Conversions & Revenue' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-slate-500 text-sm">
          Manage external affiliate products shown across all marketplace views. Commissions split 50% to the donor advised fund and 50% to platform revenue.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest rounded-t-xl transition-all ${
              tab === t.id
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'PROGRAMS'    && <ProgramsTab />}
      {tab === 'LISTINGS'    && <ListingsTab />}
      {tab === 'CONVERSIONS' && <ConversionsTab />}
    </div>
  );
};

// ── Shared field component ────────────────────────────────────────────────────

const Field = ({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div>
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300" />
  </div>
);
