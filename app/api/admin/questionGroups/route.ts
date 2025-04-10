import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions as options } from "@/lib/auth"
import prisma from "@/lib/prisma"   

// GET: 質問グループ一覧の取得
export async function GET(request: NextRequest) {
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

    // 他のユーザーが作成した質問グループも表示
    const questionGroups = await prisma.questionGroup.findMany({
      where: {
        deletedAt: null,
        OR: [
          { public: true },
          {  companyId: companyId },
        ],
      },
      include: {
        questionGroupQuestions: {
          include: {
            question: true,
          },
        },
        company: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(questionGroups)
  } catch (error) {
    console.error("Error fetching question groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: 新しい質問グループの作成
export async function POST(request: NextRequest) {
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
    const { name, description, questions, public: isPublic } = body

    const questionGroup = await prisma.questionGroup.create({
      data: {
        name,
        description,
        companyId,
        public: isPublic,
        questionGroupQuestions: {
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

    return NextResponse.json(questionGroup, { status: 201 })
  } catch (error) {
    console.error("Error creating question group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

