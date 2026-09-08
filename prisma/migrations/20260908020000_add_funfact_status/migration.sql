-- DropIndex
DROP INDEX "FunFact_active_idx";

-- AlterTable
ALTER TABLE "FunFact" DROP COLUMN "active",
ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "FunFact_status_idx" ON "FunFact"("status");


-- Guarantee at most one FunFact can ever be PUBLISHED at a time (the app
-- also enforces this in publishFunFact(), this is a belt-and-braces DB
-- constraint against any future bug/race).
CREATE UNIQUE INDEX "FunFact_single_published_idx" ON "FunFact" ((true)) WHERE "status" = 'PUBLISHED';
