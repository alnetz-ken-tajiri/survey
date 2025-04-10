import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questionGroup: {
            include: {
                questionGroupQuestions: {
                    include: {
                        question: {
                            include: {
                                tags: true,
                                category: true,
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

    const questionGroup = survey.questionGroup;
    
    return NextResponse.json({
      surveyId: survey.id,
      surveyName: survey.name,
      questionGroup,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

