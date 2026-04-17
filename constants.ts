
import { Community, Nonprofit, Product, CommunityProject, FiscalPolicy, Order } from './types';

export const GC_DISCOUNT_RATE = 0.10;
export const DONATION_RATE = 0.10;
export const PLATFORM_FEE_RATE = 0.01;
export const CARD_PROCESSING_FEE = 0.03;
export const INTERNAL_BANKING_FEE = 0.005; 
export const TAX_RATE = 0.0825; 
export const PLATFORM_LAUNCH_DATE = '2024-01-01';

const DEFAULT_POLICY: FiscalPolicy = {
  discountRate: 0.10,
  donationRate: 0.10,
  platformFeeRate: 0.01,
  taxRate: 0.0825,
  currencyCode: 'USD',
  symbol: '$',
  categoryOverrides: {
    "Groceries & Staples": { discountRate: 0.05, donationRate: 0.05, platformFeeRate: 0.005 },
    "Electronics": { discountRate: 0.07, donationRate: 0.08, platformFeeRate: 0.01 },
    "Professional Services": { discountRate: 0.15, donationRate: 0.12, platformFeeRate: 0.015 }
  }
};

export interface FAQItem {
  id: string;
  category: 'CORE' | 'ECONOMY' | 'SECURITY' | 'GOVERNANCE' | 'MERCHANT' | 'NONPROFIT';
  question: string;
  answer: string;
}

const FAQ_CORE: FAQItem[] = [
  {
    id: 'core-1',
    category: 'CORE',
    question: 'What is the 10/10/1 Economic Model?',
    answer: 'The 10/10/1 Model is our baseline "Constitution": (1) Merchants provide an automatic 10% discount to members. (2) Merchants donate 10% of net profits to a community-elected nonprofit. (3) A 1% platform fee covers network maintenance. This ensures capital is redirected from external banks and ad networks back into the local community.'
  },
  {
    id: 'core-2',
    category: 'CORE',
    question: 'How is "Net Profit" calculated for the 10% donation?',
    answer: 'Net Profit is calculated as (Sale Price - COGS). The 10% donation floor is applied to this margin. However, the "Impact Floor" safeguard ensures that even if a merchant has low margins, a minimum of 2% of the total sale is always disbursed to the community.'
  }
];

const FAQ_ECONOMY: FAQItem[] = [
  {
    id: 'econ-1',
    category: 'ECONOMY',
    question: 'What is the Circle Ledger Account (GCLA)?',
    answer: 'The GCLA is our internal community banking system. By pre-funding your wallet, you bypass the 3% credit card surcharges and pay only a 0.5% internal maintenance fee. This keeps millions in capital within the community mesh instead of "leaking" to external financial institutions.'
  },
  {
    id: 'econ-2',
    category: 'ECONOMY',
    question: 'What is "Tax Alpha" or Fiscal Arbitrage?',
    answer: 'Tax Alpha is the mathematical advantage for Good Circles merchants. By converting traditional operating losses (like credit card fees and marketing costs) into tax-deductible community donations, every dollar earned within the circle is significantly more efficient than external revenue.'
  },
  {
    id: 'econ-3',
    category: 'ECONOMY',
    question: 'How do refunds work in a circular economy?',
    answer: 'To prevent capital flight, refunds are processed via the "Recapture Protocol." Funds are returned instantly to your Circle Wallet for zero fee, allowing you to reinvest that capital into another local merchant immediately.'
  },
  {
    id: 'econ-4',
    category: 'ECONOMY',
    question: 'Are there fees for withdrawing GCLA balance to a bank?',
    answer: 'Yes. External withdrawals trigger a 3.5% Conversion Fee. This reflects the cost of capital leaving the community circle and is designed to encourage internal circulation (velocity).'
  }
];

