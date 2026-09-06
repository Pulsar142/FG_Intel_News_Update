-- CreateEnum
CREATE TYPE "GenerationRequestStatus" AS ENUM ('PENDING', 'FULFILLED', 'FAILED');

-- CreateTable
CREATE TABLE "GenerationRequest" (
    "id" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "country" TEXT,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "articleId" TEXT,
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "GenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GenerationRequest_status_idx" ON "GenerationRequest"("status");

