
export type UserRole = 'NEIGHBOR' | 'MERCHANT' | 'NONPROFIT' | 'PLATFORM' | 'CDFI';
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
export type DisputeStatus = 'NONE' | 'OPEN' | 'RESOLVED' | 'REJECTED';
export type ProductType = 'PRODUCT' | 'SERVICE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAYMENT_PENDING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// Added missing properties to User interface
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  status: AccountStatus;
  imageUrl?: string;
  communityId?: string;
  merchantId?: string;
  nonprofitId?: string;
  cdfiId?: string;
  electedNonprofitId?: string;
  createdAt: string;
  businessWebsite?: string;
  taxId?: string;
  impactScore?: number;
  businessType?: string;
  referralCount?: number;
  impactPoints?: number;
  verificationPipeline?: OnboardingStep[];
  wallet?: Wallet;
  kybScore?: number;
  kybNote?: string;
  referralCode?: string;
  platformCredits?: number;
  discountMode?: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS';
}

// Added missing properties to Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; 
  cogs: number; // Product-specific COGS (mandatory)
  category: string;
  merchantId: string;
  merchantName: string;
  imageUrl: string;
  type: ProductType;
  regionId?: string;
  latitude?: number;
  longitude?: number;
  cogsAuditStatus?: 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED';
  msrpAuditStatus?: 'VERIFIED' | 'FLAGGED';
}

export interface Booking {
  id: string;
  listingId: string;
  consumerId: string;
  merchantId: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  status: BookingStatus;
  transactionId?: string;
  createdAt: string;
  listingName?: string;
  consumerName?: string;
}

export interface MerchantAvailability {
  id: string;
  merchantId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Added internalFee to track GCLA maintenance costs
export interface Order {
  id: string;
  date: string;
  createdAt: string;
  items: CartItem[];
  totalMsrp: number;
  totalDiscount: number;
  subtotal: number;
  tax: number;
  cardFee: number;
  internalFee: number; 
  totalPaid: number;
  grossAmount: number;
  status: string;
  paymentMethod: 'CASH' | 'CARD' | 'BALANCE';
  handshakeStatus?: 'PENDING' | 'COMPLETED'; 
  impactToken?: string; 
  selectedNonprofitId: string;
  nonprofitShare: number;
  nonprofit?: { orgName: string };
  platformFee: number;
  isDiscountWaived?: boolean;
  targetProjectId?: string;
  appliedCredits?: number;
  discountMode?: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS';
  accounting: OrderAccounting;
  neighborId: string; 
  neighborName: string;
  communityId: string;
  disputeStatus?: DisputeStatus;
  disputeReason?: string;
  batchId?: string;
  neighborPublicId?: string;
}

export interface OrderAccounting {
  grossProfit: number;
  donationAmount: number; 
  platformFee: number; 
  merchantNet: number;
  totalCogs: number;
  feesSaved: number;
  appliedCredits?: number;
  waivedDiscountAmount?: number;
}

// Added categoryOverrides to FiscalPolicy
export interface FiscalPolicy {
  discountRate: number;
  donationRate: number;
  platformFeeRate: number;
  taxRate: number;
  currencyCode: string;
  symbol: string;
  categoryOverrides?: Record<string, CategoryOverride>;
}

export interface CategoryOverride {
  discountRate?: number;
  donationRate?: number;
  platformFeeRate?: number;
}

// Added activeProposals to Community
export interface Community {
  id: string;
  name: string;
  memberCount: number;
  fiscalPolicy: FiscalPolicy;
  activeProposals?: GovernanceProposal[];
}

// Added missing macro-economic properties to TreasuryStats
export interface TreasuryStats {
  totalInternalVolume: number;
  totalDonations: number;
  totalPlatformFees: number;
  totalFeesSaved: number;
  totalOrders: number;
  uniqueNeighbors: number;
  totalExternalInflow: number;
  totalExternalOutflow: number;
  moneyMultiplier: number;
  retentionRate: number;
  circularVelocity: number;
}

export interface PayoutBatch {
  id: string;
  entityId: string;
  entityName: string;
  startDate: string;
  endDate: string;
  orderIds: string[];
  totalGross: number;
  totalImpact: number;
  totalPlatformFees: number;
  netSettlement: number;
  status: 'PENDING' | 'SETTLED';
}

export interface CommunityInitiative {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  supporterCount: number;
  nonprofitId: string;
}

// New exported interfaces required by other components
export interface Nonprofit {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  impactStories?: ImpactStory[];
  wishlistProductIds?: string[];
  merchantAffiliationId?: string;
}

export interface ImpactStory {
  id: string;
  nonprofitId: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

export interface CommunityProject {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  nonprofitId: string;
  nonprofitName: string;
  status: 'ACTIVE' | 'COMPLETED';
  votes?: number;
}

export interface Review {
  id: string;
  productId: string;
  neighborId: string;
  rating: number;
  text: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DevNote {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'STRATEGY' | 'COMPLIANCE' | 'INFRASTRUCTURE' | 'UX';
}

export interface OnboardingStep {
  id: string;
  label: string;
  status: 'PENDING' | 'LOCKED' | 'COMPLETED';
  note: string;
}

export interface WaivedFundLog {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  amount: number;
  targetProjectId?: string;
  targetProjectName?: string;
  timestamp: string;
}

export interface GovernanceProposal {
  id: string;
  type: 'RATE_ADJUSTMENT' | 'STREET_INITIATIVE' | 'PROJECT_PRIORITY';
  title: string;
  description: string;
  proposerId: string;
  proposerName: string;
  stakeAmount: number;
  votesFor: number;
  votesAgainst: number;
  status: 'VOTING' | 'PASSED' | 'REJECTED';
  expiryDate: string;
  consensusThreshold: number;
  votes?: ConsensusVote[];
}

export interface ConsensusVote {
  userId: string;
  weight: number;
  vote: 'FOR' | 'AGAINST';
  timestamp: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  feeCharged: number;
  currency: string;
}

export interface TreasuryRecommendation {
  id: string;
  type: 'RATE_ADJUSTMENT' | 'PROJECT_INJECTION' | 'NODE_RESERVE';
  title: string;
  description: string;
  impactForecast: string;
  confidence: number;
  isApplied: boolean;
}

export interface SupporterCircle {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  pooledSavings: number;
  goalAmount: number;
  targetProjectId: string;
  targetProjectName: string;
  description: string;
  messages?: CircleMessage[];
}

export interface CircleMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'COORDINATION' | 'MILESTONE';
}

export interface GeospatialNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'CLUSTER' | 'MERCHANT' | 'NONPROFIT';
  impactVolume: number;
  retentionRate: number;
}

export interface MerchantConsortium {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  combinedVolume: number;
  targetCOGS_Reduction: number;
  description: string;
}

export interface TaxAlphaMetrics {
  merchantFeeSavings: number;
  marketingSavings: number;
  taxDeductions: number;
}

export interface NettingStatus {
  isActive: boolean;
  m2m_transaction_count_30d: number;
  unique_merchant_pairs_30d: number;
  simulated_monthly_savings: number;
  trigger1_met: boolean;
  trigger2_met: boolean;
  nextCheckDate: string;
}

export interface NettingBatch {
  id: string;
  batchDate: string;
  grossObligations: number;
  netSettled: number;
  savings: number;
  status: 'SIMULATED' | 'EXECUTED';
  merchantCount: number;
  cycleCount: number;
}

export interface ComplianceData {
  merchantId: string;
  year: number;
  totalGrossSettlement: number;
  totalNetSettlement: number;
  totalSavings: number;
  transactionCount: number;
  batchIds: string[];
}
