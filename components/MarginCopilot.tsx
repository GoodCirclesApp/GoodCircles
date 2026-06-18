import React, { useEffect, useState, useCallback } from 'react';
import { merchantService } from '../services/merchantService';

interface Finding {
  productId: string;
  name: string;
  category: string;
  price: number;
  cogs: number;
  grossMarginPct: number;
  status: 'LOSS' | 'LOW' | 'HEALTHY';
  units: number;
  currentNet: number;
  currentDonation: number;
  suggestedPrice: number | null;
  perSaleNetUplift: number;
  perSaleDonationUplift: number;
  periodNetUplift: number;
  periodDonationUplift: number;
}
interface Totals {
  productCount: number;
  flaggedCount: number;
  lossCount: number;
  potentialPeriodNet: number;
  potentialPeriodDonation: number;
}
interface Result { aiUsed: boolean; narrative: string; findings: Finding[]; totals: Totals; }

const money = (n: number) => '$' + (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS: Record<Finding['status'], { label: string; cls: string }> = {
  LOSS: { label: 'Below cost', cls: 'bg-[#A20021]/10 text-[#A20021]' },
  LOW: { label: 'Thin margin', cls: 'bg-amber-100 text-amber-700' },
  HEALTHY: { label: 'Healthy', cls: 'bg-emerald-50 text-emerald-600' },
};

export const MarginCopilot: React.FC = () => {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHealthy, setShowHealthy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await merchantService.getMarginCopilot()); }
    catch { setError('Could not load Margin Copilot.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const t = data?.totals;
  const rows = (data?.findings ?? []).filter((f) => showHealthy || f.status !== 'HEALTHY');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#7851A9] tracking-tight">Margin Copilot</h2>
            {data && (
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${data.aiUsed ? 'bg-[#7851A9]/10 text-[#7851A9]' : 'bg-slate-100 text-slate-400'}`}>
                {data.aiUsed ? 'AI-assisted' : 'Deterministic'}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Pricing opportunities from your own cost-of-goods. Because Good Circles donates 10% of each sale's
            <em> net profit</em>, a healthier margin also raises the community donation your sales generate.
          </p>
        </div>
        <button onClick={load} className="shrink-0 px-4 py-2 rounded-xl bg-[#7851A9] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
          Refresh
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl" role="alert">{error}</div>}

      {loading && !data ? (
        <div className="py-16 text-center text-slate-400 text-xs font-black uppercase tracking-widest">Analyzing your margins…</div>
      ) : data ? (
        <>
          {/* Narrative */}
          <div className="bg-gradient-to-br from-[#7851A9]/5 to-[#CA9CE1]/5 border border-[#CA9CE1]/30 rounded-2xl p-5">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.narrative}</p>
          </div>

          {/* Totals */}
          {t && t.productCount > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Active products" value={String(t.productCount)} accent="#1e293b" />
              <Stat label="Flagged" value={`${t.flaggedCount}${t.lossCount > 0 ? ` · ${t.lossCount} below cost` : ''}`} accent="#A20021" />
              <Stat label="Net profit upside" value={money(t.potentialPeriodNet)} accent="#0f766e" sub="across sales to date" />
              <Stat label="Extra donations" value={money(t.potentialPeriodDonation)} accent="#7851A9" sub="if re-priced" />
            </div>
          )}

          {/* Findings */}
          {rows.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-emerald-100 rounded-3xl">
              <p className="text-emerald-600 font-black uppercase tracking-widest">All healthy 🎉</p>
              <p className="text-slate-400 text-xs mt-2">No pricing issues found. Toggle below to see all products.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 text-[9px] uppercase tracking-widest border-b border-slate-100">
                    <th className="text-left font-black p-3">Product</th>
                    <th className="text-center font-black p-3">Status</th>
                    <th className="text-right font-black p-3">Margin</th>
                    <th className="text-right font-black p-3">Price → Suggested</th>
                    <th className="text-right font-black p-3">+ Net / sale</th>
                    <th className="text-right font-black p-3">+ Net (to date)</th>
                    <th className="text-right font-black p-3">+ Donation</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f) => (
                    <tr key={f.productId} className="border-b border-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-700 truncate max-w-[180px]">{f.name}</div>
                        <div className="text-[10px] text-slate-400">{f.category} · {f.units} sold</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${STATUS[f.status].cls}`}>{STATUS[f.status].label}</span>
                      </td>
                      <td className="p-3 text-right tabular-nums text-slate-600">{f.grossMarginPct}%</td>
                      <td className="p-3 text-right tabular-nums text-slate-600">
                        {money(f.price)}{f.suggestedPrice != null && <span className="text-[#7851A9] font-bold"> → {money(f.suggestedPrice)}</span>}
                      </td>
                      <td className="p-3 text-right tabular-nums text-emerald-600 font-bold">{f.perSaleNetUplift > 0 ? '+' + money(f.perSaleNetUplift) : '—'}</td>
                      <td className="p-3 text-right tabular-nums text-emerald-700 font-bold">{f.periodNetUplift > 0 ? '+' + money(f.periodNetUplift) : '—'}</td>
                      <td className="p-3 text-right tabular-nums text-[#7851A9]">{f.perSaleDonationUplift > 0 ? '+' + money(f.perSaleDonationUplift) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {t && t.productCount > rows.length && (
            <button onClick={() => setShowHealthy((v) => !v)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#7851A9]">
              {showHealthy ? 'Hide healthy products' : `Show all ${t.productCount} products`}
            </button>
          )}
          <p className="text-[10px] text-slate-300 italic">Margin Copilot reasons only over your own product data and never shares it. Suggestions are guidance, not advice.</p>
        </>
      ) : null}
    </div>
  );
};

const Stat = ({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) => (
  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-lg font-black mt-1" style={{ color: accent }}>{value}</p>
    {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);
