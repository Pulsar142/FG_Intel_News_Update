-- CreateEnum
CREATE TYPE "AirbaseType" AS ENUM ('MILITARY', 'CIVIL_MILITARY_SHARED');

-- CreateEnum
CREATE TYPE "AirbaseUnitCategory" AS ENUM ('FIGHTER_SQUADRON', 'TRANSPORT_SQUADRON', 'HELICOPTER_SQUADRON', 'UAV_SQUADRON', 'AIR_DEFENSE', 'SUPPORT', 'AMMUNITION_DEPOT', 'OTHER');

-- CreateTable
CREATE TABLE "MilitaryAirbase" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "icaoCode" TEXT,
    "baseType" "AirbaseType" NOT NULL DEFAULT 'MILITARY',
    "description" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL DEFAULT 'bot',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MilitaryAirbase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirbaseUnit" (
    "id" TEXT NOT NULL,
    "airbaseId" TEXT NOT NULL,
    "category" "AirbaseUnitCategory" NOT NULL,
    "unitName" TEXT NOT NULL,
    "aircraftType" TEXT,
    "approxCount" INTEGER,
    "notes" TEXT,
    "sources" TEXT NOT NULL,

    CONSTRAINT "AirbaseUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MilitaryAirbase_slug_key" ON "MilitaryAirbase"("slug");

-- CreateIndex
CREATE INDEX "MilitaryAirbase_status_idx" ON "MilitaryAirbase"("status");

-- CreateIndex
CREATE INDEX "MilitaryAirbase_country_idx" ON "MilitaryAirbase"("country");

-- CreateIndex
CREATE INDEX "AirbaseUnit_airbaseId_idx" ON "AirbaseUnit"("airbaseId");

-- AddForeignKey
ALTER TABLE "AirbaseUnit" ADD CONSTRAINT "AirbaseUnit_airbaseId_fkey" FOREIGN KEY ("airbaseId") REFERENCES "MilitaryAirbase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
