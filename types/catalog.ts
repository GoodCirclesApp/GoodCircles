// =============================================================================
// GoodCircles AI Catalog Upload Tool — Shared Type Definitions
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum SourcePlatform {
  SHOPIFY = 'SHOPIFY',
  ETSY = 'ETSY',
  AMAZON = 'AMAZON',
}

export enum CatalogTier {
  STARTER = 'STARTER',         // 1–50 products,   $75
  GROWTH = 'GROWTH',           // 51–250 products,  $150
  PROFESSIONAL = 'PROFESSIONAL', // 251–1,000 products, $300
  ENTERPRISE = 'ENTERPRISE',   // 1,000+ products,  $500
}

export enum ImportStatus {
  QUEUED = 'QUEUED',
  FETCHING = 'FETCHING',
  TRANSFORMING = 'TRANSFORMING',
  REVIEW_READY = 'REVIEW_READY',
  PUBLISHING = 'PUBLISHING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum CatalogProductStatus {
  PENDING = 'PENDING',
  AI_PROCESSED = 'AI_PROCESSED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
}

export enum BillingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED',
}

// ---------------------------------------------------------------------------
// Tier Configuration
// ---------------------------------------------------------------------------

export interface TierConfig {
  tier: CatalogTier;
  minProducts: number;
  maxProducts: number | null; // null = unlimited for Enterprise
  fee: number;
  estimatedPlatformCogs: number;
  targetMargin: number;
}

export const TIER_CONFIG: TierConfig[] = [
  { tier: CatalogTier.STARTER, minProducts: 1, maxProducts: 50, fee: 75, estimatedPlatformCogs: 8, targetMargin: 0.89 },
  { tier: CatalogTier.GROWTH, minProducts: 51, maxProducts: 250, fee: 150, estimatedPlatformCogs: 15, targetMargin: 0.90 },
  { tier: CatalogTier.PROFESSIONAL, minProducts: 251, maxProducts: 1000, fee: 300, estimatedPlatformCogs: 35, targetMargin: 0.88 },
  { tier: CatalogTier.ENTERPRISE, minProducts: 1001, maxProducts: null, fee: 500, estimatedPlatformCogs: 60, targetMargin: 0.88 },
];

/**
 * Determine the correct tier based on product count.
 * Tier is always based on current catalog size — no grandfathering.
 */
export function determineTier(productCount: number): TierConfig {
  const tier = TIER_CONFIG.find(
    (t) => productCount >= t.minProducts && (t.maxProducts === null || productCount <= t.maxProducts)
  );
  if (!tier) {
    throw new Error(`Cannot determine tier for product count: ${productCount}`);
  }
  return tier;
}

// ---------------------------------------------------------------------------
// Normalized Product Schema
// ---------------------------------------------------------------------------
// This is the common shape returned by ALL platform connectors (Shopify, Etsy,
// Amazon). Each connector maps its platform-specific response into this schema
// so downstream services (AI engine, review UI, publish) work identically
// regardless of source.
// ---------------------------------------------------------------------------

export interface NormalizedProductVariant {
  sourceVariantId: string;
  title: string;             // e.g. "Large / Blue"
  price: number;
  sku?: string;
  inventoryQuantity?: number;
  attributes: Record<string, string>; // e.g. { size: "Large", color: "Blue" }
}

export interface NormalizedProduct {
  /** Unique ID on the source platform (Shopify product ID, Etsy listing ID, Amazon ASIN) */
  sourceId: string;

  /** Product title as listed on the source platform */
  title: string;

  /** Product description / body HTML (cleaned to plain text) */
  description: string;

  /** Array of image URLs from the source platform */
  images: string[];

  /** Base price in USD (smallest variant price or listing price) */
  price: number;

  /**
   * Cost of goods as reported by the source platform, if available.
   * Many platforms don't expose this — will be null for most imports.
   * The AI engine will suggest a COGS if this is not available.
   */
  costOfGoods: number | null;

  /** Category on the source platform (for AI category mapping) */
  category: string | null;

  /** Product variants (sizes, colors, etc.) */
  variants: NormalizedProductVariant[];

  /** Which platform this product came from */
  sourcePlatform: SourcePlatform;

  /** Source platform URL for reference */
  sourceUrl?: string;

  /** Tags / keywords from the source platform */
  tags?: string[];

  /** Whether the product is currently active/published on the source platform */
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Connector Interface
// ---------------------------------------------------------------------------

export interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  shopDomain?: string;       // Shopify-specific
  shopId?: string;           // Etsy-specific
  sellerId?: string;         // Amazon-specific
  marketplaceId?: string;    // Amazon-specific
  expiresAt?: Date;
}

export interface ConnectorScanResult {
  platform: SourcePlatform;
  productCount: number;
  recommendedTier: TierConfig;
  shopName: string;
  connectedAt: Date;
}

export interface ConnectorFetchProgress {
  totalProducts: number;
  fetchedProducts: number;
  apiCallsMade: number;
  currentPage: number;
  totalPages: number;
}

export interface ConnectorFetchResult {
  products: NormalizedProduct[];
  apiCallsMade: number;
  fetchDurationMs: number;
  errors: ConnectorError[];
}

export interface ConnectorError {
  type: 'RATE_LIMIT' | 'AUTH_EXPIRED' | 'TIMEOUT' | 'PARTIAL_DATA' | 'UNKNOWN';
  message: string;
  retryable: boolean;
  productSourceId?: string;  // If error is product-specific
  timestamp: Date;
}

/**
 * Interface that all platform connectors must implement.
 * This ensures consistent behavior regardless of source platform.
 */
export interface PlatformConnector {
  /** Platform this connector handles */
  platform: SourcePlatform;

  /** Generate the OAuth authorization URL for the merchant */
  getAuthUrl(redirectUri: string, state: string): string;

  /** Exchange the OAuth callback code for access tokens */
  exchangeCode(code: string, redirectUri: string): Promise<PlatformCredentials>;

  /** Refresh an expired access token */
  refreshCredentials(credentials: PlatformCredentials): Promise<PlatformCredentials>;

  /** Quick scan to count products without fetching full data */
  scanCatalog(credentials: PlatformCredentials): Promise<ConnectorScanResult>;

  /**
   * Fetch all products from the platform.
   * Uses pagination and respects rate limits.
   * Calls onProgress for UI updates.
   */
  fetchProducts(
    credentials: PlatformCredentials,
    onProgress?: (progress: ConnectorFetchProgress) => void,
  ): Promise<ConnectorFetchResult>;

  /** Revoke OAuth tokens and disconnect */
  disconnect(credentials: PlatformCredentials): Promise<void>;
}

// ---------------------------------------------------------------------------
// API Cost Tracking
// ---------------------------------------------------------------------------

export interface ApiCostEntry {
  service: 'shopify' | 'etsy' | 'amazon' | 'claude_haiku' | 'claude_sonnet';
  callCount: number;
  tokensUsed?: number;       // Only for Claude API calls
  estimatedCostUsd: number;
  timestamp: Date;
}

export interface ImportCostSummary {
  importId: string;
  tier: CatalogTier;
  platformApiCosts: ApiCostEntry[];
  aiCosts: ApiCostEntry[];
  totalCostUsd: number;
  tierBudgetUsd: number;
  withinBudget: boolean;
  marginPercentage: number;
}
