/*
  Warnings:

  - You are about to drop the column `hedgehogItems` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `streakRecord` on the `UserProgress` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- DropIndex
DROP INDEX "Habit_userId_idx";

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "decorationId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "hedgehogItems",
DROP COLUMN "streakRecord",
ADD COLUMN     "bestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLoginDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DecorationItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unlockLevel" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecorationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDecoration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "decorationId" INTEGER NOT NULL,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "growthLevel" INTEGER NOT NULL DEFAULT 1,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDecoration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "habitId" INTEGER,
    "duration" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconPath" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DecorationItem_unlockLevel_idx" ON "DecorationItem"("unlockLevel");

-- CreateIndex
CREATE INDEX "DecorationItem_category_unlockLevel_idx" ON "DecorationItem"("category", "unlockLevel");

-- CreateIndex
CREATE INDEX "UserDecoration_userId_idx" ON "UserDecoration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDecoration_userId_decorationId_positionX_positionY_key" ON "UserDecoration"("userId", "decorationId", "positionX", "positionY");

-- CreateIndex
CREATE INDEX "FocusSession_userId_completedAt_idx" ON "FocusSession"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "FocusSession_userId_completed_idx" ON "FocusSession"("userId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE INDEX "Badge_category_idx" ON "Badge"("category");

-- CreateIndex
CREATE INDEX "UserBadge_userId_unlockedAt_idx" ON "UserBadge"("userId", "unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "Habit_userId_isActive_idx" ON "Habit"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Habit_userId_createdAt_idx" ON "Habit"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HabitLog_habitId_date_completed_idx" ON "HabitLog"("habitId", "date", "completed");

-- CreateIndex
CREATE INDEX "User_level_xp_idx" ON "User"("level", "xp");

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_decorationId_fkey" FOREIGN KEY ("decorationId") REFERENCES "DecorationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDecoration" ADD CONSTRAINT "UserDecoration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDecoration" ADD CONSTRAINT "UserDecoration_decorationId_fkey" FOREIGN KEY ("decorationId") REFERENCES "DecorationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
