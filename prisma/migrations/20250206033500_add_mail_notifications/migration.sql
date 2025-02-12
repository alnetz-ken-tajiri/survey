/*
  Warnings:

  - You are about to drop the column `status_id` on the `survey_targets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[survey_id,user_id]` on the table `survey_targets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SurveyTargetStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MailNotificationStatus" AS ENUM ('PENDING', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MailNotificationType" AS ENUM ('SURVEY_REMINDER');

-- AlterTable
ALTER TABLE "survey_targets" DROP COLUMN "status_id",
ADD COLUMN     "status" "SurveyTargetStatus" NOT NULL DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "MailNotification" (
    "id" TEXT NOT NULL,
    "survey_target_id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "MailNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "mailType" "MailNotificationType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_targets_survey_id_user_id_key" ON "survey_targets"("survey_id", "user_id");

-- AddForeignKey
ALTER TABLE "MailNotification" ADD CONSTRAINT "MailNotification_survey_target_id_fkey" FOREIGN KEY ("survey_target_id") REFERENCES "survey_targets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
