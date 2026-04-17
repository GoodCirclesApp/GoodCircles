
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
  category: 'CORE' | 'ECONOMY' | 'SECURITY' | 'GOVERNANCE' | 'MERCHANT' | 'NONPROFIT' | 'SHOPPING';
  question: string;
  answer: string;
}

const FAQ_CORE: FAQItem[] = [
  {
    id: 'core-1',
    category: 'CORE',
    question: 'What is Good Circles?',
    answer: 'Good Circles is a community marketplace where you shop with local businesses and automatically fund a nonprofit you care about — all at the same time. Every purchase you make gives you a 10% discount, supports a local cause, and keeps money inside your community instead of sending it to a distant corporation.'
  },
  {
    id: 'core-2',
    category: 'CORE',
    question: 'What is the 10/10/1 model?',
    answer: 'It\'s our simple three-part rule. (1) You get a 10% discount on every purchase. (2) The merchant donates 10% of their profit to your chosen nonprofit. (3) A 1% fee keeps the platform running. For example: buy a $100 service, pay $90, and roughly $7.50 flows to your chosen nonprofit. No extra steps. It happens automatically.'
  },
  {
    id: 'core-3',
    category: 'CORE',
    question: 'Who can use Good Circles?',
    answer: 'Anyone. Neighbors (shoppers) sign up to browse, buy, and designate a nonprofit. Merchants sign up to list products and services. Nonprofits sign up to receive community funding. All three groups work together to create a self-sustaining local economy.'
  },
  {
    id: 'core-4',
    category: 'CORE',
    question: 'What is a "node"?',
    answer: 'A node is a geographic community — like a city or metro area. Good Circles is launching first in Central Mississippi (the Jackson metro area). Later, North Mississippi (Oxford/Tupelo area) and South Mississippi (Hattiesburg/Biloxi area) will each become their own nodes. Each node sets its own rates and elects its own funded nonprofits.'
  },
  {
    id: 'core-5',
    category: 'CORE',
    question: 'How is Good Circles different from Amazon or Walmart?',
    answer: 'When you shop on Amazon, your money leaves your community. When you shop on Good Circles, your money stays. Local merchants keep their profits. A local nonprofit gets funded. You get a discount. Amazon keeps none of it — the whole cycle benefits the place where you live.'
  },
  {
    id: 'core-6',
    category: 'CORE',
    question: 'How is the nonprofit donation calculated?',
    answer: 'The donation comes from the merchant\'s net profit — not from your pocket. Net profit = sale price minus the cost of goods. The merchant gives 10% of that profit to your elected nonprofit. For example: a $100 service with $40 in costs has $60 net profit. The nonprofit receives $6 from that sale, automatically.'
  },
];

