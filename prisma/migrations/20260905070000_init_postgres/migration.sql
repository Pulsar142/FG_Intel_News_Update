-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('SINGAPORE', 'SEA', 'GLOBAL', 'USA', 'MALAYSIA', 'INDONESIA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "country" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "summaryP1" TEXT NOT NULL,
    "summaryP2" TEXT NOT NULL,
    "didYouKnow" TEXT NOT NULL,
    "perspective" TEXT NOT NULL,
    "bullets" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 1,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL DEFAULT 'bot',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyDigest" (
    "id" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "summaryText" TEXT NOT NULL,
    "articleIds" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyDigest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionSetting" (
    "region" "Region" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RegionSetting_pkey" PRIMARY KEY ("region")
);

-- CreateTable
CREATE TABLE "AccessInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "label" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "AccessInvite_pkey" PRIMARY KEY ("id")
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

