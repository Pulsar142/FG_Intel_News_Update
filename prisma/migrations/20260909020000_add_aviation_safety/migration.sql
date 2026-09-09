-- CreateEnum
CREATE TYPE "AviationSafetyRegion" AS ENUM ('ASIA', 'GLOBAL', 'CUSTOM');

-- CreateTable
CREATE TABLE "AviationSafetyArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" "AviationSafetyRegion" NOT NULL,
    "country" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "incidentCategory" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3),
    "aircraftInfo" TEXT,
    "summaryP1" TEXT NOT NULL,
    "summaryP2" TEXT NOT NULL,
    "summaryP3" TEXT NOT NULL,
    "safetyAnalysis" TEXT NOT NULL,
    "preventativeMeasures" TEXT NOT NULL,
    "hfacsAnalysis" TEXT,
    "images" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 1,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL DEFAULT 'bot',

    CONSTRAINT "AviationSafetyArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AviationSafetyRequest" (
    "id" TEXT NOT NULL,
    "region" "AviationSafetyRegion" NOT NULL,
    "country" TEXT,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "articleId" TEXT,
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "AviationSafetyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AviationSafetyArticle_slug_key" ON "AviationSafetyArticle"("slug");

-- CreateIndex
CREATE INDEX "AviationSafetyArticle_status_idx" ON "AviationSafetyArticle"("status");

-- CreateIndex
CREATE INDEX "AviationSafetyArticle_weekOf_idx" ON "AviationSafetyArticle"("weekOf");

-- CreateIndex
CREATE INDEX "AviationSafetyRequest_status_idx" ON "AviationSafetyRequest"("status");
