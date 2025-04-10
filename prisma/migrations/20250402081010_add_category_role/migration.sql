-- CreateEnum
CREATE TYPE "QuestionRole" AS ENUM ('NORMAL', 'CATEGORY');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "role" "QuestionRole" NOT NULL DEFAULT 'NORMAL';

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
