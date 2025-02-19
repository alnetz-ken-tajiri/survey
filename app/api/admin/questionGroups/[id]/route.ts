import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions as options } from "@/lib/auth"
import prisma from "@/lib/prisma"


// GET: 特定の質問グループを取得
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(options)
    const userId = session?.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    })
    const companyId = user?.employee?.companyId
    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    const questionGroup = await prisma.questionGroup.findUnique({
      where: {
        id: params.id,
        companyId,
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

// PUT: 質問グループの更新
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(options)
    const userId = session?.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    })
    const companyId = user?.employee?.companyId
    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, questions } = body

    const questionGroup = await prisma.questionGroup.update({
      where: { id: params.id, companyId },
      data: {
        name,
        description,
        questionGroupQuestions: {
          deleteMany: {},
          create: questions.map((question: { id: string }, index: number) => ({
            questionId: question.id,
          })),
        },
      },
      include: {
        questionGroupQuestions: {
          include: {
            question: true,
          },
        },
      },
    })

    return NextResponse.json(questionGroup)
  } catch (error) {
    console.error("Error updating question group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: 質問グループの削除（ソフトデリート）
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(options)
    const userId = session?.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    })
    const companyId = user?.employee?.companyId
    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    await prisma.questionGroup.update({
      where: { id: params.id, companyId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Question group deleted successfully" })
  } catch (error) {
    console.error("Error deleting question group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

