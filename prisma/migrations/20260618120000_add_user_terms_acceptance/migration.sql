-- Add nullable Terms/Privacy acceptance columns to User (additive, no data loss).
-- Captured at signup as a consent record.
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptedTermsVersion" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
