-- CreateTable
CREATE TABLE "FieldRegenerationRequest" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "FieldRegenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FieldRegenerationRequest_status_idx" ON "FieldRegenerationRequest"("status");

