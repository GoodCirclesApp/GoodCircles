/**
 * Catalog Mock Data Mode Implementation
 *
 * This module provides production-ready mock data for GoodCircles catalog testing.
 * When CATALOG_MOCK_MODE=true, these functions are used instead of real API calls.
 *
 * Data formats match actual Shopify, Etsy, and Amazon API responses.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum SourcePlatform {
  SHOPIFY = 'SHOPIFY',
  ETSY = 'ETSY',
  AMAZON = 'AMAZON',
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

export enum CatalogTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}

// ============================================================================
// PLATFORM-SPECIFIC PRODUCT INTERFACES
// ============================================================================

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  body_html?: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags: string;
  status: string;
  variants: Array<{
    id: string;
    product_id: string;
    title: string;
    price: string;
    sku?: string;
    inventory_quantity: number;
  }>;
  images: Array<{
    id: string;
    product_id: string;
    position: number;
    created_at: string;
    updated_at: string;
    alt?: string;
    width: number;
    height: number;
    src: string;
  }>;
}

export interface EtsyProduct {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  description: string;
  price: number;
  currency_code: string;
  quantity: number;
  tags: string[];
  category_id: number;
  creation_timestamp: number;
  last_modified_timestamp: number;
  state: 'active' | 'inactive' | 'deactivated' | 'sold_out';
  is_taxable: boolean;
  taxonomy_id?: number;
  images: Array<{
    listing_id: number;
    image_id: number;
    hex_code?: string;
    red: number;
    green: number;
    blue: number;
    hue: number;
    saturation: number;
    brightness: number;
    is_black_and_white: boolean;
    creation_timestamp: number;
    rank: number;
    url_75x75: string;
    url_170x135: string;
    url_570xN: string;
  }>;
}

export interface AmazonProduct {
  asin: string;
  product_title: string;
  product_description: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  stock_level: number;
  sku: string;
  images: string[];
  ratings: {
    average_rating: number;
    rating_count: number;
  };
  created_date: string;
  last_updated_date: string;
}

export interface MockImportRecord {
  id: string;
  merchantId: string;
  sourcePlatform: SourcePlatform;
  tier: CatalogTier;
  productCount: number;
  status: ImportStatus;
  fetchedCount: number;
  transformedCount: number;
  publishedCount: number;
  lastCompletedStep?: string;
  errorLog?: string;
  actualPlatformCogs?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface MockCatalogProduct {
  id: string;
  importId: string;
  sourceId: string;
  status: CatalogProductStatus;
  originalTitle: string;
  originalDescription?: string;
  originalPrice: number;
  originalCategory?: string;
  aiCategory?: string;
  aiDescription?: string;
  aiPricingSuggestion?: number;
  merchantTitle?: string;
  merchantDescription?: string;
  merchantPrice?: number;
  merchantCategory?: string;
  finalTitle?: string;
  finalDescription?: string;
  finalPrice?: number;
  finalCategory?: string;
  publishedProductId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockBillingRecord {
  id: string;
  importId: string;
  merchantId: string;
  tier: CatalogTier;
  productCount: number;
  amountCharged: number;
  amountChargedDisplay: number;
  status: BillingStatus;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  idempotencyKey: string;
  actualCogs?: number;
  grossMargin?: number;
  paidAt?: Date;
  completedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
}

// ============================================================================
// MOCK DATA STORES
// ============================================================================

const mockProducts: Record<string, any[]> = {
  SHOPIFY: [
    {
      id: 'gid://shopify/Product/1',
      title: 'Sustainable Bamboo Cutting Board',
      handle: 'sustainable-bamboo-cutting-board',
      body_html: '<p>Eco-friendly bamboo cutting board made from sustainable sources.</p>',
      vendor: 'EcoHome Goods',
      product_type: 'Kitchen Tools',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-04-10T14:22:00Z',
      published_at: '2024-01-15T10:30:00Z',
      tags: 'bamboo, eco-friendly, kitchen, sustainable',
      status: 'active',
      variants: [
        {
          id: 'gid://shopify/ProductVariant/1',
          product_id: 'gid://shopify/Product/1',
          title: 'Default Title',
          price: '24.99',
          sku: 'ECO-BAMBOO-001',
          inventory_quantity: 45,
        },
      ],
      images: [
        {
          id: 'gid://shopify/ProductImage/1',
          product_id: 'gid://shopify/Product/1',
          position: 1,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          alt: 'Bamboo cutting board on kitchen counter',
          width: 1200,
          height: 800,
          src: 'https://example.com/bamboo-cutting-board.jpg',
        },
      ],
    },
    {
      id: 'gid://shopify/Product/2',
      title: 'Organic Cotton T-Shirt',
      handle: 'organic-cotton-tshirt',
      body_html: '<p>100% organic cotton comfort fit t-shirt.</p>',
      vendor: 'Fair Trade Apparel',
      product_type: 'Clothing',
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-04-08T11:45:00Z',
      published_at: '2024-02-20T09:15:00Z',
      tags: 'organic, cotton, fair-trade, clothing',
      status: 'active',
      variants: [
        {
          id: 'gid://shopify/ProductVariant/2',
          product_id: 'gid://shopify/Product/2',
          title: 'Small',
          price: '34.99',
          sku: 'FAIR-ORGANIC-S',
          inventory_quantity: 120,
        },
        {
          id: 'gid://shopify/ProductVariant/3',
          product_id: 'gid://shopify/Product/2',
          title: 'Medium',
          price: '34.99',
          sku: 'FAIR-ORGANIC-M',
          inventory_quantity: 150,
        },
      ],
      images: [
        {
          id: 'gid://shopify/ProductImage/2',
          product_id: 'gid://shopify/Product/2',
          position: 1,
          created_at: '2024-02-20T09:15:00Z',
          updated_at: '2024-02-20T09:15:00Z',
          alt: 'Organic cotton t-shirt flat lay',
          width: 1000,
          height: 1000,
          src: 'https://example.com/organic-tshirt.jpg',
        },
      ],
    },
  ],
  ETSY: [
    {
      listing_id: 123456789,
      user_id: 987654321,
      shop_id: 555555,
      title: 'Handmade Ceramic Coffee Mug - Navy Blue',
      description: 'Beautiful handmade ceramic coffee mug. Perfect for morning coffee or tea. Each mug is unique with subtle variations in glaze pattern.',
      price: 18.50,
      currency_code: 'USD',
      quantity: 25,
      tags: ['handmade', 'ceramic', 'coffee', 'mug', 'artisan'],
      category_id: 68887648,
      creation_timestamp: 1704067200,
      last_modified_timestamp: 1712688000,
      state: 'active',
      is_taxable: true,
      taxonomy_id: 1,
      images: [
        {
          listing_id: 123456789,
          image_id: 1001,
          hex_code: '#1e3a8a',
          red: 30,
          green: 58,
          blue: 138,
          hue: 217,
          saturation: 78,
          brightness: 54,
          is_black_and_white: false,
          creation_timestamp: 1704067200,
          rank: 1,
          url_75x75: 'https://example.com/mug-75x75.jpg',
          url_170x135: 'https://example.com/mug-170x135.jpg',
          url_570xN: 'https://example.com/mug-570x570.jpg',
        },
      ],
    },
    {
      listing_id: 987654321,
      user_id: 987654321,
      shop_id: 555555,
      title: 'Personalized Wooden Spoon Set - Custom Engraving',
      description: 'Set of three wooden spoons with optional custom engraving. Made from sustainable wood sources. Great for cooking and serving.',
      price: 32.00,
      currency_code: 'USD',
      quantity: 18,
      tags: ['wooden', 'spoon', 'personalized', 'custom', 'cooking'],
      category_id: 68887648,
      creation_timestamp: 1707745200,
      last_modified_timestamp: 1712000000,
      state: 'active',
      is_taxable: true,
      taxonomy_id: 1,
      images: [
        {
          listing_id: 987654321,
          image_id: 2001,
          hex_code: '#8b7355',
          red: 139,
          green: 115,
          blue: 85,
          hue: 30,
          saturation: 39,
          brightness: 55,
          is_black_and_white: false,
          creation_timestamp: 1707745200,
          rank: 1,
          url_75x75: 'https://example.com/spoon-75x75.jpg',
          url_170x135: 'https://example.com/spoon-170x135.jpg',
          url_570xN: 'https://example.com/spoon-570x570.jpg',
        },
      ],
    },
  ],
  AMAZON: [
    {
      asin: 'B0D5K8H7NK',
      product_title: 'TOPELEK Portable Bluetooth Speaker',
      product_description: 'Compact and lightweight Bluetooth speaker with 12-hour battery life and IPX7 waterproof rating.',
      brand: 'TOPELEK',
      category: 'Electronics > Audio & Video > Portable Speakers',
      price: 45.99,
      currency: 'USD',
      stock_level: 342,
      sku: 'TOPELEK-BT-SPEAKER-001',
      images: [
        'https://example.com/speaker-1.jpg',
        'https://example.com/speaker-2.jpg',
        'https://example.com/speaker-3.jpg',
      ],
      ratings: {
        average_rating: 4.5,
        rating_count: 3847,
      },
      created_date: '2023-08-12T00:00:00Z',
      last_updated_date: '2024-04-10T15:30:00Z',
    },
    {
      asin: 'B0CX5VWJ9Z',
      product_title: 'NexGen Wireless Charging Pad - Fast Charge',
      product_description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Includes cable and power adapter.',
      brand: 'NexGen',
      category: 'Electronics > Mobile Phones & Accessories > Chargers',
      price: 29.99,
      currency: 'USD',
      stock_level: 567,
      sku: 'NEXGEN-CHARGE-QI-V2',
      images: [
        'https://example.com/charger-1.jpg',
        'https://example.com/charger-2.jpg',
      ],
      ratings: {
        average_rating: 4.7,
        rating_count: 2156,
      },
      created_date: '2023-10-25T00:00:00Z',
      last_updated_date: '2024-04-09T12:15:00Z',
    },
  ],
};

const mockImportRecords: Record<string, MockImportRecord> = {
  'import_001': {
    id: 'import_001',
    merchantId: 'merchant_123',
    sourcePlatform: SourcePlatform.SHOPIFY,
    tier: CatalogTier.STARTER,
    productCount: 50,
    status: ImportStatus.COMPLETED,
    fetchedCount: 50,
    transformedCount: 50,
    publishedCount: 48,
    lastCompletedStep: 'PUBLISHING',
    createdAt: new Date('2024-04-01T10:00:00Z'),
    startedAt: new Date('2024-04-01T10:05:00Z'),
    completedAt: new Date('2024-04-01T10:45:00Z'),
  },
  'import_002': {
    id: 'import_002',
    merchantId: 'merchant_456',
    sourcePlatform: SourcePlatform.ETSY,
    tier: CatalogTier.GROWTH,
    productCount: 150,
    status: ImportStatus.REVIEW_READY,
    fetchedCount: 150,
    transformedCount: 148,
    publishedCount: 0,
    lastCompletedStep: 'TRANSFORMING',
    createdAt: new Date('2024-04-08T14:20:00Z'),
    startedAt: new Date('2024-04-08T14:25:00Z'),
  },
  'import_003': {
    id: 'import_003',
    merchantId: 'merchant_789',
    sourcePlatform: SourcePlatform.AMAZON,
    tier: CatalogTier.ENTERPRISE,
    productCount: 500,
    status: ImportStatus.FETCHING,
    fetchedCount: 234,
    transformedCount: 0,
    publishedCount: 0,
    lastCompletedStep: 'FETCHING',
    createdAt: new Date('2024-04-10T08:30:00Z'),
    startedAt: new Date('2024-04-10T08:35:00Z'),
  },
  'import_004': {
    id: 'import_004',
    merchantId: 'merchant_999',
    sourcePlatform: SourcePlatform.SHOPIFY,
    tier: CatalogTier.STARTER,
    productCount: 75,
    status: ImportStatus.FAILED,
    fetchedCount: 45,
    transformedCount: 40,
    publishedCount: 0,
    lastCompletedStep: 'TRANSFORMING',
    errorLog: 'Connection timeout while fetching variant data. Retry recommended.',
    createdAt: new Date('2024-04-05T16:00:00Z'),
    startedAt: new Date('2024-04-05T16:05:00Z'),
  },
};

const mockCatalogProducts: Record<string, MockCatalogProduct[]> = {
  'import_001': [
    {
      id: 'product_001',
      importId: 'import_001',
      sourceId: 'gid://shopify/Product/1',
      status: CatalogProductStatus.PUBLISHED,
      originalTitle: 'Sustainable Bamboo Cutting Board',
      originalDescription: 'Eco-friendly bamboo cutting board made from sustainable sources.',
      originalPrice: 24.99,
      originalCategory: 'Kitchen Tools',
      aiCategory: 'Kitchen & Dining',
      aiDescription: 'Eco-friendly kitchen tool made from sustainable bamboo. Perfect for meal prep and serving.',
      aiPricingSuggestion: 26.99,
      finalTitle: 'Sustainable Bamboo Cutting Board - Eco-Friendly Kitchen Essential',
      finalDescription: 'Premium eco-friendly kitchen tool made from sustainable bamboo. Durable, beautiful, and perfect for meal prep.',
      finalPrice: 26.99,
      finalCategory: 'Kitchen & Dining',
      publishedProductId: 'gc_prod_001',
      createdAt: new Date('2024-04-01T10:10:00Z'),
      updatedAt: new Date('2024-04-01T10:40:00Z'),
    },
    {
      id: 'product_002',
      importId: 'import_001',
      sourceId: 'gid://shopify/Product/2',
      status: CatalogProductStatus.ACCEPTED,
      originalTitle: 'Organic Cotton T-Shirt',
      originalDescription: '100% organic cotton comfort fit t-shirt.',
      originalPrice: 34.99,
      originalCategory: 'Clothing',
      aiCategory: 'Apparel & Accessories',
      aiDescription: 'Premium organic cotton t-shirt with comfort fit. Ethically produced apparel.',
      aiPricingSuggestion: 36.99,
      merchantTitle: 'Organic Cotton Premium T-Shirt',
      merchantDescription: 'Ultra-soft 100% organic cotton t-shirt. Fair-trade certified.',
      merchantPrice: 35.99,
      merchantCategory: 'Apparel',
      finalTitle: 'Organic Cotton Premium T-Shirt - Fair Trade',
      finalDescription: 'Ultra-soft 100% organic cotton t-shirt. Fair-trade certified and sustainably produced.',
      finalPrice: 35.99,
      finalCategory: 'Apparel & Accessories',
      createdAt: new Date('2024-04-01T10:15:00Z'),
      updatedAt: new Date('2024-04-01T10:38:00Z'),
    },
    {
      id: 'product_003',
      importId: 'import_001',
      sourceId: 'gid://shopify/Product/3',
      status: CatalogProductStatus.REJECTED,
      originalTitle: 'Generic USB Cable',
      originalDescription: 'Standard USB cable.',
      originalPrice: 9.99,
      originalCategory: 'Electronics',
      aiCategory: 'Electronics',
      aiDescription: 'Standard USB data and charging cable.',
      // Note: errorLog removed — not in MockCatalogProduct interface
      createdAt: new Date('2024-04-01T10:12:00Z'),
      updatedAt: new Date('2024-04-01T10:35:00Z'),
    },
  ],
  'import_002': [
    {
      id: 'product_004',
      importId: 'import_002',
      sourceId: '123456789',
      status: CatalogProductStatus.AI_PROCESSED,
      originalTitle: 'Handmade Ceramic Coffee Mug - Navy Blue',
      originalDescription: 'Beautiful handmade ceramic coffee mug. Perfect for morning coffee or tea.',
      originalPrice: 18.5,
      originalCategory: 'Home & Living',
      aiCategory: 'Home & Kitchen',
      aiDescription: 'Artisan handmade ceramic coffee mug with unique glaze pattern. Perfect for hot beverages.',
      aiPricingSuggestion: 21.99,
      createdAt: new Date('2024-04-08T14:30:00Z'),
      updatedAt: new Date('2024-04-08T14:35:00Z'),
    },
    {
      id: 'product_005',
      importId: 'import_002',
      sourceId: '987654321',
      status: CatalogProductStatus.PENDING,
      originalTitle: 'Personalized Wooden Spoon Set - Custom Engraving',
      originalDescription: 'Set of three wooden spoons with optional custom engraving.',
      originalPrice: 32.0,
      originalCategory: 'Kitchen & Dining',
      createdAt: new Date('2024-04-08T14:31:00Z'),
      updatedAt: new Date('2024-04-08T14:31:00Z'),
    },
  ],
};

const mockBillingRecords: Record<string, MockBillingRecord> = {
  'import_001': {
    id: 'billing_001',
    importId: 'import_001',
    merchantId: 'merchant_123',
    tier: CatalogTier.STARTER,
    productCount: 50,
    amountCharged: 4999,
    amountChargedDisplay: 49.99,
    status: BillingStatus.PAID,
    stripeCheckoutSessionId: 'cs_test_001',
    stripePaymentIntentId: 'pi_test_001',
    idempotencyKey: 'idempotency_001',
    actualCogs: 2000,
    grossMargin: 0.6,
    paidAt: new Date('2024-04-01T11:00:00Z'),
    completedAt: new Date('2024-04-01T11:05:00Z'),
    createdAt: new Date('2024-04-01T10:50:00Z'),
  },
  'import_002': {
    id: 'billing_002',
    importId: 'import_002',
    merchantId: 'merchant_456',
    tier: CatalogTier.GROWTH,
    productCount: 150,
    amountCharged: 12999,
    amountChargedDisplay: 129.99,
    status: BillingStatus.PENDING,
    idempotencyKey: 'idempotency_002',
    createdAt: new Date('2024-04-08T14:50:00Z'),
  },
};

// ============================================================================
// CONFIGURATION & ENVIRONMENT CHECKS
// ============================================================================

/**
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return process.env.CATALOG_MOCK_MODE === 'true';
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Get mock products for a specific platform
 * Returns data in the exact format of the platform's API
 */
