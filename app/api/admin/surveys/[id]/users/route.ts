import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const surveyId = params.id

    const users = await prisma.surveyTarget.findMany({
      where: {
        surveyId: surveyId,
      },
      include: {
        user: {
          include: {
            employee: true,
          },
        },
        mailNotifications: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        responses: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    const formattedUsers = users.map((target) => ({
      id: target.user.id,
      loginId: target.user.loginId,
      email: target.user.email,
      employee: {
        name: target.user.employee?.name,
        number: target.user.employee?.number,
      },
      emailStatus: target.mailNotifications[0]?.status || "NOT_SENT",
      responseStatus: target.responses.length > 0 ? "COMPLETED" : "NOT_ANSWERED",
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching users for survey:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