const FAQ_ECONOMY: FAQItem[] = [
  {
    id: 'econ-1',
    category: 'ECONOMY',
    question: 'What is the Circle Account (GCLA)?',
    answer: 'Your Good Circles Ledger Account (GCLA) is a digital wallet inside the platform. You add money to it like a prepaid card. When you pay with your GCLA balance, there\'s no credit card processing fee — saving you (and the merchant) an extra 3%. It\'s faster, cheaper, and keeps your money in the community.'
  },
  {
    id: 'econ-2',
    category: 'ECONOMY',
    question: 'How much does the GCLA actually save me?',
    answer: 'Two ways. First, you get the 10% Good Circles discount on every purchase. Second, paying with your GCLA wallet instead of a card avoids a 3% card fee — that savings gets split between you and the merchant. Over a year of everyday spending, this adds up fast. Our AI Personal Shopper can show you the exact numbers for your habits.'
  },
  {
    id: 'econ-3',
    category: 'ECONOMY',
    question: 'How do I add money to my Circle Account?',
    answer: 'You can fund your Circle Account using a debit card, credit card, or bank transfer. The funds show up as a balance in your wallet. You can then use that balance to pay any merchant on the platform.'
  },
  {
    id: 'econ-4',
    category: 'ECONOMY',
    question: 'What are platform credits?',
    answer: 'Credits are bonus funds you earn when a merchant chooses "Platform Credits" mode instead of giving you a direct price discount. You receive the credit in your account and can use it on any future purchase. Credits never expire and never leave the community economy.'
  },
  {
    id: 'econ-5',
    category: 'ECONOMY',
    question: 'How do refunds work?',
    answer: 'If you need a refund, the money goes back to your Circle Account right away — no waiting, no fee. We call this the Recapture Protocol. It keeps the money inside the local economy so you can use it again at another local merchant immediately.'
  },
  {
    id: 'econ-6',
    category: 'ECONOMY',
    question: 'Is there a fee to withdraw money from my Circle Account to my bank?',
    answer: 'Yes — there\'s a 3.5% withdrawal fee. This fee reflects the cost of moving money out of the community network. Most members choose to keep their balance inside the platform and spend it locally, where it keeps generating discounts and nonprofit donations.'
  },
  {
    id: 'econ-7',
    category: 'ECONOMY',
    question: 'What is "Tax Alpha" for merchants?',
    answer: 'Tax Alpha is the financial advantage local merchants get by joining Good Circles. Instead of paying 3% to a credit card company (which is not deductible), merchants route a similar amount to a nonprofit — which IS tax-deductible. They save on fees, save on taxes, and build community goodwill. Every dollar earned internally is worth more than a dollar earned externally.'
  },
];

const FAQ_SHOPPING: FAQItem[] = [
  {
    id: 'shop-1',
    category: 'SHOPPING',
    question: 'How does the search tool work?',
    answer: 'Type anything into the search bar — a product, a service, a store name, or even a category like "auto repair." The search shows local Good Circles merchant results first. If no local merchant carries it, external affiliate products (from retailers like Amazon) appear below, clearly labeled as external. Local results always come first.'
  },
  {
    id: 'shop-2',
    category: 'SHOPPING',
    question: 'What is an affiliate product?',
    answer: 'An affiliate product is something sold by an outside retailer (like Amazon or Etsy) that we link to when no local merchant carries it. We add a special tracking tag to the link. If you buy through that link, the retailer pays Good Circles a small commission — usually 3–5% of the sale price. You pay the same price you would anywhere else.'
  },
  {
    id: 'shop-3',
    category: 'SHOPPING',
    question: 'Does buying an affiliate product still help my nonprofit?',
    answer: 'Yes — just less directly. Half of any commission Good Circles earns from affiliate sales goes into a pool that benefits nonprofits on the platform. The other half helps pay for platform operations. It\'s not the same impact as buying from a local merchant, but it\'s still better than buying with no community benefit at all.'
  },
  {
    id: 'shop-4',
    category: 'SHOPPING',
    question: 'Why should I buy local instead of external?',
    answer: 'When you buy from a local Good Circles merchant, you get a guaranteed 10% discount, your elected nonprofit gets a donation, the merchant keeps their profit in the community, and your money stays in Central Mississippi. External affiliate products don\'t give you the discount and only generate a small commission. Local is always the better deal — for you and your community.'
  },
  {
    id: 'shop-5',
    category: 'SHOPPING',
    question: 'Can I use a keyboard shortcut to open search?',
    answer: 'Yes. Press Cmd+K (Mac) or Ctrl+K (Windows) anywhere in the app to open the search bar instantly. You can also press Escape to close it.'
  },
  {
    id: 'shop-6',
    category: 'SHOPPING',
    question: 'Can I filter search results by price or category?',
    answer: 'Yes. Click the slider icon next to the search bar to open filters. You can choose a product category (like Dining or Auto) and set a minimum and maximum price. Hit Apply and your results update right away.'
  },
];

