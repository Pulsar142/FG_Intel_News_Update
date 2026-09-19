-- CreateEnum
CREATE TYPE "ExpertAnswerFormat" AS ENUM ('PARAGRAPH', 'BULLETS');

-- CreateTable
CREATE TABLE "ExpertQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "answer" TEXT,
    "answerFormat" "ExpertAnswerFormat",
    "sources" TEXT,
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "ExpertQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpertQuestion_status_idx" ON "ExpertQuestion"("status");
