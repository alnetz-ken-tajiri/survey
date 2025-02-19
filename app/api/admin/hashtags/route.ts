import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions as options } from "@/lib/auth"

const prisma = new PrismaClient()

// GET: ハッシュタグの検索
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    console.log(search)

    const hashtags = await prisma.tag.findMany({
      where: {
        name: {
          contains: search || "",
          mode: "insensitive",
        },
      },
      take: 10,
    })

    console.log(hashtags)
    return NextResponse.json(hashtags)
  } catch (error) {
    console.error("Error searching hashtags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: 新しいハッシュタグの作成
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

    const { name } = await request.json()

    const hashtag = await prisma.tag.create({
      data: { name },
    })

    return NextResponse.json(hashtag, { status: 201 })
  } catch (error) {
    console.error("Error creating hashtag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

