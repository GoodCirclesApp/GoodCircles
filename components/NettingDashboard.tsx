
import React, { useState, useEffect } from 'react';
import { NettingStatus, NettingBatch, ComplianceData } from '../types';
import { motion } from 'motion/react';
import { Activity, Shield, TrendingUp, FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { showToast } from '../hooks/toast';

export const NettingDashboard: React.FC<{ merchantId: string }> = ({ merchantId }) => {
  const [status, setStatus] = useState<NettingStatus | null>(null);
  const [history, setHistory] = useState<NettingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, historyRes] = await Promise.all([
          fetch('/api/netting/status'),
          fetch('/api/netting/history')
        ]);

        if (!statusRes.ok || !historyRes.ok) throw new Error('Failed to fetch netting data');

        const statusData = await statusRes.json();
        const historyData = await historyRes.json();

        setStatus(statusData);
        setHistory(historyData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantId]);

  const handleDownloadCompliance = async () => {
    try {
      const res = await fetch(`/api/netting/compliance/${merchantId}?year=${new Date().getFullYear()}`);
      if (!res.ok) throw new Error('Failed to fetch compliance data');
      const data: ComplianceData = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `1099B_Compliance_${merchantId}_${data.year}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast((err as Error).message || 'Action failed.', 'error');
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400 font-mono text-xs uppercase tracking-widest">Synchronizing Ledger...</div>;
  if (error) return <div className="p-10 text-red-500 font-bold italic">Error: {error}</div>;

  return (
    <div className="space-y-8 p-6 md:p-10 bg-[#E4E3E0] min-h-screen font-sans text-[#141414]">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#141414] pb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Net Settlement Hub</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-2">Inter-Merchant Mutual Credit Clearing System</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full border border-[#141414] flex items-center gap-2 ${status?.isActive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
            {status?.isActive ? <CheckCircle2 size={14} /> : <Activity size={14} className="animate-pulse" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{status?.isActive ? 'ACTIVE' : 'DORMANT (SIMULATING)'}</span>
          </div>
          <button 
            onClick={handleDownloadCompliance}
            className="px-6 py-2 bg-[#141414] text-[#E4E3E0] rounded-full text-[10px] font-black uppercase tracking-widest hover:invert transition-all flex items-center gap-2"
          >
            <Download size={14} />
            1099-B Data
          </button>
        </div>
      </header>

      {/* Activation Triggers */}
      {!status?.isActive && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TriggerCard 
            label="Volume Gate" 
            value={`${status?.m2m_transaction_count_30d} / 50`} 
            sub="30D M2M Transactions"
            met={status?.trigger1_met || false}
          />
          <TriggerCard 
            label="Network Density" 
            value={`${status?.unique_merchant_pairs_30d} / 10`} 
            sub="Unique Merchant Pairs"
            met={status?.trigger1_met || false}
          />
          <TriggerCard 
            label="Value Threshold" 
            value={`$${status?.simulated_monthly_savings.toFixed(2)} / $100`} 
            sub="Simulated Monthly Savings"
            met={status?.trigger2_met || false}
          />
        </section>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Cycle / Simulation */}
        <div className="bg-white p-8 rounded-[2rem] border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Current Simulation</h2>
            <TrendingUp className="text-slate-400" />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Potential Savings</span>
              <span className="text-3xl font-black italic tracking-tighter text-emerald-600">${status?.simulated_monthly_savings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Next Trigger Check</span>
              <span className="text-sm font-mono font-bold">{status?.nextCheckDate ? new Date(status.nextCheckDate).toLocaleDateString() : 'Pending'}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
              <AlertCircle size={18} className="text-slate-400 mt-1" />
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                Settlements are currently in <strong>Simulation Mode</strong>. No real funds are moved. Once triggers are met for two consecutive weeks, the system will auto-activate.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance & Security */}
        <div className="bg-[#141414] text-[#E4E3E0] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8">Compliance Integrity</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Shield size={20} className="text-[#CA9CE1]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">1099-B Readiness</p>
                  <p className="text-xs font-medium">All simulated settlements are tracked for future IRS reporting requirements.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <FileText size={20} className="text-[#CA9CE1]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Audit Trail</p>
                  <p className="text-xs font-medium">Multilateral netting cycles generate immutable ledger hashes for every participant.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <Activity size={200} />
          </div>
        </div>
      </div>

      {/* History Table */}
      <section className="bg-white rounded-[2rem] border border-[#141414] overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-8 border-b border-[#141414] flex justify-between items-center">
          <h2 className="text-xl font-black italic tracking-tighter uppercase">Settlement History</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{history.length} Cycles Recorded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#141414]">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Gross Obligations</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Net Settled</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Savings</th>
              </tr>
            </thead>
            <tbody>
              {history.map((batch) => (
                <tr key={batch.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="p-6 font-mono text-xs font-bold">{new Date(batch.batchDate).toLocaleDateString()}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${batch.status === 'EXECUTED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-6 text-right font-mono text-xs">${batch.grossObligations.toFixed(2)}</td>
                  <td className="p-6 text-right font-mono text-xs">${batch.netSettled.toFixed(2)}</td>
                  <td className="p-6 text-right font-mono text-xs text-emerald-600 font-bold">-${batch.savings.toFixed(2)}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 italic text-sm">No settlement cycles recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const TriggerCard = ({ label, value, sub, met }: { label: string, value: string, sub: string, met: boolean }) => (
  <div className={`p-6 rounded-[2rem] border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all ${met ? 'bg-emerald-50' : 'bg-white'}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      {met ? <CheckCircle2 className="text-emerald-500" size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
    </div>
    <p className="text-2xl font-black italic tracking-tighter uppercase">{value}</p>
    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{sub}</p>
  </div>
);
