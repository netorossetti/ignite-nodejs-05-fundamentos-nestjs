/*
  Warnings:

  - A unique constraint covering the columns `[best-answer-id]` on the table `questions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "best-answer-id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created-at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated-at" TIMESTAMP(3),
    "author-id" TEXT NOT NULL,
    "question-id" TEXT NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_best-answer-id_key" ON "questions"("best-answer-id");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_best-answer-id_fkey" FOREIGN KEY ("best-answer-id") REFERENCES "answers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_author-id_fkey" FOREIGN KEY ("author-id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question-id_fkey" FOREIGN KEY ("question-id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
