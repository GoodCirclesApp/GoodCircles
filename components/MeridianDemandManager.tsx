// Meridian early-access demand manager (Admin Portal, 2026-07-06).
// PRIVATE demand database: verified election counts per seed nonprofit,
// verified vote counts per seed business, suggestion moderation, and CSV
// exports. Counts shown here NEVER appear on any public surface — the
// honesty rules for the Meridian campaign forbid publishing traction data.
import React, { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';

const token = () => localStorage.getItem('gc_auth_token');

async function authedJson(url: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function downloadCsv(url: string, filename: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) { alert('Export failed'); return; }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

interface NpRow { id: string; name: string; category: string; city: string; active: boolean; verifiedElections: number }
interface BizRow { id: string; name: string; category: string; area: string | null; ownershipType: string | null; active: boolean; verifiedVotes: number }
interface Suggestion { id: string; type: string; rawName: string; note: string | null; status: string; createdAt: string; memberFirstName: string | null; memberZip: string | null }

export const MeridianDemandManager: React.FC<{ isViewer?: boolean }> = ({ isViewer = false }) => {
  const [tab, setTab] = useState<'nonprofits' | 'businesses' | 'suggestions'>('nonprofits');
  const [nps, setNps] = useState<NpRow[]>([]);
  const [bizs, setBizs] = useState<BizRow[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [catFilter, setCatFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveCategory, setApproveCategory] = useState('');

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  async function load() {
    setLoading(true);
    try {
      if (tab === 'nonprofits') setNps((await authedJson('/api/election/admin/nonprofit-demand')).nonprofits ?? []);
      else if (tab === 'businesses') setBizs((await authedJson('/api/election/admin/business-demand')).businesses ?? []);
      else setSuggestions((await authedJson('/api/election/admin/suggestions?status=pending')).suggestions ?? []);
    } catch (e) {
      console.error('[MeridianDemand] load error', e);
    } finally {
      setLoading(false);
    }
  }

  async function moderate(id: string, action: 'approve' | 'reject', category?: string) {
    const body = action === 'approve' ? JSON.stringify({ category: category || 'other' }) : undefined;
    const res = await fetch(`/api/election/admin/suggestions/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) alert(`Failed to ${action}`);
    setApprovingId(null);
    setApproveCategory('');
    load();
  }

  const npCats = useMemo(() => [...new Set(nps.map((n) => n.category))].sort(), [nps]);
  const bizCats = useMemo(() => [...new Set(bizs.map((b) => b.category))].sort(), [bizs]);
  const bizAreas = useMemo(() => [...new Set(bizs.map((b) => b.area).filter(Boolean) as string[])].sort(), [bizs]);

  const filteredNps = nps.filter((n) => !catFilter || n.category === catFilter);
  const filteredBizs = bizs.filter((b) => (!catFilter || b.category === catFilter) && (!areaFilter || b.area === areaFilter));

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-medium">
          <strong>Private demand data.</strong> Election and vote counts are admin-only by policy —
          never publish, screenshot, or quote these numbers publicly. Outreach exports include
          first names only; the full export includes emails and is admin-confidential.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {(['nonprofits', 'businesses', 'suggestions'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setCatFilter(''); setAreaFilter(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${tab === t ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {t}{t === 'suggestions' && suggestions.length > 0 ? ` (${suggestions.length})` : ''}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          {tab !== 'suggestions' && (
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-600 bg-white">
              <option value="">All categories</option>
              {(tab === 'nonprofits' ? npCats : bizCats).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {tab === 'businesses' && (
            <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-600 bg-white">
              <option value="">All areas</option>
              {bizAreas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
          <button onClick={load} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
          {tab !== 'suggestions' && !isViewer && (
            <>
              <button
                onClick={() => downloadCsv(`/api/election/admin/export?kind=${tab === 'nonprofits' ? 'nonprofit' : 'business'}&type=outreach`, `meridian-${tab}-outreach.csv`)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors">
                <Download className="w-3.5 h-3.5" /> Outreach CSV
              </button>
              <button
                onClick={() => downloadCsv(`/api/election/admin/export?kind=${tab === 'nonprofits' ? 'nonprofit' : 'business'}&type=full`, `meridian-${tab}-full-CONFIDENTIAL.csv`)}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
                <Download className="w-3.5 h-3.5" /> Full CSV (confidential)
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm font-bold">Loading…</div>
        ) : tab === 'nonprofits' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Nonprofit', 'Category', 'City', 'Verified elections'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filteredNps.map((n, i) => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-black text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">{n.name}{!n.active && <span className="ml-2 text-[10px] text-red-500 font-bold">INACTIVE</span>}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{n.category}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{n.city}</td>
                    <td className="px-5 py-3 font-black text-purple-700">{n.verifiedElections}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'businesses' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Business', 'Category', 'Area', 'Ownership', 'Verified votes'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBizs.map((b, i) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-black text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">{b.name}{!b.active && <span className="ml-2 text-[10px] text-red-500 font-bold">INACTIVE</span>}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{b.category}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{b.area ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{b.ownershipType ?? '—'}</td>
                    <td className="px-5 py-3 font-black text-purple-700">{b.verifiedVotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm font-bold">No pending suggestions.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {suggestions.map((s) => (
              <div key={s.id} className="px-5 py-4 flex flex-wrap items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${s.type === 'nonprofit' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.type}</span>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-slate-800">{s.rawName}</p>
                  {s.note && <p className="text-xs text-slate-500">{s.note}</p>}
                  <p className="text-[11px] text-slate-400">from {s.memberFirstName ?? 'a member'}{s.memberZip ? ` · ${s.memberZip}` : ''} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                {!isViewer && (approvingId === s.id ? (
                  <div className="flex items-center gap-2">
                    <input value={approveCategory} onChange={(e) => setApproveCategory(e.target.value)} placeholder="category (e.g. food)"
                      className="text-xs border border-slate-200 rounded-xl px-3 py-2 w-40" />
                    <button onClick={() => moderate(s.id, 'approve', approveCategory)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500">
                      <Check className="w-3.5 h-3.5" /> Confirm
                    </button>
                    <button onClick={() => { setApprovingId(null); setApproveCategory(''); }}
                      className="px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setApprovingId(s.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500">
                      <Check className="w-3.5 h-3.5" /> Approve → seed list
                    </button>
                    <button onClick={() => moderate(s.id, 'reject')}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500">
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeridianDemandManager;
