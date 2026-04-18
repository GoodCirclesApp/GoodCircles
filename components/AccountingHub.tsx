
import React, { useState, useMemo } from 'react';
import { Order, UserRole, Product } from '../types';
import { GlobalStats } from '../hooks/useGoodCirclesStore';
import { useLedgerStore } from '../hooks/useLedgerStore';
import { useRegionalStore } from '../hooks/useRegionalStore';
import { EcosystemHealthHUD } from './EcosystemHealthHUD';
import { IntegrityTestSuite } from './IntegrityTestSuite';
import { WorkloadDiagnostic } from './WorkloadDiagnostic';
import { SentinelSecurity } from './SentinelSecurity';
import { GovernanceNotes } from './GovernanceNotes';
import { MerchantApprovals } from './MerchantApprovals';
import { ComplianceAudit } from './ComplianceAudit';
import { GlobalLedger } from './GlobalLedger';
import { RegionalGovernance } from './RegionalGovernance';
import { TreasuryDashboard } from './TreasuryDashboard';

interface Props {
  orders: Order[];
  currentRole: UserRole;
  products: Product[];
  onUpdateProduct: (p: Product) => void;
  globalStats: GlobalStats;
}

export const AccountingHub: React.FC<Props> = ({ orders, currentRole, products, onUpdateProduct, globalStats }) => {
  const [governanceTab, setGovernanceTab] = useState<'HEALTH' | 'LEDGER' | 'INTEGRITY' | 'WORKLOAD' | 'SECURITY' | 'APPROVALS' | 'COMPLIANCE' | 'NOTES' | 'REGIONS' | 'TREASURY' | 'MEDIATION'>('HEALTH');
  
  const { batches, treasuryStats, resolveDispute } = useLedgerStore();
  const { allRegions, updateCommunityPolicy } = useRegionalStore();

  const disputedOrders = useMemo(() => orders.filter(o => o.disputeStatus === 'OPEN'), [orders]);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {currentRole === 'PLATFORM' && (
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit mx-auto overflow-x-auto scrollbar-hide max-w-full">
          <TabButton active={governanceTab === 'HEALTH'} onClick={() => setGovernanceTab('HEALTH')} label="Ecosystem Health" />
          <TabButton active={governanceTab === 'LEDGER'} onClick={() => setGovernanceTab('LEDGER')} label="Ledger" />
          <TabButton active={governanceTab === 'TREASURY'} onClick={() => setGovernanceTab('TREASURY')} label="Treasury" highlight="gold" />
          <TabButton 
            active={governanceTab === 'MEDIATION'} 
            onClick={() => setGovernanceTab('MEDIATION')} 
            label={`Mediation ${disputedOrders.length > 0 ? `(${disputedOrders.length})` : ''}`} 
            highlight={disputedOrders.length > 0 ? 'red' : undefined} 
          />
          <TabButton active={governanceTab === 'REGIONS'} onClick={() => setGovernanceTab('REGIONS')} label="Governance" />
          <TabButton active={governanceTab === 'APPROVALS'} onClick={() => setGovernanceTab('APPROVALS')} label="Approvals" />
          <TabButton active={governanceTab === 'COMPLIANCE'} onClick={() => setGovernanceTab('COMPLIANCE')} label="Compliance" highlight="red" />
          <TabButton active={governanceTab === 'SECURITY'} onClick={() => setGovernanceTab('SECURITY')} label="Security" highlight="red" />
          <TabButton active={governanceTab === 'NOTES'} onClick={() => setGovernanceTab('NOTES')} label="Notes" />
        </div>
      )}

      {governanceTab === 'HEALTH' && (
        <div className="space-y-12">
          <header className="max-w-2xl">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Network Overseer.</h2>
            <p className="text-slate-500 font-medium mt-4">Real-time macro-economic monitoring of all Metropolitan Statistical Area (MSA) nodes.</p>
          </header>
          <EcosystemHealthHUD 
            totalFeesSaved={globalStats.totalFeesSaved} 
            activeNodes={globalStats.merchantCount + globalStats.nonprofitCount} 
            anomalyRate={0.04} 
            merchantCount={globalStats.merchantCount}
            nonprofitCount={globalStats.nonprofitCount}
          />
          <WorkloadDiagnostic />
        </div>
      )}

      {governanceTab === 'MEDIATION' && (
        <div className="bg-white rounded-[4rem] p-12 border border-[#A20021]/20 shadow-sm space-y-12 animate-in fade-in duration-500">
           <header className="max-w-xl">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">Resolution Center</h3>
              <p className="text-slate-500 font-medium">Platform arbitration for merchant settlement disputes.</p>
           </header>
           <div className="grid grid-cols-1 gap-6">
              {disputedOrders.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-40">
                   <p className="font-black text-slate-400 italic">No active disputes requiring arbitration.</p>
                </div>
              ) : (
                disputedOrders.map(o => (
                  <div key={o.id} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
                     <div className="flex-1 space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hash: GC-{o.id?.slice(-8) || 'N/A'}</p>
                          <h4 className="text-2xl font-black italic tracking-tighter uppercase">Dispute from {o.items[0]?.product.merchantName}</h4>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border border-red-100">
                           <p className="text-[10px] font-black text-[#A20021] uppercase mb-2">Claim Reason</p>
                           <p className="text-sm font-medium italic text-slate-700">"{o.disputeReason}"</p>
                        </div>
                     </div>
                     <div className="flex flex-col gap-3 shrink-0">
                        <button 
                          onClick={() => resolveDispute(o.id, 'RESOLVED')}
                          className="bg-emerald-500 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
                        >
                          Resolve & Credit
                        </button>
                        <button 
                          onClick={() => resolveDispute(o.id, 'REJECTED')}
                          className="bg-white text-[#A20021] border border-[#A20021]/20 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                        >
                          Reject Claim
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {governanceTab === 'TREASURY' && <TreasuryDashboard stats={treasuryStats} />}
      {governanceTab === 'APPROVALS' && <MerchantApprovals />}
      {governanceTab === 'COMPLIANCE' && <ComplianceAudit products={products} onUpdateProduct={onUpdateProduct} />}
      {governanceTab === 'NOTES' && <GovernanceNotes />}
      {governanceTab === 'INTEGRITY' && <IntegrityTestSuite />}
      {governanceTab === 'SECURITY' && <SentinelSecurity />}
      {governanceTab === 'LEDGER' && <GlobalLedger orders={orders} batches={batches} />}
      {governanceTab === 'REGIONS' && <RegionalGovernance communities={allRegions} onUpdatePolicy={updateCommunityPolicy} />}
    </div>
  );
};

const TabButton = ({ active, onClick, label, highlight }: { active: boolean, onClick: () => void, label: string, highlight?: 'red' | 'gold' }) => {
  const activeColor = highlight === 'red' ? 'text-[#A20021]' : highlight === 'gold' ? 'text-[#C2A76F]' : 'text-[#7851A9]';
  return (
    <button 
      onClick={onClick} 
      className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? `bg-white ${activeColor} shadow-sm` : 'text-slate-400 hover:text-slate-600'}`}
    >
      {label}
    </button>
  );
};