const FAQ_MERCHANT: FAQItem[] = [
  {
    id: 'merch-1',
    category: 'MERCHANT',
    question: 'How do I join Good Circles as a merchant?',
    answer: 'Sign up with your business name and email, then list your products or services. Set your price and your cost of goods (COGS). Our system calculates the 10/10/1 split automatically. You can start accepting customers the same day you list.'
  },
  {
    id: 'merch-2',
    category: 'MERCHANT',
    question: 'Do merchants have to lower their prices?',
    answer: 'No. Your listed price is your full price (MSRP). The 10% member discount comes out of the transaction automatically — you don\'t manually cut your price. The discount and the nonprofit donation both come from the profit side of the sale, not from your cost structure.'
  },
  {
    id: 'merch-3',
    category: 'MERCHANT',
    question: 'How does booking work for service businesses?',
    answer: 'Service merchants can enable bookings for any listing. Customers pick a date and time, and the booking appears in your merchant dashboard. The system sends reminders automatically — to both you and the customer — 48 hours and 2 hours before the appointment.'
  },
  {
    id: 'merch-4',
    category: 'MERCHANT',
    question: 'What is a merchant cooperative?',
    answer: 'A cooperative is a group of merchants who pool their buying power together. By joining a purchasing cooperative, small businesses can negotiate wholesale prices that are normally only available to large chains. This lowers your cost of goods and increases your profit margin — which in turn increases the amount donated to local nonprofits.'
  },
  {
    id: 'merch-5',
    category: 'MERCHANT',
    question: 'What is merchant netting?',
    answer: 'When merchants buy from each other on the platform, they build up small debts. Instead of settling every transaction individually, the netting system adds them all up and settles the difference at the end of a cycle — one net payment instead of dozens of small ones. This cuts transaction fees and keeps more money inside the network.'
  },
  {
    id: 'merch-6',
    category: 'MERCHANT',
    question: 'What is the supply chain tool?',
    answer: 'The supply chain tool lets you find other Good Circles merchants who supply what you need — ingredients, materials, equipment. Sourcing from within the network keeps your spending inside the community and qualifies for the same discounts and profit-sharing. The AI tool also suggests lower-cost sources to help you reduce your COGS.'
  },
  {
    id: 'merch-7',
    category: 'MERCHANT',
    question: 'How does in-person (QR) checkout work?',
    answer: 'At your physical location, a customer opens their Good Circles app and shows their QR code. You scan it — we call this the "Optical Handshake" — and the payment processes instantly from their Circle Account to yours. No card reader needed. The 10/10/1 split happens in real time.'
  },
];

