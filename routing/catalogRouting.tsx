// ============================================================================
// catalogRouting.tsx — Catalog Upload Tool Routing Integration
// ============================================================================
// Drop-in routing configuration for the GoodCircles merchant portal.
// Adds CatalogUploadView as a lazy-loaded route with merchant access gating.
//
// INTEGRATION: Copy the relevant sections into your existing App.tsx / router
// configuration. This file is a standalone reference showing exactly what to add.
// ============================================================================

import { lazy, Suspense, type ComponentType } from 'react';

// ---------------------------------------------------------------------------
// 1. LAZY IMPORT — Named export pattern (matches GoodCircles convention)
// ---------------------------------------------------------------------------
// Add this near your other lazy() imports in App.tsx:

const CatalogUploadView = lazy(() =>
  import('../views/CatalogUploadView').then((m) => ({
    default: m.CatalogUploadView ?? m.default,
  }))
);

// ---------------------------------------------------------------------------
// 2. ACCESS GATE — Merchant-only route guard
// ---------------------------------------------------------------------------
// Wraps CatalogUploadView to ensure only active merchants can access it.
// Uses the existing useGoodCirclesStore() hook for auth state.

interface MerchantRouteGuardProps {
  children: React.ReactNode;
}

/**
 * MerchantCatalogGuard
 * - Checks that user is authenticated
 * - Checks that user has an active merchant account
 * - Redirects to login if unauthenticated
 * - Redirects to merchant onboarding if not yet a merchant
 */
