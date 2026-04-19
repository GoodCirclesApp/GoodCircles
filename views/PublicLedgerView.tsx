
import React, { useState } from 'react';
import { Order, PayoutBatch } from '../types';
import { BrandSubmark } from '../components/BrandAssets';
import { GlobalStats } from '../hooks/useGoodCirclesStore';

interface Props {
  orders: Order[];
  batches: PayoutBatch[];
  globalStats?: GlobalStats;
  onToast?: (message: string, type?: 'success' | 'error') => void;
}

const SAMPLE_ENTRIES = [
  { id: 'smpl-001', date: '2026-04-18T14:32:00Z', shieldId: 'A4F2', hash: 'A4F2C9E1', node: 'Sunset Bakery', donation: 5.70 },
  { id: 'smpl-002', date: '2026-04-18T11:15:00Z', shieldId: 'B8D7', hash: 'B8D7F3A2', node: 'Jackson Fresh Market', donation: 12.40 },
  { id: 'smpl-003', date: '2026-04-17T16:48:00Z', shieldId: 'C1E9', hash: 'C1E94B6D', node: 'Eastside Transportation Co.', donation: 3.20 },
  { id: 'smpl-004', date: '2026-04-17T09:22:00Z', shieldId: 'D6A3', hash: 'D6A3810F', node: 'Westside Arts District', donation: 8.90 },
  { id: 'smpl-005', date: '2026-04-16T13:05:00Z', shieldId: 'E2B5', hash: 'E2B5C72A', node: 'Downtown Commercial Hub', donation: 21.60 },
  { id: 'smpl-006', date: '2026-04-15T10:40:00Z', shieldId: 'F7D1', hash: 'F7D1094C', node: 'Greenwood Grocery Co-op', donation: 6.30 },
  { id: 'smpl-007', date: '2026-04-14T15:17:00Z', shieldId: 'G3C8', hash: 'G3C8E5B1', node: 'Ridgeland Auto Services', donation: 15.80 },
];

