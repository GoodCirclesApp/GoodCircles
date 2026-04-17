import { useState } from 'react';
import { Product } from '../types';

export function useViewStore() {
  const [activeView, setActiveView] = useState<'MAIN' | 'LEADERBOARD' | 'FAQ' | 'TIMELINE' | 'COMMUNITY_NEEDS' | 'PROJECTS' | 'TAX_CENTER' | 'PUBLIC_LEDGER' | 'SOCIAL_HUB' | 'IMPACT_MAP' | 'GOVERNANCE' | 'WALLET' | 'NETTING' | 'ADMIN_NETTING' | 'COOP' | 'ADMIN_COOP' | 'CREDITS' | 'REFERRALS' | 'SCHEDULE' | 'DATA_COOP' | 'ADMIN_DATA_COOP' | 'CDFI_DASHBOARD' | 'BENEFITS' | 'SUPPLY_CHAIN' | 'ADMIN_IMPACT' | 'MUNICIPAL_PORTAL' | 'MERCHANT_INCENTIVES' | 'PROFILE' | 'NONPROFIT_SELECTION' | 'ORDER_HISTORY' | 'IMPACT' | 'COMMUNITY_INITIATIVES' | 'MERCHANT_PORTAL' | 'NONPROFIT_PORTAL' | 'CATALOG_UPLOAD' | 'ADMIN_PORTAL'>('MAIN');
  const [isShopperOpen, setIsShopperOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  return {
    activeView,
    setActiveView,
    isShopperOpen,
    setIsShopperOpen,
    selectedProductDetail,
    setSelectedProductDetail
  };
}
