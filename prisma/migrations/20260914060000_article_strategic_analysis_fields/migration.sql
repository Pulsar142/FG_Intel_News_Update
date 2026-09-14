-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "analysisHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "militaryPerspective" TEXT,
ADD COLUMN     "strategicRelevance" TEXT;


-- carry forward any existing hidden flag onto the new combined toggle
UPDATE "Article" SET "analysisHidden" = "perspectiveHidden" WHERE "perspectiveHidden" = true;
