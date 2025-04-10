-- AlterTable
ALTER TABLE "question_groups" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "survey_display_settings" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "display_count" INTEGER NOT NULL,

    CONSTRAINT "survey_display_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_links" (
    "id" TEXT NOT NULL,
    "from_question_id" TEXT NOT NULL,
    "to_question_id" TEXT NOT NULL,
    "relationType" TEXT,

    CONSTRAINT "question_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_display_settings_survey_id_key" ON "survey_display_settings"("survey_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_links_from_question_id_to_question_id_key" ON "question_links"("from_question_id", "to_question_id");

-- AddForeignKey
ALTER TABLE "survey_display_settings" ADD CONSTRAINT "survey_display_settings_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_links" ADD CONSTRAINT "question_links_from_question_id_fkey" FOREIGN KEY ("from_question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_links" ADD CONSTRAINT "question_links_to_question_id_fkey" FOREIGN KEY ("to_question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
