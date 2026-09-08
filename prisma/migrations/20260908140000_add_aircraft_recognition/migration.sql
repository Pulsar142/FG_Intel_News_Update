-- CreateEnum
CREATE TYPE "AircraftCategory" AS ENUM ('FIGHTER_JET', 'HELICOPTER', 'UAV', 'COMMERCIAL_AIRLINER');

-- CreateTable
CREATE TABLE "AircraftRecognition" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageSourceName" TEXT,
    "imageSourceUrl" TEXT,
    "aircraftName" TEXT NOT NULL,
    "category" "AircraftCategory" NOT NULL,
    "operator" TEXT,
    "description" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL DEFAULT 'bot',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AircraftRecognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AircraftRecognitionRequest" (
    "id" TEXT NOT NULL,
    "topic" TEXT,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "cardId" TEXT,
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "AircraftRecognitionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AircraftRecognition_status_idx" ON "AircraftRecognition"("status");

-- CreateIndex
CREATE INDEX "AircraftRecognitionRequest_status_idx" ON "AircraftRecognitionRequest"("status");

-- Guarantee at most one AircraftRecognition card can ever be PUBLISHED at a
-- time (the app also enforces this in publishAircraftRecognition(), this is
-- a belt-and-braces DB constraint against any future bug/race).
CREATE UNIQUE INDEX "AircraftRecognition_single_published_idx" ON "AircraftRecognition" ((true)) WHERE "status" = 'PUBLISHED';
