-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SUPER_USER', 'ADMIN', 'USER_ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
