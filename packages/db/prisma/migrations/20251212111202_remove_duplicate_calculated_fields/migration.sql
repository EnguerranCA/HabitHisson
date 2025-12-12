/*
  Warnings:

  - You are about to drop the column `hedgehogState` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bestStreak` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `currentLevel` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `totalXp` on the `UserProgress` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_level_xp_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hedgehogState",
DROP COLUMN "level";

-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "bestStreak",
DROP COLUMN "currentLevel",
DROP COLUMN "totalXp";

-- CreateIndex
CREATE INDEX "User_xp_idx" ON "User"("xp");