const FAQ_SECURITY: FAQItem[] = [
  {
    id: 'sec-1',
    category: 'SECURITY',
    question: 'How does the Privacy Shield protect my identity?',
    answer: 'While transaction amounts are public for auditing purposes, your personal identity is masked. The ledger uses "Hash Masking" so you appear as an anonymous ID (e.g., Member #B2A9). Only you and the platform stewards can link your real identity to your shopping history.'
  },
  {
    id: 'sec-2',
    category: 'SECURITY',
    question: 'What happens if a Merchant "Price Hikes" to offset the discount?',
    answer: 'Our "Price Sentinel AI" benchmarks every listing MSRP against global market averages. If a price is found to be significantly inflated to hide the 10% discount, the listing is automatically flagged for governance review and may be frozen from the marketplace.'
  },
  {
    id: 'sec-3',
    category: 'SECURITY',
    question: 'How do you verify Merchant COGS integrity?',
    answer: 'COGS are audited via pattern analysis. If a merchant reports abnormally high COGS to reduce their 10% donation liability, the Sentinel AI detects the margin anomaly and triggers a "Deep Integrity Audit" of their settlement history.'
  },
  {
    id: 'sec-4',
    category: 'SECURITY',
    question: 'What are the specific insurance requirements for platform merchants?',
    answer: '' // BLANK: For admins to complete
  }
];

const FAQ_GOVERNANCE: FAQItem[] = [
  {
    id: 'gov-1',
    category: 'GOVERNANCE',
    question: 'How can I change the 10/10/1 rates in my city?',
    answer: 'Good Circles is a Decentralized Economic Democracy. Members can submit "Rate Adjustment Proposals" via the Community Council. If the proposal reaches the consensus threshold (usually 66%), the new fiscal policy is applied to that specific Metropolitan Statistical Area (MSA).'
  },
  {
    id: 'gov-2',
    category: 'GOVERNANCE',
    question: 'What is "Priority Voting" and how do I earn it?',
    answer: 'Members earn "Impact Points" for every purchase. Once you reach 100 points, you reach the "Governance Threshold," allowing you to cast Priority Votes on which Community Projects (like parks or clinics) should be funded first by the collective pool.'
  },
  {
    id: 'gov-3',
    category: 'GOVERNANCE',
    question: 'What is the "Proposer Stake" requirement?',
    answer: 'To prevent governance spam, proposing a new initiative requires staking 250 Impact Points. These points are locked during the voting cycle and returned if the proposal passes or reaches a "Seriousness Threshold" of 20% support.'
  }
];

const FAQ_ENTITIES: FAQItem[] = [
  {
    id: 'ent-1',
    category: 'NONPROFIT',
    question: 'What is Direct Asset Funding?',
    answer: 'Nonprofits can list specific equipment or resources as "Needs" (e.g., a $500 laptop). Members can fulfill these needs directly at checkout instead of giving general cash. This ensures 100% transparency in how impact funds are utilized.'
  },
  {
    id: 'ent-2',
    category: 'NONPROFIT',
    question: 'How are donation conflicts managed (Safeguard #2)?',
    answer: 'We prohibit "Self-Cycling Loops." A merchant cannot donate to a nonprofit they own or have significant control over. The platform automatically flags affiliated entities to ensure community funds flow to independent initiatives.'
  },
  {
    id: 'ent-3',
    category: 'MERCHANT',
    question: 'How does "Cash Local" work for in-person sales?',
    answer: 'Merchants maintain an "Impact Reserve" (collateral). When a cash sale occurs, the member presents a QR code. The merchant scans this via the "Optical Handshake," and the 10% community impact is instantly debited from the merchant\'s reserve and credited to the nonprofit.'
  },
  {
    id: 'ent-4',
    category: 'MERCHANT',
    question: 'What is the Scaling Consortium?',
    answer: 'Merchants in the same category can join a "Consortium" to pool their purchasing power. This allows small local businesses to negotiate wholesale prices previously reserved for big-box retailers, significantly lowering their COGS.'
  }
];

export const INITIAL_FAQ: FAQItem[] = [
  ...FAQ_CORE,
  ...FAQ_ECONOMY,
  ...FAQ_SECURITY,
  ...FAQ_GOVERNANCE,
  ...FAQ_ENTITIES
];

export const PRODUCT_CATEGORIES = [
  "Housing & Real Estate",
  "Utilities & Power",
  "Connectivity",
  "Groceries & Staples",
  "Health & Pharmacy",
  "Wellness",
  "Transportation",
  "Home Maintenance",
  "Professional Services",
  "Education",
  "Insurance",
  "Dining",
  "Retail",
  "Electronics",
  "Entertainment",
  "Travel",
  "Pet Care",
  "Childcare",
  "Business",
  "Sports",
  "Art & Creative",
  "Fitness",
  "Gifts"
];