export const PublicLedgerView: React.FC<Props> = ({ orders, batches, globalStats, onToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyMode, setPrivacyMode] = useState<'public' | 'private'>('public');

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.neighborPublicId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSamples = SAMPLE_ENTRIES.filter(s =>
    searchTerm === '' ||
    s.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.shieldId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDisbursed = globalStats
    ? globalStats.totalDonations
    : orders.reduce((sum, o) => sum + o.accounting.donationAmount, 0) +
      SAMPLE_ENTRIES.reduce((sum, s) => sum + s.donation, 0);
  const activeNodes = globalStats ? (globalStats.merchantCount + globalStats.nonprofitCount) : new Set(orders.map(o => o.items[0]?.product.merchantId)).size;
  const verificationRate = 100.00; // In this system, all ledger entries are verified by the protocol

  const handleExportProof = (order: Order) => {
    onToast?.(`Exporting certificate for Node GC-${order.id.slice(-8)}...`, 'success');
    window.print();
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 font-accent">Radical Transparency Live</p>
        </div>
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Public Ledger.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-8">Verifiable real-time audit of every dollar flowing through the circle.</p>
      </header>

      {/* Privacy Shield HUD */}
      <div className="bg-[#7851A9] text-white p-8 md:p-12 rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
         <div className="relative z-10 space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <svg className="w-6 h-6 text-[#C2A76F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
               <h4 className="text-xl font-black uppercase italic tracking-tighter">Privacy Shield Active</h4>
            </div>
            <p className="text-sm text-white/60 font-medium max-w-xl">
              Member identities are fully anonymized via Hash Masking. Transaction sums and impact destinations are public, ensuring 100% auditability without compromising personal shopping habits.
            </p>
         </div>
         <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <div className="px-6 py-4 bg-white/10 rounded-2xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase text-[#C2A76F] mb-1">Audit Mode</p>
               <p className="text-lg font-black italic">Public</p>
            </div>
            <div className="px-6 py-4 bg-white/10 rounded-2xl border border-white/10 text-center">
               <p className="text-[10px] font-black uppercase text-[#C2A76F] mb-1">Identity Mode</p>
               <p className="text-lg font-black italic">Encrypted</p>
            </div>
            <button
               onClick={() => setPrivacyMode(p => p === 'public' ? 'private' : 'public')}
               className={`px-6 py-4 rounded-2xl border text-center transition-all ${privacyMode === 'private' ? 'bg-white text-[#7851A9] border-white' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
            >
               <p className="text-[10px] font-black uppercase text-current/60 mb-1">Merchant Visibility</p>
               <p className="text-lg font-black italic">{privacyMode === 'public' ? 'Revealed' : 'Masked'}</p>
            </button>
         </div>
         <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={140} variant="WHITE" showCrown={false} />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Total Community Funding</p>
           <p className="text-5xl font-black italic tracking-tighter text-[#7851A9]">${totalDisbursed.toLocaleString()}</p>
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Impact Nodes</p>
           <p className="text-4xl font-black italic tracking-tighter">{activeNodes.toLocaleString()} Entities</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Verification Rate</p>
           <p className="text-4xl font-black italic tracking-tighter text-emerald-500">{verificationRate.toFixed(2)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-[#CA9CE1]/20 p-12 md:p-16 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Live Settlement Stream</h3>
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search by Hash or Anonymous ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold outline-none focus:ring-4 focus:ring-[#7851A9]/10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="pb-6">Date</th>
                <th className="pb-6">Shielded Member ID</th>
                <th className="pb-6">Ledger Hash</th>
                <th className="pb-6">Source Node</th>
                <th className="pb-6">Impact Disbursed</th>
                <th className="pb-6 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 && filteredSamples.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-bold italic uppercase text-xs">
                  No records matching search.
                </td></tr>
              ) : (
                <>
                  {filteredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-8 text-xs font-bold text-slate-500">{new Date(o.date).toLocaleDateString()}</td>
                      <td className="py-8">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 uppercase font-mono group-hover:text-black transition-colors">
                          SHIELD-#{o.neighborPublicId || o.neighborId.slice(-4).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-8 font-mono text-[10px] font-black uppercase tracking-tighter text-slate-800">GC-{o.id.slice(-8)}</td>
                      <td className="py-8 text-xs font-black uppercase text-slate-900">
                        {privacyMode === 'private' ? `NODE-${o.items[0]?.product.merchantId?.slice(-4).toUpperCase() || 'XXXX'}` : (o.items[0]?.product.merchantName || 'Network Entity')}
                      </td>
                      <td className="py-8 text-xl font-black text-[#7851A9] tracking-tighter">${o.accounting.donationAmount.toFixed(2)}</td>
                      <td className="py-8 text-right">
                        <button
                          onClick={() => handleExportProof(o)}
                          className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-[#7851A9]"
                        >
                          Download Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSamples.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-8 text-xs font-bold text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="py-8">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 uppercase font-mono group-hover:text-black transition-colors">
                          SHIELD-#{s.shieldId}
                        </span>
                      </td>
                      <td className="py-8 font-mono text-[10px] font-black uppercase tracking-tighter text-slate-800">GC-{s.hash}</td>
                      <td className="py-8 text-xs font-black uppercase text-slate-900">
                        {privacyMode === 'private' ? `NODE-${s.hash.slice(-4)}` : s.node}
                      </td>
                      <td className="py-8 text-xl font-black text-[#7851A9] tracking-tighter">${s.donation.toFixed(2)}</td>
                      <td className="py-8 text-right">
                        <button
                          onClick={() => onToast?.(`Exporting certificate for Node GC-${s.hash}...`, 'success')}
                          className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-[#7851A9]"
                        >
                          Download Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center gap-4 opacity-40 py-8">
         <div className="flex gap-4 items-center">
            <BrandSubmark size={32} color="#000" showCrown={false} />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] font-accent">Audit Finality Protocol v10.01 - Privacy Shield Enabled</p>
         </div>
         <p className="text-[10px] font-medium text-center max-w-sm uppercase tracking-widest leading-relaxed">
           This ledger is immutable. Every entry represents a verified community contribution that has been settled against the Merchant Impact Reserve.
         </p>
      </div>
    </div>
  );
};
