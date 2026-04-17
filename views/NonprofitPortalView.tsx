
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  History,
  BarChart3,
  Users,
  Target,
  UserCircle,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { NonprofitDashboard } from '../components/NonprofitDashboard';
import { NonprofitTransactions } from '../components/NonprofitTransactions';
import { NonprofitAnalytics } from '../components/NonprofitAnalytics';
import { NonprofitReferrals } from '../components/NonprofitReferrals';
import { NonprofitInitiatives } from '../components/NonprofitInitiatives';
import { NonprofitProfile } from '../components/NonprofitProfile';
import { NonprofitPayouts } from '../components/NonprofitPayouts';

type NonprofitSubView = 'DASHBOARD' | 'TRANSACTIONS' | 'ANALYTICS' | 'REFERRALS' | 'INITIATIVES' | 'PROFILE' | 'PAYOUTS';

export const NonprofitPortalView: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<NonprofitSubView>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser } = useGoodCirclesStore();

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'TRANSACTIONS', label: 'Transaction Feed', icon: History },
    { id: 'ANALYTICS', label: 'Impact Analytics', icon: BarChart3 },
    { id: 'REFERRALS', label: 'Referral Program', icon: Users },
    { id: 'INITIATIVES', label: 'Community Initiatives', icon: Target },
    { id: 'PROFILE', label: 'Org Profile', icon: UserCircle },
    { id: 'PAYOUTS', label: 'Payout History', icon: CreditCard },
  ];

  const renderSubView = () => {
    switch (activeSubView) {
      case 'DASHBOARD': return <NonprofitDashboard />;
      case 'TRANSACTIONS': return <NonprofitTransactions />;
      case 'ANALYTICS': return <NonprofitAnalytics />;
      case 'REFERRALS': return <NonprofitReferrals />;
      case 'INITIATIVES': return <NonprofitInitiatives />;
      case 'PROFILE': return <NonprofitProfile />;
      case 'PAYOUTS': return <NonprofitPayouts />;
      default: return <NonprofitDashboard />;
    }
  };

  const activeLabel = navItems.find(n => n.id === activeSubView)?.label || 'Dashboard';

  return (
    <div className="min-h-[50vh] bg-[#f8fafc] font-sans">
      {/* Mobile sub-nav bar */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#7851A9] rounded-xl flex items-center justify-center text-white font-black italic text-lg shadow-lg shadow-[#7851A9]/20">GC</div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-tighter truncate">Nonprofit Portal</h1>
            <p className="text-[8px] font-black text-[#7851A9] uppercase tracking-widest">{activeLabel}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
          aria-label="Toggle nonprofit menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dropdown nav (replaces sidebar) */}
      {isSidebarOpen && (
        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] p-3 mb-6 shadow-lg overflow-hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSubView(item.id as NonprofitSubView); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${activeSubView === item.id ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}
              >
                <item.icon size={18} className={activeSubView === item.id ? 'text-white' : 'text-slate-400'} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                {activeSubView === item.id && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-16">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-center text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-[#7851A9]">
            {currentUser?.firstName?.[0]}
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter">Impact Report: {currentUser?.firstName}.</h2>
            <p className="text-slate-400 text-[10px] sm:text-xs font-medium">Your organization is actively receiving community-driven funding.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Impact Status</p>
              <p className="text-[10px] font-black uppercase text-[#7851A9]">Verified Partner</p>
            </div>
            <div className="w-2 h-2 bg-[#7851A9] rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderSubView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
