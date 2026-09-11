-- CreateEnum
CREATE TYPE "AviationSafetySector" AS ENUM ('MILITARY', 'COMMERCIAL');

-- AlterTable
ALTER TABLE "AviationSafetyArticle" ADD COLUMN     "sector" "AviationSafetySector" NOT NULL DEFAULT 'COMMERCIAL';
ALTER TABLE "AviationSafetyArticle" ALTER COLUMN "sector" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AviationSafetyBrief" DROP COLUMN "trendHighlight",
ADD COLUMN     "commercialIncidentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commercialTrendHighlight" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "militaryIncidentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "militaryTrendHighlight" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AviationSafetyBrief" ALTER COLUMN "commercialIncidentCount" DROP DEFAULT;
ALTER TABLE "AviationSafetyBrief" ALTER COLUMN "commercialTrendHighlight" DROP DEFAULT;
ALTER TABLE "AviationSafetyBrief" ALTER COLUMN "militaryIncidentCount" DROP DEFAULT;
ALTER TABLE "AviationSafetyBrief" ALTER COLUMN "militaryTrendHighlight" DROP DEFAULT;
