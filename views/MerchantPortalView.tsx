import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LayoutDashboard, Package, Calendar, BarChart3, ShoppingBag, Truck, Heart, Settings, Menu, X, ChevronRight, QrCode, Smartphone } from 'lucide-react';
import { MerchantDashboard } from '../components/MerchantDashboard';
import { MerchantListings } from '../components/MerchantListings';
import { MerchantBookings } from '../components/MerchantBookings';
import { MerchantFinancials } from '../components/MerchantFinancials';
import { MerchantCoop } from '../components/MerchantCoop';
import { MerchantSupplyChain } from '../components/MerchantSupplyChain';
import { MerchantBenefits } from '../components/MerchantBenefits';
import { MerchantSettings } from '../components/MerchantSettings';
import { MerchantOrders } from '../components/MerchantOrders';
import { HandshakeScanner } from '../components/HandshakeScanner';
import { MerchantQRDisplay } from '../components/QRPaymentSystem';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { MerchantAdvisor } from '../components/MerchantAdvisor';
import { MerchantWelcomeKit } from '../components/MerchantWelcomeKit';
import { merchantService } from '../services/merchantService';

type MerchantSubView = 'DASHBOARD' | 'LISTINGS' | 'ORDERS' | 'BOOKINGS' | 'FINANCIALS' | 'COOP' | 'SUPPLY_CHAIN' | 'BENEFITS' | 'SETTLEMENT' | 'QR_PAY' | 'SETTINGS';

