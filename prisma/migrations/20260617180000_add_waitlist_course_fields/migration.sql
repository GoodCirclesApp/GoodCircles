-- AlterTable
ALTER TABLE "WaitlistEntry" ADD COLUMN     "courseEnrolled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "intentLevel" TEXT;
