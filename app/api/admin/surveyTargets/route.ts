import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"


const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "認証されていません" }, { status: 401 })
  }

  if (!session.user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 401 })
  }

  try {
    const { surveyId, targetUserIds } = await request.json()

    if (!surveyId || !targetUserIds || !Array.isArray(targetUserIds)) {
      return NextResponse.json({ error: "無効なリクエストデータ" }, { status: 400 })
    }

    // サーベイの存在確認
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
    })

    if (!survey) {
      return NextResponse.json({ error: "指定されたサーベイが見つかりません" }, { status: 404 })
    }

    // 対象者レコードの作成
    const surveyTargets = await prisma.surveyTarget.createMany({
      data: targetUserIds.map((userId) => ({
        surveyId: survey.id,
        userId: userId,
        status: "ACTIVE",
      })),
    })

    return NextResponse.json(
      {
        message: "サーベイ対象者が正常に作成されました",
        targetCount: surveyTargets.count,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("サーベイ対象者の作成中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

