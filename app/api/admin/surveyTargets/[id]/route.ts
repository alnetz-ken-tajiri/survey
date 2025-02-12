import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "ログインしてください" }, { status: 401 })
    }
    const thisUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        employee: {
          include: {
            company: true,
          },
        },
      },
    })
    if (!thisUser) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }
    const companyId = thisUser.employee?.companyId
    if (!companyId) {
      return NextResponse.json({ error: "会社が見つかりません" }, { status: 404 })
    }
    const user = await prisma.user.findMany({
      where: {
        employee: {
          companyId: companyId,
        },
      },
      include: {
        employee: {
          include: {
            organization: true,
            leadOrganizations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        surveyTargets: {
          where: {
            surveyId: params.id,
          },
        },
      },
    })


    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }


    return NextResponse.json(user)
  } catch (error) {
    console.error("ユーザーの取得中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}