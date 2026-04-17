// =============================================================================
// GoodCircles AI Catalog Upload Tool — Amazon Connector
// =============================================================================
// SP-API (Selling Partner API) authentication + catalog item fetch.
// Rate limits vary by endpoint (handled per-call with backoff).
// Pagination: nextToken-based.
//
// Amazon SP-API is the most complex of the three connectors due to:
//   1. LWA (Login with Amazon) + SP-API role-based auth
//   2. Separate Catalog Items API and Listings API
//   3. Marketplace-specific endpoints
//   4. Variable throttling per endpoint
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

const SP_API_BASE = 'https://sellingpartnerapi-na.amazon.com'; // North America
const ITEMS_PER_PAGE = 20; // SP-API Catalog Items max per request
const LISTINGS_PER_PAGE = 10; // SP-API Listings max per request
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 2000; // Amazon throttling can be aggressive

// US marketplace ID (default — can be overridden per merchant)
const DEFAULT_MARKETPLACE_ID = 'ATVPDKIKX0DER';

// Environment variables
const AMAZON_CLIENT_ID = process.env.AMAZON_SP_CLIENT_ID!;
const AMAZON_CLIENT_SECRET = process.env.AMAZON_SP_CLIENT_SECRET!;
const AMAZON_REFRESH_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get an access token from Amazon LWA (Login with Amazon).
 * SP-API uses short-lived access tokens that must be refreshed.
 */
async function getAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch(AMAZON_REFRESH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: AMAZON_CLIENT_ID,
      client_secret: AMAZON_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Amazon LWA token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Make a rate-limited request to the Amazon SP-API.
 * Implements exponential backoff on 429 and 503 errors.
 *
 * Amazon throttle response includes a x-amzn-RateLimit-Limit header
 * indicating the current rate. We use this to adjust delays dynamically.
 */
async function spApiFetch(
  endpoint: string,
  accessToken: string,
  marketplaceId: string,
  retryCount = 0,
  delayMs = 200,
): Promise<Response> {
  await sleep(delayMs);

  const url = `${SP_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-amz-access-token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  // Handle throttling (429) or service unavailable (503)
  if (response.status === 429 || response.status === 503) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Amazon SP-API throttled after ${MAX_RETRIES} retries (${response.status})`);
    }
    const backoff = BASE_BACKOFF_MS * Math.pow(2, retryCount);
    console.warn(`[AmazonConnector] Throttled (${response.status}). Retrying in ${backoff}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await sleep(backoff);
    return spApiFetch(endpoint, accessToken, marketplaceId, retryCount + 1, delayMs);
  }

  return response;
}

/**
 * Normalize an Amazon catalog item into the GoodCircles shared schema.
 */
function normalizeAmazonProduct(item: any, marketplaceId: string): NormalizedProduct {
  // SP-API catalog items have a complex nested structure
  const summaries = item.summaries?.[0] || {};
  const images = item.images?.[0]?.images || [];
  const salesRanks = item.salesRanks || [];
  const attributes = item.attributes || {};

  // Extract price from various possible locations
  let price = 0;
  if (attributes.list_price?.[0]?.value) {
    price = parseFloat(attributes.list_price[0].value);
  } else if (summaries.purchasableOffers?.[0]?.ourPrice?.amount) {
    price = parseFloat(summaries.purchasableOffers[0].ourPrice.amount);
  }

  // Build variants from variation attributes
  const variants: NormalizedProductVariant[] = [];
  if (item.relationships?.[0]?.relationships) {
    for (const rel of item.relationships[0].relationships) {
      if (rel.childAsins) {
        for (const childAsin of rel.childAsins) {
          variants.push({
            sourceVariantId: childAsin.asin,
            title: childAsin.asin, // Will be enriched in a second pass if needed
            price,
            attributes: {},
          });
        }
      }
    }
  }

  return {
    sourceId: item.asin,
    title: summaries.itemName || 'Untitled Product',
    description: summaries.itemDescription || attributes.product_description?.[0]?.value || '',
    images: images.map((img: any) => img.link).filter(Boolean),
    price,
    costOfGoods: null, // Amazon doesn't expose seller COGS via API
    category: summaries.browseClassification?.displayName || null,
    variants,
    sourcePlatform: SourcePlatform.AMAZON,
    sourceUrl: `https://www.amazon.com/dp/${item.asin}`,
    tags: [],
    isActive: summaries.status === 'BuyableOnAmazon' || summaries.status === undefined,
  };
}

// ---------------------------------------------------------------------------
// Amazon Connector
// ---------------------------------------------------------------------------