export function getMockProductsByPlatform(platform: SourcePlatform): any[] {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  const products = mockProducts[platform];
  if (!products) {
    throw new Error(`No mock products available for platform: ${platform}`);
  }

  return JSON.parse(JSON.stringify(products)); // Deep copy to prevent mutations
}

/**
 * In-memory store for dynamically-created import records (e.g., from random jobIds)
 * These are created when a checkout succeeds and persist during the session
 */
const dynamicImportRecords: Record<string, MockImportRecord> = {};

/**
 * Get or create a mock import record
 * If the ID exists in static mock records, return it
 * If not, generate a dynamic record that progresses through import states
 */
export function getMockImportRecord(importId: string): MockImportRecord | null {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  // Check static mock records first
  const staticRecord = mockImportRecords[importId];
  if (staticRecord) {
    return JSON.parse(JSON.stringify(staticRecord));
  }

  // Check if this is a dynamic record we've already created
  if (dynamicImportRecords[importId]) {
    return JSON.parse(JSON.stringify(dynamicImportRecords[importId]));
  }

  // Return null if neither exists
  return null;
}

/**
 * Generate or retrieve a mock import record, creating a dynamic one if needed
 * This is used by the import status endpoint to allow progress polling even
 * for dynamically-created jobIds
 */
export function getOrCreateMockImportRecord(
  importId: string,
  productCount: number = 50,
  sourcePlatform: SourcePlatform = SourcePlatform.SHOPIFY,
  tier: CatalogTier = CatalogTier.STARTER,
  merchantId: string = 'demo-merchant'
): MockImportRecord {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  // Return existing record if found
  const existing = mockImportRecords[importId] || dynamicImportRecords[importId];
  if (existing) {
    return JSON.parse(JSON.stringify(existing));
  }

  // Create a new dynamic record that will progress through import states
  const now = new Date();
  const createdRecord: MockImportRecord = {
    id: importId,
    merchantId,
    sourcePlatform,
    tier,
    productCount,
    status: ImportStatus.QUEUED,
    fetchedCount: 0,
    transformedCount: 0,
    publishedCount: 0,
    lastCompletedStep: 'QUEUED',
    createdAt: now,
    startedAt: new Date(now.getTime() + 2000), // Start 2 seconds after creation
  };

  // Store in dynamic records
  dynamicImportRecords[importId] = createdRecord;

  return JSON.parse(JSON.stringify(createdRecord));
}

