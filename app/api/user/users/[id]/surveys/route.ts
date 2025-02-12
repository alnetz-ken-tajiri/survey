import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId

  try {
    const surveys = await prisma.surveyTarget.findMany({
      where: {
        userId: userId,
      },
      include: {
        survey: true,
        responses: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    const formattedSurveys = surveys.map((target) => ({
      id: target.survey.id,
      name: target.survey.name,
      status: target.survey.status,
    }))

    return NextResponse.json(formattedSurveys)
  } catch (error) {
    console.error("Error fetching user surveys:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

