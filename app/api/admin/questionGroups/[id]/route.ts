import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const questionGroup = await prisma.questionGroup.findUnique({
      where: { id: params.id },
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
    


    if (!questionGroup) {
      return NextResponse.json({ error: "Question group not found" }, { status: 404 })
    }

    for (const question of questionGroup.questionGroupQuestions) {
      console.log(question.question)
    }

    return NextResponse.json(questionGroup)
  } catch (error) {
    console.error("Error fetching question group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

