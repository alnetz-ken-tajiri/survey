-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "organization_id" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leader_id" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_relationships" (
    "id" TEXT NOT NULL,
    "ancestor_id" TEXT NOT NULL,
    "descendant_id" TEXT NOT NULL,
    "company_id" TEXT,
    "depth" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_organization_company_id" ON "organizations"("company_id");

-- CreateIndex
CREATE INDEX "idx_organization_relationship_company_id" ON "organization_relationships"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_relationships_ancestor_id_descendant_id_key" ON "organization_relationships"("ancestor_id", "descendant_id");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_relationships" ADD CONSTRAINT "organization_relationships_ancestor_id_fkey" FOREIGN KEY ("ancestor_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_relationships" ADD CONSTRAINT "organization_relationships_descendant_id_fkey" FOREIGN KEY ("descendant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_relationships" ADD CONSTRAINT "organization_relationships_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
