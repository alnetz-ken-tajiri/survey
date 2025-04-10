import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questionGroup: {
        include: {
          questionGroupQuestions: {
            include: {
              question: {
                include: {
                  questionOptions: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  // CATEGORY role のみを抽出
  const questions = survey.questionGroup.questionGroupQuestions
  .map((qgq) => qgq.question)
  .filter((question) => question.role === "CATEGORY");


  return NextResponse.json(questions);
}
