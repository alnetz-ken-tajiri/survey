-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