export const MOCK_COMMUNITIES: Community[] = [
  { id: 'msa-la', name: 'Los Angeles-Long Beach-Anaheim', memberCount: 12400, fiscalPolicy: DEFAULT_POLICY },
  { id: 'msa-ny', name: 'New York-Newark-Jersey City', memberCount: 18500, fiscalPolicy: { ...DEFAULT_POLICY, taxRate: 0.08875 } },
  { 
    id: 'msa-lon', 
    name: 'Greater London Authority', 
    memberCount: 5200, 
    fiscalPolicy: { 
      discountRate: 0.12, 
      donationRate: 0.08, 
      platformFeeRate: 0.015, 
      taxRate: 0.20, 
      currencyCode: 'GBP', 
      symbol: '£' 
    } 
  },
  { 
    id: 'msa-ber', 
    name: 'Berlin Metropolitan Region', 
    memberCount: 3100, 
    fiscalPolicy: { 
      discountRate: 0.05, 
      donationRate: 0.15, 
      platformFeeRate: 0.01, 
      taxRate: 0.19, 
      currencyCode: 'EUR', 
      symbol: '€' 
    } 
  },
  { id: 'msa-ch', name: 'Chicago-Naperville-Elgin', memberCount: 8900, fiscalPolicy: DEFAULT_POLICY },
  { id: 'msa-dfw', name: 'Dallas-Fort Worth-Arlington', memberCount: 7600, fiscalPolicy: DEFAULT_POLICY },
];

export const MOCK_NONPROFITS: Nonprofit[] = [
  {
    id: 'np-1',
    name: 'Green Earth Initiative',
    description: 'Protecting local forests and promoting urban gardening.',
    category: 'Environment',
    logoUrl: 'https://picsum.photos/seed/env/100/100',
    impactStories: [
      {
        id: 'st-1',
        nonprofitId: 'np-1',
        title: 'Central Park Reforestation',
        description: 'Planting 500 native oak trees using Q1 community funds.',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
        date: '2024-03-15'
      }
    ]
  },
  {
    id: 'np-2',
    name: 'Future Scholars Fund',
    description: 'Providing school supplies and scholarships.',
    category: 'Education',
    logoUrl: 'https://picsum.photos/seed/edu/100/100',
    impactStories: [
      {
        id: 'st-2',
        nonprofitId: 'np-2',
        title: 'Laptops for Learning',
        description: 'Distributed 50 tablets to the local middle school.',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400',
        date: '2024-02-20'
      }
    ]
  }
];

