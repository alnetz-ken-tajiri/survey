import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions as options } from "@/lib/auth"

const prisma = new PrismaClient()

// GET: 質問一覧の取得
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

    const questions = await prisma.question.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        questionOptions: true,
        tags: true,
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: 新しい質問の作成
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
    const { name, description, public: isPublic, type, questionOptions, hashtags } = body

    const question = await prisma.question.create({
      data: {
        name,
        description,
        companyId,
        public: isPublic,
        type,
        questionOptions: {
          create: questionOptions,
        },
        tags: {
          connectOrCreate: hashtags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        questionOptions: true,
        tags: true,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: 質問の更新
export async function PUT(request: NextRequest) {
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
    const { id, name, description, public: isPublic, type, questionOptions, hashtags } = body

    const question = await prisma.question.update({
      where: { id, companyId },
      data: {
        name,
        description,
        public: isPublic,
        type,
        questionOptions: {
          deleteMany: {},
          create: questionOptions,
        },
        tags: {
          set: [],
          connectOrCreate: hashtags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        questionOptions: true,
        tags: true,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: 質問の削除（ソフトデリート）
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 })
    }

    const question = await prisma.question.update({
      where: { id, companyId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

