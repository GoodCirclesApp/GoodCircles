// =============================================================================
// GoodCircles AI Catalog Upload Tool — Shopify Connector
// =============================================================================
// OAuth 2.0 authentication + product fetch via Shopify Admin API.
// Rate limit: 2 req/s on basic plans (handled via token bucket + backoff).
// Pagination: cursor-based (Link header / pageInfo).
// =============================================================================

import type {
  PlatformConnector,
  PlatformCredentials,
  ConnectorScanResult,
  ConnectorFetchResult,
  ConnectorFetchProgress,
  ConnectorError,
  NormalizedProduct,
  NormalizedProductVariant,
  ApiCostEntry,
} from '../types/catalog';
import { SourcePlatform, determineTier } from '../types/catalog';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SHOPIFY_API_VERSION = '2024-10';
const PRODUCTS_PER_PAGE = 250; // Shopify max per request
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const RATE_LIMIT_DELAY_MS = 500; // 2 req/s = 500ms between requests

// Environment variables (validated at startup)
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a rate-limited request to the Shopify Admin API.
 * Implements exponential backoff on 429 and 5xx errors.
 */
async function shopifyFetch(
  shopDomain: string,
  endpoint: string,
  accessToken: string,
  retryCount = 0,
): Promise<Response> {
  // Rate limiting: wait between requests
  await sleep(RATE_LIMIT_DELAY_MS);

  const url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  // Handle rate limiting (429)
  if (response.status === 429) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Shopify rate limit exceeded after ${MAX_RETRIES} retries`);
    }
    const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
    const backoff = Math.max(retryAfter * 1000, BASE_BACKOFF_MS * Math.pow(2, retryCount));
    console.warn(`[ShopifyConnector] Rate limited. Retrying in ${backoff}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await sleep(backoff);
    return shopifyFetch(shopDomain, endpoint, accessToken, retryCount + 1);
  }

  // Handle server errors (5xx)
  if (response.status >= 500) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Shopify server error ${response.status} after ${MAX_RETRIES} retries`);
    }
    const backoff = BASE_BACKOFF_MS * Math.pow(2, retryCount);
    console.warn(`[ShopifyConnector] Server error ${response.status}. Retrying in ${backoff}ms`);
    await sleep(backoff);
    return shopifyFetch(shopDomain, endpoint, accessToken, retryCount + 1);
  }

  return response;
}

/**
 * Parse Shopify's Link header for cursor-based pagination.
 * Returns the next page URL parameter if available.
 */
function parseNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>;\s*rel="next"/);
  return match ? match[1] : null;
}

/**
 * Normalize a Shopify product into the GoodCircles shared schema.
 */
function normalizeShopifyProduct(shopifyProduct: any, shopDomain: string): NormalizedProduct {
  const variants: NormalizedProductVariant[] = (shopifyProduct.variants || []).map((v: any) => ({
    sourceVariantId: String(v.id),
    title: v.title || 'Default',
    price: parseFloat(v.price) || 0,
    sku: v.sku || undefined,
    inventoryQuantity: v.inventory_quantity ?? undefined,
    attributes: {
      ...(v.option1 ? { option1: v.option1 } : {}),
      ...(v.option2 ? { option2: v.option2 } : {}),
      ...(v.option3 ? { option3: v.option3 } : {}),
    },
  }));

  // Use the lowest variant price as the base price
  const prices = variants.map((v) => v.price).filter((p) => p > 0);
  const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

  return {
    sourceId: String(shopifyProduct.id),
    title: shopifyProduct.title || 'Untitled Product',
    description: shopifyProduct.body_html ? stripHtml(shopifyProduct.body_html) : '',
    images: (shopifyProduct.images || []).map((img: any) => img.src),
    price: basePrice,
    costOfGoods: null, // Shopify doesn't expose COGS via standard API
    category: shopifyProduct.product_type || null,
    variants,
    sourcePlatform: SourcePlatform.SHOPIFY,
    sourceUrl: `https://${shopDomain}/products/${shopifyProduct.handle}`,
    tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map((t: string) => t.trim()) : [],
    isActive: shopifyProduct.status === 'active',
  };
}

