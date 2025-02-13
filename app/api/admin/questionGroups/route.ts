import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { uploadFileToS3 } from "@/lib/s3/upload"
import { getCompanyId } from "@/lib/getCompanyId"

/**
 * 質問グループを作成する
 * url: /api/admin/questionGroups
 * method: POST
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, fileUrl, questionGroupQuestions } = body

    // バリデーション
    if (!name) {
      return NextResponse.json({ error: "名前が必要です" }, { status: 400 })
    }
    if (!questionGroupQuestions || !Array.isArray(questionGroupQuestions)) {
      return NextResponse.json({ error: "質問が必要です" }, { status: 400 })
    }

    const companyId = await getCompanyId()

    let uploadedFileUrl: string | undefined = undefined

    // ファイルアップロードがある場合のみ処理
    if (fileUrl) {
      if (typeof fileUrl === "string" && fileUrl.startsWith("http")) {
        // URLの場合
        const response = await fetch(fileUrl)
        if (!response.ok) {
          return NextResponse.json({ error: "画像URLが無効です" }, { status: 400 })
        }
        const arrayBuffer = await response.arrayBuffer()
        const fileName = `${Date.now()}-uploaded.jpg`
        const file = new File([arrayBuffer], fileName, { type: response.headers.get("Content-Type") || "image/jpeg" })
        uploadedFileUrl = await uploadFileToS3(file, companyId, "question-group")
      } else {
        // バイナリデータの場合
        const fileName = `${Date.now()}-uploaded.jpg`
        const file = new File([Buffer.from(fileUrl, "base64")], fileName, { type: "image/jpeg" })
        uploadedFileUrl = await uploadFileToS3(file, companyId, "question-group")
      }
    }

    // データ作成処理
    const newQuestionGroup = await prisma.questionGroup.create({
      data: {
        name,
        description,
        fileUrl: uploadedFileUrl, // S3アップロード後のURLを保存
        companyId,
        questionGroupQuestions: {
          create: questionGroupQuestions.map((item: any) => ({
            question: {
              create: {
                name: item.question.name,
                description: item.question.description,
                type: item.question.type,
                questionOptions: item.question.questionOptions?.length
                  ? { create: item.question.questionOptions.map((option: any) => ({ name: option.name, value: option.value })) }
                  : undefined,
              },
            },
          })),
        },
      },
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
    })

    return NextResponse.json(newQuestionGroup, { status: 201 })
  } catch (error) {
    console.error("Error creating question group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * 質問グループ一覧を取得する
 * url: /api/admin/questionGroups
 * method: GET
 */
export async function GET() {
  try {
    const companyId = await getCompanyId()
    const questionGroups = await prisma.questionGroup.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        questionGroupQuestions: {
          include: {
            question: {
              include: {
                questionOptions: true,
              },
            },
          },
          orderBy: {
            question: {
              order: "asc",
            },
          },
        },
      },
    })
    return NextResponse.json(questionGroups)
  } catch (error) {
    console.error("Error fetching question groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
