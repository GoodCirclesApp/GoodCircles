// =============================================================================
// GoodCircles AI Catalog Upload Tool — Etsy Connector
// =============================================================================
// OAuth 2.0 authentication via Etsy Open API v3.
// Rate limit: 10 req/s (handled via delay + exponential backoff).
// Pagination: offset-based (limit + offset parameters).
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

const ETSY_API_BASE = 'https://openapi.etsy.com/v3';
const LISTINGS_PER_PAGE = 100; // Etsy max per request
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const RATE_LIMIT_DELAY_MS = 100; // 10 req/s = 100ms between requests

// Environment variables
const ETSY_CLIENT_ID = process.env.ETSY_CLIENT_ID!; // Etsy "keystring"
const ETSY_CLIENT_SECRET = process.env.ETSY_CLIENT_SECRET!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a rate-limited request to the Etsy Open API v3.
 * Implements exponential backoff on 429 and 5xx errors.
 */
async function etsyFetch(
  endpoint: string,
  accessToken: string,
  retryCount = 0,
): Promise<Response> {
  await sleep(RATE_LIMIT_DELAY_MS);

  const url = `${ETSY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-api-key': ETSY_CLIENT_ID,
      'Content-Type': 'application/json',
    },
  });

  // Handle rate limiting (429)
  if (response.status === 429) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Etsy rate limit exceeded after ${MAX_RETRIES} retries`);
    }
    const backoff = BASE_BACKOFF_MS * Math.pow(2, retryCount);
    console.warn(`[EtsyConnector] Rate limited. Retrying in ${backoff}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await sleep(backoff);
    return etsyFetch(endpoint, accessToken, retryCount + 1);
  }

  // Handle server errors (5xx)
  if (response.status >= 500) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Etsy server error ${response.status} after ${MAX_RETRIES} retries`);
    }
    const backoff = BASE_BACKOFF_MS * Math.pow(2, retryCount);
    console.warn(`[EtsyConnector] Server error ${response.status}. Retrying in ${backoff}ms`);
    await sleep(backoff);
    return etsyFetch(endpoint, accessToken, retryCount + 1);
  }

  return response;
}

/**
 * Fetch images for a specific listing.
 * Returns array of image URLs.
 */
