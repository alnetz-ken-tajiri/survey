import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getCompanyId } from "@/lib/getCompanyId"
import { uploadFileToS3 } from "@/lib/s3/upload"

const prisma = new PrismaClient()

/**
 * サーベイ作成
 * @param request NextRequest
 * @returns JSON response
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "認証されていません" }, { status: 401 })
  }

  try {
    const { questionGroupId, name, image } = await request.json()
    const companyId = await getCompanyId()

    // バリデーション
    if (!questionGroupId || !name || !image) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 })
    }

    // 質問グループの存在確認
    const questionGroup = await prisma.questionGroup.findUnique({
      where: { id: questionGroupId },
    })

    if (!questionGroup) {
      return NextResponse.json({ error: "指定された質問グループが見つかりません" }, { status: 404 })
    }

    let uploadedImageUrl: string

    // `image` がURLかバイナリデータかを判別
    if (typeof image === "string" && image.startsWith("http")) {
      // URLの場合
      const response = await fetch(image)
      if (!response.ok) {
        return NextResponse.json({ error: "画像URLが無効です" }, { status: 400 })
      }
      const arrayBuffer = await response.arrayBuffer()
      const fileName = `${Date.now()}-image.jpg`
      const file = new File([arrayBuffer], fileName, { type: response.headers.get("Content-Type") || "image/jpeg" })
      uploadedImageUrl = await uploadFileToS3(file, companyId, "survey-image")
    } else {
      // バイナリデータの場合（デコードを想定）
      const fileName = `${Date.now()}-image.jpg`
      const file = new File([Buffer.from(image, "base64")], fileName, { type: "image/jpeg" })
      uploadedImageUrl = await uploadFileToS3(file, companyId, "survey-image")
    }

    // サーベイ作成
    const survey = await prisma.survey.create({
      data: {
        questionGroupId: questionGroup.id,
        name,
        image: uploadedImageUrl,
        status: "ACTIVE",
      },
    })

    return NextResponse.json(
      {
        message: "サーベイが正常に作成されました",
        surveyId: survey.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("サーベイの作成中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

/**
 * サーベイ一覧取得
 * url: /api/admin/surveys
 * method: GET
 * @returns JSON response
 */
export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        questionGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(surveys)
  } catch (error) {
    console.error("Error fetching surveys:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
