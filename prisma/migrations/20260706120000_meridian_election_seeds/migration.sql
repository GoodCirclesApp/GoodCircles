-- AlterTable
ALTER TABLE "WaitlistEntry" ADD COLUMN     "electedNonprofitId" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifyToken" TEXT;

-- CreateTable
CREATE TABLE "SeedNonprofit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "source" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedNonprofit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedBusiness" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "area" TEXT,
    "ownershipType" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberBusinessVote" (
    "id" TEXT NOT NULL,
    "waitlistEntryId" TEXT NOT NULL,
    "seedBusinessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberBusinessVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectionDigestLog" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "ElectionDigestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitySuggestion" (
    "id" TEXT NOT NULL,
    "waitlistEntryId" TEXT,
    "type" TEXT NOT NULL,
    "rawName" TEXT NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntitySuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeedNonprofit_name_key" ON "SeedNonprofit"("name");

-- CreateIndex
CREATE INDEX "SeedNonprofit_category_idx" ON "SeedNonprofit"("category");

-- CreateIndex
CREATE INDEX "SeedNonprofit_active_idx" ON "SeedNonprofit"("active");

-- CreateIndex
CREATE UNIQUE INDEX "SeedBusiness_name_key" ON "SeedBusiness"("name");

-- CreateIndex
CREATE INDEX "SeedBusiness_category_idx" ON "SeedBusiness"("category");

-- CreateIndex
CREATE INDEX "SeedBusiness_active_idx" ON "SeedBusiness"("active");

-- CreateIndex
CREATE INDEX "MemberBusinessVote_seedBusinessId_idx" ON "MemberBusinessVote"("seedBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberBusinessVote_waitlistEntryId_seedBusinessId_key" ON "MemberBusinessVote"("waitlistEntryId", "seedBusinessId");

-- CreateIndex
CREATE INDEX "EntitySuggestion_status_idx" ON "EntitySuggestion"("status");

-- CreateIndex
CREATE INDEX "EntitySuggestion_type_idx" ON "EntitySuggestion"("type");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_verifyToken_key" ON "WaitlistEntry"("verifyToken");

-- CreateIndex
CREATE INDEX "WaitlistEntry_electedNonprofitId_idx" ON "WaitlistEntry"("electedNonprofitId");

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_electedNonprofitId_fkey" FOREIGN KEY ("electedNonprofitId") REFERENCES "SeedNonprofit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberBusinessVote" ADD CONSTRAINT "MemberBusinessVote_waitlistEntryId_fkey" FOREIGN KEY ("waitlistEntryId") REFERENCES "WaitlistEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberBusinessVote" ADD CONSTRAINT "MemberBusinessVote_seedBusinessId_fkey" FOREIGN KEY ("seedBusinessId") REFERENCES "SeedBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySuggestion" ADD CONSTRAINT "EntitySuggestion_waitlistEntryId_fkey" FOREIGN KEY ("waitlistEntryId") REFERENCES "WaitlistEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