/**
 * Simulate import progress for a dynamic record
 * This advances the status through QUEUED → FETCHING → TRANSFORMING → REVIEW_READY
 * when the status endpoint is polled repeatedly
 */
export function advanceMockImportProgress(importId: string): MockImportRecord | null {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  const record = dynamicImportRecords[importId];
  if (!record) {
    return null;
  }

  const now = new Date();
  const elapsed = now.getTime() - (record.startedAt?.getTime() ?? 0);

  // Simulate progress: 0-3 seconds = FETCHING, 3-6 seconds = TRANSFORMING, 6+ = REVIEW_READY
  if (record.status === ImportStatus.QUEUED) {
    record.status = ImportStatus.FETCHING;
    record.lastCompletedStep = 'FETCHING';
    record.fetchedCount = Math.min(record.productCount, Math.floor(record.productCount * 0.3));
  } else if (record.status === ImportStatus.FETCHING && elapsed > 3000) {
    record.status = ImportStatus.TRANSFORMING;
    record.lastCompletedStep = 'TRANSFORMING';
    record.fetchedCount = record.productCount;
    record.transformedCount = Math.min(record.productCount, Math.floor(record.productCount * 0.8));
  } else if (record.status === ImportStatus.TRANSFORMING && elapsed > 6000) {
    record.status = ImportStatus.REVIEW_READY;
    record.lastCompletedStep = 'TRANSFORMING';
    record.transformedCount = record.productCount;
    record.completedAt = now;
  }

  return JSON.parse(JSON.stringify(record));
}