const FAQ_NONPROFIT: FAQItem[] = [
  {
    id: 'np-faq-1',
    category: 'NONPROFIT',
    question: 'How does my nonprofit receive funding through Good Circles?',
    answer: 'When a community member (neighbor) designates your organization as their elected nonprofit, a portion of every purchase they make at any Good Circles merchant flows to you — automatically, with no extra steps. The more members who elect your nonprofit, and the more they shop, the more funding you receive.'
  },
  {
    id: 'np-faq-2',
    category: 'NONPROFIT',
    question: 'What is the Donor Management System (DMS)?',
    answer: 'The DMS is your nonprofit\'s command center inside Good Circles. It shows you how many supporters you have, how much total funding you\'ve received, a full donor list (with privacy controls respected), and tools to export that data or connect it to your existing CRM software.'
  },
  {
    id: 'np-faq-3',
    category: 'NONPROFIT',
    question: 'What are impact updates?',
    answer: 'Impact updates are short posts your nonprofit can publish — like social media updates — that show donors how their contributions are being used. Supporters see these updates in their account feed. A strong update with a real story builds trust and encourages more people to elect your organization.'
  },
  {
    id: 'np-faq-4',
    category: 'NONPROFIT',
    question: 'What are donor milestones?',
    answer: 'Donor milestones are automatic thank-you emails sent when a supporter hits a giving milestone — their first donation, $100 lifetime, $500 lifetime, and $1,000 lifetime. The system handles this for you with no setup required. Each email reminds the donor of their cumulative impact.'
  },
  {
    id: 'np-faq-5',
    category: 'NONPROFIT',
    question: 'Can I export my donor list?',
    answer: 'Yes. From your DMS dashboard, you can export your full donor list as a CSV or JSON file for any date range. Donor names and emails are included only if the donor has enabled sharing in their privacy settings. You can download this file for use in any email or fundraising platform.'
  },
  {
    id: 'np-faq-6',
    category: 'NONPROFIT',
    question: 'What is a CRM webhook?',
    answer: 'A webhook is a way for Good Circles to automatically send data to your existing software — like Salesforce, HubSpot, or any custom tool — the moment something happens. For example, when a new donation comes in, a webhook can instantly create or update a record in your donor database. You set it up once from your DMS settings.'
  },
  {
    id: 'np-faq-7',
    category: 'NONPROFIT',
    question: 'What can a nonprofit see about its donors?',
    answer: 'By default, nonprofits can see a donor\'s first name and total giving amount. Email addresses are hidden unless the donor chooses to share them. Donors control their own privacy settings in their profile. This design protects supporter privacy while still giving your team the data you need to build relationships.'
  },
  {
    id: 'np-faq-8',
    category: 'NONPROFIT',
    question: 'Can a nonprofit also sell products or services?',
    answer: 'Yes. Nonprofits can set up as a merchant and list their own products or services in the marketplace. Revenue from those sales follows the same 10/10/1 model — the nonprofit still benefits from the profit-sharing while also keeping the sale proceeds from their own listings.'
  },
];

const FAQ_SECURITY: FAQItem[] = [
  {
    id: 'sec-1',
    category: 'SECURITY',
    question: 'How is my personal information protected?',
    answer: 'Your transaction history is private by default. On the public ledger, you appear as an anonymous member ID — not your name. Only you and platform admins can connect your identity to your purchase history. We never sell your personal data to third parties.'
  },
  {
    id: 'sec-2',
    category: 'SECURITY',
    question: 'What can nonprofits see about me?',
    answer: 'By default, nonprofits can see your first name and total donation amount. Your email is hidden unless you turn on sharing in your privacy settings. You can update these settings any time from your account profile under "Donor Privacy."'
  },
  {
    id: 'sec-3',
    category: 'SECURITY',
    question: 'How does Good Circles prevent price gouging?',
    answer: 'Our Price Sentinel tool checks every listing against normal market prices. If a merchant inflates their price to hide the 10% discount, the system flags the listing for review. Listings that are significantly above market rates can be paused until reviewed by platform staff.'
  },
  {
    id: 'sec-4',
    category: 'SECURITY',
    question: 'Is my payment information safe?',
    answer: 'Yes. Card payments are processed by Stripe, which is used by millions of businesses worldwide and meets the highest payment security standards (PCI DSS Level 1). Good Circles never sees or stores your card number directly. Circle Account (GCLA) payments are processed internally with bank-grade encryption.'
  },
];

const FAQ_GOVERNANCE: FAQItem[] = [
  {
    id: 'gov-1',
    category: 'GOVERNANCE',
    question: 'Can the community change the 10/10/1 rates?',
    answer: 'Yes. Good Circles is built on community governance. Any member can submit a rate adjustment proposal — for example, to change the nonprofit share from 10% to 12% in your node. If the proposal gets enough support (usually 66% of active voters), the new rate takes effect in your community. Other nodes are not affected.'
  },
  {
    id: 'gov-2',
    category: 'GOVERNANCE',
    question: 'How do I vote on governance proposals?',
    answer: 'Active members earn voting rights automatically by shopping on the platform. When a proposal is open, you\'ll see it in your account. You can vote yes, no, or abstain. Every vote is recorded on the ledger so the process is transparent and tamper-proof.'
  },
  {
    id: 'gov-3',
    category: 'GOVERNANCE',
    question: 'What is required to submit a proposal?',
    answer: 'You must be an active member with enough Impact Points (earned through purchases). When you submit a proposal, a small stake of your Impact Points is held until the vote closes. If your proposal gets at least 20% support, your stake is returned in full — this prevents spam proposals while keeping governance open to real members.'
  },
];

