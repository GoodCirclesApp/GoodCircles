
import React, { useState, useEffect } from 'react';
import { NettingStatus, NettingBatch } from '../types';
import { Play, RefreshCw, Activity, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export const AdminNetting: React.FC = () => {
  const [status, setStatus] = useState<NettingStatus | null>(null);
  const [history, setHistory] = useState<NettingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch('/api/netting/status'),
        fetch('/api/netting/history')
      ]);
      if (!statusRes.ok || !historyRes.ok) throw new Error('Failed to fetch data');
      setStatus(await statusRes.json());
      setHistory(await historyRes.json());
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEvaluate = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/netting/evaluate', { method: 'POST' });
      const result = await res.json();
      setMessage({ type: 'success', text: `Evaluation complete: ${result.is_active ? 'ACTIVE' : 'DORMANT'}` });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunCycle = async () => {
    if (!confirm('Are you sure you want to manually run a netting cycle? This will process all pending obligations.')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/netting/run', { method: 'POST' });
      const result = await res.json();
      setMessage({ type: 'success', text: `Cycle complete. Gross: $${result.grossObligations.toFixed(2)}, Net: $${result.netSettled.toFixed(2)}` });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400 font-mono text-xs uppercase tracking-widest">Loading Admin Controls...</div>;

  return (
    <div className="space-y-10 p-6 md:p-10 bg-[#F5F5F4] min-h-screen font-sans text-[#0A0A0A]">
      <header className="flex justify-between items-center border-b border-black/10 pb-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Netting Control</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-2">Platform Infrastructure Management</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleEvaluate}
            disabled={actionLoading}
            className="px-6 py-3 bg-white border border-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={actionLoading ? 'animate-spin' : ''} />
            Evaluate Triggers
          </button>
          <button 
            onClick={handleRunCycle}
            disabled={actionLoading}
            className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={14} />
            Run Manual Cycle
          </button>
        </div>
      </header>

      {message && (
        <div className={`p-6 rounded-3xl border flex items-center gap-4 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          <p className="text-sm font-bold italic">{message.text}</p>
          <button onClick={() => setMessage(null)} className="ml-auto text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Status */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black uppercase italic tracking-tighter">System Status</h2>
            <div className={`w-3 h-3 rounded-full ${status?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </div>
          
          <div className="space-y-6">
            <StatusItem label="Current Mode" value={status?.isActive ? 'ACTIVE' : 'DORMANT'} color={status?.isActive ? 'text-emerald-600' : 'text-amber-600'} />
            <StatusItem label="30D Volume" value={`${status?.m2m_transaction_count_30d} tx`} />
            <StatusItem label="Merchant Pairs" value={`${status?.unique_merchant_pairs_30d} pairs`} />
            <StatusItem label="Monthly Savings" value={`$${status?.simulated_monthly_savings.toFixed(2)}`} />
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
            <Info size={18} className="text-slate-400 shrink-0" />
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
              System auto-activates when both Volume (50 tx/10 pairs) and Value ($100 savings) triggers are met for 2 consecutive weeks.
            </p>
          </div>
        </div>

        {/* Recent Cycles */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black uppercase italic tracking-tighter">Global Cycle History</h2>
            <Activity size={20} className="text-slate-200" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Batch ID</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Gross</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Net</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Savings</th>
                </tr>
              </thead>
              <tbody>
                {history.map(batch => (
                  <tr key={batch.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 font-mono text-[10px] font-bold">{batch.id?.slice(-8).toUpperCase() || 'N/A'}</td>
                    <td className="p-6 text-xs font-bold">{new Date(batch.batchDate).toLocaleDateString()}</td>
                    <td className="p-6 text-right font-mono text-xs">${batch.grossObligations.toFixed(2)}</td>
                    <td className="p-6 text-right font-mono text-xs">${batch.netSettled.toFixed(2)}</td>
                    <td className="p-6 text-right font-mono text-xs text-emerald-600 font-bold">${batch.savings.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({ label, value, color = "text-black" }: { label: string, value: string, color?: string }) => (
  <div className="flex justify-between items-end border-b border-slate-50 pb-4">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <span className={`text-xl font-black italic tracking-tighter uppercase ${color}`}>{value}</span>
  </div>
);