/**
 * Get all mock import records for a specific merchant
 */
export function getMockImportRecordsByMerchant(merchantId: string): MockImportRecord[] {
  return Object.values(mockImportRecords)
    .filter((record) => record.merchantId === merchantId)
    .map((record) => JSON.parse(JSON.stringify(record)));
}

/**
 * Get all mock catalog products for a specific import
 */
export function getMockProducts(importId: string): MockCatalogProduct[] {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  const products = mockCatalogProducts[importId];
  if (!products) {
    return [];
  }

  return JSON.parse(JSON.stringify(products)); // Deep copy to prevent mutations
}

/**
 * Get billing data for a merchant
 */
export function getMockBillingData(merchantId: string): MockBillingRecord | null {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  // Find billing record by merchantId
  for (const record of Object.values(mockBillingRecords)) {
    if (record.merchantId === merchantId) {
      return JSON.parse(JSON.stringify(record));
    }
  }

  return null;
}

/**
 * Get a specific billing record by ID
 */
export function getMockBillingRecord(billingId: string): MockBillingRecord | null {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  const record = mockBillingRecords[billingId];
  return record ? JSON.parse(JSON.stringify(record)) : null;
}

/**
 * Create a mock import record (for testing create operations)
 */
export function createMockImportRecord(
  merchantId: string,
  platform: SourcePlatform,
  productCount: number,
  tier: CatalogTier,
): MockImportRecord {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  const record: MockImportRecord = {
    id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    merchantId,
    sourcePlatform: platform,
    tier,
    productCount,
    status: ImportStatus.QUEUED,
    fetchedCount: 0,
    transformedCount: 0,
    publishedCount: 0,
    createdAt: new Date(),
  };

  mockImportRecords[record.id] = record;
  return JSON.parse(JSON.stringify(record));
}

