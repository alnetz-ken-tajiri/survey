// ユーザーが回答したアンケートの回答を取得する

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id


    const id = params.id
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        surveyTargets: {
          where: {
            userId,
          },
        },
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
    })
    const surveyTargets = survey?.surveyTargets
    const questionGroup = survey?.questionGroup
    const questionGroupQuestions = questionGroup?.questionGroupQuestions
    const question = questionGroupQuestions?.map((question: any) => question.question)
    const questionOptions = question?.map((question: any) => question?.questionOptions)
    return NextResponse.json({ surveyTargets, questionGroup, questionGroupQuestions, question, questionOptions })



  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch survey" }, { status: 500 })
  }
}