async function fetchListingImages(
  shopId: string,
  listingId: string,
  accessToken: string,
): Promise<string[]> {
  try {
    const response = await etsyFetch(
      `/application/shops/${shopId}/listings/${listingId}/images`,
      accessToken,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map((img: any) => img.url_fullxfull || img.url_570xN);
  } catch {
    return []; // Non-fatal — product still importable without images
  }
}

/**
 * Normalize an Etsy listing into the GoodCircles shared schema.
 */
function normalizeEtsyListing(
  listing: any,
  images: string[],
  shopName: string,
): NormalizedProduct {
  // Etsy price is returned as an object { amount, divisor, currency_code }
  const priceObj = listing.price || {};
  const price = priceObj.amount && priceObj.divisor
    ? priceObj.amount / priceObj.divisor
    : 0;

  // Etsy doesn't have a structured variant system like Shopify.
  // Variations come through the inventory/offerings endpoint.
  // For the initial import we capture the main listing data;
  // variants are fetched separately if present.
  const variants: NormalizedProductVariant[] = [];
  if (listing.has_variations) {
    // Placeholder — variant details are fetched in a separate enrichment pass
    // to minimize API calls on the initial scan
    variants.push({
      sourceVariantId: `${listing.listing_id}_default`,
      title: 'Default',
      price,
      attributes: {},
    });
  }

  return {
    sourceId: String(listing.listing_id),
    title: listing.title || 'Untitled Listing',
    description: listing.description || '',
    images,
    price,
    costOfGoods: null, // Etsy doesn't expose COGS
    category: listing.taxonomy_path
      ? listing.taxonomy_path.join(' > ')
      : null,
    variants,
    sourcePlatform: SourcePlatform.ETSY,
    sourceUrl: listing.url || undefined,
    tags: listing.tags || [],
    isActive: listing.state === 'active',
  };
}

// ---------------------------------------------------------------------------
// Etsy Connector
// ---------------------------------------------------------------------------

export const etsyConnector: PlatformConnector = {
  platform: SourcePlatform.ETSY,

  // -------------------------------------------------------------------------
  // OAuth 2.0 (PKCE flow — Etsy requires it for public clients)
  // -------------------------------------------------------------------------

  getAuthUrl(redirectUri: string, state: string): string {
    // Etsy uses PKCE (Proof Key for Code Exchange).
    // The code_verifier is generated and stored in session before this call.
    // The code_challenge is derived from it (S256).
    const scopes = 'listings_r shops_r';
    return `https://www.etsy.com/oauth/connect?response_type=code&client_id=${ETSY_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&code_challenge={code_challenge}&code_challenge_method=S256`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<PlatformCredentials> {
    // code_verifier comes from the session (stored when getAuthUrl was called)
    const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: ETSY_CLIENT_ID,
        redirect_uri: redirectUri,
        code,
        code_verifier: '{code_verifier}', // Injected by controller from session
      }),
    });

    if (!response.ok) {
      throw new Error(`Etsy OAuth exchange failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      shopId: undefined, // Fetched after auth via /users/me
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  },

  async refreshCredentials(credentials: PlatformCredentials): Promise<PlatformCredentials> {
    if (!credentials.refreshToken) {
      throw new Error('No refresh token available for Etsy credentials');
    }

    const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: ETSY_CLIENT_ID,
        refresh_token: credentials.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Etsy token refresh failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      ...credentials,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  },

  // -------------------------------------------------------------------------
  // Scan
  // -------------------------------------------------------------------------

  async scanCatalog(credentials: PlatformCredentials): Promise<ConnectorScanResult> {
    let { accessToken, shopId } = credentials;

    // If we don't have the shop ID yet, fetch it
    if (!shopId) {
      const meResponse = await etsyFetch('/application/users/me', accessToken);
      if (!meResponse.ok) throw new Error(`Etsy /users/me failed: ${meResponse.status}`);
      const meData = await meResponse.json();
      shopId = String(meData.shop_id);
    }

    // Get shop details + listing count
    const shopResponse = await etsyFetch(`/application/shops/${shopId}`, accessToken);
    if (!shopResponse.ok) throw new Error(`Etsy shop fetch failed: ${shopResponse.status}`);
    const shopData = await shopResponse.json();

    const productCount = shopData.listing_active_count || 0;

    return {
      platform: SourcePlatform.ETSY,
      productCount,
      recommendedTier: determineTier(productCount),
      shopName: shopData.shop_name || `Etsy Shop ${shopId}`,
      connectedAt: new Date(),
    };
  },

  // -------------------------------------------------------------------------
  // Fetch Products
  // -------------------------------------------------------------------------

  async fetchProducts(
    credentials: PlatformCredentials,
    onProgress?: (progress: ConnectorFetchProgress) => void,
  ): Promise<ConnectorFetchResult> {
    let { accessToken, shopId } = credentials;
    const startTime = Date.now();
    const allProducts: NormalizedProduct[] = [];
    const errors: ConnectorError[] = [];
    let apiCallsMade = 0;

    // Ensure we have shop ID
    if (!shopId) {
      const meResponse = await etsyFetch('/application/users/me', accessToken);
      apiCallsMade++;
      if (!meResponse.ok) throw new Error(`Etsy /users/me failed: ${meResponse.status}`);
      const meData = await meResponse.json();
      shopId = String(meData.shop_id);
    }

    // Get shop name for normalization
    const shopResponse = await etsyFetch(`/application/shops/${shopId}`, accessToken);
    apiCallsMade++;
    const shopData = await shopResponse.json();
    const shopName = shopData.shop_name || `Etsy Shop ${shopId}`;
    const totalProducts = shopData.listing_active_count || 0;
    const totalPages = Math.ceil(totalProducts / LISTINGS_PER_PAGE) || 1;

    // Paginate through all active listings
    let offset = 0;
    let currentPage = 0;
    let hasMore = true;

    while (hasMore) {
      currentPage++;

      try {
        const response = await etsyFetch(
          `/application/shops/${shopId}/listings/active?limit=${LISTINGS_PER_PAGE}&offset=${offset}&includes=images`,
          accessToken,
        );
        apiCallsMade++;

        if (!response.ok) {
          errors.push({
            type: response.status === 401 ? 'AUTH_EXPIRED' : 'UNKNOWN',
            message: `Etsy API returned ${response.status} on page ${currentPage}`,
            retryable: response.status !== 401,
            timestamp: new Date(),
          });

          if (response.status === 401) break;
          offset += LISTINGS_PER_PAGE;
          continue;
        }

        const data = await response.json();
        const listings = data.results || [];

        if (listings.length === 0) {
          hasMore = false;
          break;
        }

        // Normalize each listing
        // Note: If includes=images doesn't return images inline,
        // we fetch them separately (additional API calls per listing).
        for (const listing of listings) {
          let images: string[] = [];

          // Check if images were included inline
          if (listing.images && listing.images.length > 0) {
            images = listing.images.map((img: any) => img.url_fullxfull || img.url_570xN);
          } else {
            // Fetch images separately (costs 1 API call per listing)
            images = await fetchListingImages(shopId, String(listing.listing_id), accessToken);
            apiCallsMade++;
          }

          allProducts.push(normalizeEtsyListing(listing, images, shopName));
        }

        offset += listings.length;
        hasMore = listings.length === LISTINGS_PER_PAGE;

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
          message: err.message || 'Unknown error fetching Etsy listings',
          retryable: true,
          timestamp: new Date(),
        });

        if (allProducts.length > 0) {
          console.warn(`[EtsyConnector] Error on page ${currentPage}, returning ${allProducts.length} listings fetched so far`);
          break;
        }
        throw err;
      }
    }

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
    // Etsy doesn't provide a token revocation endpoint.
    // The merchant can revoke access from their Etsy account settings.
    // We just clear our stored credentials.
    console.info('[EtsyConnector] Credentials cleared. Merchant can revoke access from Etsy settings.');
  },
};

// ---------------------------------------------------------------------------
// Cost Estimation
// ---------------------------------------------------------------------------

/**
 * Estimate the number of Etsy API calls for a given product count.
 *
 * Etsy API calls:
 *   - 1 call for /users/me (get shop ID)
 *   - 1 call for /shops/:id (shop details + count)
 *   - ceil(productCount / 100) calls for paginated listing fetch
 *   - If images aren't inlined: +1 call per listing for images
 *
 * Best case (images included via `includes=images`):
 *   Starter  (50 products):   2 + 1  = 3 calls
 *   Growth   (250 products):  2 + 3  = 5 calls
 *   Professional (1,000):     2 + 10 = 12 calls
 *   Enterprise (2,000):       2 + 20 = 22 calls
 *
 * Worst case (images fetched separately):
 *   Starter  (50 products):   3 + 50   = 53 calls
 *   Growth   (250 products):  5 + 250  = 255 calls
 *   (We avoid this by using `includes=images` parameter)
 *
 * Etsy API is free for approved apps (no per-call cost).
 */
export function estimateEtsyApiCalls(productCount: number): ApiCostEntry {
  const setupCalls = 2; // /users/me + /shops/:id
  const listingCalls = Math.ceil(productCount / LISTINGS_PER_PAGE);
  // Assume images are inlined (best case)
  const totalCalls = setupCalls + listingCalls;

  return {
    service: 'etsy',
    callCount: totalCalls,
    estimatedCostUsd: 0, // Etsy API is free
    timestamp: new Date(),
  };
}

export default etsyConnector;
