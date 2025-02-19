/*
  Warnings:

  - The values [Low,Medium,High] on the enum `ImportanceLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImportanceLevel_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
ALTER TABLE "messages" ALTER COLUMN "importance_level" TYPE "ImportanceLevel_new" USING ("importance_level"::text::"ImportanceLevel_new");
ALTER TABLE "notifications" ALTER COLUMN "importance_level" TYPE "ImportanceLevel_new" USING ("importance_level"::text::"ImportanceLevel_new");
ALTER TYPE "ImportanceLevel" RENAME TO "ImportanceLevel_old";
ALTER TYPE "ImportanceLevel_new" RENAME TO "ImportanceLevel";
DROP TYPE "ImportanceLevel_old";
COMMIT;
