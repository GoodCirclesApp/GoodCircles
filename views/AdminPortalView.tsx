
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Users,
  History,
  DollarSign,
  Building2,
  ShieldCheck,
  Map,
  Database,
  Activity,
  Menu,
  X,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  RefreshCw,
  Presentation,
  FlaskConical,
  Link,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../services/adminService';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { MunicipalDemoSimulator } from '../components/MunicipalDemoSimulator';
import { MockDataManager } from '../components/MockDataManager';
import { AdminAffiliateDashboard } from '../components/AdminAffiliateDashboard';

// Sub-components

const DEMO_STATS = {
  totalRevenue: 48720,
  totalTransactionVolume: 487200,
  totalNonprofitFunding: 24360,
  activeUsersByRole: { CONSUMER: 312, MERCHANT: 47, NONPROFIT: 8, CDFI: 3, ADMIN: 2 },
  internalBankingAdoption: 0.68,
};

const SystemDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  useEffect(() => { adminService.getStats().then(setStats); }, []);

  const handleSeedNonprofits = async () => {
    setSeeding(true);
    try {
      const result = await adminService.seedNonprofits();
      setSeedResult(result);
    } catch (e: any) {
      setSeedResult({ message: 'Error: ' + e.message });
    } finally {
      setSeeding(false);
    }
  };

  if (!stats) return <div className="p-8">Loading...</div>;
  const isDemo = stats.totalRevenue === 0;
  const activeStats = isDemo ? DEMO_STATS : stats;
  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — No live transactions yet</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Platform Revenue" value={`$${activeStats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} trend="+12%" />
        <StatCard title="Transaction Volume" value={`$${activeStats.totalTransactionVolume.toLocaleString()}`} icon={<History className="w-5 h-5" />} trend="+8%" />
        <StatCard title="Nonprofit Funding" value={`$${activeStats.totalNonprofitFunding.toLocaleString()}`} icon={<Heart className="w-5 h-5" />} trend="+15%" />
        <StatCard title="Active Users" value={Object.values(activeStats.activeUsersByRole).reduce((a: any, b: any) => a + b, 0).toString()} icon={<Users className="w-5 h-5" />} trend="+5%" />
      </div>
      <div className="bg-white p-6 rounded-2xl border border-amber-100 flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-black uppercase tracking-tight">Seed Nonprofits</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Populate the database with 5 verified nonprofits for testing.</p>
          {seedResult && (
            <div className="mt-2 text-xs text-emerald-700 font-bold">{seedResult.message} — {seedResult.results?.map((r: any) => `${r.orgName}: ${r.status}`).join(' · ')}</div>
          )}
        </div>
        <button
          onClick={handleSeedNonprofits}
          disabled={seeding}
          className="shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
        >
          {seeding ? 'Seeding...' : 'Run Seed'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h4 className="text-lg font-bold mb-6">Users by Role</h4>
          <div className="space-y-4">
            {Object.entries(activeStats.activeUsersByRole).map(([role, count]: [string, any]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">{role}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h4 className="text-lg font-bold mb-6">Banking Adoption</h4>
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="text-4xl font-black">{(activeStats.internalBankingAdoption * 100).toFixed(0)}%</div>
              <div className="text-slate-400 text-sm">Internal Banking Adoption Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => { adminService.getUsers().then(setUsers); }, []);
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()));
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try { await adminService.updateUserStatus(userId, !currentStatus); setUsers(await adminService.getUsers()); } catch (err) { console.error('Failed to update user status:', err); }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search users by name or email..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2"><button className="px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-medium"><Filter className="w-4 h-4" /> Filter</button></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-bottom border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic font-medium">No users found{searchTerm ? ' matching your search' : ''}.</td></tr>
            )}
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{user.firstName?.[0] || user.email[0].toUpperCase()}</div><div><div className="font-bold text-sm">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'No Name'}</div><div className="text-xs text-slate-400">{user.email}</div></div></div></td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{user.role}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{user.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => toggleUserStatus(user.id, user.isActive)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${user.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>{user.isActive ? 'DEACTIVATE' : 'ACTIVATE'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DEMO_TRANSACTIONS = [
  { id: 'demo-tx-001', merchant: { businessName: 'Jackson Fresh Market' }, grossAmount: 84.50, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'demo-tx-002', merchant: { businessName: 'Eastside Bakery' }, grossAmount: 32.00, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'demo-tx-003', merchant: { businessName: 'Sunset Community Goods' }, grossAmount: 127.75, createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString() },
  { id: 'demo-tx-004', merchant: { businessName: 'Greenway Farmers Co-op' }, grossAmount: 56.20, createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() },
  { id: 'demo-tx-005', merchant: { businessName: 'Northside Hardware' }, grossAmount: 209.00, createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() },
];

const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  useEffect(() => { adminService.getTransactions().then(setTransactions); }, []);
  const isDemo = transactions.length === 0;
  const activeTxs = isDemo ? DEMO_TRANSACTIONS : transactions;
  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — No live transactions yet</span>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Transaction</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{activeTxs.map(tx => (<tr key={tx.id} className="hover:bg-slate-50"><td className="px-6 py-4"><div className="text-sm font-bold">{tx.merchant?.businessName || 'Merchant'}</div><div className="text-xs text-slate-400">ID: {tx.id.slice(0, 8)}...</div></td><td className="px-6 py-4 font-bold text-sm">${Number(tx.grossAmount).toFixed(2)}</td><td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">COMPLETED</span></td><td className="px-6 py-4 text-sm text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td><td className="px-6 py-4 text-right">{!isDemo && <button className="text-xs font-bold text-rose-600">REFUND</button>}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

const DEMO_FINANCIALS = {
  platformFeeRevenue: 4872,
  processingFeePassThrough: 1461,
  nettingSavings: 8340,
  paymentSplit: { internal: 68, card: 32 },
  aggregateWalletBalance: 128500,
};

const FinancialOverview = () => {
  const [financials, setFinancials] = useState<any>(null);
  useEffect(() => { adminService.getFinancials().then(setFinancials); }, []);
  if (!financials) return <div className="p-8">Loading...</div>;
  const isDemo = financials.platformFeeRevenue === 0;
  const activeFinancials = isDemo ? DEMO_FINANCIALS : financials;
  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — No live transactions yet</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Platform Fees" value={`$${activeFinancials.platformFeeRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} />
        <StatCard title="Processing Fees" value={`$${activeFinancials.processingFeePassThrough.toLocaleString()}`} icon={<RefreshCw className="w-5 h-5" />} />
        <StatCard title="Netting Savings" value={`$${activeFinancials.nettingSavings.toLocaleString()}`} icon={<ArrowDownRight className="w-5 h-5" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-lg font-bold mb-6">Payment Split</h4><div className="flex items-center gap-4"><div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex"><div style={{ width: `${activeFinancials.paymentSplit.internal}%` }} className="bg-emerald-500 h-full" /><div style={{ width: `${activeFinancials.paymentSplit.card}%` }} className="bg-blue-500 h-full" /></div></div><div className="mt-4 flex justify-between text-xs font-bold"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full" /> Internal ({activeFinancials.paymentSplit.internal}%)</div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> Card ({activeFinancials.paymentSplit.card}%)</div></div></div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-lg font-bold mb-6">Aggregate Wallet Balance</h4><div className="text-3xl font-black">${activeFinancials.aggregateWalletBalance.toLocaleString()}</div><p className="text-slate-400 text-sm mt-2">Total capital held in platform wallets</p></div>
      </div>
    </div>
  );
};

const DEMO_COOPS = [
  { id: 'demo-coop-1', name: 'Eastside Worker Collective', members: 34, dividendStatus: 'DISTRIBUTED' },
  { id: 'demo-coop-2', name: 'Northside Food Co-op', members: 127, dividendStatus: 'PENDING' },
  { id: 'demo-coop-3', name: 'Greenway Merchant Guild', members: 19, dividendStatus: 'DISTRIBUTED' },
];

const CooperativeManagement = () => {
  const [coops, setCoops] = useState<any[]>([]);
  useEffect(() => { adminService.getCooperatives().then(setCoops); }, []);
  const isDemo = coops.length === 0;
  const activeCoops = isDemo ? DEMO_COOPS : coops;
  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — No cooperatives registered yet</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{activeCoops.map(coop => (<div key={coop.id} className="bg-white p-6 rounded-2xl border border-slate-100"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Building2 className="w-6 h-6" /></div><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${coop.dividendStatus === 'DISTRIBUTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{coop.dividendStatus}</span></div><h4 className="font-bold text-lg">{coop.name}</h4><div className="mt-4 flex items-center gap-4 text-sm text-slate-500"><div className="flex items-center gap-1"><Users className="w-4 h-4" /> {coop.members} Members</div></div></div>))}</div>
    </div>
  );
};

const DEMO_FUND = { fundBalance: 320000, deployedCapital: 187500, loanPerformance: 0.97, returnDistributions: 14200 };

const CommunityFundOversight = () => {
  const [fund, setFund] = useState<any>(null);
  useEffect(() => { adminService.getCommunityFund().then(setFund); }, []);
  if (!fund) return <div className="p-8">Loading...</div>;
  const isDemo = fund.fundBalance === 0;
  const activeFund = isDemo ? DEMO_FUND : fund;
  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — No fund activity yet</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><StatCard title="Fund Balance" value={`$${activeFund.fundBalance.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} /><StatCard title="Deployed Capital" value={`$${activeFund.deployedCapital.toLocaleString()}`} icon={<ArrowUpRight className="w-5 h-5" />} /><StatCard title="Loan Performance" value={`${(activeFund.loanPerformance * 100).toFixed(1)}%`} icon={<CheckCircle2 className="w-5 h-5" />} /><StatCard title="Return Distributions" value={`$${activeFund.returnDistributions.toLocaleString()}`} icon={<RefreshCw className="w-5 h-5" />} /></div>
    </div>
  );
};

const DEMO_MUNICIPAL = [
  { id: 'demo-muni-1', name: 'City of Newark, NJ', impactScore: 74, activeUsers: 1840 },
  { id: 'demo-muni-2', name: 'Camden County, NJ', impactScore: 61, activeUsers: 920 },
  { id: 'demo-muni-3', name: 'Trenton Economic Dev.', impactScore: 48, activeUsers: 530 },
];

const MunicipalPartnerships = () => {
  const [partners, setPartners] = useState<any[]>([]);
  useEffect(() => { adminService.getMunicipalPartners().then(setPartners); }, []);
  const isDemo = partners.length === 0;
  const activePartners = isDemo ? DEMO_MUNICIPAL : partners;
  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — No municipal partners onboarded yet</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{activePartners.map(p => (<div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100"><div className="flex justify-between items-center mb-4"><h4 className="font-bold text-lg">{p.name}</h4><div className="text-emerald-600 font-black">{p.impactScore} Impact</div></div><div className="text-sm text-slate-500">{p.activeUsers.toLocaleString()} Active Users</div><div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden"><div style={{ width: `${p.impactScore}%` }} className="bg-emerald-500 h-full" /></div></div>))}</div>
    </div>
  );
};

const DEMO_DATA_COOP = { aggregationStatus: 'ACTIVE', lastInsightLog: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), premiumRevenue: 8400 };

const DataCooperative = () => {
  const [dataCoop, setDataCoop] = useState<any>(null);
  useEffect(() => { adminService.getDataCoop().then(setDataCoop); }, []);
  if (!dataCoop) return <div className="p-8">Loading...</div>;
  const isDemo = dataCoop.premiumRevenue === 0;
  const activeData = isDemo ? DEMO_DATA_COOP : dataCoop;
  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — No cooperative data yet</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Aggregation Status</h4><div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" /><span className="text-2xl font-black">{activeData.aggregationStatus}</span></div></div><div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Last Insight Log</h4><div className="text-2xl font-black">{new Date(activeData.lastInsightLog).toLocaleDateString()}</div></div><div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Premium Revenue</h4><div className="text-2xl font-black">${activeData.premiumRevenue.toLocaleString()}</div></div></div>
    </div>
  );
};

const DEMO_HEALTH = {
  apiResponseTime: 142,
  errorRate: 0.0012,
  jobs: [
    { name: 'Settlement Processor', status: 'SUCCESS', lastRun: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { name: 'Nonprofit Distribution', status: 'SUCCESS', lastRun: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { name: 'Wallet Reconciliation', status: 'SUCCESS', lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { name: 'Price Sentinel Scan', status: 'SUCCESS', lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  ],
};

const SystemHealth = () => {
  const [health, setHealth] = useState<any>(null);
  useEffect(() => { adminService.getSystemHealth().then(setHealth); }, []);
  if (!health) return <div className="p-8">Loading...</div>;
  const isDemo = health.apiResponseTime === 0;
  const activeHealth = isDemo ? DEMO_HEALTH : health;
  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-700">Demo Data — Live metrics will appear after deployment</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-lg font-bold mb-6">API Performance</h4><div className="flex items-end gap-2"><span className="text-4xl font-black">{activeHealth.apiResponseTime}ms</span><span className="text-emerald-500 text-sm font-bold mb-1">Healthy</span></div><p className="text-slate-400 text-sm mt-2">Average response time across all endpoints</p></div><div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-lg font-bold mb-6">Error Rate</h4><div className="flex items-end gap-2"><span className="text-4xl font-black">{(activeHealth.errorRate * 100).toFixed(2)}%</span><span className="text-emerald-500 text-sm font-bold mb-1">Normal</span></div><p className="text-slate-400 text-sm mt-2">Percentage of failed requests in last 24h</p></div></div><div className="bg-white p-6 rounded-2xl border border-slate-100"><h4 className="text-lg font-bold mb-6">Scheduled Jobs</h4><div className="space-y-4">{activeHealth.jobs.map((job: any) => (<div key={job.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${job.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} /><span className="font-bold">{job.name}</span></div><div className="text-xs text-slate-400">Last run: {new Date(job.lastRun).toLocaleString()}</div></div>))}</div></div>
    </div>
  );
};

const PriceSentinelReview = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminService.getSentinelFlags().then(f => { setFlags(f); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handle = async (flagId: string, approve: boolean) => {
    setActing(flagId);
    try {
      await adminService.resolveSentinelFlag(flagId, approve);
      setFlags(prev => prev.filter(f => f.id !== flagId));
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="p-8 text-slate-400 font-medium">Loading flags...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Listings automatically paused because their price exceeded 125% of the category median.
            <strong> Approve</strong> to reinstate the listing as-is, or <strong>Reject</strong> to keep it paused pending merchant correction.
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
      </div>

      {flags.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="font-black italic uppercase tracking-tighter text-xl">All Clear</p>
            <p className="text-slate-400 text-sm font-medium mt-1">No listings are currently flagged for price review.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-700">{flags.length} listing{flags.length !== 1 ? 's' : ''} pending review</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Listing</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Listed Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Market Median</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Suggested Max</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Flagged</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flags.map(flag => (
                <tr key={flag.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm">{flag.listing?.name || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{flag.listing?.merchant?.businessName || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-600">{flag.listing?.category || '—'}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm text-rose-600">${Number(flag.listing?.price ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">${Number(flag.marketMedian ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">${Number(flag.suggestedMax ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{new Date(flag.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handle(flag.id, true)}
                        disabled={acting === flag.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        <ThumbsUp className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handle(flag.id, false)}
                        disabled={acting === flag.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                      >
                        <ThumbsDown className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main View

type AdminSubView =
  | 'DASHBOARD' | 'USERS' | 'TRANSACTIONS' | 'FINANCIALS'
  | 'COOPS' | 'FUND' | 'MUNICIPAL' | 'DATA' | 'HEALTH'
  | 'DEMO' | 'MOCK_DATA' | 'AFFILIATE' | 'SENTINEL';

export const AdminPortalView: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<AdminSubView>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const store = useGoodCirclesStore();

  const menuItems = [
    { id: 'DASHBOARD', label: 'System Dashboard', icon: LayoutDashboard },
    { id: 'USERS', label: 'User Management', icon: Users },
    { id: 'TRANSACTIONS', label: 'Transaction Monitoring', icon: History },
    { id: 'FINANCIALS', label: 'Financial Overview', icon: DollarSign },
    { id: 'COOPS', label: 'Cooperative Management', icon: Building2 },
    { id: 'FUND', label: 'Community Fund', icon: ShieldCheck },
    { id: 'MUNICIPAL', label: 'Municipal Partners', icon: Map },
    { id: 'DATA', label: 'Data Cooperative', icon: Database },
    { id: 'HEALTH', label: 'System Health', icon: Activity },
    { id: 'DEMO', label: 'Municipal Demo', icon: Presentation },
    { id: 'MOCK_DATA', label: 'Demo Data Manager', icon: FlaskConical },
    { id: 'AFFILIATE', label: 'Affiliate Marketplace', icon: Link },
    { id: 'SENTINEL', label: 'Price Sentinel', icon: ShieldAlert },
  ];

  const renderContent = () => {
    switch (activeSubView) {
      case 'DASHBOARD': return <SystemDashboard />;
      case 'USERS': return <UserManagement />;
      case 'TRANSACTIONS': return <TransactionMonitoring />;
      case 'FINANCIALS': return <FinancialOverview />;
      case 'COOPS': return <CooperativeManagement />;
      case 'FUND': return <CommunityFundOversight />;
      case 'MUNICIPAL': return <MunicipalPartnerships />;
      case 'DATA': return <DataCooperative />;
      case 'HEALTH': return <SystemHealth />;
      case 'DEMO': return <MunicipalDemoSimulator />;
      case 'MOCK_DATA': return <MockDataManager />;
      case 'AFFILIATE': return <AdminAffiliateDashboard />;
      case 'SENTINEL': return <PriceSentinelReview />;
      default: return <SystemDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <motion.aside initial={false} animate={{ width: isSidebarOpen ? 280 : 80 }} className="bg-white border-r border-slate-100 flex flex-col z-20">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden"><div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0"><ShieldCheck className="w-5 h-5" /></div>{isSidebarOpen && <span className="font-black italic uppercase tracking-tighter text-xl">Admin</span>}</div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">{isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}</button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <button onClick={() => store.setActiveView('MAIN')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 mb-4 border-b border-slate-50 pb-4"><ChevronRight className="w-5 h-5 shrink-0 rotate-180" />{isSidebarOpen && <span className="font-bold text-sm whitespace-nowrap">Back to Platform</span>}</button>
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSubView(item.id as AdminSubView)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeSubView === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon className="w-5 h-5 shrink-0" />{isSidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100"><div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-50 ${!isSidebarOpen && 'justify-center'}`}><div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />{isSidebarOpen && (<div className="overflow-hidden"><div className="font-bold text-xs truncate">Platform Admin</div><div className="text-[10px] text-slate-400 truncate">admin@goodcircles.org</div></div>)}</div></div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 px-8 py-4">
          <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-black italic uppercase tracking-tighter">{menuItems.find(i => i.id === activeSubView)?.label}</h2><p className="text-slate-400 text-xs font-medium">Platform Management Portal</p></div>
            <div className="flex items-center gap-4"><div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[10px] font-bold text-emerald-700 uppercase">System Online</span></div></div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait"><motion.div key={activeSubView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>{renderContent()}</motion.div></AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4"><div className="p-2 bg-slate-50 rounded-xl text-slate-600">{icon}</div>{trend && (<span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>)}</div>
    <div className="text-2xl font-black">{value}</div>
    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{title}</div>
  </div>
);

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
);