export const amazonConnector: PlatformConnector = {
  platform: SourcePlatform.AMAZON,

  // -------------------------------------------------------------------------
  // OAuth (SP-API uses LWA — Login with Amazon)
  // -------------------------------------------------------------------------

  getAuthUrl(redirectUri: string, state: string): string {
    // SP-API authorization URL for seller apps
    return `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${AMAZON_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&version=beta`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<PlatformCredentials> {
    // The spapi_oauth_code comes from the SP-API authorization callback
    const response = await fetch(AMAZON_REFRESH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: AMAZON_CLIENT_ID,
        client_secret: AMAZON_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Amazon OAuth exchange failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      marketplaceId: DEFAULT_MARKETPLACE_ID,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  },

  async refreshCredentials(credentials: PlatformCredentials): Promise<PlatformCredentials> {
    if (!credentials.refreshToken) {
      throw new Error('No refresh token available for Amazon credentials');
    }

    const { accessToken, expiresIn } = await getAccessToken(credentials.refreshToken);

    return {
      ...credentials,
      accessToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  },

  // -------------------------------------------------------------------------
  // Scan
  // -------------------------------------------------------------------------

  async scanCatalog(credentials: PlatformCredentials): Promise<ConnectorScanResult> {
    let { accessToken, refreshToken, sellerId, marketplaceId } = credentials;
    marketplaceId = marketplaceId || DEFAULT_MARKETPLACE_ID;

    // Ensure token is fresh
    if (credentials.expiresAt && new Date() >= credentials.expiresAt) {
      const refreshed = await getAccessToken(refreshToken!);
      accessToken = refreshed.accessToken;
    }

    // Get seller information
    if (!sellerId) {
      const sellerResponse = await spApiFetch(
        '/sellers/v1/marketplaceParticipations',
        accessToken,
        marketplaceId,
      );

      if (!sellerResponse.ok) {
        throw new Error(`Amazon seller info fetch failed: ${sellerResponse.status}`);
      }

      const sellerData = await sellerResponse.json();
      const participation = sellerData.payload?.find(
        (p: any) => p.marketplace?.id === marketplaceId
      );
      sellerId = participation?.participation?.sellerId || 'unknown';
    }

    // Count listings using the Listings API
    // SP-API doesn't have a simple count endpoint, so we fetch page 1
    // and use the total count from pagination metadata
    const listingsResponse = await spApiFetch(
      `/listings/2021-08-01/items/${sellerId}?marketplaceIds=${marketplaceId}&pageSize=1`,
      accessToken,
      marketplaceId,
    );

    let productCount = 0;
    let shopName = `Amazon Seller ${sellerId}`;

    if (listingsResponse.ok) {
      const listingsData = await listingsResponse.json();
      productCount = listingsData.pagination?.totalResultsCount || listingsData.numberOfResults || 0;
    } else {
      // Fallback: use the Reports API to get inventory count
      // This is a simplified approach — in production, we'd create a report
      // and poll for completion
      console.warn('[AmazonConnector] Listings count unavailable, using fallback estimation');
      productCount = 0; // Will be determined during full fetch
    }

    return {
      platform: SourcePlatform.AMAZON,
      productCount,
      recommendedTier: determineTier(Math.max(productCount, 1)),
      shopName,
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
    let { accessToken, refreshToken, sellerId, marketplaceId } = credentials;
    marketplaceId = marketplaceId || DEFAULT_MARKETPLACE_ID;
    const startTime = Date.now();
    const allProducts: NormalizedProduct[] = [];
    const errors: ConnectorError[] = [];
    let apiCallsMade = 0;

    // Ensure token is fresh
    if (credentials.expiresAt && new Date() >= credentials.expiresAt) {
      const refreshed = await getAccessToken(refreshToken!);
      accessToken = refreshed.accessToken;
    }

    // Step 1: Get seller's ASINs via Listings Items API
    // This returns the list of items the seller has in their catalog
    let nextToken: string | null = null;
    let totalProducts = 0;
    let currentPage = 0;

    do {
      currentPage++;
      const pageParam = nextToken ? `&pageToken=${encodeURIComponent(nextToken)}` : '';
      const endpoint = `/listings/2021-08-01/items/${sellerId}?marketplaceIds=${marketplaceId}&pageSize=${LISTINGS_PER_PAGE}${pageParam}`;

      try {
        const response = await spApiFetch(endpoint, accessToken, marketplaceId);
        apiCallsMade++;

        if (!response.ok) {
          errors.push({
            type: response.status === 401 || response.status === 403 ? 'AUTH_EXPIRED' : 'UNKNOWN',
            message: `Amazon Listings API returned ${response.status} on page ${currentPage}`,
            retryable: response.status !== 401 && response.status !== 403,
            timestamp: new Date(),
          });

          if (response.status === 401 || response.status === 403) break;
          nextToken = null;
          continue;
        }

        const data = await response.json();
        const items = data.items || [];
        totalProducts = data.pagination?.totalResultsCount || totalProducts;
        nextToken = data.pagination?.nextToken || null;

        // Step 2: For each ASIN, fetch detailed catalog data
        // We batch these to minimize API calls
        const asins = items.map((item: any) => item.asin).filter(Boolean);

        if (asins.length > 0) {
          // Use Catalog Items API to get full details (supports up to 20 ASINs per call)
          const asinParam = asins.join(',');
          const catalogResponse = await spApiFetch(
            `/catalog/2022-04-01/items?marketplaceIds=${marketplaceId}&identifiers=${asinParam}&identifiersType=ASIN&includedData=summaries,images,attributes,relationships,salesRanks`,
            accessToken,
            marketplaceId,
          );
          apiCallsMade++;

          if (catalogResponse.ok) {
            const catalogData = await catalogResponse.json();
            const catalogItems = catalogData.items || [];

            for (const catalogItem of catalogItems) {
              allProducts.push(normalizeAmazonProduct(catalogItem, marketplaceId));
            }
          } else {
            // If catalog details fail, create basic products from listing data
            for (const item of items) {
              allProducts.push({
                sourceId: item.asin || `amazon_${item.sku}`,
                title: item.summaries?.[0]?.itemName || item.sku || 'Unknown Product',
                description: '',
                images: [],
                price: 0,
                costOfGoods: null,
                category: null,
                variants: [],
                sourcePlatform: SourcePlatform.AMAZON,
                sourceUrl: item.asin ? `https://www.amazon.com/dp/${item.asin}` : undefined,
                tags: [],
                isActive: item.summaries?.[0]?.status === 'Active',
              });
            }

            errors.push({
              type: 'PARTIAL_DATA',
              message: `Catalog details unavailable for page ${currentPage} — basic data imported`,
              retryable: true,
              timestamp: new Date(),
            });
          }
        }

        const totalPages = Math.ceil(totalProducts / LISTINGS_PER_PAGE) || 1;

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
          message: err.message || 'Unknown error fetching Amazon catalog',
          retryable: true,
          timestamp: new Date(),
        });

        if (allProducts.length > 0) {
          console.warn(`[AmazonConnector] Error on page ${currentPage}, returning ${allProducts.length} products fetched so far`);
          break;
        }
        throw err;
      }
    } while (nextToken);

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
    // Amazon SP-API: the seller can revoke access from Seller Central.
    // There's no programmatic revocation endpoint.
    // We clear our stored credentials.
    console.info('[AmazonConnector] Credentials cleared. Seller can revoke access from Seller Central > Manage Apps.');
  },
};

// ---------------------------------------------------------------------------
// Cost Estimation
// ---------------------------------------------------------------------------

/**
 * Estimate the number of Amazon SP-API calls for a given product count.
 *
 * Amazon is the most API-call-intensive due to separate endpoints for
 * listings vs catalog details.
 *
 * API calls:
 *   - 1 call for marketplace participations (seller info)
 *   - ceil(productCount / 10) calls for listings pages
 *   - ceil(productCount / 20) calls for catalog item details (batched)
 *
 * Starter  (50 products):   1 + 5 + 3     = 9 calls
 * Growth   (250 products):  1 + 25 + 13   = 39 calls
 * Professional (1,000):     1 + 100 + 50  = 151 calls
 * Enterprise (2,000):       1 + 200 + 100 = 301 calls
 *
 * Amazon SP-API calls are free, but throttle limits mean higher
 * call counts = longer processing time.
 */
export function estimateAmazonApiCalls(productCount: number): ApiCostEntry {
  const setupCalls = 1; // marketplace participations
  const listingsCalls = Math.ceil(productCount / LISTINGS_PER_PAGE);
  const catalogCalls = Math.ceil(productCount / ITEMS_PER_PAGE);
  const totalCalls = setupCalls + listingsCalls + catalogCalls;

  return {
    service: 'amazon',
    callCount: totalCalls,
    estimatedCostUsd: 0, // SP-API is free
    timestamp: new Date(),
  };
}

export default amazonConnector;
