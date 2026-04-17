
import { useIdentityStore } from './useIdentityStore';
import { useInventoryStore } from './useInventoryStore';
import { useLedgerStore } from './useLedgerStore';
import { useCartStore } from './useCartStore';
import { useViewStore } from './useViewStore';
import { useRegionalStore } from './useRegionalStore';
import { useWalletStore } from './useWalletStore';
import { useGovernanceStore } from './useGovernanceStore';
import { useProjectStore } from './useProjectStore';
import { useBookingStore } from './useBookingStore';
import { Order, TreasuryStats } from '../types';
import { useMemo } from 'react';
import { MOCK_NONPROFITS } from '../constants';

export interface GlobalStats extends TreasuryStats {
  merchantCount: number;
  nonprofitCount: number;
}

export function useGoodCirclesStore() {
  const identity = useIdentityStore();
  const inventory = useInventoryStore();
  const ledger = useLedgerStore();
  const cart = useCartStore();
  const view = useViewStore();
  const regional = useRegionalStore();
  const wallet = useWalletStore(identity.currentUser, identity.updateUser);
  const governance = useGovernanceStore(identity.currentUser, identity.updateUser);
  const project = useProjectStore(identity.currentUser, identity.updateUser);
  const booking = useBookingStore(identity.currentUser);

  const globalStats: GlobalStats = useMemo(() => {
    const uniqueMerchants = new Set(inventory.products.map(p => p.merchantId));
    const uniqueNonprofits = new Set(ledger.orders.map(o => o.selectedNonprofitId));
    // Add mock nonprofits that might not have orders yet
    MOCK_NONPROFITS.forEach(np => uniqueNonprofits.add(np.id));
    
    return {
      ...ledger.treasuryStats,
      merchantCount: uniqueMerchants.size,
      nonprofitCount: uniqueNonprofits.size
    };
  }, [inventory.products, ledger.orders, ledger.treasuryStats]);

  // GCLA Settlement Coordinator: Distributes funds across the ecosystem nodes
  const coordinateSettlement = (order: Order) => {
    console.log(`[GCLA] Settling Order ${order.id} for Merchant ${order.items[0]?.product.merchantId}`);
  };

  return {
    // Identity Domain
    ...identity,
    
    // Inventory Domain
    ...inventory,
    
    // Ledger Domain
    ...ledger,
    
    // Cart Domain
    ...cart,
    
    // UI/View Domain
    ...view,

    // Regional Domain
    ...regional,

    // Wallet/Banking Domain
    wallet: wallet.wallet,
    walletBalance: wallet.balance,
    creditBalance: wallet.creditBalance,
    topUp: wallet.topUp,
    withdraw: wallet.withdraw,
    refundToWallet: wallet.refundToWallet,
    coordinateSettlement,

    // Governance Domain
    ...governance,
    waivedFundsLog: governance.waivedFundsLog,
    logWaivedFunds: governance.logWaivedFunds,

    // Project Domain
    projects: project.projects,
    voteOnProject: project.voteOnProject,
    contributeToProject: project.contributeToProject,

    // Booking Domain
    ...booking,

    // Global Synced Stats
    globalStats
  };
}
