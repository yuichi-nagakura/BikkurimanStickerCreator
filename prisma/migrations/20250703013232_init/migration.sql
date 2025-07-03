-- CreateTable
CREATE TABLE "GeneratedImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "sourceImageUrl" TEXT,
    "title" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "effects" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "data" TEXT NOT NULL,
    "result" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ImageCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promptHash" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "metadata" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UsageStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "GeneratedImage_createdAt_idx" ON "GeneratedImage"("createdAt");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImageCache_promptHash_key" ON "ImageCache"("promptHash");

-- CreateIndex
CREATE INDEX "ImageCache_expiresAt_idx" ON "ImageCache"("expiresAt");

-- CreateIndex
CREATE INDEX "UsageStats_date_idx" ON "UsageStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UsageStats_date_key" ON "UsageStats"("date");
