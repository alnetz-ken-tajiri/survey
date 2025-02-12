import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  console.log(id)
  try {

    const surveyTargets = await prisma.surveyTarget.findMany({
      where: {
        userId: id,
        deletedAt: null,
      },

      include: {
        survey: {
          select: {
            id: true,
            name: true,
            status: true,
            questionGroupId: true,
          },
        },
      },
    })
    console.log(surveyTargets)

    const formattedSurveyTargets = surveyTargets.map((target) => ({
      id: target.id,
      survey: {
        id: target.survey.id,
        name: target.survey.name,
        status: target.survey.status,
        questionGroupId: target.survey.questionGroupId,
      },
      status: target.status,
    }))

    return NextResponse.json(formattedSurveyTargets)
  } catch (error) {
    console.error("Error fetching user survey targets:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

