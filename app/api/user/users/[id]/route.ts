import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("ユーザーの取得中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { loginId, email, password, employee } = body


    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        loginId,
        email,
        password,
        employee: employee

          ? {
              upsert: {
                create: {
                  name: employee.name,
                  number: employee.number,
                  companyId: employee.companyId,
                  organizationId: employee.organizationId,
                },
                update: {
                  name: employee.name,
                  number: employee.number,
                  companyId: employee.companyId,
                  organizationId: employee.organizationId,
                },
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

    return NextResponse.json(user)
  } catch (error) {
    console.error("ユーザーの更新中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "ユーザーが正常に削除されました" })
  } catch (error) {
    console.error("ユーザーの削除中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

