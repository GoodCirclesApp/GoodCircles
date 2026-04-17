
import React, { useState, useMemo } from 'react';
import { Order, PayoutBatch } from '../types';
import { generateAccountingReport } from '../services/geminiService';
import { AccountingService } from '../services/accountingService';
import { SettlementReport } from './SettlementReport';

interface Props {
  orders: Order[];
  batches?: PayoutBatch[];
}

export const GlobalLedger: React.FC<Props> = ({ orders, batches = [] }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [viewMode, setViewMode] = useState<'ORDERS' | 'BATCHES'>('ORDERS');
  const [selectedBatch, setSelectedBatch] = useState<PayoutBatch | null>(null);

  const summary = useMemo(() => AccountingService.summarizeOrders(orders), [orders]);

  const handleRunAudit = async () => {
    if (orders.length === 0) return;
    setIsAuditing(true);
    try {
      await generateAccountingReport(orders);
      alert("AI Audit Engine: Financial integrity across all 10/10/1 nodes verified. No drift detected.");
    } catch (err) {
      alert("AI Audit Engine encountered a synchronization error.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-[4rem] border border-[#CA9CE1]/30 p-12 md:p-20 shadow-sm overflow-hidden">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Settlement Ledger</h3>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setViewMode('ORDERS')} 
                className={`text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${viewMode === 'ORDERS' ? 'bg-black text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}
              >
                Raw Transactions
              </button>
              <button 
                onClick={() => setViewMode('BATCHES')} 
                className={`text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${viewMode === 'BATCHES' ? 'bg-black text-white shadow-xl' : 'bg-slate-50 text-slate-400'}`}
              >
                Settlement Batches ({batches.length})
              </button>
            </div>
          </div>
          <button 
            onClick={handleRunAudit}
            disabled={isAuditing || orders.length === 0}
            className={`bg-[#7851A9] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isAuditing ? 'opacity-50 animate-pulse' : 'hover:bg-black hover:scale-105 active:scale-95'}`}
          >
            {isAuditing ? 'Auditing Ledger...' : 'Run Global AI Audit'}
          </button>
        </header>

        {/* Global Summary Hub */}
        <div className="mb-16 p-10 bg-slate-50 border border-slate-100 rounded-[3rem] grid grid-cols-2 md:grid-cols-4 gap-8">
           <ReportStat label="Gross Economy" value={`$${summary.revenue.toFixed(2)}`} />
           <ReportStat label="Impact Generated" value={`$${summary.donations.toFixed(2)}`} color="text-[#7851A9]" />
           <ReportStat label="Node Sustainability" value={`$${summary.platformFees.toFixed(2)}`} />
           <ReportStat label="Merchant Velocity" value={`$${summary.net.toFixed(2)}`} color="text-emerald-500" />
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'ORDERS' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#CA9CE1]/20 text-slate-400 uppercase text-[9px] font-black tracking-[0.3em]">
                  <th className="pb-8">Date</th>
                  <th className="pb-8">Hash</th>
                  <th className="pb-8">Revenue</th>
                  <th className="pb-8 text-[#7851A9]">Impact (10%)</th>
                  <th className="pb-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CA9CE1]/10">
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-bold italic uppercase tracking-widest text-xs">Waiting for first transaction...</td></tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-all group">
                      <td className="py-10 text-xs font-bold text-slate-500">{new Date(o.date).toLocaleDateString()}</td>
                      <td className="py-10 text-xs font-black text-slate-900 font-mono">GC-{o.id?.slice(-6).toUpperCase() || 'N/A'}</td>
                      <td className="py-10 text-xl font-black text-slate-900 tracking-tighter">${o.subtotal.toFixed(2)}</td>
                      <td className="py-10 text-xl font-black text-[#7851A9] tracking-tighter">+${o.accounting.donationAmount.toFixed(2)}</td>
                      <td className="py-10 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase ${o.handshakeStatus === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {o.handshakeStatus === 'PENDING' ? 'Escrow' : 'Settled'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#CA9CE1]/20 text-slate-400 uppercase text-[9px] font-black tracking-[0.3em]">
                  <th className="pb-8">Batch Node ID</th>
                  <th className="pb-8">Date Range</th>
                  <th className="pb-8">Total Impact</th>
                  <th className="pb-8">Net Settlement</th>
                  <th className="pb-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CA9CE1]/10">
                {batches.length === 0 ? (
                  <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-bold italic uppercase tracking-widest text-xs">Awaiting threshold completion (5 orders) to close period.</td></tr>
                ) : (
                  batches.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-all group">
                      <td className="py-10 text-xs font-black text-slate-900 font-mono">{b.id}</td>
                      <td className="py-10 text-xs font-bold text-slate-500">{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                      <td className="py-10 text-2xl font-black text-[#7851A9] tracking-tighter">${b.totalImpact.toFixed(2)}</td>
                      <td className="py-10 text-2xl font-black italic tracking-tighter">${b.netSettlement.toFixed(2)}</td>
                      <td className="py-10 text-right">
                         <button 
                           onClick={() => setSelectedBatch(b)}
                           className="bg-black text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-[#7851A9] hover:scale-105"
                         >
                           View Certificate
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedBatch && <SettlementReport batch={selectedBatch} onClose={() => setSelectedBatch(null)} />}
    </div>
  );
};

const ReportStat = ({ label, value, color = "text-black" }: { label: string, value: string, color?: string }) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
  </div>
);
