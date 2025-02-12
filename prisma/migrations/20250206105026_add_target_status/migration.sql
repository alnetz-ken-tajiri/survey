/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `MailNotification` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SurveyTargetStatus" ADD VALUE 'NOT_STARTED';
ALTER TYPE "SurveyTargetStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "SurveyTargetStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "MailNotification" DROP COLUMN "scheduledAt";

-- AlterTable
ALTER TABLE "surveys" ADD COLUMN     "status" "SurveyStatus" NOT NULL DEFAULT 'INACTIVE';
