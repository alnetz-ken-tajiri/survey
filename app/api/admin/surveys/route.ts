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
    const { questionGroupId, name, image, startDate, deadline } = await request.json()
    const companyId = await getCompanyId()

    // バリデーション
    if (!questionGroupId || !name || !image || !startDate || !deadline) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 })
    }

    // 日付のバリデーション
    const startDateObj = new Date(startDate)
    const deadlineObj = new Date(deadline)
    if (isNaN(startDateObj.getTime()) || isNaN(deadlineObj.getTime())) {
      return NextResponse.json({ error: "無効な日付形式です" }, { status: 400 })
    }
    if (startDateObj >= deadlineObj) {
      return NextResponse.json({ error: "開始日は締切日より前である必要があります" }, { status: 400 })
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
      // バイナリデータの場合（Data URL形式に対応）
      let base64Data = image
      let mimeType = "image/jpeg" // デフォルト

      if (base64Data.startsWith("data:")) {
        // Data URLの形式: data:[<MIME-type>];base64,<data>
        const matches = base64Data.match(/^data:(image\/\w+);base64,(.*)$/)
        if (matches) {
          mimeType = matches[1]
          base64Data = matches[2]
        } else {
          return NextResponse.json({ error: "無効な画像データです" }, { status: 400 })
        }
      }

      const extension = mimeType.split("/")[1]
      const fileName = `${Date.now()}-image.${extension}`
      const file = new File([Buffer.from(base64Data, "base64")], fileName, { type: mimeType })
      uploadedImageUrl = await uploadFileToS3(file, companyId, "survey-image")
    }

    // サーベイ作成
    const survey = await prisma.survey.create({
      data: {
        questionGroupId: questionGroup.id,
        name,
        image: uploadedImageUrl,
        status: "ACTIVE",
        companyId,
        startDate: startDateObj,
        deadline: deadlineObj,
      },
    })

    return NextResponse.json(
      {
        message: "サーベイが正常に作成されました",
        surveyId: survey.id,
      },
      { status: 201 },
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
    const companyId = await getCompanyId()
    const surveys = await prisma.survey.findMany({
      where: {
        companyId,
      },
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
