import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description, fileUrl, questionGroupQuestions } = body

    // トランザクションを使用して、すべての操作を一つのトランザクションで実行
    const updatedQuestionGroup = await prisma.$transaction(async (prisma) => {
      // 質問グループを更新
      const updatedGroup = await prisma.questionGroup.update({
        where: { id: params.id },
        data: {
          name,
          description,
          fileUrl,
        },
      })

      // 既存の質問IDを取得
      const existingQuestions = await prisma.questionGroupQuestions.findMany({
        where: { questionGroupId: params.id },
        select: { questionId: true },
      })
      const existingQuestionIds = existingQuestions.map((q) => q.questionId)

      // 送信された質問IDを取得
      const submittedQuestionIds = questionGroupQuestions.map((item: any) => item.question.id).filter((id: any) => id) // undefinedを除外

      // 削除すべき質問IDを特定
      const questionIdsToDelete = existingQuestionIds.filter((id) => !submittedQuestionIds.includes(id))

      // 不要な質問を削除（関連するレコードも含めて）
      for (const questionId of questionIdsToDelete) {
        // QuestionOptionを削除
        await prisma.questionOption.deleteMany({
          where: { questionId: questionId },
        })

        // QuestionGroupQuestionsを削除
        await prisma.questionGroupQuestions.deleteMany({
          where: { questionId: questionId },
        })

        // Questionを削除
        await prisma.question.delete({
          where: { id: questionId },
        })
      }

      // 既存の質問とオプションを更新または作成
      for (const item of questionGroupQuestions) {
        const { question } = item
        if (question.id) {
          // 既存の質問を更新
          await prisma.question.update({
            where: { id: question.id },
            data: {
              name: question.name,
              description: question.description,
              type: question.type,
            },
          })

          // 既存のオプションを削除
          await prisma.questionOption.deleteMany({
            where: { questionId: question.id },
          })

          // 新しいオプションを作成
          if (question.questionOptions && question.questionOptions.length > 0) {
            await prisma.questionOption.createMany({
              data: question.questionOptions.map((option: any) => ({
                name: option.name,
                value: option.value,
                questionId: question.id,
              })),
            })
          }
        } else {
          // 新しい質問を作成
          const newQuestion = await prisma.question.create({
            data: {
              name: question.name,
              description: question.description,
              type: question.type,
              questionGroupQuestions: {
                create: {
                  questionGroupId: params.id,
                },
              },
            },
          })

          // 新しい質問のオプションを作成
          if (question.questionOptions && question.questionOptions.length > 0) {
            await prisma.questionOption.createMany({
              data: question.questionOptions.map((option: any) => ({
                name: option.name,
                value: option.value,
                questionId: newQuestion.id,
              })),
            })
          }
        }
      }

      // 更新された質問グループを取得
      return prisma.questionGroup.findUnique({
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
    })

    return NextResponse.json(updatedQuestionGroup)
  } catch (error) {
    console.error("Error updating question group:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "ユニーク制約違反。重複データが原因です。" },
        { status: 400 },
      )
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "関連するデータが存在するため、削除できません。" },
        { status: 400 },
      )
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { error: "質問グループが見つかりません。" },
        { status: 404 },
      )
    }
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