export const INITIAL_FAQ: FAQItem[] = [
  ...FAQ_CORE,
  ...FAQ_SHOPPING,
  ...FAQ_ECONOMY,
  ...FAQ_MERCHANT,
  ...FAQ_NONPROFIT,
  ...FAQ_SECURITY,
  ...FAQ_GOVERNANCE,
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
  { id: 'msa-cjx', name: 'Central Mississippi — Jackson Metro', memberCount: 1847, fiscalPolicy: { ...DEFAULT_POLICY, taxRate: 0.07 } },
  { id: 'msa-njx', name: 'North Mississippi — Oxford/Tupelo', memberCount: 0, fiscalPolicy: { ...DEFAULT_POLICY, taxRate: 0.07 } },
  { id: 'msa-sjx', name: 'South Mississippi — Hattiesburg/Biloxi', memberCount: 0, fiscalPolicy: { ...DEFAULT_POLICY, taxRate: 0.07 } },
];

export const MOCK_NONPROFITS: Nonprofit[] = [
  {
    id: 'np-1',
    name: 'Mississippi Food Network',
    description: "Mississippi's largest food bank, serving 43,000 people per week across all 82 counties through 500+ partner agencies.",
    category: 'Food Security',
    logoUrl: 'https://picsum.photos/seed/msfoodnet/100/100',
    impactStories: [
      {
        id: 'st-1',
        nonprofitId: 'np-1',
        title: 'Summer Feeding Program Expansion',
        description: 'Good Circles funding helped us add 3 new summer feeding sites in Hinds County, reaching 420 additional children.',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400',
        date: '2025-07-10'
      }
    ]
  },
  {
    id: 'np-2',
    name: 'Boys & Girls Club of Central Mississippi',
    description: 'Providing after-school programs, summer camps, and youth development for children in Hinds, Rankin, and Madison counties.',
    category: 'Youth Development',
    logoUrl: 'https://picsum.photos/seed/bgcms/100/100',
    impactStories: [
      {
        id: 'st-2',
        nonprofitId: 'np-2',
        title: 'STEM Lab Renovation — Brandon Club',
        description: 'Community shopping dollars funded new computers and robotics kits for 85 Brandon-area youth.',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400',
        date: '2025-09-05'
      }
    ]
  },
  {
    id: 'np-3',
    name: 'Habitat for Humanity Mississippi Capital Area',
    description: 'Building and renovating affordable homes alongside low-income families in the Jackson metro area.',
    category: 'Housing',
    logoUrl: 'https://picsum.photos/seed/habitatms/100/100',
    impactStories: [
      {
        id: 'st-3',
        nonprofitId: 'np-3',
        title: 'West Jackson Rehab Project',
        description: 'Four homes fully renovated in West Jackson using Good Circles neighborhood funding.',
        imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=400',
        date: '2025-11-01'
      }
    ]
  }
];

