-- CreateEnum
CREATE TYPE "SourcePlatform" AS ENUM ('SHOPIFY', 'ETSY', 'AMAZON');

-- CreateEnum
CREATE TYPE "CatalogTier" AS ENUM ('STARTER', 'GROWTH', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('QUEUED', 'FETCHING', 'TRANSFORMING', 'REVIEW_READY', 'PUBLISHING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CatalogProductStatus" AS ENUM ('PENDING', 'AI_PROCESSED', 'ACCEPTED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'REFUND_REQUESTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CatalogErrorType" AS ENUM ('CONNECTION_ERROR', 'RATE_LIMIT_ERROR', 'API_ERROR', 'PARSING_ERROR', 'TRANSFORMATION_ERROR', 'VALIDATION_ERROR', 'UNKNOWN_ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'NEIGHBOR',
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discountMode" TEXT NOT NULL DEFAULT 'PRICE_REDUCTION',
    "electedNonprofitId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantReferral" (
    "id" TEXT NOT NULL,
    "referringNonprofitId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "referralCodeUsed" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "referredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralBonusTier" (
    "id" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "nonprofitFundingThreshold" DECIMAL(65,30) NOT NULL,
    "bonusAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralBonusTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralBonusPayout" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "nonprofitFundingAtPayout" DECIMAL(65,30) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralBonusPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "entryType" TEXT NOT NULL DEFAULT 'CREDIT',
    "source" TEXT NOT NULL,
    "transactionId" TEXT,
    "redeemedTransactionId" TEXT,
    "transferId" TEXT,
    "circulationCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "taxId" TEXT,
    "physicalAddress" TEXT,
    "physicalCity" TEXT,
    "physicalState" TEXT,
    "physicalZip" TEXT,
    "censusTractId" TEXT,
    "isQualifiedInvestmentArea" BOOLEAN NOT NULL DEFAULT false,
    "censusTractCheckedAt" TIMESTAMP(3),
    "agreementAcceptedAt" TIMESTAMP(3),
    "agreementVersion" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "onboardedAt" TIMESTAMP(3),
    "stripeAccountId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "regionId" TEXT,
    "creditAcceptance" TEXT NOT NULL DEFAULT 'NONE',
    "maxCreditPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCoopMember" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "optedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "optedOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataCoopMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketInsight" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "regionId" TEXT,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "statisticalConfidence" DOUBLE PRECISION NOT NULL,
    "memberCountAtGeneration" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCoopActivation" (
    "id" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "regionId" TEXT,
    "optedInMemberCount" INTEGER NOT NULL,
    "thresholdRequired" INTEGER NOT NULL,
    "thresholdMet" BOOLEAN NOT NULL,
    "insightsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataCoopActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnonymizedTransaction" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "regionId" TEXT,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "nonprofitShare" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "merchantNet" DOUBLE PRECISION NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymizedTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCoopAccess" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "regionId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataCoopAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasingGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coopType" TEXT NOT NULL,
    "category" TEXT,
    "regionId" TEXT,
    "minMembers" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MONITORING',
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchasingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupDeal" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "productDescription" TEXT NOT NULL,
    "unitPriceRetail" DECIMAL(65,30) NOT NULL,
    "unitPriceGroup" DECIMAL(65,30) NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "currentCommitments" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupCommitment" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "committedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupCommitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoopActivationTracking" (
    "id" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coopType" TEXT NOT NULL,
    "category" TEXT,
    "regionId" TEXT,
    "merchantCount" INTEGER NOT NULL,
    "thresholdRequired" INTEGER NOT NULL,
    "thresholdMet" BOOLEAN NOT NULL,
    "progressPct" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoopActivationTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransfer" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nonprofit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "ein" TEXT NOT NULL,
    "missionStatement" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "stripeAccountId" TEXT,
    "referralCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nonprofit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductService" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "cogs" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isClearance" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "upc" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "neighborId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "productServiceId" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "grossAmount" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "nonprofitShare" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "merchantNet" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL,
    "discountWaived" BOOLEAN NOT NULL DEFAULT false,
    "waivedToInitiativeId" TEXT,
    "waivedToFundId" TEXT,
    "discountMode" TEXT NOT NULL DEFAULT 'PRICE_REDUCTION',
    "appliedCredits" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "consumerState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "transactionId" TEXT,
    "entryType" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAccount" (
    "id" TEXT NOT NULL DEFAULT 'gc-platform-treasury',
    "balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformLedgerEntry" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "balanceAfter" DECIMAL(18,4) NOT NULL,
    "transactionId" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantObligation" (
    "id" TEXT NOT NULL,
    "debtorMerchantId" TEXT NOT NULL,
    "creditorMerchantId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "transactionId" TEXT NOT NULL,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NettingBatch" (
    "id" TEXT NOT NULL,
    "batchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grossObligations" DECIMAL(65,30) NOT NULL,
    "netSettled" DECIMAL(65,30) NOT NULL,
    "savings" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "merchantCount" INTEGER NOT NULL,
    "cycleCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NettingBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NettingActivation" (
    "id" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "m2mTransactionCount30d" INTEGER NOT NULL,
    "uniqueMerchantPairs30d" INTEGER NOT NULL,
    "simulatedMonthlySavings" DECIMAL(65,30) NOT NULL,
    "trigger1Met" BOOLEAN NOT NULL,
    "trigger2Met" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NettingActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityInitiative" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fundingGoal" DECIMAL(65,30) NOT NULL,
    "currentFunding" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "nonprofitId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityInitiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantAvailability" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MerchantAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantBlock" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "MerchantBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingReminder" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "channel" TEXT NOT NULL,

    CONSTRAINT "BookingReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooperative" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ein" TEXT NOT NULL,
    "formationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fiscalYearEnd" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "merchantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoopMember" (
    "id" TEXT NOT NULL,
    "coopId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "equityShares" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "CoopMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatronageRecord" (
    "id" TEXT NOT NULL,
    "coopId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "totalPurchasesThroughCoop" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "patronageDividendAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "distributedAt" TIMESTAMP(3),
    "form1099Issued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatronageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CDFIPartner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "cdfiCertificationNumber" TEXT NOT NULL,
    "treasuryFundEligible" BOOLEAN NOT NULL DEFAULT false,
    "newMarketsTaxCreditEligible" BOOLEAN NOT NULL DEFAULT false,
    "lendingRegions" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "partnershipStatus" TEXT NOT NULL DEFAULT 'applied',
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "targetCensusTracts" TEXT[],
    "reportingFrequency" TEXT NOT NULL DEFAULT 'ANNUAL',
    "tlrColumnMapping" JSONB,
    "milestoneThreshold" INTEGER NOT NULL DEFAULT 50,
    "firstLossPoolId" TEXT,

    CONSTRAINT "CDFIPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCdfiPackage" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "cdfiPartnerId" TEXT NOT NULL,
    "triggerMetric" TEXT NOT NULL,
    "transactionCount" INTEGER NOT NULL,
    "grossRevenue" DECIMAL(12,2) NOT NULL,
    "censusTractId" TEXT,
    "packageSnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantCdfiPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityFund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "regionId" TEXT,
    "totalCapital" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deployedCapital" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "returnRate" DECIMAL(65,30),
    "cdfiPartnerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundContribution" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundReturn" (
    "id" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundDeployment" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "recipientMerchantId" TEXT,
    "recipientInitiativeId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "deploymentType" TEXT NOT NULL,
    "interestRate" DECIMAL(65,30),
    "repaymentTermMonths" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "cdfiApprovedBy" TEXT,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repaidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "FundDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundRepayment" (
    "id" TEXT NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "principalAmount" DECIMAL(65,30) NOT NULL,
    "interestAmount" DECIMAL(65,30) NOT NULL,
    "repaidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundRepayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "geoBounds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalMetric" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "totalGtv" DECIMAL(65,30) NOT NULL,
    "totalLocalSpendRetained" DECIMAL(65,30) NOT NULL,
    "totalNonprofitFunding" DECIMAL(65,30) NOT NULL,
    "totalCommunityFundDeployed" DECIMAL(65,30) NOT NULL,
    "totalJobsSupported" DOUBLE PRECISION NOT NULL,
    "merchantsActive" INTEGER NOT NULL,
    "consumersActive" INTEGER NOT NULL,
    "internalPaymentPct" DOUBLE PRECISION NOT NULL,
    "avgTransactionValue" DECIMAL(65,30) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionalMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MunicipalPartner" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "partnershipStatus" TEXT NOT NULL DEFAULT 'none',
    "activatedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MunicipalPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MunicipalAccessToken" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "MunicipalAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MunicipalIncentive" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "incentiveType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eligibilityCriteria" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MunicipalIncentive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitProgram" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "groupRateMonthly" DECIMAL(65,30) NOT NULL,
    "individualRateMonthly" DECIMAL(65,30) NOT NULL,
    "minParticipants" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenefitProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitEnrollment" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "BenefitEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitActivation" (
    "id" TEXT NOT NULL,
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalActiveMerchants" INTEGER NOT NULL,
    "thresholdMet" BOOLEAN NOT NULL,
    "benefitsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenefitActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyRelationship" (
    "id" TEXT NOT NULL,
    "buyerMerchantId" TEXT NOT NULL,
    "supplierType" TEXT NOT NULL,
    "supplierMerchantId" TEXT,
    "externalSupplierName" TEXT,
    "productCategory" TEXT NOT NULL,
    "avgMonthlySpend" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyMatch" (
    "id" TEXT NOT NULL,
    "buyerMerchantId" TEXT NOT NULL,
    "suggestedSupplierMerchantId" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "potentialSavings" DECIMAL(65,30) NOT NULL,
    "matchConfidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogImport" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "sourcePlatform" "SourcePlatform" NOT NULL,
    "tier" "CatalogTier" NOT NULL,
    "productCount" INTEGER NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'QUEUED',
    "fetchedCount" INTEGER NOT NULL DEFAULT 0,
    "transformedCount" INTEGER NOT NULL DEFAULT 0,
    "publishedCount" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedStep" TEXT,
    "errorLog" TEXT,
    "actualPlatformCogs" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CatalogImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogProduct" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "CatalogProductStatus" NOT NULL DEFAULT 'PENDING',
    "originalTitle" TEXT NOT NULL,
    "originalDescription" TEXT,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "originalCategory" TEXT,
    "aiCategory" TEXT,
    "aiDescription" TEXT,
    "aiPricingSuggestion" DOUBLE PRECISION,
    "merchantTitle" TEXT,
    "merchantDescription" TEXT,
    "merchantPrice" DOUBLE PRECISION,
    "merchantCogs" DOUBLE PRECISION,
    "merchantCategory" TEXT,
    "cogsVerified" BOOLEAN NOT NULL DEFAULT false,
    "finalTitle" TEXT,
    "finalDescription" TEXT,
    "finalPrice" DOUBLE PRECISION,
    "finalCogs" DOUBLE PRECISION,
    "finalCategory" TEXT,
    "publishedProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogBilling" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tier" "CatalogTier" NOT NULL,
    "productCount" INTEGER NOT NULL,
    "amountCharged" INTEGER NOT NULL,
    "amountChargedDisplay" DOUBLE PRECISION,
    "status" "BillingStatus" NOT NULL DEFAULT 'PENDING',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "actualCogs" INTEGER,
    "grossMargin" DOUBLE PRECISION,
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" INTEGER,
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogRevenue" (
    "id" TEXT NOT NULL,
    "billingId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tier" "CatalogTier" NOT NULL,
    "productCount" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "cogsActual" DOUBLE PRECISION,
    "grossMargin" DOUBLE PRECISION,
    "platform" "SourcePlatform" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateProgram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "baseCommRate" DECIMAL(5,4) NOT NULL DEFAULT 0.04,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateListing" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "upc" TEXT,
    "commRate" DECIMAL(5,4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT,
    "userRole" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateConversion" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "clickId" TEXT,
    "saleAmount" DECIMAL(10,2) NOT NULL,
    "commRate" DECIMAL(5,4) NOT NULL,
    "commTotal" DECIMAL(10,2) NOT NULL,
    "dafShare" DECIMAL(10,2) NOT NULL,
    "cdfiShare" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "platformShare" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "externalRef" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSentinelFlag" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "flagReason" TEXT NOT NULL,
    "suggestedMax" DECIMAL(10,2) NOT NULL,
    "marketMedian" DECIMAL(10,2),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSentinelFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationReceipt" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "donationAmount" DECIMAL(10,2) NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "nonprofitEin" TEXT NOT NULL,
    "nonprofitName" TEXT NOT NULL,
    "merchantName" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalPolicy" (
    "id" TEXT NOT NULL,
    "regionId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "discountRate" DECIMAL(5,4) NOT NULL DEFAULT 0.10,
    "nonprofitRate" DECIMAL(5,4) NOT NULL DEFAULT 0.10,
    "platformRate" DECIMAL(5,4) NOT NULL DEFAULT 0.01,
    "categoryOverrides" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FiscalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceProposal" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposedChanges" JSONB NOT NULL,
    "stakeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "votesFor" INTEGER NOT NULL DEFAULT 0,
    "votesAgainst" INTEGER NOT NULL DEFAULT 0,
    "quorum" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernanceProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalVote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "voteWeight" INTEGER NOT NULL DEFAULT 1,
    "inFavor" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionRefund" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "reason" TEXT,
    "neighborRefund" DECIMAL(10,2) NOT NULL,
    "merchantDebit" DECIMAL(10,2) NOT NULL,
    "nonprofitDebit" DECIMAL(10,2) NOT NULL,
    "platformDebit" DECIMAL(10,2) NOT NULL,
    "refundedToWallet" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrCheckoutToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrCheckoutToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CogsSuggestion" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "listingId" TEXT,
    "supplyMatchId" TEXT NOT NULL,
    "currentCogs" DECIMAL(10,2) NOT NULL,
    "suggestedCogs" DECIMAL(10,2) NOT NULL,
    "savingsPct" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CogsSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareNameWithNonprofits" BOOLEAN NOT NULL DEFAULT true,
    "shareEmailWithNonprofits" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactUpdate" (
    "id" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DmsExportJob" (
    "id" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'CSV',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "rowCount" INTEGER,
    "error" TEXT,
    "requestedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DmsExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmWebhook" (
    "id" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorMilestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "milestone" TEXT NOT NULL,
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonorMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrsNonprofitRecord" (
    "id" TEXT NOT NULL,
    "ein" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "deductibilityCode" TEXT,
    "subsectionCode" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedDate" TIMESTAMP(3),
    "city" TEXT,
    "state" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrsNonprofitRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IrsSyncLog" (
    "id" TEXT NOT NULL,
    "syncDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordsTotal" INTEGER NOT NULL DEFAULT 0,
    "revokedCount" INTEGER NOT NULL DEFAULT 0,
    "newRecords" INTEGER NOT NULL DEFAULT 0,
    "updatedRecords" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "error" TEXT,

    CONSTRAINT "IrsSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDeadline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "jurisdiction" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,
    "agencyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CcvCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "states" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "donationMechanism" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "donationAmount" DECIMAL(10,2),
    "donationPercentage" DECIMAL(5,4),
    "disclosureText" TEXT,
    "transferDeadlineDays" INTEGER NOT NULL DEFAULT 90,
    "transferDueAt" TIMESTAMP(3),
    "campaignStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "msNoticeFiledAt" TIMESTAMP(3),
    "alRegistrationFiledAt" TIMESTAMP(3),
    "laConsentObtainedAt" TIMESTAMP(3),
    "flConsentObtainedAt" TIMESTAMP(3),
    "gaAgreementSignedAt" TIMESTAMP(3),
    "msReportDueAt" TIMESTAMP(3),
    "alClosingDueAt" TIMESTAMP(3),
    "msReportFiledAt" TIMESTAMP(3),
    "alClosingFiledAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CcvCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CcvContract" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contractText" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "platformSignedAt" TIMESTAMP(3),
    "nonprofitSignedAt" TIMESTAMP(3),
    "platformSignature" TEXT,
    "nonprofitSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CcvContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StateStandingRecord" (
    "id" TEXT NOT NULL,
    "ein" TEXT NOT NULL,
    "registrationState" TEXT NOT NULL,
    "legalName" TEXT,
    "registrationNumber" TEXT,
    "status" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StateStandingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StateStandingSyncLog" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "syncDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "recordsTotal" INTEGER NOT NULL DEFAULT 0,
    "flaggedCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "StateStandingSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxReportingFlag" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "grossSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "requires1099K" BOOLEAN NOT NULL DEFAULT false,
    "flaggedAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxReportingFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemTestReport" (
    "id" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredBy" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "totalTests" INTEGER NOT NULL,
    "passed" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL,
    "warnings" INTEGER NOT NULL DEFAULT 0,
    "reportJson" TEXT NOT NULL,

    CONSTRAINT "SystemTestReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTopUp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WalletTopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NonprofitDigestLog" (
    "id" TEXT NOT NULL,
    "nonprofitId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donationCount" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "NonprofitDigestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformActFlag" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "grossRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "certifiedAt" TIMESTAMP(3),
    "flaggedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InformActFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" SERIAL NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "zipCode" TEXT,
    "city" TEXT,
    "state" TEXT,
    "preferredCauseHint" TEXT,
    "businessName" TEXT,
    "website" TEXT,
    "category" TEXT,
    "orgName" TEXT,
    "ein" TEXT,
    "cdfiCertNumber" TEXT,
    "lendingRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jurisdiction" TEXT,
    "decisionMakerRole" TEXT,
    "interestArea" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "ipHash" TEXT,
    "requestBriefing" BOOLEAN NOT NULL DEFAULT false,
    "briefingStatus" TEXT,
    "briefingNotes" TEXT,
    "launchPerks" JSONB,
    "emailConfirmedAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "redeemedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistOverflow" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistOverflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundEmail" (
    "id" TEXT NOT NULL,
    "resendId" TEXT,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT,
    "toAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "textBody" TEXT,
    "htmlBody" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboundEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundEmailReply" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboundEmailReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "blocksJson" JSONB,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "replyTo" TEXT,
    "layoutVariant" TEXT NOT NULL DEFAULT 'MARKETING',
    "accentRole" TEXT,
    "targetRole" TEXT,
    "targetSegmentJson" JSONB,
    "triggerSource" TEXT,
    "templateId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdById" TEXT,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "clickedCount" INTEGER NOT NULL DEFAULT 0,
    "bouncedCount" INTEGER NOT NULL DEFAULT 0,
    "complainedCount" INTEGER NOT NULL DEFAULT 0,
    "unsubscribedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT,
    "emailAddress" TEXT NOT NULL,
    "toName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resendId" TEXT,
    "errorMessage" TEXT,
    "personalizationJson" JSONB,
    "linkedInboundEmailId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "complainedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "EmailRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAttachment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "isLibraryItem" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "blocksJson" JSONB,
    "category" TEXT NOT NULL,
    "layoutVariant" TEXT NOT NULL DEFAULT 'MARKETING',
    "defaultAccentRole" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailUnsubscribe" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "emailAddress" TEXT NOT NULL,
    "category" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailUnsubscribe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSuppression" (
    "id" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSuppression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantReferral_merchantId_key" ON "MerchantReferral"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantReferral_referringNonprofitId_idx" ON "MerchantReferral"("referringNonprofitId");

-- CreateIndex
CREATE INDEX "MerchantReferral_merchantId_idx" ON "MerchantReferral"("merchantId");

-- CreateIndex
CREATE INDEX "ReferralBonusPayout_referralId_idx" ON "ReferralBonusPayout"("referralId");

-- CreateIndex
CREATE INDEX "ReferralBonusPayout_tierId_idx" ON "ReferralBonusPayout"("tierId");

-- CreateIndex
CREATE INDEX "CreditLedger_userId_idx" ON "CreditLedger"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_userId_key" ON "Merchant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_stripeAccountId_key" ON "Merchant"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "DataCoopMember_merchantId_key" ON "DataCoopMember"("merchantId");

-- CreateIndex
CREATE INDEX "DataCoopMember_merchantId_idx" ON "DataCoopMember"("merchantId");

-- CreateIndex
CREATE INDEX "MarketInsight_category_regionId_period_idx" ON "MarketInsight"("category", "regionId", "period");

-- CreateIndex
CREATE INDEX "DataCoopActivation_category_regionId_idx" ON "DataCoopActivation"("category", "regionId");

-- CreateIndex
CREATE INDEX "AnonymizedTransaction_category_regionId_transactionDate_idx" ON "AnonymizedTransaction"("category", "regionId", "transactionDate");

-- CreateIndex
CREATE INDEX "DataCoopAccess_merchantId_category_regionId_idx" ON "DataCoopAccess"("merchantId", "category", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_merchantId_key" ON "GroupMember"("groupId", "merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupCommitment_dealId_merchantId_key" ON "GroupCommitment"("dealId", "merchantId");

-- CreateIndex
CREATE INDEX "CreditTransfer_fromUserId_idx" ON "CreditTransfer"("fromUserId");

-- CreateIndex
CREATE INDEX "CreditTransfer_toUserId_idx" ON "CreditTransfer"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Nonprofit_userId_key" ON "Nonprofit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Nonprofit_ein_key" ON "Nonprofit"("ein");

-- CreateIndex
CREATE UNIQUE INDEX "Nonprofit_stripeAccountId_key" ON "Nonprofit"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Nonprofit_referralCode_key" ON "Nonprofit"("referralCode");

-- CreateIndex
CREATE INDEX "Transaction_neighborId_idx" ON "Transaction"("neighborId");

-- CreateIndex
CREATE INDEX "Transaction_merchantId_idx" ON "Transaction"("merchantId");

-- CreateIndex
CREATE INDEX "Transaction_nonprofitId_idx" ON "Transaction"("nonprofitId");

-- CreateIndex
CREATE INDEX "Transaction_consumerState_idx" ON "Transaction"("consumerState");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "LedgerEntry_walletId_idx" ON "LedgerEntry"("walletId");

-- CreateIndex
CREATE INDEX "LedgerEntry_transactionId_idx" ON "LedgerEntry"("transactionId");

-- CreateIndex
CREATE INDEX "PlatformLedgerEntry_accountId_idx" ON "PlatformLedgerEntry"("accountId");

-- CreateIndex
CREATE INDEX "PlatformLedgerEntry_createdAt_idx" ON "PlatformLedgerEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantObligation_transactionId_key" ON "MerchantObligation"("transactionId");

-- CreateIndex
CREATE INDEX "MerchantObligation_debtorMerchantId_idx" ON "MerchantObligation"("debtorMerchantId");

-- CreateIndex
CREATE INDEX "MerchantObligation_creditorMerchantId_idx" ON "MerchantObligation"("creditorMerchantId");

-- CreateIndex
CREATE INDEX "MerchantObligation_batchId_idx" ON "MerchantObligation"("batchId");

-- CreateIndex
CREATE INDEX "MerchantAvailability_merchantId_idx" ON "MerchantAvailability"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantBlock_merchantId_idx" ON "MerchantBlock"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_transactionId_key" ON "Booking"("transactionId");

-- CreateIndex
CREATE INDEX "Booking_listingId_idx" ON "Booking"("listingId");

-- CreateIndex
CREATE INDEX "Booking_consumerId_idx" ON "Booking"("consumerId");

-- CreateIndex
CREATE INDEX "Booking_merchantId_idx" ON "Booking"("merchantId");

-- CreateIndex
CREATE INDEX "Booking_transactionId_idx" ON "Booking"("transactionId");

-- CreateIndex
CREATE INDEX "BookingReminder_bookingId_idx" ON "BookingReminder"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_ein_key" ON "Cooperative"("ein");

-- CreateIndex
CREATE UNIQUE INDEX "Cooperative_merchantId_key" ON "Cooperative"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "CoopMember_coopId_merchantId_key" ON "CoopMember"("coopId", "merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "PatronageRecord_coopId_merchantId_fiscalYear_key" ON "PatronageRecord"("coopId", "merchantId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "CDFIPartner_userId_key" ON "CDFIPartner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CDFIPartner_cdfiCertificationNumber_key" ON "CDFIPartner"("cdfiCertificationNumber");

-- CreateIndex
CREATE INDEX "MerchantCdfiPackage_merchantId_idx" ON "MerchantCdfiPackage"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantCdfiPackage_cdfiPartnerId_idx" ON "MerchantCdfiPackage"("cdfiPartnerId");

-- CreateIndex
CREATE INDEX "MerchantCdfiPackage_status_idx" ON "MerchantCdfiPackage"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalMetric_regionId_period_key" ON "RegionalMetric"("regionId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "MunicipalPartner_regionId_key" ON "MunicipalPartner"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "MunicipalAccessToken_tokenHash_key" ON "MunicipalAccessToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "BenefitEnrollment_programId_merchantId_key" ON "BenefitEnrollment"("programId", "merchantId");

-- CreateIndex
CREATE INDEX "SupplyRelationship_buyerMerchantId_idx" ON "SupplyRelationship"("buyerMerchantId");

-- CreateIndex
CREATE INDEX "SupplyRelationship_productCategory_idx" ON "SupplyRelationship"("productCategory");

-- CreateIndex
CREATE INDEX "SupplyMatch_buyerMerchantId_idx" ON "SupplyMatch"("buyerMerchantId");

-- CreateIndex
CREATE INDEX "SupplyMatch_productCategory_idx" ON "SupplyMatch"("productCategory");

-- CreateIndex
CREATE INDEX "CatalogImport_merchantId_idx" ON "CatalogImport"("merchantId");

-- CreateIndex
CREATE INDEX "CatalogImport_status_idx" ON "CatalogImport"("status");

-- CreateIndex
CREATE INDEX "CatalogImport_createdAt_idx" ON "CatalogImport"("createdAt");

-- CreateIndex
CREATE INDEX "CatalogProduct_importId_idx" ON "CatalogProduct"("importId");

-- CreateIndex
CREATE INDEX "CatalogProduct_status_idx" ON "CatalogProduct"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogBilling_importId_key" ON "CatalogBilling"("importId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogBilling_idempotencyKey_key" ON "CatalogBilling"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CatalogBilling_merchantId_idx" ON "CatalogBilling"("merchantId");

-- CreateIndex
CREATE INDEX "CatalogBilling_status_idx" ON "CatalogBilling"("status");

-- CreateIndex
CREATE INDEX "CatalogRevenue_merchantId_idx" ON "CatalogRevenue"("merchantId");

-- CreateIndex
CREATE INDEX "CatalogRevenue_tier_idx" ON "CatalogRevenue"("tier");

-- CreateIndex
CREATE INDEX "CatalogRevenue_timestamp_idx" ON "CatalogRevenue"("timestamp");

-- CreateIndex
CREATE INDEX "AffiliateListing_category_idx" ON "AffiliateListing"("category");

-- CreateIndex
CREATE INDEX "AffiliateListing_isActive_idx" ON "AffiliateListing"("isActive");

-- CreateIndex
CREATE INDEX "AffiliateClick_listingId_idx" ON "AffiliateClick"("listingId");

-- CreateIndex
CREATE INDEX "AffiliateClick_clickedAt_idx" ON "AffiliateClick"("clickedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateConversion_clickId_key" ON "AffiliateConversion"("clickId");

-- CreateIndex
CREATE INDEX "AffiliateConversion_listingId_idx" ON "AffiliateConversion"("listingId");

-- CreateIndex
CREATE INDEX "AffiliateConversion_status_idx" ON "AffiliateConversion"("status");

-- CreateIndex
CREATE INDEX "AffiliateConversion_createdAt_idx" ON "AffiliateConversion"("createdAt");

-- CreateIndex
CREATE INDEX "PriceSentinelFlag_listingId_idx" ON "PriceSentinelFlag"("listingId");

-- CreateIndex
CREATE INDEX "PriceSentinelFlag_isResolved_idx" ON "PriceSentinelFlag"("isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "DonationReceipt_transactionId_key" ON "DonationReceipt"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "DonationReceipt_receiptNumber_key" ON "DonationReceipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "DonationReceipt_nonprofitId_idx" ON "DonationReceipt"("nonprofitId");

-- CreateIndex
CREATE INDEX "DonationReceipt_merchantId_idx" ON "DonationReceipt"("merchantId");

-- CreateIndex
CREATE INDEX "DonationReceipt_fiscalYear_idx" ON "DonationReceipt"("fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalPolicy_regionId_key" ON "FiscalPolicy"("regionId");

-- CreateIndex
CREATE INDEX "GovernanceProposal_policyId_idx" ON "GovernanceProposal"("policyId");

-- CreateIndex
CREATE INDEX "GovernanceProposal_status_idx" ON "GovernanceProposal"("status");

-- CreateIndex
CREATE INDEX "ProposalVote_proposalId_idx" ON "ProposalVote"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalVote_proposalId_voterId_key" ON "ProposalVote"("proposalId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionRefund_transactionId_key" ON "TransactionRefund"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionRefund_initiatedBy_idx" ON "TransactionRefund"("initiatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "QrCheckoutToken_tokenHash_key" ON "QrCheckoutToken"("tokenHash");

-- CreateIndex
CREATE INDEX "QrCheckoutToken_userId_idx" ON "QrCheckoutToken"("userId");

-- CreateIndex
CREATE INDEX "QrCheckoutToken_tokenHash_idx" ON "QrCheckoutToken"("tokenHash");

-- CreateIndex
CREATE INDEX "CogsSuggestion_merchantId_idx" ON "CogsSuggestion"("merchantId");

-- CreateIndex
CREATE INDEX "CogsSuggestion_status_idx" ON "CogsSuggestion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DonorProfile_userId_key" ON "DonorProfile"("userId");

-- CreateIndex
CREATE INDEX "DonorProfile_userId_idx" ON "DonorProfile"("userId");

-- CreateIndex
CREATE INDEX "ImpactUpdate_nonprofitId_idx" ON "ImpactUpdate"("nonprofitId");

-- CreateIndex
CREATE INDEX "ImpactUpdate_createdAt_idx" ON "ImpactUpdate"("createdAt");

-- CreateIndex
CREATE INDEX "DmsExportJob_nonprofitId_idx" ON "DmsExportJob"("nonprofitId");

-- CreateIndex
CREATE INDEX "DmsExportJob_status_idx" ON "DmsExportJob"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CrmWebhook_nonprofitId_key" ON "CrmWebhook"("nonprofitId");

-- CreateIndex
CREATE INDEX "DonorMilestone_userId_idx" ON "DonorMilestone"("userId");

-- CreateIndex
CREATE INDEX "DonorMilestone_nonprofitId_idx" ON "DonorMilestone"("nonprofitId");

-- CreateIndex
CREATE UNIQUE INDEX "DonorMilestone_userId_nonprofitId_milestone_key" ON "DonorMilestone"("userId", "nonprofitId", "milestone");

-- CreateIndex
CREATE UNIQUE INDEX "IrsNonprofitRecord_ein_key" ON "IrsNonprofitRecord"("ein");

-- CreateIndex
CREATE INDEX "IrsNonprofitRecord_ein_idx" ON "IrsNonprofitRecord"("ein");

-- CreateIndex
CREATE INDEX "IrsNonprofitRecord_isRevoked_idx" ON "IrsNonprofitRecord"("isRevoked");

-- CreateIndex
CREATE INDEX "IrsNonprofitRecord_state_idx" ON "IrsNonprofitRecord"("state");

-- CreateIndex
CREATE INDEX "IrsSyncLog_syncDate_idx" ON "IrsSyncLog"("syncDate");

-- CreateIndex
CREATE INDEX "ComplianceDeadline_dueDate_idx" ON "ComplianceDeadline"("dueDate");

-- CreateIndex
CREATE INDEX "ComplianceDeadline_jurisdiction_idx" ON "ComplianceDeadline"("jurisdiction");

-- CreateIndex
CREATE INDEX "ComplianceDeadline_category_idx" ON "ComplianceDeadline"("category");

-- CreateIndex
CREATE INDEX "CcvCampaign_nonprofitId_idx" ON "CcvCampaign"("nonprofitId");

-- CreateIndex
CREATE INDEX "CcvCampaign_startDate_idx" ON "CcvCampaign"("startDate");

-- CreateIndex
CREATE INDEX "CcvCampaign_campaignStatus_idx" ON "CcvCampaign"("campaignStatus");

-- CreateIndex
CREATE UNIQUE INDEX "CcvContract_campaignId_key" ON "CcvContract"("campaignId");

-- CreateIndex
CREATE INDEX "CcvContract_campaignId_idx" ON "CcvContract"("campaignId");

-- CreateIndex
CREATE INDEX "StateStandingRecord_ein_idx" ON "StateStandingRecord"("ein");

-- CreateIndex
CREATE INDEX "StateStandingRecord_registrationState_idx" ON "StateStandingRecord"("registrationState");

-- CreateIndex
CREATE INDEX "StateStandingRecord_status_idx" ON "StateStandingRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StateStandingRecord_ein_registrationState_key" ON "StateStandingRecord"("ein", "registrationState");

-- CreateIndex
CREATE INDEX "StateStandingSyncLog_syncDate_idx" ON "StateStandingSyncLog"("syncDate");

-- CreateIndex
CREATE INDEX "StateStandingSyncLog_state_idx" ON "StateStandingSyncLog"("state");

-- CreateIndex
CREATE INDEX "TaxReportingFlag_taxYear_idx" ON "TaxReportingFlag"("taxYear");

-- CreateIndex
CREATE INDEX "TaxReportingFlag_requires1099K_idx" ON "TaxReportingFlag"("requires1099K");

-- CreateIndex
CREATE UNIQUE INDEX "TaxReportingFlag_merchantId_taxYear_key" ON "TaxReportingFlag"("merchantId", "taxYear");

-- CreateIndex
CREATE INDEX "SystemTestReport_runAt_idx" ON "SystemTestReport"("runAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTopUp_stripePaymentIntentId_key" ON "WalletTopUp"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "WalletTopUp_userId_idx" ON "WalletTopUp"("userId");

-- CreateIndex
CREATE INDEX "WalletTopUp_stripePaymentIntentId_idx" ON "WalletTopUp"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "NonprofitDigestLog_nonprofitId_idx" ON "NonprofitDigestLog"("nonprofitId");

-- CreateIndex
CREATE INDEX "NonprofitDigestLog_sentAt_idx" ON "NonprofitDigestLog"("sentAt");

-- CreateIndex
CREATE INDEX "InformActFlag_taxYear_idx" ON "InformActFlag"("taxYear");

-- CreateIndex
CREATE INDEX "InformActFlag_requiresVerification_idx" ON "InformActFlag"("requiresVerification");

-- CreateIndex
CREATE UNIQUE INDEX "InformActFlag_merchantId_taxYear_key" ON "InformActFlag"("merchantId", "taxYear");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_inviteCode_key" ON "WaitlistEntry"("inviteCode");

-- CreateIndex
CREATE INDEX "WaitlistEntry_role_idx" ON "WaitlistEntry"("role");

-- CreateIndex
CREATE INDEX "WaitlistEntry_state_city_idx" ON "WaitlistEntry"("state", "city");

-- CreateIndex
CREATE INDEX "WaitlistEntry_createdAt_idx" ON "WaitlistEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistOverflow_email_key" ON "WaitlistOverflow"("email");

-- CreateIndex
CREATE INDEX "WaitlistOverflow_role_idx" ON "WaitlistOverflow"("role");

-- CreateIndex
CREATE INDEX "WaitlistOverflow_createdAt_idx" ON "WaitlistOverflow"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InboundEmail_resendId_key" ON "InboundEmail"("resendId");

-- CreateIndex
CREATE INDEX "InboundEmail_isRead_idx" ON "InboundEmail"("isRead");

-- CreateIndex
CREATE INDEX "InboundEmail_createdAt_idx" ON "InboundEmail"("createdAt");

-- CreateIndex
CREATE INDEX "InboundEmailReply_emailId_idx" ON "InboundEmailReply"("emailId");

-- CreateIndex
CREATE INDEX "EmailCampaign_type_idx" ON "EmailCampaign"("type");

-- CreateIndex
CREATE INDEX "EmailCampaign_status_idx" ON "EmailCampaign"("status");

-- CreateIndex
CREATE INDEX "EmailCampaign_triggerSource_idx" ON "EmailCampaign"("triggerSource");

-- CreateIndex
CREATE INDEX "EmailRecipient_campaignId_idx" ON "EmailRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "EmailRecipient_emailAddress_idx" ON "EmailRecipient"("emailAddress");

-- CreateIndex
CREATE INDEX "EmailRecipient_resendId_idx" ON "EmailRecipient"("resendId");

-- CreateIndex
CREATE INDEX "EmailAttachment_isLibraryItem_idx" ON "EmailAttachment"("isLibraryItem");

-- CreateIndex
CREATE UNIQUE INDEX "EmailUnsubscribe_emailAddress_category_key" ON "EmailUnsubscribe"("emailAddress", "category");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSuppression_emailAddress_key" ON "EmailSuppression"("emailAddress");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_electedNonprofitId_fkey" FOREIGN KEY ("electedNonprofitId") REFERENCES "Nonprofit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantReferral" ADD CONSTRAINT "MerchantReferral_referringNonprofitId_fkey" FOREIGN KEY ("referringNonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantReferral" ADD CONSTRAINT "MerchantReferral_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralBonusPayout" ADD CONSTRAINT "ReferralBonusPayout_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "MerchantReferral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralBonusPayout" ADD CONSTRAINT "ReferralBonusPayout_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "ReferralBonusTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataCoopMember" ADD CONSTRAINT "DataCoopMember_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataCoopAccess" ADD CONSTRAINT "DataCoopAccess_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PurchasingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupDeal" ADD CONSTRAINT "GroupDeal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PurchasingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupCommitment" ADD CONSTRAINT "GroupCommitment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "GroupDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupCommitment" ADD CONSTRAINT "GroupCommitment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nonprofit" ADD CONSTRAINT "Nonprofit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductService" ADD CONSTRAINT "ProductService_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_neighborId_fkey" FOREIGN KEY ("neighborId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES "ProductService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_waivedToInitiativeId_fkey" FOREIGN KEY ("waivedToInitiativeId") REFERENCES "CommunityInitiative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_waivedToFundId_fkey" FOREIGN KEY ("waivedToFundId") REFERENCES "CommunityFund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformLedgerEntry" ADD CONSTRAINT "PlatformLedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlatformAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantObligation" ADD CONSTRAINT "MerchantObligation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantObligation" ADD CONSTRAINT "MerchantObligation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "NettingBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityInitiative" ADD CONSTRAINT "CommunityInitiative_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityInitiative" ADD CONSTRAINT "CommunityInitiative_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantAvailability" ADD CONSTRAINT "MerchantAvailability_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantBlock" ADD CONSTRAINT "MerchantBlock_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProductService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingReminder" ADD CONSTRAINT "BookingReminder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooperative" ADD CONSTRAINT "Cooperative_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoopMember" ADD CONSTRAINT "CoopMember_coopId_fkey" FOREIGN KEY ("coopId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoopMember" ADD CONSTRAINT "CoopMember_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatronageRecord" ADD CONSTRAINT "PatronageRecord_coopId_fkey" FOREIGN KEY ("coopId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatronageRecord" ADD CONSTRAINT "PatronageRecord_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CDFIPartner" ADD CONSTRAINT "CDFIPartner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCdfiPackage" ADD CONSTRAINT "MerchantCdfiPackage_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCdfiPackage" ADD CONSTRAINT "MerchantCdfiPackage_cdfiPartnerId_fkey" FOREIGN KEY ("cdfiPartnerId") REFERENCES "CDFIPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityFund" ADD CONSTRAINT "CommunityFund_cdfiPartnerId_fkey" FOREIGN KEY ("cdfiPartnerId") REFERENCES "CDFIPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "CommunityFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundReturn" ADD CONSTRAINT "FundReturn_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "FundContribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundDeployment" ADD CONSTRAINT "FundDeployment_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "CommunityFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundDeployment" ADD CONSTRAINT "FundDeployment_recipientMerchantId_fkey" FOREIGN KEY ("recipientMerchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundDeployment" ADD CONSTRAINT "FundDeployment_recipientInitiativeId_fkey" FOREIGN KEY ("recipientInitiativeId") REFERENCES "CommunityInitiative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundDeployment" ADD CONSTRAINT "FundDeployment_cdfiApprovedBy_fkey" FOREIGN KEY ("cdfiApprovedBy") REFERENCES "CDFIPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundRepayment" ADD CONSTRAINT "FundRepayment_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "FundDeployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalMetric" ADD CONSTRAINT "RegionalMetric_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalPartner" ADD CONSTRAINT "MunicipalPartner_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalAccessToken" ADD CONSTRAINT "MunicipalAccessToken_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "MunicipalPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalIncentive" ADD CONSTRAINT "MunicipalIncentive_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "MunicipalPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitEnrollment" ADD CONSTRAINT "BenefitEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "BenefitProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitEnrollment" ADD CONSTRAINT "BenefitEnrollment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyRelationship" ADD CONSTRAINT "SupplyRelationship_buyerMerchantId_fkey" FOREIGN KEY ("buyerMerchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyRelationship" ADD CONSTRAINT "SupplyRelationship_supplierMerchantId_fkey" FOREIGN KEY ("supplierMerchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyMatch" ADD CONSTRAINT "SupplyMatch_buyerMerchantId_fkey" FOREIGN KEY ("buyerMerchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyMatch" ADD CONSTRAINT "SupplyMatch_suggestedSupplierMerchantId_fkey" FOREIGN KEY ("suggestedSupplierMerchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogImport" ADD CONSTRAINT "CatalogImport_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CatalogImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_publishedProductId_fkey" FOREIGN KEY ("publishedProductId") REFERENCES "ProductService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogBilling" ADD CONSTRAINT "CatalogBilling_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CatalogImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateListing" ADD CONSTRAINT "AffiliateListing_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AffiliateProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AffiliateListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateConversion" ADD CONSTRAINT "AffiliateConversion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AffiliateListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateConversion" ADD CONSTRAINT "AffiliateConversion_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "AffiliateClick"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSentinelFlag" ADD CONSTRAINT "PriceSentinelFlag_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProductService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationReceipt" ADD CONSTRAINT "DonationReceipt_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPolicy" ADD CONSTRAINT "FiscalPolicy_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceProposal" ADD CONSTRAINT "GovernanceProposal_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "FiscalPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceProposal" ADD CONSTRAINT "GovernanceProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalVote" ADD CONSTRAINT "ProposalVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GovernanceProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalVote" ADD CONSTRAINT "ProposalVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionRefund" ADD CONSTRAINT "TransactionRefund_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrCheckoutToken" ADD CONSTRAINT "QrCheckoutToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CogsSuggestion" ADD CONSTRAINT "CogsSuggestion_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CogsSuggestion" ADD CONSTRAINT "CogsSuggestion_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProductService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CogsSuggestion" ADD CONSTRAINT "CogsSuggestion_supplyMatchId_fkey" FOREIGN KEY ("supplyMatchId") REFERENCES "SupplyMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorProfile" ADD CONSTRAINT "DonorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactUpdate" ADD CONSTRAINT "ImpactUpdate_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmsExportJob" ADD CONSTRAINT "DmsExportJob_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmWebhook" ADD CONSTRAINT "CrmWebhook_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorMilestone" ADD CONSTRAINT "DonorMilestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorMilestone" ADD CONSTRAINT "DonorMilestone_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CcvCampaign" ADD CONSTRAINT "CcvCampaign_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CcvContract" ADD CONSTRAINT "CcvContract_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CcvCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxReportingFlag" ADD CONSTRAINT "TaxReportingFlag_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTopUp" ADD CONSTRAINT "WalletTopUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformActFlag" ADD CONSTRAINT "InformActFlag_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundEmailReply" ADD CONSTRAINT "InboundEmailReply_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "InboundEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAttachment" ADD CONSTRAINT "EmailAttachment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

