-- AlterTable
ALTER TABLE "question_groups" ADD COLUMN     "company_id" TEXT;

-- AlterTable
ALTER TABLE "surveys" ADD COLUMN     "company_id" TEXT;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_groups" ADD CONSTRAINT "question_groups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
