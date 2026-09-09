-- AlterTable
ALTER TABLE "AviationSafetyArticle" ADD COLUMN     "bullets" TEXT NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "AviationSafetyBrief" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "catchphrase" TEXT NOT NULL,
    "trendHighlight" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AviationSafetyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AviationSafetyBrief_month_year_key" ON "AviationSafetyBrief"("month", "year");
