/*
  Warnings:

  - You are about to drop the column `connectionId` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `employee_id` on the `messages` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipient_id_fkey";

-- DropIndex
DROP INDEX "connections_connectionId_key";

-- DropIndex
DROP INDEX "idx_employee_id";

-- AlterTable
ALTER TABLE "connections" DROP COLUMN "connectionId";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "employee_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_user_id" ON "messages"("user_id");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