export const MOCK_PROJECTS: CommunityProject[] = [
  {
    id: 'proj-pantry',
    name: 'West Jackson Community Pantry',
    description: 'Establishing a permanent walk-in food pantry at Westside Community Center to serve 800 families per month in Hinds County.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    goalAmount: 35000,
    currentAmount: 11240,
    nonprofitId: 'np-1',
    nonprofitName: 'Mississippi Food Network',
    status: 'ACTIVE'
  },
  {
    id: 'proj-stem',
    name: 'Rankin County STEM Expansion',
    description: 'Equipping three Boys & Girls Club sites in Brandon, Pearl, and Flowood with robotics kits, 3D printers, and coding workstations.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    goalAmount: 22000,
    currentAmount: 8750,
    nonprofitId: 'np-2',
    nonprofitName: 'Boys & Girls Club of Central Mississippi',
    status: 'ACTIVE'
  },
  {
    id: 'proj-homes',
    name: 'Madison County First-Time Homebuyer Fund',
    description: 'Down-payment assistance for five low-income first-time homebuyers in Canton and Madison through Habitat for Humanity.',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800',
    goalAmount: 50000,
    currentAmount: 19600,
    nonprofitId: 'np-3',
    nonprofitName: 'Habitat for Humanity Mississippi Capital Area',
    status: 'ACTIVE'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'h-1',
    name: 'Jackson Midtown Rental',
    description: 'Updated 2-bedroom home in Midtown Jackson. Monthly lease.',
    price: 1150.00,
    cogs: 700.00,
    category: 'Housing & Real Estate',
    merchantId: 'm-capital-prop',
    merchantName: 'Capital City Properties',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    latitude: 32.2988,
    longitude: -90.1848,
    regionId: 'msa-cjx'
  },
  {
    id: 'u-1',
    name: 'Entergy MS Monthly Plan',
    description: 'Standard residential electric service through Entergy Mississippi.',
    price: 145.00,
    cogs: 95.00,
    category: 'Utilities & Power',
    merchantId: 'm-entergy',
    merchantName: 'Entergy Mississippi',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    latitude: 32.2988,
    longitude: -90.1848,
    regionId: 'msa-cjx'
  },
  {
    id: 'e-1',
    name: 'C Spire Home Internet',
    description: 'High-speed fiber internet from Mississippi-based C Spire. Up to 1 Gbps.',
    price: 75.00,
    cogs: 35.00,
    category: 'Connectivity',
    merchantId: 'm-cspire',
    merchantName: 'C Spire',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400&h=300',
    type: 'SERVICE',
    latitude: 32.2988,
    longitude: -90.1848,
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    regionId: 'msa-cjx'
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
    neighborName: 'Marcus Johnson',
    neighborPublicId: '82A9',
    communityId: 'msa-cjx',
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
    neighborName: 'Marcus Johnson',
    neighborPublicId: '82A9',
    communityId: 'msa-cjx',
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
    neighborName: 'Marcus Johnson',
    neighborPublicId: '82A9',
    communityId: 'msa-cjx',
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
    neighborName: 'Marcus Johnson',
    neighborPublicId: '82A9',
    communityId: 'msa-cjx',
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
    neighborName: 'Marcus Johnson',
    neighborPublicId: '82A9',
    communityId: 'msa-cjx',
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
    name: 'Marcus Johnson',
    role: 'NEIGHBOR',
    status: 'ACTIVE',
    impactScore: 125,
    impactPoints: 450,
    communityId: 'msa-cjx',
    createdAt: '2026-01-10T10:00:00Z',
    platformCredits: 25.00,
    discountMode: 'PRICE_REDUCTION'
  },
  {
    id: 'merchant-1',
    email: 'merchant@goodcircles.org',
    password: 'password123',
    name: 'Tamara Williams',
    role: 'MERCHANT',
    status: 'ACTIVE',
    merchantId: 'm-walkers',
    communityId: 'msa-cjx',
    createdAt: '2026-01-12T14:30:00Z',
    platformCredits: 0,
    discountMode: 'PRICE_REDUCTION'
  },
  {
    id: 'nonprofit-1',
    email: 'impact@goodcircles.org',
    password: 'password123',
    name: 'Darius Davis',
    role: 'NONPROFIT',
    status: 'ACTIVE',
    nonprofitId: 'np-1',
    communityId: 'msa-cjx',
    createdAt: '2026-01-15T09:00:00Z',
    platformCredits: 0,
    discountMode: 'PRICE_REDUCTION'
  }
];
