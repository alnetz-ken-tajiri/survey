-- CreateTable
CREATE TABLE "company_details" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "corporate_number" TEXT,
    "established_date" TIMESTAMP(3),
    "representative_name" TEXT,
    "business_description" TEXT,
    "number_of_employees" INTEGER,
    "capital" DECIMAL(65,30),
    "fiscal_year_end" INTEGER,
    "industry" TEXT,
    "logo_url" TEXT,
    "linkedin_url" TEXT,
    "twitter_url" TEXT,
    "facebook_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "company_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_details_company_id_key" ON "company_details"("company_id");

-- AddForeignKey
ALTER TABLE "company_details" ADD CONSTRAINT "company_details_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
