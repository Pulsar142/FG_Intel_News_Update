-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "strategicRelevance" SET NOT NULL;
ALTER TABLE "Article" ALTER COLUMN "militaryPerspective" SET NOT NULL;
ALTER TABLE "Article" DROP COLUMN "perspective";
ALTER TABLE "Article" DROP COLUMN "perspectiveHidden";