export const MOCK_PROJECTS: CommunityProject[] = [
  {
    id: 'proj-clinic',
    name: 'Mobile Health Clinic',
    description: 'A fully equipped mobile medical unit to serve under-resourced neighborhoods.',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    goalAmount: 50000,
    currentAmount: 12450,
    nonprofitId: 'np-2',
    nonprofitName: 'Future Scholars Fund',
    status: 'ACTIVE'
  },
  {
    id: 'proj-garden',
    name: 'Urban Garden Expansion',
    description: 'Transforming 5 vacant lots into productive community gardens and composting centers.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
    goalAmount: 15000,
    currentAmount: 9800,
    nonprofitId: 'np-1',
    nonprofitName: 'Green Earth Initiative',
    status: 'ACTIVE'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'h-1',
    name: 'Downtown Loft Lease',
    description: 'Modern 1-bedroom loft. Monthly recurring lease payment.',
    price: 1850.00,
    cogs: 1100.00,
    category: 'Housing & Real Estate',
    merchantId: 'm-metro-prop',
    merchantName: 'Metro Property Group',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    latitude: 34.0522,
    longitude: -118.2437,
    regionId: 'msa-la'
  },
  {
    id: 'u-1',
    name: 'Clean Energy Power Plan',
    description: '100% renewable wind and solar energy plan.',
    price: 185.00,
    cogs: 110.00,
    category: 'Utilities & Power',
    merchantId: 'm-cleangrid',
    merchantName: 'CleanGrid Energy',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    latitude: 34.0522,
    longitude: -118.2437,
    regionId: 'msa-la'
  },
  {
    id: 'e-1',
    name: 'Brooklyn Fiber Internet',
    description: 'Ultra-high speed connectivity for residents of the NY MSA.',
    price: 85.00,
    cogs: 40.00,
    category: 'Connectivity',
    merchantId: 'm-ny-fiber',
    merchantName: 'Empire Connect',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    latitude: 40.7128,
    longitude: -74.0060,
    regionId: 'msa-ny'
  },
  {
    id: 'g-1',
    name: 'Organic Produce Box',
    description: 'Weekly selection of seasonal, locally-grown vegetables and fruits.',
    price: 45.00,
    cogs: 25.00,
    category: 'Groceries & Staples',
    merchantId: 'm-farm-fresh',
    merchantName: 'Farm Fresh Collective',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'PRODUCT',
    regionId: 'msa-la'
  },
  {
    id: 'hp-1',
    name: 'Essential Wellness Kit',
    description: 'A curated selection of natural supplements and first-aid essentials.',
    price: 65.00,
    cogs: 35.00,
    category: 'Health & Pharmacy',
    merchantId: 'm-health-hub',
    merchantName: 'Community Health Hub',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'PRODUCT',
    regionId: 'msa-la'
  },
  {
    id: 'w-1',
    name: 'Mindfulness Session',
    description: '1-hour guided meditation and mindfulness workshop.',
    price: 30.00,
    cogs: 10.00,
    category: 'Wellness',
    merchantId: 'm-zen-space',
    merchantName: 'Zen Space Studio',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 't-1',
    name: 'E-Bike Monthly Rental',
    description: 'Unlimited access to our fleet of community electric bikes.',
    price: 120.00,
    cogs: 50.00,
    category: 'Transportation',
    merchantId: 'm-eco-ride',
    merchantName: 'EcoRide Mobility',
    imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77891?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'hm-1',
    name: 'Home Repair Service',
    description: '2-hour professional maintenance or repair visit.',
    price: 150.00,
    cogs: 80.00,
    category: 'Home Maintenance',
    merchantId: 'm-fix-it',
    merchantName: 'Fix-It Local',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'ps-1',
    name: 'Legal Consultation',
    description: 'Initial 1-hour legal advice session for individuals or small businesses.',
    price: 200.00,
    cogs: 60.00,
    category: 'Professional Services',
    merchantId: 'm-justice-partners',
    merchantName: 'Justice Partners',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'edu-1',
    name: 'Coding Bootcamp Access',
    description: 'Full access to our online full-stack development curriculum.',
    price: 499.00,
    cogs: 150.00,
    category: 'Education',
    merchantId: 'm-tech-academy',
    merchantName: 'Tech Academy',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'ins-1',
    name: 'Micro-Business Protection',
    description: 'Comprehensive liability insurance for local artisans and vendors.',
    price: 75.00,
    cogs: 30.00,
    category: 'Insurance',
    merchantId: 'm-safe-guard',
    merchantName: 'SafeGuard Insurance',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'd-1',
    name: 'Farm-to-Table Dinner',
    description: 'A 3-course seasonal meal for two at our community kitchen.',
    price: 80.00,
    cogs: 35.00,
    category: 'Dining',
    merchantId: 'm-harvest-table',
    merchantName: 'The Harvest Table',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'r-1',
    name: 'Artisan Leather Wallet',
    description: 'Handcrafted from sustainably sourced leather.',
    price: 55.00,
    cogs: 20.00,
    category: 'Retail',
    merchantId: 'm-craft-guild',
    merchantName: 'Craft Guild Artisans',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'PRODUCT',
    regionId: 'msa-la'
  },
  {
    id: 'el-1',
    name: 'Refurbished Laptop',
    description: 'High-performance laptop, professionally restored for a second life.',
    price: 350.00,
    cogs: 200.00,
    category: 'Electronics',
    merchantId: 'm-re-tech',
    merchantName: 'Re-Tech Solutions',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'PRODUCT',
    regionId: 'msa-la'
  },
  {
    id: 'ent-1',
    name: 'Local Theater Tickets',
    description: 'Pair of tickets to any performance this season.',
    price: 90.00,
    cogs: 40.00,
    category: 'Entertainment',
    merchantId: 'm-stage-lights',
    merchantName: 'Stage Lights Theater',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807039045349?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'tr-1',
    name: 'Eco-Lodge Weekend Stay',
    description: 'Two nights in a sustainable cabin in the local mountains.',
    price: 300.00,
    cogs: 120.00,
    category: 'Travel',
    merchantId: 'm-nature-stays',
    merchantName: 'Nature Stays',
    imageUrl: 'https://images.unsplash.com/photo-1449156001437-3a145b9bb286?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'pc-1',
    name: 'Organic Pet Food Bundle',
    description: 'Premium, grain-free food and treats for your furry friends.',
    price: 40.00,
    cogs: 18.00,
    category: 'Pet Care',
    merchantId: 'm-paws-claws',
    merchantName: 'Paws & Claws',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'PRODUCT',
    regionId: 'msa-la'
  },
  {
    id: 'cc-1',
    name: 'After-School Program',
    description: 'One month of creative and educational activities for kids.',
    price: 250.00,
    cogs: 100.00,
    category: 'Childcare',
    merchantId: 'm-bright-futures',
    merchantName: 'Bright Futures Center',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'biz-1',
    name: 'Co-working Day Pass',
    description: 'Full access to our professional workspace and amenities.',
    price: 25.00,
    cogs: 5.00,
    category: 'Business',
    merchantId: 'm-hub-work',
    merchantName: 'The Hub Workspaces',
    imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'sp-1',
    name: 'Sports Equipment Set',
    description: 'Complete beginner set for local community leagues.',
    price: 110.00,
    cogs: 60.00,
    category: 'Sports',
    merchantId: 'm-active-life',
    merchantName: 'Active Life Sports',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'PRODUCT',
    regionId: 'msa-la'
  },
  {
    id: 'art-1',
    name: 'Painting Workshop',
    description: 'All materials included for a 3-hour creative session.',
    price: 45.00,
    cogs: 15.00,
    category: 'Art & Creative',
    merchantId: 'm-art-vibe',
    merchantName: 'Art Vibe Studio',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'fit-1',
    name: 'Gym Monthly Pass',
    description: 'Full access to community fitness centers and classes.',
    price: 50.00,
    cogs: 15.00,
    category: 'Fitness',
    merchantId: 'm-power-house',
    merchantName: 'PowerHouse Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    regionId: 'msa-la'
  },
  {
    id: 'gift-1',
    name: 'Community Gift Basket',
    description: 'A collection of best-selling items from local merchants.',
    price: 100.00,
    cogs: 55.00,
    category: 'Gifts',
    merchantId: 'm-gift-box',
    merchantName: 'The Gift Box',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'PRODUCT',
    regionId: 'msa-la'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    date: '2024-03-01T10:00:00Z',
    createdAt: '2024-03-01T10:00:00Z',
    items: [{ product: MOCK_PRODUCTS[0], quantity: 1 }],
    totalMsrp: 1850.00,
    totalDiscount: 185.00,
    subtotal: 1665.00,
    tax: 137.36,
    cardFee: 0,
    internalFee: 8.33,
    totalPaid: 1810.69,
    grossAmount: 1850.00,
    status: 'COMPLETED',
    paymentMethod: 'BALANCE',
    handshakeStatus: 'COMPLETED',
    selectedNonprofitId: 'np-1',
    nonprofitShare: 56.50,
    platformFee: 5.65,
    neighborId: 'neighbor-1',
    neighborName: 'Alex Rivera',
    neighborPublicId: '82A9',
    communityId: 'msa-la',
    accounting: {
      grossProfit: 565.00,
      donationAmount: 56.50,
      platformFee: 5.65,
      merchantNet: 502.85,
      totalCogs: 1100.00,
      feesSaved: 49.95
    }
  },
  {
    id: 'ord-102',
    date: '2024-03-02T14:30:00Z',
    createdAt: '2024-03-02T14:30:00Z',
    items: [{ product: MOCK_PRODUCTS[1], quantity: 1 }],
    totalMsrp: 185.00,
    totalDiscount: 18.50,
    subtotal: 166.50,
    tax: 13.74,
    cardFee: 5.41,
    internalFee: 0,
    totalPaid: 185.65,
    grossAmount: 185.00,
    status: 'COMPLETED',
    paymentMethod: 'CARD',
    handshakeStatus: 'COMPLETED',
    selectedNonprofitId: 'np-2',
    nonprofitShare: 5.65,
    platformFee: 0.57,
    neighborId: 'neighbor-1',
    neighborName: 'Alex Rivera',
    neighborPublicId: '82A9',
    communityId: 'msa-la',
    accounting: {
      grossProfit: 56.50,
      donationAmount: 5.65,
      platformFee: 0.57,
      merchantNet: 50.28,
      totalCogs: 110.00,
      feesSaved: 0
    }
  },
  {
    id: 'ord-big-1',
    date: '2024-03-05T09:00:00Z',
    createdAt: '2024-03-05T09:00:00Z',
    items: [{ product: MOCK_PRODUCTS[0], quantity: 1000 }],
    totalMsrp: 1850000.00,
    totalDiscount: 185000.00,
    subtotal: 1665000.00,
    tax: 137362.50,
    cardFee: 0,
    internalFee: 8325.00,
    totalPaid: 1810687.50,
    grossAmount: 1850000.00,
    status: 'COMPLETED',
    paymentMethod: 'BALANCE',
    handshakeStatus: 'COMPLETED',
    selectedNonprofitId: 'np-1',
    nonprofitShare: 56500.00,
    platformFee: 5650.00,
    neighborId: 'neighbor-1',
    neighborName: 'Alex Rivera',
    neighborPublicId: '82A9',
    communityId: 'msa-la',
    accounting: {
      grossProfit: 565000.00,
      donationAmount: 56500.00,
      platformFee: 5650.00,
      merchantNet: 502850.00,
      totalCogs: 1100000.00,
      feesSaved: 49950.00
    }
  },
  {
    id: 'ord-big-2',
    date: '2024-03-06T11:00:00Z',
    createdAt: '2024-03-06T11:00:00Z',
    items: [{ product: MOCK_PRODUCTS[2], quantity: 15686 }],
    totalMsrp: 1333310.00,
    totalDiscount: 133331.00,
    subtotal: 1199979.00,
    tax: 98998.27,
    cardFee: 0,
    internalFee: 5999.90,
    totalPaid: 1304977.17,
    grossAmount: 1333310.00,
    status: 'COMPLETED',
    paymentMethod: 'BALANCE',
    handshakeStatus: 'COMPLETED',
    selectedNonprofitId: 'np-2',
    nonprofitShare: 70587.00,
    platformFee: 7058.70,
    neighborId: 'neighbor-1',
    neighborName: 'Alex Rivera',
    neighborPublicId: '82A9',
    communityId: 'msa-ny',
    accounting: {
      grossProfit: 705870.00,
      donationAmount: 70587.00,
      platformFee: 7058.70,
      merchantNet: 628224.30,
      totalCogs: 627440.00,
      feesSaved: 35999.37
    }
  },
  {
    id: 'ord-sync-target',
    date: '2024-03-07T15:00:00Z',
    createdAt: '2024-03-07T15:00:00Z',
    items: [{ product: MOCK_PRODUCTS[3], quantity: 3000 }],
    totalMsrp: 135000.00,
    totalDiscount: 13500.00,
    subtotal: 133354.51, 
    tax: 11001.75,
    cardFee: 0,
    internalFee: 666.77,
    totalPaid: 145023.03,
    grossAmount: 135000.00,
    status: 'COMPLETED',
    paymentMethod: 'BALANCE',
    handshakeStatus: 'COMPLETED',
    selectedNonprofitId: 'np-1',
    nonprofitShare: 6000.00,
    platformFee: 600.00,
    neighborId: 'neighbor-1',
    neighborName: 'Alex Rivera',
    neighborPublicId: '82A9',
    communityId: 'msa-la',
    accounting: {
      grossProfit: 60000.00,
      donationAmount: 6000.00,
      platformFee: 600.00,
      merchantNet: 53400.00,
      totalCogs: 75000.00,
      feesSaved: 4000.64
    }
  }
];

