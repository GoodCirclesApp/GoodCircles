
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Loader2, Package, Receipt, Trash2, Download } from 'lucide-react';
import { apiClient } from '../services/apiClient';

// ═══════════════════════════════════════════════════
// ADMIN MOCK DATA MANAGER
// Load/unload demo marketplace data for beta testing
// ═══════════════════════════════════════════════════

interface MockDataStatus {
  isLoaded: boolean;
  demoProducts: number;
  demoTransactions: number;
  totalProducts: number;
  totalTransactions: number;
}

export const MockDataManager: React.FC = () => {
  const [status, setStatus] = useState<MockDataStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await apiClient.get<MockDataStatus>('/admin/mock-data/status');
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch mock data status:', err);
      // If endpoint doesn't exist, show default
      setStatus({ isLoaded: false, demoProducts: 0, demoTransactions: 0, totalProducts: 0, totalTransactions: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLoad = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const result = await apiClient.post<any>('/admin/mock-data/load', {});
      setMessage({ type: 'success', text: `Loaded ${result.created.products} products and ${result.created.transactions} transactions` });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load mock data' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnload = async () => {
    if (!confirm('Are you sure you want to remove all demo data? This will delete demo products and their transactions.')) {
      return;
    }
    setIsProcessing(true);
    setMessage(null);
    try {
      const result = await apiClient.post<any>('/admin/mock-data/unload', {});
      setMessage({ type: 'success', text: `Removed ${result.deleted.products} products and ${result.deleted.transactions} transactions` });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to unload mock data' });
    } finally {
      setIsProcessing(false);
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
        <p className="text-slate-400 text-sm mt-1">Load or remove demo marketplace data for beta testing presentations</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className={`px-6 py-4 flex items-center justify-between ${status?.isLoaded ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-slate-50 border-b border-slate-100'}`}>
          <div className="flex items-center gap-3">
            {status?.isLoaded ? (
              <ToggleRight size={28} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={28} className="text-slate-400" />
            )}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: status?.isLoaded ? '#059669' : '#94a3b8' }}>
                Demo Data {status?.isLoaded ? 'Active' : 'Inactive'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {status?.isLoaded 
                  ? 'Demo products and transactions are visible in the marketplace' 
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
            {isProcessing ? (
              <><Loader2 size={14} className="animate-spin" /> Processing...</>
            ) : status?.isLoaded ? (
              <><Trash2 size={14} /> Unload Demo Data</>
            ) : (
              <><Download size={14} /> Load Demo Data</>
            )}
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Demo Products" value={status?.demoProducts || 0} icon={Package} color="#7851A9" />
            <StatBox label="Demo Transactions" value={status?.demoTransactions || 0} icon={Receipt} color="#C2A76F" />
            <StatBox label="Total Products" value={status?.totalProducts || 0} icon={Package} color="#94a3b8" />
            <StatBox label="Total Transactions" value={status?.totalTransactions || 0} icon={Receipt} color="#94a3b8" />
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

      {/* What Gets Loaded */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-widest mb-4">What Demo Data Includes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Package, title: '35+ Products & Services', desc: 'Realistic listings across Dining, Home Services, Professional Services, Groceries, Education, Health & Wellness, and more. Distributed across all seed merchants.' },
            { icon: Receipt, title: '50 Simulated Transactions', desc: 'Completed purchases with proper 10/10/1 splits — discount amounts, nonprofit donations, platform fees, and merchant payouts all calculated.' },
            { icon: Database, title: 'Safely Tagged', desc: 'All demo items are prefixed with [DEMO] and can be cleanly removed at any time without affecting real user data or actual transactions.' },
            { icon: CheckCircle2, title: 'Dashboard Ready', desc: 'Transactions populate the admin dashboards, financial reports, and impact metrics so you can demonstrate the full platform during presentations.' },
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

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black text-amber-700">Beta Testing Notes</h4>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-amber-600">• Load demo data before inviting testers so the marketplace looks populated</li>
              <li className="text-xs text-amber-600">• Demo products show [DEMO] in their names — testers will know they're sample items</li>
              <li className="text-xs text-amber-600">• Unload demo data before going live with real merchants</li>
              <li className="text-xs text-amber-600">• You can load and unload as many times as needed — it's fully reversible</li>
              <li className="text-xs text-amber-600">• Real products from actual merchants are never affected by this toggle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper stat box component
const StatBox = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
  <div className="text-center p-4 bg-slate-50 rounded-xl">
    <Icon size={20} className="mx-auto mb-2" style={{ color }} />
    <div className="text-2xl font-black" style={{ color }}>{value}</div>
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
  </div>
);
