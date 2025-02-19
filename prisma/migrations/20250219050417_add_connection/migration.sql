/*
  Warnings:

  - You are about to drop the column `employee_id` on the `connections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `connections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `connections` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "connections" DROP CONSTRAINT "connections_employee_id_fkey";

-- DropIndex
DROP INDEX "connections_employee_id_key";

-- DropIndex
DROP INDEX "idx_connection_employee_id";

-- AlterTable
ALTER TABLE "connections" DROP COLUMN "employee_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "connections_user_id_key" ON "connections"("user_id");

-- CreateIndex
CREATE INDEX "idx_connection_user_id" ON "connections"("user_id");

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
