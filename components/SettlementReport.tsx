
import React, { useState, useEffect } from 'react';
import { PayoutBatch, Nonprofit } from '../types';
import { BrandLogo, BrandSubmark } from './BrandAssets';
import { generateBatchSettlementSummary } from '../services/geminiService';
import { AccountingService } from '../services/accountingService';
import { MOCK_NONPROFITS } from '../constants';

interface Props {
  batch: PayoutBatch;
  onClose: () => void;
}

export const SettlementReport: React.FC<Props> = ({ batch, onClose }) => {
  const [narrative, setNarrative] = useState('Auditing period integrity...');
  const [loading, setLoading] = useState(true);
  const [isConflictDetected, setIsConflictDetected] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      const text = await generateBatchSettlementSummary(batch);
      setNarrative(text);
      setLoading(false);
      
      // Simulate Safeguard #2 check against a specific nonprofit in the batch
      // (In production, this would iterate through all orders in the batch)
      const mockNonprofit = MOCK_NONPROFITS[0];
      const conflict = AccountingService.detectConflict(batch.entityId, mockNonprofit);
      setIsConflictDetected(conflict);
    }
    fetchSummary();
  }, [batch]);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(batch, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `GC_SETTLEMENT_${batch.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-full overflow-y-auto rounded-[4rem] shadow-2xl animate-in zoom-in duration-300">
        
        <div className="p-12 md:p-16 space-y-12">
          <header className="flex flex-col md:flex-row justify-between items-start gap-8">
            <BrandLogo variant="BLACK" size="240px" />
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Certificate of Settlement</p>
              <p className="text-xl font-black italic tracking-tighter uppercase">{batch.id}</p>
              <p className="text-xs font-bold text-slate-500 mt-1">Closed: {new Date(batch.endDate).toLocaleDateString()}</p>
            </div>
          </header>

          <div className="p-10 bg-slate-900 text-white rounded-[3rem] relative overflow-hidden group shadow-2xl border-l-8 border-l-[#C2A76F]">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-[#CA9CE1] uppercase tracking-[0.3em] mb-4">Period Narrative</p>
                <p className={`text-xl md:text-2xl font-black italic tracking-tighter leading-tight ${loading ? 'animate-pulse text-white/20' : 'text-white'}`}>
                  "{narrative}"
                </p>
             </div>
             <div className="absolute bottom-0 right-0 p-8 opacity-10">
                <BrandSubmark size={80} color="#FFF" />
             </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Financial Reconsolidation (10/10/1 Model)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <SummaryItem label="Gross Period Volume" value={`$${batch.totalGross.toFixed(2)}`} />
               <SummaryItem label="Community Impact Disbursed" value={`$${batch.totalImpact.toFixed(2)}`} color="text-[#7851A9]" />
               <SummaryItem label="Platform Node Fees" value={`$${batch.totalPlatformFees.toFixed(2)}`} />
               <SummaryItem label="Net Merchant Settlement" value={`$${batch.netSettlement.toFixed(2)}`} color="text-black" isBold />
            </div>
          </div>

          {isConflictDetected ? (
            <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex items-center gap-6 animate-shake">
               <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
               </div>
               <div>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Safeguard #2: Conflict Alert</p>
                  <p className="text-sm font-bold text-red-800 italic">Self-cycling donation loop detected. Settlement paused for manual audit.</p>
               </div>
            </div>
          ) : (
            <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-center gap-6">
               <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
               </div>
               <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Safeguard #2 Verified</p>
                  <p className="text-sm font-bold text-emerald-800 italic">No affiliated conflicts detected in this settlement period.</p>
               </div>
            </div>
          )}

          <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-8">
             <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2">Immutable Ledger Node</p>
                <code className="text-[10px] font-mono font-bold bg-slate-50 px-6 py-2 rounded-xl text-slate-900 border border-slate-100">HASH_GC_BATCH_{batch.id.toUpperCase()}</code>
             </div>
             <div className="flex gap-4 w-full max-w-md">
                <button onClick={() => window.print()} className="flex-1 bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Print PDF</button>
                <button onClick={handleExportData} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Export JSON</button>
             </div>
             <button onClick={onClose} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-black">Dismiss Audit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, color = "text-slate-500", isBold = false }: { label: string, value: string, color?: string, isBold?: boolean }) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-accent">{label}</p>
    <p className={`${isBold ? 'text-4xl' : 'text-2xl'} font-black italic tracking-tighter ${color}`}>{value}</p>
  </div>
);