export function MerchantCatalogGuard({ children }: MerchantRouteGuardProps) {
  // Replace with your actual store hook:
  // const { user, merchant } = useGoodCirclesStore();
  //
  // Placeholder type for reference:
  const user = null as {
    id: string;
    role: string;
  } | null;

  const merchant = null as {
    id: string;
    status: 'active' | 'pending' | 'suspended';
    accountVerified: boolean;
  } | null;

  // Not logged in → redirect to login
  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  // No merchant account → redirect to merchant onboarding
  if (!merchant) {
    return <div>Merchant account required.</div>;
  }

  // Merchant account suspended → show error page
  if (merchant.status === 'suspended') {
    return <div>Your merchant account is suspended.</div>;
  }

  // Merchant account pending verification
  if (merchant.status === 'pending' || !merchant.accountVerified) {
    return <div>Your merchant account is pending verification.</div>;
  }

  // Active merchant — allow access
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// 3. LOADING FALLBACK — Skeleton while CatalogUploadView chunk loads
// ---------------------------------------------------------------------------

function CatalogUploadSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-gray-200 rounded-2xl mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded-xl mb-8" />

        {/* Step indicator skeleton */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-2 flex-1 bg-gray-200 rounded-full" />
          ))}
        </div>

        {/* Content card skeleton */}
        <div className="bg-white rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 shadow-sm">
          <div className="h-6 w-48 bg-gray-200 rounded-xl mb-4" />
          <div className="h-4 w-full bg-gray-200 rounded-lg mb-3" />
          <div className="h-4 w-3/4 bg-gray-200 rounded-lg mb-3" />
          <div className="h-4 w-1/2 bg-gray-200 rounded-lg mb-6" />

          {/* Platform cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. ROUTE DEFINITION — Add to your <Routes> block in App.tsx
// ---------------------------------------------------------------------------
// Insert this inside your merchant portal route group:
//
//   <Route
//     path="/merchant/catalog-upload"
//     element={
//       <MerchantCatalogGuard>
//         <Suspense fallback={<CatalogUploadSkeleton />}>
//           <CatalogUploadView />
//         </Suspense>
//       </MerchantCatalogGuard>
//     }
//   />

// Export the complete route element for convenience:
export function CatalogUploadRoute() {
  return (
    <MerchantCatalogGuard>
      <Suspense fallback={<CatalogUploadSkeleton />}>
        <CatalogUploadView />
      </Suspense>
    </MerchantCatalogGuard>
  );
}

// ---------------------------------------------------------------------------
// 5. NAVIGATION ITEMS — Add to merchant portal sidebar / hamburger menu
// ---------------------------------------------------------------------------
// Add this to your merchant nav items array (e.g., in MerchantSidebar.tsx
// or MerchantPortalLayout.tsx):

export const CATALOG_UPLOAD_NAV_ITEM = {
  label: 'Import Catalog',
  path: '/merchant/catalog-upload',
  icon: 'Upload', // lucide-react icon name
  description: 'Import products from Shopify, Etsy, or Amazon',
  badge: 'New', // Remove after launch period
  section: 'tools', // Group under "Tools" section in sidebar
} as const;

// If your sidebar uses a NavItem[] array pattern:
//
//   import { CATALOG_UPLOAD_NAV_ITEM } from '../routing/catalogRouting';
//
//   const merchantNavItems: NavItem[] = [
//     ...existingItems,
//     CATALOG_UPLOAD_NAV_ITEM,
//   ];

// ---------------------------------------------------------------------------
// 6. API ROUTES — Express backend route registration
// ---------------------------------------------------------------------------
// Add to your Express app or router file (e.g., server/routes/index.ts):
//
//   import { catalogRouter } from './catalog';
//
//   app.use('/api/catalog', requireMerchantAuth, catalogRouter);
//
// The catalogRouter should expose these endpoints (built in Prompts 2-6):
//
//   POST   /connect/:platform      — Initiate OAuth flow
//   GET    /connect/:platform/callback — OAuth callback
//   POST   /scan                    — Scan catalog size
//   POST   /checkout                — Create Stripe checkout session
//   POST   /webhook/stripe          — Stripe webhook handler
//   POST   /import/start            — Start import job
//   GET    /import/:importId/status — Poll import progress
//   POST   /import/:importId/resume — Resume failed import
//   GET    /import/:importId/products — Get products for review
//   PATCH  /import/:importId/products/:productId — Update product review
//   POST   /import/:importId/products/bulk — Bulk accept/reject
//   POST   /import/:importId/publish — Publish approved products
//   GET    /billing/history         — Merchant billing history
//   GET    /admin/monitoring        — Admin dashboard metrics (admin only)
//   POST   /admin/alerts/:alertId/resolve — Resolve COGS alert (admin only)

// ---------------------------------------------------------------------------
// 7. ANALYTICS EVENTS — Fire on key user actions
// ---------------------------------------------------------------------------
// Add these to your existing analytics service (e.g., analyticsService.ts):

export const CATALOG_ANALYTICS_EVENTS = {
  // Funnel events
  CATALOG_PAGE_VIEWED: 'catalog_page_viewed',
  PLATFORM_SELECTED: 'platform_selected',
  PLATFORM_CONNECTED: 'platform_connected',
  TIER_SELECTED: 'tier_selected',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_PROCESSED: 'payment_processed',
  IMPORT_STARTED: 'import_started',
  IMPORT_COMPLETED: 'import_completed',
  IMPORT_FAILED: 'import_failed',
  IMPORT_RESUMED: 'import_resumed',
  PRODUCTS_REVIEWED: 'products_reviewed',
  PRODUCTS_PUBLISHED: 'products_published',

  // Engagement events
  PRODUCT_EDITED: 'product_edited',
  PRODUCT_ACCEPTED: 'product_accepted',
  PRODUCT_REJECTED: 'product_rejected',
  BULK_ACCEPT_ALL: 'bulk_accept_all',
  BULK_REJECT_ALL: 'bulk_reject_all',
  PRICING_BREAKDOWN_VIEWED: 'pricing_breakdown_viewed',

  // Error events
  CONNECTION_FAILED: 'connection_failed',
  PAYMENT_FAILED: 'payment_failed',
  IMPORT_ERROR: 'import_error',
} as const;

// Example usage in components:
//
//   import { analytics } from '../services/analyticsService';
//   import { CATALOG_ANALYTICS_EVENTS } from '../routing/catalogRouting';
//
//   analytics.track(CATALOG_ANALYTICS_EVENTS.TIER_SELECTED, {
//     tier: 'GROWTH',
//     productCount: 120,
//     platform: 'shopify',
//   });
