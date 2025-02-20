-- AlterTable
ALTER TABLE "connections" ALTER COLUMN "deleted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "deleted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "deleted_at" DROP DEFAULT;