export const MerchantPortalView: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<MerchantSubView>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorInitialQuery, setAdvisorInitialQuery] = useState<string | undefined>(undefined);
  const [showWelcomeKit, setShowWelcomeKit] = useState(false);
  const [merchantListings, setMerchantListings] = useState<{ id: string; name: string; price: number }[]>([]);
  const { currentUser, orders, updateOrders, products } = useGoodCirclesStore();

  // Accessing the merchant relation safely via a cast
  const merchantData = (currentUser as any)?.merchant;

  useEffect(() => {
    if (!currentUser?.id) return;
    const key = `gc_merchant_welcomed_${currentUser.id}`;
    if (!localStorage.getItem(key)) {
      setShowWelcomeKit(true);
      localStorage.setItem(key, '1');
    }
  }, [currentUser?.id]);

  useEffect(() => {
    merchantService.getListings().then(listings => {
      setMerchantListings(
        listings
          .filter(l => l.isActive)
          .map(l => ({ id: l.id, name: l.name, price: l.price }))
      );
    }).catch(() => {});
  }, []);

  const handleVerifyHandshake = async (token: string, productServiceId?: string) => {
    if (productServiceId) {
      try {
        const result = await merchantService.processQrCheckout(token, productServiceId);
        const nonprofitShare = result?.transaction?.nonprofitShare ?? result?.nonprofitShare;
        return {
          success: true,
          message: 'Payment settled. 10/10/1 split complete.',
          amount: nonprofitShare ? Number(nonprofitShare) : undefined,
        };
      } catch (err: any) {
        return { success: false, message: err.message || 'Settlement failed.' };
      }
    }
    // Fallback: local demo handshake via impact token
    const order = orders.find(o => o.impactToken === token);
    if (order) {
      const updated = orders.map(o => o.id === order.id ? { ...o, handshakeStatus: 'COMPLETED' as const } : o);
      updateOrders(updated);
      return { success: true, message: 'Contribution secured.', amount: order.accounting.donationAmount };
    }
    return { success: false, message: 'Invalid token.' };
  };

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'LISTINGS', label: 'Marketplace Assets', icon: Package },
    { id: 'ORDERS', label: 'Order Fulfillment', icon: ShoppingBag },
    { id: 'BOOKINGS', label: 'Service Schedule', icon: Calendar },
    { id: 'FINANCIALS', label: 'Financial Reports', icon: BarChart3 },
    { id: 'QR_PAY', label: 'In-Person QR Pay', icon: Smartphone },
    { id: 'SETTLEMENT', label: 'QR Settlement', icon: QrCode },
    { id: 'COOP', label: 'Co-op Purchasing', icon: ShoppingBag },
    { id: 'SUPPLY_CHAIN', label: 'Supply Chain Node', icon: Truck },
    { id: 'BENEFITS', label: 'Collective Benefits', icon: Heart },
    { id: 'SETTINGS', label: 'Node Settings', icon: Settings },
  ];

  const renderSubView = () => {
    switch (activeSubView) {
      case 'DASHBOARD': return <MerchantDashboard onOpenAdvisor={(query) => { setAdvisorInitialQuery(query); setIsAdvisorOpen(true); }} />;
      case 'LISTINGS': return <MerchantListings />;
      case 'ORDERS': return <MerchantOrders />;
      case 'BOOKINGS': return <MerchantBookings />;
      case 'FINANCIALS': return <MerchantFinancials />;
      case 'QR_PAY': return (
        <MerchantQRDisplay
          merchantId={currentUser?.id || ''}
          merchantName={(currentUser as any)?.merchant?.businessName || currentUser?.firstName || 'Merchant'}
          products={[]}
        />
      );
      case 'SETTLEMENT': return <HandshakeScanner onVerify={handleVerifyHandshake} onCancel={() => setActiveSubView('DASHBOARD')} products={merchantListings} />;
      case 'COOP': return <MerchantCoop />;
      case 'SUPPLY_CHAIN': return <MerchantSupplyChain />;
      case 'BENEFITS': return <MerchantBenefits />;
      case 'SETTINGS': return <MerchantSettings />;
      default: return <MerchantDashboard onOpenAdvisor={(query) => { setAdvisorInitialQuery(query); setIsAdvisorOpen(true); }} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      {/* Hamburger toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-20 left-4 z-50 p-3 bg-white rounded-2xl shadow-lg border border-slate-100"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={prefersReducedMotion ? false : { width: isSidebarOpen ? 320 : 100 }}
        className={`bg-white border-r border-slate-100 flex flex-col h-screen z-50 shadow-2xl shadow-slate-200/50 fixed top-0 left-0 md:sticky md:top-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black italic text-xl">GC</div>
              <div className="min-w-0">
                <h1 className="text-sm font-black uppercase tracking-tighter truncate">Merchant Portal</h1>
                <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Node: {currentUser?.id?.slice(0, 8) ?? ''}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black italic text-xl mx-auto">GC</div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSubView(item.id as MerchantSubView); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${
                activeSubView === item.id
                  ? 'bg-black text-white shadow-xl'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-black'
              }`}
            >
              <item.icon
                size={20}
                className={activeSubView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-black'}
              />
              {isSidebarOpen && (
                <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.label}</span>
              )}
              {activeSubView === item.id && isSidebarOpen && (
                <motion.div layoutId="active-nav" className="absolute right-4">
                  <ChevronRight size={14} />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-4 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-black transition-all flex items-center justify-center"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-16 md:pt-8 md:p-12 lg:p-16 overflow-y-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-center text-2xl font-black italic uppercase tracking-tighter">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Welcome back, {(currentUser as any)?.merchant?.businessName || currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Merchant'}.
              </h2>
              <p className="text-slate-400 text-xs font-medium">
                Your merchant node is healthy and synced with the global ledger.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Status</p>
                <p className="text-[10px] font-black uppercase text-emerald-500">Active & Verified</p>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

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
      </main>
      {/* AI Merchant Advisor */}
      <button
        onClick={() => setIsAdvisorOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#7851A9] hover:bg-[#6a3f9a] text-white font-bold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors"
        title="Open AI Advisor"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
        <span className="hidden sm:inline text-sm">AI Advisor</span>
      </button>
      {currentUser && (
        <MerchantAdvisor
          isOpen={isAdvisorOpen}
          onClose={() => { setIsAdvisorOpen(false); setAdvisorInitialQuery(undefined); }}
          merchantProfile={currentUser}
          currentProducts={products.filter((p: any) => p.merchantId === (currentUser as any)?.merchantId || p.merchantId === currentUser.id)}
          allProducts={products}
          orders={orders}
          initialQuery={advisorInitialQuery}
        />
      )}
      {showWelcomeKit && (
        <MerchantWelcomeKit
          merchantName={(currentUser as any)?.name ?? ''}
          onClose={() => setShowWelcomeKit(false)}
        />
      )}
    </div>
  );
};