/**
 * Update a mock import record's status
 */
export function updateMockImportStatus(
  importId: string,
  status: ImportStatus,
  updates?: Partial<MockImportRecord>,
): MockImportRecord | null {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  const record = mockImportRecords[importId];
  if (!record) {
    return null;
  }

  record.status = status;
  if (updates) {
    Object.assign(record, updates);
  }

  if (status === ImportStatus.COMPLETED || status === ImportStatus.FAILED) {
    record.completedAt = new Date();
  }

  return JSON.parse(JSON.stringify(record));
}

/**
 * Get summary statistics for mock data
 */
export function getMockDataStatistics() {
  if (!isMockModeEnabled()) {
    throw new Error('Mock mode is disabled. Set CATALOG_MOCK_MODE=true to use mock data.');
  }

  const imports = Object.values(mockImportRecords);
  const totalProducts = Object.values(mockCatalogProducts).flat().length;
  const completedImports = imports.filter((i) => i.status === ImportStatus.COMPLETED).length;
  const failedImports = imports.filter((i) => i.status === ImportStatus.FAILED).length;

  return {
    totalImports: imports.length,
    completedImports,
    failedImports,
    totalCatalogProducts: totalProducts,
    platformBreakdown: {
      [SourcePlatform.SHOPIFY]: mockProducts[SourcePlatform.SHOPIFY]?.length || 0,
      [SourcePlatform.ETSY]: mockProducts[SourcePlatform.ETSY]?.length || 0,
      [SourcePlatform.AMAZON]: mockProducts[SourcePlatform.AMAZON]?.length || 0,
    },
  };
}

export default {
  isMockModeEnabled,
  getMockProductsByPlatform,
  getMockImportRecord,
  getOrCreateMockImportRecord,
  advanceMockImportProgress,
  getMockProducts,
  getMockBillingData,
  getMockBillingRecord,
  createMockImportRecord,
  updateMockImportStatus,
  getMockDataStatistics,
};
