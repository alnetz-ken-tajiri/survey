import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        employee: {
          include: {
            leadOrganizations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })

    console.log(users)
    // Add a check to ensure users are not undefined
    if (!users) {
      throw new Error("Failed to fetch users")
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error("ユーザーの取得中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }
    if (!session.user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 401 })
    }
    const sessionUser = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        employee: true
      }
    })
    const companyId = sessionUser?.employee?.companyId
    if (!companyId) {
      return NextResponse.json({ error: "会社が見つかりません" }, { status: 401 })
    }

    const body = await request.json()
    const { loginId, email, password, employee } = body




    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        password,
        employee: employee
          ? {
              create: {
                name: employee.name,
                number: employee.number,
                companyId: companyId,
                organizationId: employee.organizationId,

              },
            }
          : undefined,
      },
      include: {
        employee: {
          include: {
            leadOrganizations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("ユーザーの作成中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

