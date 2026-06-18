-- In-house error monitoring table (additive, no data loss).
-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'error',
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "source" TEXT,
    "statusCode" INTEGER,
    "requestId" TEXT,
    "userId" TEXT,
    "userRole" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- CreateIndex
CREATE INDEX "ErrorLog_resolved_idx" ON "ErrorLog"("resolved");
