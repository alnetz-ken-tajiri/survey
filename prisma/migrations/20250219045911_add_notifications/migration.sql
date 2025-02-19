/*
  Warnings:

  - You are about to drop the column `employee_id` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_employee_id_fkey";

-- DropIndex
DROP INDEX "idx_notification_employee_id";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "employee_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_notification_user_id" ON "notifications"("user_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
