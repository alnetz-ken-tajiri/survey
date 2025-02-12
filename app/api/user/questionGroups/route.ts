import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description, fileUrl, questionGroupQuestions } = body

    // トランザクションを使用して、すべての操作を一つのトランザクションで実行
    const updatedQuestionGroup = await prisma.$transaction(async (prisma) => {
      // 既存の質問とオプションを削除
      await prisma.questionGroupQuestions.deleteMany({
        where: { questionGroupId: params.id },
      })

      // 質問グループを更新
      const updatedGroup = await prisma.questionGroup.update({
        where: { id: params.id },
        data: {
          name,
          description,
          fileUrl,
          questionGroupQuestions: {
            create: questionGroupQuestions.map((item: any) => ({
              question: {
                create: {
                  name: item.question.name,
                  description: item.question.description,
                  type: item.question.type,
                  questionOptions: {
                    create:
                      item.question.options?.map((option: any) => ({
                        name: option.name,
                        value: option.value,
                      })) || [],
                  },
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

      return updatedGroup
    })

    return NextResponse.json(updatedQuestionGroup)
  } catch (error) {
    console.error("Error updating question group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }
    const sessionUser = session.user
    if (!sessionUser) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 401 })
    }
    const employee = await prisma.employee.findUnique({
      where: {
        id: sessionUser.id,
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "従業員が見つかりません" }, { status: 401 })
    }
    const companyId = employee.companyId
    if (!companyId) {
      return NextResponse.json({ error: "会社が見つかりません" }, { status: 401 })
    }
    const questionGroup = await prisma.questionGroup.findMany({
      where: {
        deletedAt: null,
        // companyId: companyId,
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

    if (!questionGroup) {
      return NextResponse.json({ error: "Question group not found" }, { status: 404 })
    }

    return NextResponse.json(questionGroup)
  } catch (error) {
    console.error("Error fetching question group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

