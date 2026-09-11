-- AlterTable
ALTER TABLE "AviationSafetyBrief" ADD COLUMN     "commercialTrendTag" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "militaryTrendTag" TEXT NOT NULL DEFAULT '';
