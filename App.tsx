import React, { useState, useEffect, useRef, Suspense } from 'react';
import { PurchaseImpactAnimation } from './components/PurchaseImpactAnimation';
import { MarketplaceView } from './views/MarketplaceView';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BrandLogo } from './components/BrandAssets';
import { ActivityTicker } from './components/CommunityActivityFeed';
import { useGoodCirclesStore } from './hooks/useGoodCirclesStore';
import { MOCK_NONPROFITS, MOCK_USERS } from './constants';
import { Nonprofit, Order, Review } from './types';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AuthSystem } from './components/AuthSystem';
import { marketplaceService } from './services/marketplaceService';
import { authService } from './services/authService';
import { neighborService } from './services/neighborService';
import ErrorBoundary from './components/ErrorBoundary';
import { registerToastHandler } from './hooks/toast';

// --- Lazy-loaded views (code-split per route for faster mobile loads) ---
const TimelineView = React.lazy(() => import('./views/TimelineView').then(m => ({ default: m.TimelineView })));
const CommunityNeedsView = React.lazy(() => import('./views/CommunityNeedsView').then(m => ({ default: m.CommunityNeedsView })));
const PublicLedgerView = React.lazy(() => import('./views/PublicLedgerView').then(m => ({ default: m.PublicLedgerView })));
const GovernanceView = React.lazy(() => import('./views/GovernanceView').then(m => ({ default: m.GovernanceView })));
const MerchantScheduleView = React.lazy(() => import('./views/MerchantScheduleView').then(m => ({ default: m.MerchantScheduleView })));
const ProfileView = React.lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));
const NonprofitSelectionView = React.lazy(() => import('./views/NonprofitSelectionView').then(m => ({ default: m.NonprofitSelectionView })));
const WalletView = React.lazy(() => import('./views/WalletView').then(m => ({ default: m.WalletView })));
const OrderHistoryView = React.lazy(() => import('./views/OrderHistoryView').then(m => ({ default: m.OrderHistoryView })));
const ImpactDashboardView = React.lazy(() => import('./views/ImpactDashboardView').then(m => ({ default: m.ImpactDashboardView })));
const CommunityInitiativesView = React.lazy(() => import('./views/CommunityInitiativesView').then(m => ({ default: m.CommunityInitiativesView })));
const MerchantPortalView = React.lazy(() => import('./views/MerchantPortalView').then(m => ({ default: m.MerchantPortalView })));
const NonprofitPortalView = React.lazy(() => import('./views/NonprofitPortalView').then(m => ({ default: m.NonprofitPortalView })));
const AdminPortalView = React.lazy(() => import('./views/AdminPortalView').then(m => ({ default: m.AdminPortalView })));
const ImpactMapView = React.lazy(() => import('./views/ImpactMapView').then(m => ({ default: m.ImpactMapView })));
const ImpactLeaderboard = React.lazy(() => import('./components/ImpactLeaderboard').then(m => ({ default: m.ImpactLeaderboard })));
const FAQSection = React.lazy(() => import('./components/FAQSection').then(m => ({ default: m.FAQSection })));
const NonprofitPortal = React.lazy(() => import('./components/NonprofitPortal').then(m => ({ default: m.NonprofitPortal })));
const AccountingHub = React.lazy(() => import('./components/AccountingHub').then(m => ({ default: m.AccountingHub })));
const PublicImpactDashboard = React.lazy(() => import('./components/PublicImpactDashboard').then(m => ({ default: m.PublicImpactDashboard })));
const MerchantLandingPage = React.lazy(() => import('./components/MerchantLandingPage').then(m => ({ default: m.MerchantLandingPage })));
const AccountingDashboard = React.lazy(() => import('./components/AccountingDashboard').then(m => ({ default: m.AccountingDashboard })));
const NettingDashboard = React.lazy(() => import('./components/NettingDashboard').then(m => ({ default: m.NettingDashboard })));
const AdminNetting = React.lazy(() => import('./components/AdminNetting').then(m => ({ default: m.AdminNetting })));
const CoopDashboard = React.lazy(() => import('./components/CoopDashboard').then(m => ({ default: m.CoopDashboard })));
const AdminCoopActivation = React.lazy(() => import('./components/AdminCoopActivation').then(m => ({ default: m.AdminCoopActivation })));
const DataCoopDashboard = React.lazy(() => import('./components/DataCoopDashboard').then(m => ({ default: m.DataCoopDashboard })));
const AdminDataCoopDashboard = React.lazy(() => import('./components/AdminDataCoopDashboard').then(m => ({ default: m.AdminDataCoopDashboard })));
const CreditDashboard = React.lazy(() => import('./components/CreditDashboard').then(m => ({ default: m.CreditDashboard })));
const ReferralDashboard = React.lazy(() => import('./components/ReferralDashboard').then(m => ({ default: m.ReferralDashboard })));
const CDFIDashboard = React.lazy(() => import('./components/CDFIDashboard').then(m => ({ default: m.CDFIDashboard })));
const BenefitsView = React.lazy(() => import('./components/BenefitsView').then(m => ({ default: m.BenefitsView })));
const SupplyChainView = React.lazy(() => import('./components/SupplyChainView').then(m => ({ default: m.SupplyChainView })));
const MerchantIncentivesView = React.lazy(() => import('./components/MerchantIncentivesView').then(m => ({ default: m.MerchantIncentivesView })));
const TaxCenter = React.lazy(() => import('./components/TaxCenter').then(m => ({ default: m.TaxCenter })));
const AdminImpactView = React.lazy(() => import('./components/AdminImpactView').then(m => ({ default: m.AdminImpactView })));
const MunicipalPartnerPortal = React.lazy(() => import('./components/MunicipalPartnerPortal').then(m => ({ default: m.MunicipalPartnerPortal })));
const CatalogUploadView = React.lazy(() => import('./views/CatalogUploadView').then(m => ({ default: m.CatalogUploadView })));

