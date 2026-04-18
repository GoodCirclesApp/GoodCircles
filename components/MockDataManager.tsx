
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2,
  Loader2, Package, Receipt, Trash2, Download, Users, Store,
  Heart, MapPin, AlertTriangle
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface MockDataStatus {
  isLoaded: boolean;
  node: string;
  demoUsers: number;
  demoMerchants: number;
  demoNonprofits: number;
  demoProducts: number;
  demoTransactions: number;
  totalUsers: number;
  totalProducts: number;
  totalTransactions: number;
}

export const MockDataManager: React.FC = () => {
  const [status, setStatus] = useState<MockDataStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await apiClient.get<MockDataStatus>('/admin/mock-data/status');
      setStatus(data);
    } catch {
      setStatus({ isLoaded: false, node: 'Central Mississippi', demoUsers: 0, demoMerchants: 0, demoNonprofits: 0, demoProducts: 0, demoTransactions: 0, totalUsers: 0, totalProducts: 0, totalTransactions: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleLoad = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const result = await apiClient.post<any>('/admin/mock-data/load', {});
      const c = result.created;
      setMessage({ type: 'success', text: `Loaded: ${c.merchants} merchants, ${c.nonprofits} nonprofits, ${c.neighbors} neighbors, ${c.products} products, ${c.transactions} transactions` });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load demo data' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnload = async () => {
    if (!confirm('Remove all Central Mississippi demo data? This cannot be undone.')) return;
    setIsProcessing(true);
    setMessage(null);
    try {
      const result = await apiClient.post<any>('/admin/mock-data/unload', {});
      setMessage({ type: 'success', text: `Removed ${result.deleted.users} demo users, ${result.deleted.products} products, ${result.deleted.transactions} transactions` });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to unload demo data' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWipeLegacy = async () => {
    if (!confirm('PERMANENT: Wipe all legacy (Los Angeles) seed data? Admin credentials will be preserved. This cannot be undone.')) return;
    setIsWiping(true);
    setMessage(null);
    try {
      const result = await apiClient.post<any>('/admin/mock-data/wipe-legacy', {});
      setMessage({ type: 'success', text: result.message });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Wipe failed' });
    } finally {
      setIsWiping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#7851A9] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Demo Data Manager</h2>
        <p className="text-slate-400 text-sm mt-1">Manage Central Mississippi demo data for sales presentations and investor demos</p>
      </div>

      {/* Node Badge */}
      <div className="flex items-center gap-3 bg-[#7851A9]/8 border border-[#7851A9]/20 rounded-2xl px-5 py-3">
        <MapPin size={16} className="text-[#7851A9] shrink-0" />
        <div>
          <span className="text-xs font-black text-[#7851A9] uppercase tracking-widest">Active Node: Central Mississippi — Jackson Metro</span>
          <p className="text-[10px] text-slate-500 mt-0.5">Hinds · Rankin · Madison · Simpson · Copiah counties — ~1M consumer target</p>
        </div>
      </div>

      {/* Demo Toggle Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className={`px-6 py-4 flex items-center justify-between ${status?.isLoaded ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-slate-50 border-b border-slate-100'}`}>
          <div className="flex items-center gap-3">
            {status?.isLoaded
              ? <ToggleRight size={28} className="text-emerald-500" />
              : <ToggleLeft size={28} className="text-slate-400" />}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: status?.isLoaded ? '#059669' : '#94a3b8' }}>
                Demo Mode {status?.isLoaded ? 'Active' : 'Inactive'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {status?.isLoaded
                  ? 'Central Mississippi demo data is live in the marketplace'
                  : 'No demo data loaded — marketplace shows only real listings'}
              </p>
            </div>
          </div>
          <button
            onClick={status?.isLoaded ? handleUnload : handleLoad}
            disabled={isProcessing}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-wait'
                : status?.isLoaded
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                  : 'bg-[#7851A9] text-white hover:bg-[#6841A0] shadow-lg'
            }`}
          >
            {isProcessing
              ? <><Loader2 size={14} className="animate-spin" /> Processing...</>
              : status?.isLoaded
                ? <><Trash2 size={14} /> Disable Demo Mode</>
                : <><Download size={14} /> Enable Demo Mode</>}
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <StatBox label="Merchants"    value={status?.demoMerchants || 0}    icon={Store}    color="#7851A9" />
            <StatBox label="Nonprofits"   value={status?.demoNonprofits || 0}   icon={Heart}    color="#C2A76F" />
            <StatBox label="Neighbors"    value={status?.demoUsers ? status.demoUsers - (status.demoMerchants + status.demoNonprofits) : 0} icon={Users} color="#3b82f6" />
            <StatBox label="Products"     value={status?.demoProducts || 0}     icon={Package}  color="#10b981" />
            <StatBox label="Transactions" value={status?.demoTransactions || 0} icon={Receipt}  color="#f59e0b" />
            <StatBox label="Total Users"  value={status?.totalUsers || 0}       icon={Database} color="#94a3b8" />
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
        </motion.div>
      )}

      {/* What the demo includes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-widest mb-4">What Demo Mode Includes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Store,   title: '12 Real Jackson-Area Merchants', desc: "Walker's Drive-In, Cups Coffee, McDade's Market, Patton's Heating & Air, Bravo! Italian, Whole Health Pharmacy, Hal & Mal's, Capital City Pest, Watkins & Eager, Foundation Fitness, Capitol City Auto, Jackson Baking Co." },
            { icon: Heart,   title: '5 Real Central MS Nonprofits',   desc: "Mississippi Food Network, The Stewpot Community Services, Boys & Girls Club of Central MS, Habitat for Humanity MS Capital Area, Big Brothers Big Sisters of Greater MS." },
            { icon: Package, title: '70+ Realistic Product Listings', desc: 'Full range of goods and services: dining, groceries, HVAC, pest control, legal, fitness, auto, pharmacy, entertainment, and bakery — all Central Mississippi priced.' },
            { icon: Receipt, title: '~400 Simulated Transactions',   desc: 'Spread over 90 days with correct 10/10/1 financial splits. Populates admin dashboards, financial reports, and nonprofit impact metrics for presentations.' },
            { icon: Users,   title: '25 Central MS Consumer Profiles', desc: 'Diverse neighbor profiles across Jackson, Brandon, Ridgeland, Madison, Pearl, Clinton, and Flowood — realistic names and demographics.' },
            { icon: Database, title: 'Clean Enable / Disable Toggle', desc: 'All demo data is tagged to the @demo.goodcircles.ms domain. Enabling and disabling is fully reversible and never affects real merchant or user data.' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 p-4 bg-slate-50/50 rounded-xl">
              <div className="p-2 rounded-lg bg-[#7851A9]/10 h-fit shrink-0">
                <item.icon size={16} className="text-[#7851A9]" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-700 mb-1">{item.title}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy Data Wipe */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-red-700">Wipe Legacy Data (One-Time)</h4>
              <p className="text-xs text-red-600 mt-1 max-w-lg">
                Permanently removes the old Los Angeles seed data (Harvest Table, Fix-It Plumbing, etc.)
                from the database. Admin credentials are preserved. Run this once before your first
                Central Mississippi demo. Cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={handleWipeLegacy}
            disabled={isWiping}
            className="shrink-0 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-2 shadow disabled:opacity-50 disabled:cursor-wait"
          >
            {isWiping
              ? <><Loader2 size={14} className="animate-spin" /> Wiping...</>
              : <><Trash2 size={14} /> Wipe Legacy Data</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
  <div className="text-center p-4 bg-slate-50 rounded-xl">
    <Icon size={20} className="mx-auto mb-2" style={{ color }} />
    <div className="text-2xl font-black" style={{ color }}>{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
  </div>
);
