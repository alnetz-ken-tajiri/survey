import { type NextRequest, NextResponse } from "next/server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
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
    const q = searchParams.get("q") || ""
    const type = searchParams.get("type")
    const sort = searchParams.get("sort") || "newest"
    const tagsParam = searchParams.get("tags")

    // 単一カテゴリーと複数カテゴリーの両方をサポート
    const categoryId = searchParams.get("categoryId")
    const categoryIdsParam = searchParams.get("categoryIds")

    // カテゴリーIDの配列を作成
    const categoryIds = categoryIdsParam ? categoryIdsParam.split(",") : []
    // 単一カテゴリーIDがある場合は配列に追加
    if (categoryId && categoryId !== "all" && !categoryIds.includes(categoryId)) {
      categoryIds.push(categoryId)
    }

    // タグIDの配列を作成
    const tagIds = tagsParam ? tagsParam.split(",") : []

    // 検索条件を構築
    const whereCondition: any = {
      companyId,
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    }

    // タイプフィルターを追加
    if (type && type !== "all") {
      whereCondition.type = type
    }

    // カテゴリーフィルターを追加（複数選択対応）
    if (categoryIds.length > 0) {
      whereCondition.categoryId = {
        in: categoryIds,
      }
    }

    // タグフィルターを追加
    if (tagIds.length > 0) {
      whereCondition.tags = {
        some: {
          id: {
            in: tagIds,
          },
        },
      }
    }

    // ソート条件を設定
    const orderBy: any = {}
    if (sort === "name-asc") {
      orderBy.name = "asc"
    } else if (sort === "name-desc") {
      orderBy.name = "desc"
    } else if (sort === "oldest") {
      orderBy.createdAt = "asc"
    } else {
      // デフォルトは newest
      orderBy.createdAt = "desc"
    }

    const questions = await prisma.question.findMany({
      where: whereCondition,
      include: {
        questionOptions: true,
        tags: true, // タグを含める
        category: true, // カテゴリー情報を含める
      },
      orderBy,
      take: 50,
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error searching questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
