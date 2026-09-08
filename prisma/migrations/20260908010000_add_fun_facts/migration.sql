-- CreateTable
CREATE TABLE "FunFact" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "topic" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL DEFAULT 'bot',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunFactRequest" (
    "id" TEXT NOT NULL,
    "topic" TEXT,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "factId" TEXT,
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "FunFactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FunFact_active_idx" ON "FunFact"("active");

-- CreateIndex
CREATE INDEX "FunFactRequest_status_idx" ON "FunFactRequest"("status");

