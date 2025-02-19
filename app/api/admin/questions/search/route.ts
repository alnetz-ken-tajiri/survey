import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions as options } from "@/lib/auth"

const prisma = new PrismaClient()

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
    const q = searchParams.get("q")

    const questions = await prisma.question.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [
          { name: { contains: q || "", mode: "insensitive" } },
          { description: { contains: q || "", mode: "insensitive" } },
        ],
      },
      include: {
        questionOptions: true,
      },
      take: 10,
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error searching questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