const App: React.FC = () => {
  const store = useGoodCirclesStore();
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>(MOCK_NONPROFITS);
  const [realNonprofits, setRealNonprofits] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [showPublicImpact, setShowPublicImpact] = useState(false);
  const [showMerchantLanding, setShowMerchantLanding] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [impactData, setImpactData] = useState<{
    grossAmount: number;
    merchantNet: number;
    discountAmount: number;
    nonprofitDonation: number;
    nonprofitName: string;
    nonprofitMission: string;
  } | null>(null);
  // Prefer the user's elected real nonprofit; fall back to first real, then mock
  const electedReal = realNonprofits.find(n => n.id === store.currentUser?.electedNonprofitId);
  const selectedRealNonprofit = electedReal ?? realNonprofits[0] ?? null;
  const selectedNonprofit = nonprofits[0];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { registerToastHandler(showToast); }, []);

  useEffect(() => {
    neighborService.listNonprofits().then(setRealNonprofits).catch(() => {});
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('gc_mock_users')) {
      localStorage.setItem('gc_mock_users', JSON.stringify(MOCK_USERS));
    }
    const savedReviews = localStorage.getItem('gc_reviews');
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    const savedWishlist = localStorage.getItem('gc_wishlist');
    if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));
  }, []);

  const handleAddReview = (review: Review) => {
    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem('gc_reviews', JSON.stringify(updated));
  };

  const handleAddToWishlist = (productId: string) => {
    if (wishlistIds.includes(productId)) return;
    const updated = [...wishlistIds, productId];
    setWishlistIds(updated);
    localStorage.setItem('gc_wishlist', JSON.stringify(updated));
  };

  const handleRemoveFromWishlist = (productId: string) => {
    const updated = wishlistIds.filter(id => id !== productId);
    setWishlistIds(updated);
    localStorage.setItem('gc_wishlist', JSON.stringify(updated));
  };

  const handleUpdateNonprofit = (updated: Nonprofit) => {
    setNonprofits(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const handleCheckout = async (order: Order) => {
    try {
      const payload = {
        items: store.cart.map(item => ({
          merchantId: item.product.merchantId,
          productServiceId: item.product.id,
          nonprofitId: selectedRealNonprofit?.id ?? store.currentUser?.electedNonprofitId ?? undefined,
        })),
        paymentMethod: store.paymentMethod,
        discountWaived: order.isDiscountWaived,
        waivedToInitiativeId: order.targetProjectId,
        creditsToApply: order.appliedCredits,
      };
      const response = await marketplaceService.checkout(payload);
      const updatedOrders = [...store.orders, ...response.orders];
      store.updateOrders(updatedOrders);
      const profile = await authService.getProfile();
      store.updateUser(profile);
      if (store.paymentMethod === 'CARD' || store.paymentMethod === 'BALANCE') {
        store.setSelectedInvoiceOrder(response.orders[0]);
      }
      store.setIsCartOpen(false);
      store.setCart([]);
      const completedOrder = response.orders[0];
      if (completedOrder?.accounting) {
        setImpactData({
          grossAmount:       Number(completedOrder.grossAmount),
          merchantNet:       Number(completedOrder.accounting.merchantNet),
          discountAmount:    Number(completedOrder.totalDiscount ?? completedOrder.accounting.grossProfit ?? 0),
          nonprofitDonation: Number(completedOrder.accounting.donationAmount),
          nonprofitName:     selectedRealNonprofit?.orgName ?? selectedNonprofit.name,
          nonprofitMission:  selectedRealNonprofit?.missionStatement ?? selectedNonprofit.description,
        });
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      showToast('Checkout failed. Please try again.', 'error');
    }
  };

  if (!store.currentUser) {
    if (showPublicImpact) {
      return <PublicImpactDashboard onClose={() => setShowPublicImpact(false)} onJoin={() => setShowPublicImpact(false)} />;
    }
    if (showMerchantLanding) {
      return <MerchantLandingPage onBack={() => setShowMerchantLanding(false)} onSignUp={() => setShowMerchantLanding(false)} />;
    }
    return (
      <div>
        <AuthSystem onLogin={store.login} />
        <div className="fixed bottom-8 left-0 right-0 text-center z-50 flex justify-center gap-3">
          <button onClick={() => setShowPublicImpact(true)} className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#CA9CE1]/30 text-xs font-black text-[#7851A9] uppercase tracking-widest hover:shadow-2xl transition-all">
            View Community Impact
          </button>
          <button onClick={() => setShowMerchantLanding(true)} className="px-6 py-3 bg-[#7851A9]/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#7851A9] text-xs font-black text-white uppercase tracking-widest hover:shadow-2xl transition-all">
            Become a Merchant
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = store.products;

  const viewLabels: Partial<Record<typeof store.activeView, string>> = {
    MAIN: 'Marketplace',
    PUBLIC_LEDGER: 'Public Ledger',
    IMPACT: 'My Impact',
    WALLET: 'Wallet',
    COMMUNITY_NEEDS: 'Community Needs',
    COMMUNITY_INITIATIVES: 'Initiatives',
    ORDER_HISTORY: 'Order History',
    NONPROFIT_SELECTION: 'Choose a Cause',
    GOVERNANCE: 'Governance',
    LEADERBOARD: 'Leaderboard',
    FAQ: 'FAQ',
    IMPACT_MAP: 'Impact Map',
    NONPROFIT_PORTAL: 'Nonprofit Portal',
    MERCHANT_PORTAL: 'Merchant Portal',
    ADMIN_PORTAL: 'Admin Portal',
    PROFILE: 'My Profile',
    TAX_CENTER: 'Tax Center',
    SCHEDULE: 'Schedule',
    CATALOG_UPLOAD: 'Catalog Upload',
  };
  const currentViewLabel = viewLabels[store.activeView] || '';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FDFCFE] flex flex-col font-sans relative overflow-x-hidden">
        {store.impersonationRole && (
          <div className="sticky top-0 z-[110] bg-[#A20021] text-white px-4 py-2 flex items-center justify-between text-xs font-black uppercase tracking-widest">
            <span>Admin Impersonation Active — Viewing as {store.impersonationRole}</span>
            <button
              onClick={() => store.setImpersonationRole(null)}
              className="px-3 py-1 bg-white text-[#A20021] rounded-lg hover:bg-red-50 transition-colors"
            >
              Return to Admin
            </button>
          </div>
        )}
        <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-[#CA9CE1]/30 shadow-sm">
          {/* Top bar */}
          <div className="px-2 sm:px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-3 min-w-0 shrink">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0" aria-label="Toggle menu">
                {isMenuOpen ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
              <div className="min-w-0 overflow-hidden">
                <BrandLogo variant="GOLD" className="transform scale-[0.6] sm:scale-75 origin-left cursor-pointer" onClick={() => { store.setActiveView('MAIN'); setIsMenuOpen(false); }} />
              </div>
            </div>
            {currentViewLabel && (
              <span className="hidden sm:block text-xs font-bold text-slate-400 truncate max-w-[160px]">
                {currentViewLabel}
              </span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setIsWishlistOpen(true)} className="p-1.5 sm:p-2.5 bg-white rounded-xl sm:rounded-2xl border border-[#CA9CE1]/30 relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {wishlistIds.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A20021] text-white text-[7px] font-black rounded-full flex items-center justify-center">{wishlistIds.length}</span>}
              </button>
              <button onClick={() => store.setIsCartOpen(true)} className="p-1.5 sm:p-2.5 bg-white rounded-xl sm:rounded-2xl border border-[#CA9CE1]/30 relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {store.cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#7851A9] text-white text-[7px] font-black rounded-full flex items-center justify-center">{store.cart.length}</span>}
              </button>
              <button onClick={() => store.setActiveView('PROFILE')} className="p-1.5 sm:p-2.5 bg-white rounded-xl sm:rounded-2xl border border-[#CA9CE1]/30">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
              <button onClick={store.logout} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white rounded-xl sm:rounded-2xl text-[#A20021] border border-red-100 font-black text-[10px] sm:text-[10px] uppercase tracking-wide">Out</button>
            </div>
          </div>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 z-[99] bg-white border-t border-slate-100 px-3 py-3 flex flex-col gap-0.5 max-h-[75vh] overflow-y-auto shadow-xl">
              <MenuBtn active={store.activeView === 'MAIN'} onClick={() => { store.setActiveView('MAIN'); setIsMenuOpen(false); }} label="Marketplace" />
              <MenuBtn active={store.activeView === 'PUBLIC_LEDGER'} onClick={() => { store.setActiveView('PUBLIC_LEDGER'); setIsMenuOpen(false); }} label="Public Ledger" />
              <MenuBtn active={store.activeView === 'IMPACT'} onClick={() => { store.setActiveView('IMPACT'); setIsMenuOpen(false); }} label="Impact" />
              <MenuBtn active={store.activeView === 'WALLET'} onClick={() => { store.setActiveView('WALLET'); setIsMenuOpen(false); }} label="Wallet" />
              <MenuBtn active={store.activeView === 'COMMUNITY_NEEDS'} onClick={() => { store.setActiveView('COMMUNITY_NEEDS'); setIsMenuOpen(false); }} label="Community Needs" />
              <MenuBtn active={store.activeView === 'COMMUNITY_INITIATIVES'} onClick={() => { store.setActiveView('COMMUNITY_INITIATIVES'); setIsMenuOpen(false); }} label="Initiatives" />
              <MenuBtn active={store.activeView === 'ORDER_HISTORY'} onClick={() => { store.setActiveView('ORDER_HISTORY'); setIsMenuOpen(false); }} label="Orders" />
              <MenuBtn active={store.activeView === 'NONPROFIT_SELECTION'} onClick={() => { store.setActiveView('NONPROFIT_SELECTION'); setIsMenuOpen(false); }} label="Causes" />
              <MenuBtn active={store.activeView === 'GOVERNANCE'} onClick={() => { store.setActiveView('GOVERNANCE'); setIsMenuOpen(false); }} label="Governance" />
              <MenuBtn active={store.activeView === 'LEADERBOARD'} onClick={() => { store.setActiveView('LEADERBOARD'); setIsMenuOpen(false); }} label="Leaderboard" />
              <MenuBtn active={store.activeView === 'FAQ'} onClick={() => { store.setActiveView('FAQ'); setIsMenuOpen(false); }} label="FAQ" />
              <MenuBtn active={store.activeView === 'IMPACT_MAP'} onClick={() => { store.setActiveView('IMPACT_MAP'); setIsMenuOpen(false); }} label="Impact Map" />

              {store.effectiveRole === 'NONPROFIT' && (
                <>
                  <div className="mt-3 mb-1 px-3 text-[10px] font-black text-[#7851A9] uppercase tracking-widest border-t border-slate-100 pt-3">Nonprofit</div>
                  <MenuBtn active={store.activeView === 'NONPROFIT_PORTAL'} onClick={() => { store.setActiveView('NONPROFIT_PORTAL'); setIsMenuOpen(false); }} label="Nonprofit Portal" />
                  <MenuBtn active={store.activeView === 'TAX_CENTER'} onClick={() => { store.setActiveView('TAX_CENTER'); setIsMenuOpen(false); }} label="Tax Center" />
                </>
              )}

              {store.effectiveRole === 'MERCHANT' && (
                <>
                  <div className="mt-3 mb-1 px-3 text-[10px] font-black text-[#7851A9] uppercase tracking-widest border-t border-slate-100 pt-3">Merchant</div>
                  <MenuBtn active={store.activeView === 'MERCHANT_PORTAL'} onClick={() => { store.setActiveView('MERCHANT_PORTAL'); setIsMenuOpen(false); }} label="Merchant Portal" />
                  <MenuBtn active={store.activeView === 'SCHEDULE'} onClick={() => { store.setActiveView('SCHEDULE'); setIsMenuOpen(false); }} label="Schedule" />
                  <MenuBtn active={store.activeView === 'NETTING'} onClick={() => { store.setActiveView('NETTING'); setIsMenuOpen(false); }} label="Netting" />
                  <MenuBtn active={store.activeView === 'DATA_COOP'} onClick={() => { store.setActiveView('DATA_COOP'); setIsMenuOpen(false); }} label="Data Co-op" />
                  <MenuBtn active={store.activeView === 'BENEFITS'} onClick={() => { store.setActiveView('BENEFITS'); setIsMenuOpen(false); }} label="Benefits" />
                  <MenuBtn active={store.activeView === 'SUPPLY_CHAIN'} onClick={() => { store.setActiveView('SUPPLY_CHAIN'); setIsMenuOpen(false); }} label="Supply Chain" />
                  <MenuBtn active={store.activeView === 'MERCHANT_INCENTIVES'} onClick={() => { store.setActiveView('MERCHANT_INCENTIVES'); setIsMenuOpen(false); }} label="Incentives" />
                  <MenuBtn active={store.activeView === 'TAX_CENTER'} onClick={() => { store.setActiveView('TAX_CENTER'); setIsMenuOpen(false); }} label="Tax Center" />
                  <MenuBtn active={store.activeView === 'CATALOG_UPLOAD'} onClick={() => { store.setActiveView('CATALOG_UPLOAD'); setIsMenuOpen(false); }} label="Catalog Upload" />
                </>
              )}

              {store.effectiveRole === 'CDFI' && (
                <>
                  <div className="mt-3 mb-1 px-3 text-[10px] font-black text-[#7851A9] uppercase tracking-widest border-t border-slate-100 pt-3">CDFI</div>
                  <MenuBtn active={store.activeView === 'CDFI_DASHBOARD'} onClick={() => { store.setActiveView('CDFI_DASHBOARD'); setIsMenuOpen(false); }} label="CDFI Portal" />
                </>
              )}

              {store.effectiveRole === 'PLATFORM' && (
                <>
                  <div className="mt-3 mb-1 px-3 text-[10px] font-black text-[#7851A9] uppercase tracking-widest border-t border-slate-100 pt-3">Admin</div>
                  <MenuBtn active={store.activeView === 'ADMIN_NETTING'} onClick={() => { store.setActiveView('ADMIN_NETTING'); setIsMenuOpen(false); }} label="Netting Admin" />
                  <MenuBtn active={store.activeView === 'ADMIN_COOP'} onClick={() => { store.setActiveView('ADMIN_COOP'); setIsMenuOpen(false); }} label="Co-op Admin" />
                  <MenuBtn active={store.activeView === 'ADMIN_DATA_COOP'} onClick={() => { store.setActiveView('ADMIN_DATA_COOP'); setIsMenuOpen(false); }} label="Data Coop Admin" />
                  <MenuBtn active={store.activeView === 'ADMIN_IMPACT'} onClick={() => { store.setActiveView('ADMIN_IMPACT'); setIsMenuOpen(false); }} label="Impact Admin" />
                </>
              )}
            </div>
          )}
        </nav>

        <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12">
          <Suspense fallback={<div className="flex-1 flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#7851A9]/20 border-t-[#7851A9] rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading...</p>
            </div>
          </div>}>
            {store.activeView === 'PROFILE' && store.currentUser && (
              <ProfileView user={store.currentUser} onUpdate={store.updateUser} />
            )}
            {store.activeView === 'NONPROFIT_SELECTION' && (
              <NonprofitSelectionView
                currentNonprofitId={store.currentUser?.electedNonprofitId}
                onSelect={(id) => store.updateUser({ ...store.currentUser!, electedNonprofitId: id })}
              />
            )}
            {store.activeView === 'WALLET' && (
              <WalletView
                balance={store.walletBalance}
                creditBalance={store.creditBalance}
                transactions={store.wallet?.transactions || []}
                onTopUp={store.topUp}
                onWithdraw={store.withdraw}
                isLoading={store.isLoading}
                onToast={showToast}
              />
            )}
            {store.activeView === 'ORDER_HISTORY' && <OrderHistoryView />}
            {store.activeView === 'IMPACT' && <ImpactDashboardView />}
            {store.activeView === 'COMMUNITY_INITIATIVES' && <CommunityInitiativesView />}
            {store.activeView === 'COMMUNITY_NEEDS' && <CommunityNeedsView nonprofits={MOCK_NONPROFITS} allProducts={store.products} cart={store.cart} onFulfill={(product) => store.addToCart(product)} />}
            {store.activeView === 'NONPROFIT_PORTAL' && <NonprofitPortalView />}
            {store.activeView === 'MERCHANT_PORTAL' && <MerchantPortalView />}
            {store.activeView === 'ADMIN_PORTAL' && <AdminPortalView />}
            {store.activeView === 'TIMELINE' && (
              <TimelineView
                orders={store.orders}
                bookings={store.bookings}
                selectedNonprofit={selectedNonprofit}
                onInvoiceClick={store.setSelectedInvoiceOrder}
                onCancelBooking={store.cancelBooking}
                currentUser={store.currentUser}
              />
            )}
            {store.activeView === 'PUBLIC_LEDGER' && <PublicLedgerView orders={store.orders} batches={store.batches} globalStats={store.globalStats} onToast={showToast} />}
            {store.activeView === 'LEADERBOARD' && <ImpactLeaderboard orders={store.orders} />}
            {store.activeView === 'FAQ' && <FAQSection role={store.effectiveRole!} />}
            {store.activeView === 'GOVERNANCE' && <GovernanceView proposals={store.proposals} waivedFundsLog={store.waivedFundsLog} currentUser={store.currentUser} onVote={store.castVote} onCreateProposal={store.createProposal} globalStats={store.globalStats} />}
            {store.activeView === 'ADMIN_NETTING' && <AdminNetting />}
            {store.activeView === 'ADMIN_COOP' && <AdminCoopActivation />}
            {store.activeView === 'ADMIN_DATA_COOP' && <AdminDataCoopDashboard />}
            {store.activeView === 'CREDITS' && <CreditDashboard />}
            {store.activeView === 'REFERRALS' && <ReferralDashboard />}
            {store.activeView === 'CDFI_DASHBOARD' && <CDFIDashboard />}
            {store.activeView === 'ADMIN_IMPACT' && <AdminImpactView />}
            {store.activeView === 'MUNICIPAL_PORTAL' && <MunicipalPartnerPortal />}
            {store.activeView === 'DATA_COOP' && <DataCoopDashboard />}
            {store.activeView === 'BENEFITS' && <BenefitsView />}
            {store.activeView === 'TAX_CENTER' && <TaxCenter orders={store.orders} user={store.currentUser!} />}
            {store.activeView === 'SCHEDULE' && store.effectiveRole === 'MERCHANT' && (
              <MerchantScheduleView
                bookings={store.bookings}
                availability={store.availability}
                onConfirm={store.confirmBooking}
                onComplete={store.completeBooking}
                onCancel={store.cancelBooking}
                onUpdateAvailability={store.updateAvailability}
              />
            )}
            {store.activeView === 'NETTING' && <NettingDashboard merchantId={store.currentUser?.merchantId || ''} />}
            {store.activeView === 'IMPACT_MAP' && (
              <ImpactMapView
                circles={[]}
                myCircle={undefined}
                currentUser={store.currentUser}
                onSendMessage={() => {}}
              />
            )}
            {store.activeView === 'SUPPLY_CHAIN' && <SupplyChainView />}
            {store.activeView === 'MERCHANT_INCENTIVES' && <MerchantIncentivesView />}
            {store.activeView === 'CATALOG_UPLOAD' && <CatalogUploadView />}

            {store.activeView === 'MAIN' && (
              <>
                <MarketplaceView
                  products={filteredProducts}
                  cart={store.cart}
                  effectiveRole={store.effectiveRole!}
                  selectedNonprofitName={selectedNonprofit.name}
                  onProductClick={store.setSelectedProductDetail}
                  onShopperClick={() => store.setIsShopperOpen(true)}
                  regionName={store.selectedRegion.name}
                  policy={store.activePolicy}
                  isLoading={store.isLoading}
                  pagination={{
                    currentPage: store.currentPage,
                    totalPages: store.totalPages,
                    totalProducts: store.totalProducts,
                    pageSize: store.pageSize,
                    goToPage: store.goToPage,
                    nextPage: store.nextPage,
                    prevPage: store.prevPage,
                  }}
                />

                {store.effectiveRole === 'MERCHANT' && store.currentUser && (
                  <div className="space-y-24 mt-32">
                  </div>
                )}

                {store.effectiveRole === 'NONPROFIT' && (
                  <div className="space-y-24 mt-32">
                  </div>
                )}

                {store.effectiveRole === 'PLATFORM' && (
                  <div className="space-y-16">
                    <div className="bg-[#A20021]/5 border border-[#A20021]/20 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xl font-black text-[#A20021] uppercase italic tracking-tighter">Admin Control Center</h3>
                        <p className="text-xs text-slate-500 font-medium">Manage platform-wide systems, users, and financials.</p>
                      </div>
                      <button onClick={() => store.setActiveView('ADMIN_PORTAL')} className="px-8 py-3 bg-[#A20021] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#A20021]/20 hover:scale-105 transition-transform">
                        Enter Admin Portal
                      </button>
                    </div>

                    <div className="bg-[#A20021]/5 border border-[#A20021]/20 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xl font-black text-[#A20021] uppercase italic tracking-tighter">Admin Impersonation Mode</h3>
                        <p className="text-xs text-slate-500 font-medium">Switch roles to troubleshoot MSA node experiences.</p>
                      </div>
                      <div className="flex gap-4">
                        {(['NEIGHBOR', 'MERCHANT', 'NONPROFIT', 'CDFI', null] as const).map(role => (
                          <button
                            key={role || 'PLATFORM'}
                            onClick={() => store.setImpersonationRole(role)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${store.impersonationRole === role ? 'bg-[#A20021] text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
                          >
                            {role || 'RESET'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-8 rounded-[3rem] space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Data Integrity Sync Report</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SyncIndicator label="Gross Sales" value={`$${store.globalStats.totalInternalVolume.toLocaleString()}`} />
                        <SyncIndicator label="Vendor Count" value={store.globalStats.merchantCount.toString()} />
                        <SyncIndicator label="Impact Generated" value={`$${store.globalStats.totalDonations.toLocaleString()}`} />
                        <SyncIndicator label="Network Nodes" value={(store.globalStats.merchantCount + store.globalStats.nonprofitCount).toString()} />
                      </div>
                      <p className="text-[10px] text-slate-400 italic font-medium">
                        * All data points are real-time synced across Governance, Merchant, Neighbor, and Nonprofit portals via the Global Ledger Store.
                      </p>
                    </div>

                    <AccountingHub
                      orders={store.orders}
                      currentRole="PLATFORM"
                      products={store.products}
                      onUpdateProduct={store.updateProduct}
                      globalStats={store.globalStats}
                    />
                  </div>
                )}
              </>
            )}
          </Suspense>
        </main>

        <CartDrawer
          isOpen={store.isCartOpen}
          onClose={() => store.setIsCartOpen(false)}
          cart={store.cart}
          setCart={store.setCart}
          updateQuantity={store.updateQuantity}
          removeFromCart={store.removeFromCart}
          paymentMethod={store.paymentMethod}
          setPaymentMethod={store.setPaymentMethod}
          selectedNonprofit={selectedNonprofit}
          onCheckout={handleCheckout}
          currentUser={store.currentUser}
          policy={store.activePolicy}
          projects={store.projects}
        />
        <ProductDetailModal
          product={store.selectedProductDetail}
          onClose={() => store.setSelectedProductDetail(null)}
          onAddToCart={store.addToCart}
          onAddToWishlist={handleAddToWishlist}
          reviews={reviews}
          onAddReview={handleAddReview}
          orders={store.orders}
          onToast={showToast}
        />
        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistIds={wishlistIds}
          products={store.products}
          onAddToCart={store.addToCart}
          onRemoveFromWishlist={handleRemoveFromWishlist}
        />
        <ActivityTicker />
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl text-white text-sm font-black uppercase tracking-widest transition-all animate-in slide-in-from-bottom-4 duration-300 ${toast.type === 'error' ? 'bg-[#A20021]' : toast.type === 'info' ? 'bg-slate-700' : 'bg-emerald-600'}`}>
            {toast.message}
          </div>
        )}
        {impactData && (
          <PurchaseImpactAnimation
            isVisible={!!impactData}
            onClose={() => setImpactData(null)}
            grossAmount={impactData.grossAmount}
            merchantNet={impactData.merchantNet}
            discountAmount={impactData.discountAmount}
            nonprofitDonation={impactData.nonprofitDonation}
            nonprofitName={impactData.nonprofitName}
            nonprofitMission={impactData.nonprofitMission}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

const SyncIndicator = ({ label, value }: { label: string, value: string }) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-black">{value}</p>
  </div>
);

const NavBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-black ${active ? 'text-[#7851A9]' : 'text-slate-400'}`}>{label}</button>
);

const MenuBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${active ? 'bg-[#7851A9] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-black'}`}>{label}</button>
);

export default App;
