-- The Local Dollar Graph: one immutable append-only edge per settled transaction (additive, no data loss).
-- CreateTable
CREATE TABLE "LocalDollarEdge" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'settlement',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "neighborId" TEXT NOT NULL,
    "consumerState" TEXT,
    "merchantId" TEXT NOT NULL,
    "merchantType" TEXT,
    "productCategory" TEXT,
    "censusTractId" TEXT,
    "isQIA" BOOLEAN NOT NULL DEFAULT false,
    "regionId" TEXT,
    "nonprofitId" TEXT NOT NULL,
    "nonprofitName" TEXT,
    "nonprofitEin" TEXT,
    "nteeCode" TEXT,
    "waivedToInitiativeId" TEXT,
    "waivedToFundId" TEXT,
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL,
    "cogs" DECIMAL(12,2) NOT NULL,
    "merchantNet" DECIMAL(12,2) NOT NULL,
    "nonprofitShare" DECIMAL(12,2) NOT NULL,
    "platformFee" DECIMAL(12,2) NOT NULL,
    "waivedContribution" DECIMAL(12,2) NOT NULL,
    "creditIssued" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "discountWaived" BOOLEAN NOT NULL DEFAULT false,
    "discountMode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalDollarEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalDollarEdge_transactionId_key" ON "LocalDollarEdge"("transactionId");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_period_idx" ON "LocalDollarEdge"("period");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_censusTractId_idx" ON "LocalDollarEdge"("censusTractId");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_regionId_idx" ON "LocalDollarEdge"("regionId");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_nonprofitId_idx" ON "LocalDollarEdge"("nonprofitId");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_merchantId_idx" ON "LocalDollarEdge"("merchantId");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_neighborId_idx" ON "LocalDollarEdge"("neighborId");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_isQIA_idx" ON "LocalDollarEdge"("isQIA");

-- CreateIndex
CREATE INDEX "LocalDollarEdge_paymentMethod_idx" ON "LocalDollarEdge"("paymentMethod");
