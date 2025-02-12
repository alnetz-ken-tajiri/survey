-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'RADIO', 'CHECKBOX', 'SELECT', 'FILE');

-- CreateTable
CREATE TABLE "surveys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "question_group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_targets" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "survey_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responses" (
    "id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "question_id" TEXT,
    "question_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_details" (
    "id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "question_option_id" TEXT,
    "optionLabel" TEXT,
    "optionValue" TEXT,
    "textValue" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "response_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "question_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_group_questions" (
    "question_group_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "question_group_questions_pkey" PRIMARY KEY ("question_group_id","question_id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "QuestionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_survey_target_survey_id" ON "survey_targets"("survey_id");

-- CreateIndex
CREATE INDEX "idx_survey_target_user_id" ON "survey_targets"("user_id");

-- CreateIndex
CREATE INDEX "idx_response_target_id" ON "responses"("target_id");

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_question_group_id_fkey" FOREIGN KEY ("question_group_id") REFERENCES "question_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_targets" ADD CONSTRAINT "survey_targets_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_targets" ADD CONSTRAINT "survey_targets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "survey_targets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_details" ADD CONSTRAINT "response_details_response_id_fkey" FOREIGN KEY ("response_id") REFERENCES "responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_details" ADD CONSTRAINT "response_details_question_option_id_fkey" FOREIGN KEY ("question_option_id") REFERENCES "question_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_group_questions" ADD CONSTRAINT "question_group_questions_question_group_id_fkey" FOREIGN KEY ("question_group_id") REFERENCES "question_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_group_questions" ADD CONSTRAINT "question_group_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