export const MOCK_USERS: any[] = [
  {
    id: 'neighbor-1',
    email: 'member@goodcircles.org',
    password: 'password123',
    name: 'Alex Rivera',
    role: 'NEIGHBOR',
    status: 'ACTIVE',
    impactScore: 125,
    impactPoints: 450,
    communityId: 'msa-la',
    createdAt: '2024-01-10T10:00:00Z',
    platformCredits: 25.00,
    discountMode: 'PRICE_REDUCTION'
  },
  {
    id: 'merchant-1',
    email: 'merchant@goodcircles.org',
    password: 'password123',
    name: 'Sarah Chen',
    role: 'MERCHANT',
    status: 'ACTIVE',
    merchantId: 'm-metro-prop',
    communityId: 'msa-la',
    createdAt: '2024-01-12T14:30:00Z',
    platformCredits: 0,
    discountMode: 'PRICE_REDUCTION'
  },
  {
    id: 'nonprofit-1',
    email: 'impact@goodcircles.org',
    password: 'password123',
    name: 'David Miller',
    role: 'NONPROFIT',
    status: 'ACTIVE',
    nonprofitId: 'np-1',
    communityId: 'msa-la',
    createdAt: '2024-01-15T09:00:00Z',
    platformCredits: 0,
    discountMode: 'PRICE_REDUCTION'
  }
];