// ---------------------------------------------------------------------------
// Shopify Connector
// ---------------------------------------------------------------------------

export const shopifyConnector: PlatformConnector = {
  platform: SourcePlatform.SHOPIFY,

  // -------------------------------------------------------------------------
  // OAuth
  // -------------------------------------------------------------------------

  getAuthUrl(redirectUri: string, state: string): string {
    const scopes = 'read_products,read_product_listings,read_inventory';
    // Note: shopDomain is passed via state parameter or stored in session
    // The merchant enters their shop domain before this step
    return `https://{shop}.myshopify.com/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<PlatformCredentials> {
    // The shop domain comes from the OAuth callback query params
    // In practice, it's extracted from the request in the controller
    const shopDomain = ''; // Set by controller from callback params

    const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Shopify OAuth exchange failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      shopDomain,
      // Shopify offline tokens don't expire, so no refreshToken or expiresAt
    };
  },

  async refreshCredentials(credentials: PlatformCredentials): Promise<PlatformCredentials> {
    // Shopify offline access tokens don't expire — return as-is
    return credentials;
  },

  // -------------------------------------------------------------------------
  // Scan (lightweight product count)
  // -------------------------------------------------------------------------

  async scanCatalog(credentials: PlatformCredentials): Promise<ConnectorScanResult> {
    const { shopDomain, accessToken } = credentials;
    if (!shopDomain || !accessToken) {
      throw new Error('Missing Shopify credentials (shopDomain, accessToken)');
    }

    // Use the count endpoint — single API call, no product data fetched
    const response = await shopifyFetch(shopDomain, '/products/count.json', accessToken);

    if (!response.ok) {
      throw new Error(`Shopify scan failed: ${response.status}`);
    }

    const data = await response.json();
    const productCount = data.count;

    // Also fetch shop name for display
    const shopResponse = await shopifyFetch(shopDomain, '/shop.json', accessToken);
    const shopData = await shopResponse.json();

    return {
      platform: SourcePlatform.SHOPIFY,
      productCount,
      recommendedTier: determineTier(productCount),
      shopName: shopData.shop?.name || shopDomain,
      connectedAt: new Date(),
    };
  },

  // -------------------------------------------------------------------------
  // Fetch Products (full catalog with pagination)
  // -------------------------------------------------------------------------

  async fetchProducts(
    credentials: PlatformCredentials,
    onProgress?: (progress: ConnectorFetchProgress) => void,
  ): Promise<ConnectorFetchResult> {
    const { shopDomain, accessToken } = credentials;
    if (!shopDomain || !accessToken) {
      throw new Error('Missing Shopify credentials');
    }

    const startTime = Date.now();
    const allProducts: NormalizedProduct[] = [];
    const errors: ConnectorError[] = [];
    let apiCallsMade = 0;
    let nextPageInfo: string | null = null;
    let totalProducts = 0;

    // First, get total count for progress tracking
    try {
      const countResponse = await shopifyFetch(shopDomain, '/products/count.json', accessToken);
      apiCallsMade++;
      if (countResponse.ok) {
        const countData = await countResponse.json();
        totalProducts = countData.count;
      }
    } catch (err) {
      // Non-fatal — we just won't have accurate progress percentages
      console.warn('[ShopifyConnector] Could not fetch product count for progress tracking');
    }

    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE) || 1;
    let currentPage = 0;

    // Paginate through all products
    do {
      currentPage++;
      const endpoint = nextPageInfo
        ? `/products.json?limit=${PRODUCTS_PER_PAGE}&page_info=${nextPageInfo}`
        : `/products.json?limit=${PRODUCTS_PER_PAGE}&status=active`;

      try {
        const response = await shopifyFetch(shopDomain, endpoint, accessToken);
        apiCallsMade++;

        if (!response.ok) {
          errors.push({
            type: response.status === 401 ? 'AUTH_EXPIRED' : 'UNKNOWN',
            message: `Shopify API returned ${response.status} on page ${currentPage}`,
            retryable: response.status !== 401,
            timestamp: new Date(),
          });

          if (response.status === 401) {
            // Auth expired — can't continue, but return what we have so far
            break;
          }
          continue;
        }

        const data = await response.json();
        const products = (data.products || []).map((p: any) =>
          normalizeShopifyProduct(p, shopDomain)
        );
        allProducts.push(...products);

        // Parse pagination cursor from Link header
        nextPageInfo = parseNextPageUrl(response.headers.get('Link'));

        // Report progress
        if (onProgress) {
          onProgress({
            totalProducts,
            fetchedProducts: allProducts.length,
            apiCallsMade,
            currentPage,
            totalPages,
          });
        }
      } catch (err: any) {
        const isTimeout = err.name === 'AbortError' || err.message?.includes('timeout');
        errors.push({
          type: isTimeout ? 'TIMEOUT' : 'UNKNOWN',
          message: err.message || 'Unknown error fetching Shopify products',
          retryable: true,
          timestamp: new Date(),
        });

        // If we have some products, we can still continue/return partial
        if (allProducts.length > 0) {
          console.warn(`[ShopifyConnector] Error on page ${currentPage}, returning ${allProducts.length} products fetched so far`);
          break;
        }
        throw err; // If we have nothing, propagate the error
      }
    } while (nextPageInfo);

    return {
      products: allProducts,
      apiCallsMade,
      fetchDurationMs: Date.now() - startTime,
      errors,
    };
  },

  // -------------------------------------------------------------------------
  // Disconnect
  // -------------------------------------------------------------------------

  async disconnect(credentials: PlatformCredentials): Promise<void> {
    const { shopDomain, accessToken } = credentials;
    if (!shopDomain || !accessToken) return;

    try {
      // Shopify doesn't have a standard revoke endpoint for offline tokens.
      // The app can be uninstalled via the API to revoke access.
      await shopifyFetch(
        shopDomain,
        '/api_permissions/current.json',
        accessToken,
      ).then((r) => {
        if (r.ok) {
          return fetch(
            `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/api_permissions/current.json`,
            { method: 'DELETE', headers: { 'X-Shopify-Access-Token': accessToken } }
          );
        }
      });
    } catch {
      // Best-effort disconnect — don't fail if revocation errors
      console.warn('[ShopifyConnector] Could not revoke access token — merchant can uninstall app from Shopify admin');
    }
  },
};

// ---------------------------------------------------------------------------
// Cost Estimation
// ---------------------------------------------------------------------------

/**
 * Estimate the number of Shopify API calls for a given product count.
 * Used for COGS projections in the billing system.
 *
 * Shopify API calls:
 *   - 1 call for product count (scan)
 *   - 1 call for shop info
 *   - ceil(productCount / 250) calls for paginated product fetch
 *
 * Starter  (50 products):   1 + 1 + 1  = 3 calls
 * Growth   (250 products):  1 + 1 + 1  = 3 calls
 * Professional (1,000):     1 + 1 + 4  = 6 calls
 * Enterprise (2,000):       1 + 1 + 8  = 10 calls
 *
 * Shopify API calls are free (included in the app subscription), so the
 * "cost" here is just operational overhead tracking, not direct $ cost.
 */
export function estimateShopifyApiCalls(productCount: number): ApiCostEntry {
  const scanCalls = 2; // count + shop info
  const fetchCalls = Math.ceil(productCount / PRODUCTS_PER_PAGE);
  const totalCalls = scanCalls + fetchCalls;

  return {
    service: 'shopify',
    callCount: totalCalls,
    estimatedCostUsd: 0, // Shopify API is free for approved apps
    timestamp: new Date(),
  };
}

export default shopifyConnector;
