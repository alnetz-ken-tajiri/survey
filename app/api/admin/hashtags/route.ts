import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "タグ名は必須です" }, { status: 400 })
    }

    // 既存のタグをチェック
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    })

    if (existingTag) {
      return NextResponse.json(existingTag)
    }

    // 新しいタグを作成
    const tag = await prisma.tag.create({
      data: { name },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

