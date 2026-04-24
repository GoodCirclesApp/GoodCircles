
import React, { useState, useEffect } from 'react';
import { GovernanceProposal, User, WaivedFundLog } from '../types';
import { BrandSubmark } from '../components/BrandAssets';
import { GlobalStats } from '../hooks/useGoodCirclesStore';
import { useCountUp } from '../hooks/useCountUp';

interface Props {
  proposals: GovernanceProposal[];
  waivedFundsLog: WaivedFundLog[];
  currentUser: User | null;
  onVote: (proposalId: string, direction: 'FOR' | 'AGAINST') => void;
  onCreateProposal: (p: Partial<GovernanceProposal>) => void;
  globalStats?: GlobalStats;
}

function useCountdown(expiryDate: string): string {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiryDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      setRemaining(days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [expiryDate]);

  return remaining;
}

export const GovernanceView: React.FC<Props> = ({ proposals, waivedFundsLog, currentUser, onVote, onCreateProposal, globalStats }) => {
  const [showLabs, setShowLabs] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<GovernanceProposal['type']>('STREET_INITIATIVE');

  const animatedVotingWeight = useCountUp(currentUser?.impactScore || 0, 1400);
  const animatedVolume = useCountUp(globalStats?.totalInternalVolume || 0, 1600);
  const animatedDonations = useCountUp(globalStats?.totalDonations || 0, 1800);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProposal({
      title: newTitle,
      description: newDesc,
      type: newType,
      stakeAmount: 250
    });
    setNewTitle('');
    setNewDesc('');
    setShowLabs(false);
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Sync Status Badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Global Ledger Synced: {globalStats?.totalOrders} Verified Transactions</span>
      </div>
      <header className="flex flex-col xl:flex-row justify-between items-end gap-4 sm:gap-10">
        <div className="max-w-4xl w-full">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-2 h-2 rounded-full bg-[#C2A76F] animate-pulse"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C2A76F] font-accent">Regional Governance Node v10.0</p>
          </div>
          <h2 className="text-3xl sm:text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Community Council.</h2>
          <p className="text-slate-500 text-base sm:text-2xl font-medium mt-4 sm:mt-8 leading-relaxed">
            Direct economic democracy. Stake your impact to propose new rules, prioritize projects, or adjust regional fiscal policy.
          </p>
        </div>
        <button
          onClick={() => setShowLabs(true)}
          className="bg-black text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-[#7851A9] transition-all group"
        >
          <span className="flex items-center gap-2">
            Initialize Proposal
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </span>
        </button>
      </header>

      {/* Member Power HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-black text-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">My Voting Weight</p>
            <p className="text-3xl sm:text-5xl font-black italic tracking-tighter text-[#C2A76F]">{Math.round(animatedVotingWeight)}</p>
            <p className="text-[10px] text-[#CA9CE1] font-medium mt-4 uppercase tracking-widest italic">Weighted by Impact Ledger</p>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
               <BrandSubmark size={120} variant="WHITE" showCrown={false} />
            </div>
         </div>
         <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-[#CA9CE1]/20 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Gross Sales</p>
            <p className="text-2xl sm:text-4xl font-black italic tracking-tighter text-black">${animatedVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
         </div>
         <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-[#CA9CE1]/20 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Impact</p>
            <p className="text-2xl sm:text-4xl font-black italic tracking-tighter text-[#C2A76F]">${animatedDonations.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
         </div>
      </div>

      {/* Directed Funds Ledger */}
      <div className="space-y-10">
         <div className="flex justify-between items-end border-b border-slate-100 pb-6">
           <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter">Directed Funding Ledger</h3>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-time Transparency</p>
         </div>
         <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-[#CA9CE1]/20 overflow-x-auto shadow-sm">
           <table className="w-full text-left border-collapse min-w-[600px]">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contributor</th>
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Directed To</th>
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {waivedFundsLog.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic uppercase tracking-widest text-xs">
                     No directed funding events recorded yet.
                   </td>
                 </tr>
               ) : (
                 waivedFundsLog.map(log => (
                   <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="p-8 text-xs font-bold text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                     <td className="p-8 text-sm font-black text-black">{log.userName}</td>
                     <td className="p-8 text-sm font-black text-[#7851A9]">${log.amount.toFixed(2)}</td>
                     <td className="p-8">
                       <span className="px-4 py-1.5 bg-[#7851A9]/10 text-[#7851A9] text-[10px] font-black uppercase rounded-lg tracking-widest">
                         {log.targetProjectName}
                       </span>
                     </td>
                     <td className="p-8 text-right">
                       <code className="text-[10px] font-mono text-slate-300">GC-WAIVE-{log.orderId.slice(-6).toUpperCase()}</code>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
      </div>

      {/* Active Proposals Ledger */}
      <div className="space-y-10">
         <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter border-b border-slate-100 pb-6">Active Ballots</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {proposals.map(prop => {
              const totalVotes = prop.votesFor + prop.votesAgainst;
              const forPercent = totalVotes > 0 ? (prop.votesFor / totalVotes) * 100 : 0;
              const againstPercent = totalVotes > 0 ? (prop.votesAgainst / totalVotes) * 100 : 0;
              const hasVoted = prop.votes?.some(v => v.userId === currentUser?.id);

              return (
                <ProposalCard
                  key={prop.id}
                  prop={prop}
                  forPercent={forPercent}
                  againstPercent={againstPercent}
                  hasVoted={hasVoted}
                  onVote={onVote}
                  currentUser={currentUser}
                />
              );
            })}
         </div>
      </div>

      {/* Proposal Lab Modal */}
      {showLabs && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-[4rem] p-5 sm:p-12 md:p-16 space-y-10 shadow-2xl animate-in zoom-in duration-300 border border-[#C2A76F]/20 relative overflow-hidden">
              <header className="relative z-10">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-[#C2A76F] text-black rounded-2xl">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.260.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter">Proposal Lab.</h3>
                 </div>
                 <p className="text-slate-500 font-medium italic">Construct a community initiative. Requires 250 Impact Points stake.</p>
              </header>

              <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Objective</label>
                       <input
                         required
                         value={newTitle}
                         onChange={e => setNewTitle(e.target.value)}
                         className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:bg-white focus:ring-4 focus:ring-[#C2A76F]/10 transition-all"
                         placeholder="e.g. Expand Greenway"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type</label>
                       <select
                         value={newType}
                         onChange={e => setNewType(e.target.value as any)}
                         className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:bg-white transition-all"
                       >
                          <option value="STREET_INITIATIVE">Street Initiative</option>
                          <option value="PROJECT_PRIORITY">Project Priority</option>
                          <option value="RATE_ADJUSTMENT">Rate Adjustment</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Rationale</label>
                    <textarea
                      required
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      rows={4}
                      className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-medium leading-relaxed italic transition-all focus:bg-white focus:ring-4 focus:ring-[#C2A76F]/10"
                      placeholder="Detail the community ROI..."
                    />
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button
                      type="submit"
                      disabled={!newTitle || !newDesc}
                      className="flex-1 bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#C2A76F] transition-all disabled:opacity-30"
                    >
                       Stake 250 Points & Launch
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLabs(false)}
                      className="px-10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-black"
                    >
                       Cancel
                    </button>
                 </div>
              </form>
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <BrandSubmark size={140} color="#C2A76F" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ProposalCard: React.FC<{
  prop: GovernanceProposal;
  forPercent: number;
  againstPercent: number;
  hasVoted: boolean | undefined;
  onVote: (id: string, dir: 'FOR' | 'AGAINST') => void;
  currentUser: User | null;
}> = ({ prop, forPercent, againstPercent, hasVoted, onVote, currentUser }) => {
  const countdown = useCountdown(prop.expiryDate);
  const totalVotes = prop.votesFor + prop.votesAgainst;

  return (
    <div className={`p-5 sm:p-12 rounded-2xl sm:rounded-[4rem] border transition-all duration-500 relative overflow-hidden group ${hasVoted ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-white border-[#CA9CE1]/20 shadow-xl hover:border-[#7851A9]/30'}`}>
       <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
             <span className="px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase rounded-lg tracking-widest">{prop.type.replace('_', ' ')}</span>
             <h4 className="text-xl sm:text-3xl font-black italic tracking-tighter uppercase mt-4 leading-tight">{prop.title}</h4>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-300 uppercase">Closes In</p>
             <p className="text-sm font-black text-[#7851A9] tracking-tight">{countdown}</p>
          </div>
       </div>

       <p className="text-slate-500 font-medium leading-relaxed italic mb-10 text-lg relative z-10">"{prop.description}"</p>

       {/* Split vote bar */}
       <div className="space-y-3 mb-10 relative z-10">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
             <span className="text-emerald-600">For: {forPercent.toFixed(0)}% ({prop.votesFor})</span>
             <span className="text-[10px] text-slate-300">Goal: {prop.consensusThreshold * 100}%</span>
             <span className="text-red-400">Against: {againstPercent.toFixed(0)}% ({prop.votesAgainst})</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner flex">
             <div
               className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
               style={{ width: `${forPercent}%` }}
             />
             <div
               className="h-full bg-red-400 transition-all duration-1000 ease-out"
               style={{ width: `${againstPercent}%` }}
             />
          </div>
          {totalVotes > 0 && (
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast</p>
          )}
       </div>

       <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          {!hasVoted ? (
            <>
               <button
                 onClick={() => onVote(prop.id, 'FOR')}
                 className="flex-1 bg-emerald-500 text-white py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95"
               >
                 Support Proposal
               </button>
               <button
                 onClick={() => onVote(prop.id, 'AGAINST')}
                 className="flex-1 bg-white border-2 border-slate-100 text-slate-400 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all active:scale-95"
               >
                 Reject
               </button>
            </>
          ) : (
            <div className="w-full py-5 bg-slate-100 border border-slate-200 rounded-3xl text-center">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Signature Recorded in Ledger</p>
            </div>
          )}
       </div>

       <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <BrandSubmark size={180} color="#000" showCrown={false} />
       </div>
    </div>
  );
};
