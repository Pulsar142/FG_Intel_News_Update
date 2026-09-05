-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "summaryP1" TEXT NOT NULL,
    "summaryP2" TEXT NOT NULL,
    "didYouKnow" TEXT NOT NULL,
    "perspective" TEXT NOT NULL,
    "bullets" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 1,
    "weekOf" DATETIME NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    "createdBy" TEXT NOT NULL DEFAULT 'bot',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyDigest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekOf" DATETIME NOT NULL,
    "summaryText" TEXT NOT NULL,
    "articleIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RegionSetting" (
    "region" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "AccessInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "label" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_region_status_idx" ON "Article"("region", "status");

-- CreateIndex
CREATE INDEX "Article_year_month_idx" ON "Article"("year", "month");

-- CreateIndex
CREATE INDEX "Article_weekOf_idx" ON "Article"("weekOf");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyDigest_weekOf_key" ON "WeeklyDigest"("weekOf");

-- CreateIndex
CREATE UNIQUE INDEX "AccessInvite_token_key" ON "AccessInvite"("token");
