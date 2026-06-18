import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';

interface Summary {
  period: string;
  edges: number;
  grossMapped: number;
  consumerSaved: number;
  toMerchants: number;
  toNonprofits: number;
  platformFee: number;
  localRetentionPct: number;
  qiaVolume: number;
  tractsTouched: number;
  nonprofitsFunded: number;
}
interface Tract { censusTractId: string | null; isQIA: boolean; gross: number; donations: number; transactions: number; }
interface Np { nonprofitId: string; nonprofitName: string | null; donations: number; transactions: number; }
interface Cat { category: string | null; gross: number; merchantNet: number; cogs: number; donations: number; transactions: number; }
interface Payload { summary: Summary; tracts: Tract[]; nonprofits: Np[]; categories: Cat[]; }

const money = (n: number) => '$' + (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const LocalDollarGraphView: React.FC = () => {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reconciling, setReconciling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await adminService.getLocalDollarGraph()); }
    catch { setError('Could not load the Local Dollar Graph.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reconcile = async () => {
    setReconciling(true);
    try { await adminService.reconcileLocalDollarGraph(); } catch { /* ignore */ }
    setReconciling(false);
    load();
  };

  const s = data?.summary;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black text-[#7851A9] tracking-tight">The Local Dollar Graph</h2>
          <p className="text-slate-500 text-sm mt-1">
            One immutable edge per settled transaction — the full path of every dollar from neighbor → merchant → census
            tract → nonprofit. The proprietary data asset no single competitor can assemble. Every product below is a
            <em> query</em> over this one graph, not a separate pipeline.
          </p>
        </div>
        <button
          onClick={reconcile}
          disabled={reconciling}
          className="shrink-0 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          {reconciling ? 'Reconciling…' : 'Reconcile now'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl" role="alert">{error}</div>}

      {loading && !data ? (
        <div className="py-16 text-center text-slate-400 text-xs font-black uppercase tracking-widest">Loading…</div>
      ) : s && s.edges === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-[#CA9CE1]/30 rounded-3xl">
          <p className="text-[#7851A9] font-black uppercase tracking-widest">Graph is empty</p>
          <p className="text-slate-400 text-xs mt-2">Edges are written as transactions settle. "Reconcile now" backfills any existing transactions.</p>
        </div>
      ) : s ? (
        <>
          {/* Headline cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Dollars mapped" value={money(s.grossMapped)} accent="#7851A9" />
            <Stat label="Local retention" value={`${s.localRetentionPct}%`} accent="#0f766e" sub="kept in the closed loop" />
            <Stat label="To nonprofits" value={money(s.toNonprofits)} accent="#A20021" />
            <Stat label="Consumers saved" value={money(s.consumerSaved)} accent="#C2A76F" />
            <Stat label="To merchants" value={money(s.toMerchants)} accent="#1e293b" />
            <Stat label="QIA volume" value={money(s.qiaVolume)} accent="#7851A9" sub="qualified-investment-area" />
            <Stat label="Tracts touched" value={String(s.tractsTouched)} accent="#0f766e" />
            <Stat label="Edges · nonprofits" value={`${s.edges} · ${s.nonprofitsFunded}`} accent="#1e293b" />
          </div>

          {/* Traversals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Civic / CDFI traversal — by census tract">
              <Table head={['Tract', 'QIA', 'Gross', 'Donations', 'Txns']}
                rows={data!.tracts.map(t => [t.censusTractId ?? '—', t.isQIA ? '✓' : '', money(t.gross), money(t.donations), String(t.transactions)])} />
            </Panel>
            <Panel title="Nonprofit traversal — donations routed">
              <Table head={['Nonprofit', 'Donations', 'Txns']}
                rows={data!.nonprofits.map(n => [n.nonprofitName ?? n.nonprofitId.slice(0, 8), money(n.donations), String(n.transactions)])} />
            </Panel>
            <Panel title="Merchant traversal — by category">
              <Table head={['Category', 'Gross', 'Merchant net', 'Donations', 'Txns']}
                rows={data!.categories.map(c => [c.category ?? '—', money(c.gross), money(c.merchantNet), money(c.donations), String(c.transactions)])} />
            </Panel>
            <Panel title="What this becomes">
              <ul className="text-xs text-slate-500 space-y-2 leading-relaxed p-1">
                <li>• <b>Local Dollar Retention Index</b> (cities) = retention % over time, by region.</li>
                <li>• <b>Capital Gap Map</b> (CDFIs) = QIA volume × tract, where spend rises but capital is thin.</li>
                <li>• <b>Funder Match / donor dev</b> (nonprofits) = donations by nonprofit + cause.</li>
                <li>• <b>Margin Benchmark</b> (merchants) = gross vs COGS vs net by category.</li>
                <li className="text-slate-400 pt-1">All four are traversals of the same table — no new pipeline.</li>
              </ul>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
};

const Stat = ({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) => (
  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-black mt-1" style={{ color: accent }}>{value}</p>
    {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
    <h3 className="text-[11px] font-black text-[#7851A9] uppercase tracking-widest mb-3">{title}</h3>
    {children}
  </div>
);

const Table = ({ head, rows }: { head: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto">
    {rows.length === 0 ? (
      <p className="text-xs text-slate-300 italic py-4 text-center">No data yet</p>
    ) : (
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-400 text-[9px] uppercase tracking-widest">
            {head.map((h, i) => <th key={i} className={`pb-2 font-black ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-t border-slate-50">
              {r.map((c, ci) => <td key={ci} className={`py-2 ${ci === 0 ? 'text-left font-bold text-slate-700 truncate max-w-[160px]' : 'text-right tabular-nums text-slate-600'}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
