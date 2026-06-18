import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';

interface ErrorRow {
  id: string;
  level: string;
  message: string;
  stack?: string | null;
  source?: string | null;
  statusCode?: number | null;
  requestId?: string | null;
  userId?: string | null;
  userRole?: string | null;
  resolved: boolean;
  createdAt: string;
}

interface ErrorPage {
  items: ErrorRow[];
  total: number;
  unresolved: number;
  page: number;
  totalPages: number;
}

export const ErrorMonitor: React.FC = () => {
  const [data, setData] = useState<ErrorPage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getErrorLogs({ page, resolved: filter === 'unresolved' ? false : undefined });
      setData(res);
    } catch {
      setError('Could not load error logs.');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id: string, resolved: boolean) => {
    try { await adminService.resolveErrorLog(id, resolved); } catch { /* ignore */ }
    load();
  };

  const clearResolved = async () => {
    if (!window.confirm('Clear all resolved errors? This permanently deletes them.')) return;
    try { await adminService.clearErrorLogs(false); } catch { /* ignore */ }
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#7851A9] tracking-tight">Error Monitor</h2>
          <p className="text-slate-400 text-sm">
            Server errors (5xx) captured automatically.{' '}
            {data && (
              <span className="font-bold text-[#A20021]">{data.unresolved} unresolved</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1">
            {(['unresolved', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white shadow text-[#7851A9]' : 'text-slate-400'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={load} className="px-3 py-2 rounded-xl bg-[#7851A9] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
            Refresh
          </button>
          <button onClick={clearResolved} className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            Clear resolved
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl" role="alert">{error}</div>}

      {loading && !data ? (
        <div className="py-16 text-center text-slate-400 text-xs font-black uppercase tracking-widest">Loading…</div>
      ) : !data || data.items.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-emerald-100 rounded-3xl">
          <p className="text-emerald-600 font-black uppercase tracking-widest">No {filter === 'unresolved' ? 'unresolved ' : ''}errors 🎉</p>
          <p className="text-slate-400 text-xs mt-2">Server errors will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map(row => (
            <div key={row.id} className={`rounded-2xl border p-4 ${row.resolved ? 'border-slate-100 bg-slate-50/50 opacity-70' : 'border-[#A20021]/20 bg-white'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#A20021]/10 text-[#A20021] text-[9px] font-black uppercase tracking-widest">{row.statusCode ?? row.level}</span>
                    {row.source && <span className="text-[10px] font-bold text-slate-500">{row.source}</span>}
                    <span className="text-[10px] text-slate-400">{new Date(row.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-1 break-words">{row.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                    {row.requestId && <span>req: {row.requestId.slice(0, 8)}</span>}
                    {row.userRole && <span>{row.userRole}</span>}
                    {row.stack && (
                      <button onClick={() => setExpanded(expanded === row.id ? null : row.id)} className="text-[#7851A9] font-bold underline">
                        {expanded === row.id ? 'Hide' : 'Show'} stack
                      </button>
                    )}
                  </div>
                  {expanded === row.id && row.stack && (
                    <pre className="mt-2 p-3 bg-slate-900 text-slate-200 text-[10px] rounded-xl overflow-x-auto whitespace-pre-wrap break-words max-h-72">{row.stack}</pre>
                  )}
                </div>
                <button
                  onClick={() => resolve(row.id, !row.resolved)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${row.resolved ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                >
                  {row.resolved ? 'Reopen' : 'Resolve'}
                </button>
              </div>
            </div>
          ))}

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest disabled:opacity-40">Prev</button>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {data.page} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
