/*
  Warnings:

  - You are about to drop the column `fax` on the `organization_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organization_details" DROP COLUMN "fax",
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "website" DROP NOT NULL;
