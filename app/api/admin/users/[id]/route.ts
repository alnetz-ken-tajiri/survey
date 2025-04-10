import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { uploadFileToS3 } from "@/lib/s3/upload"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "ログインしてください" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          include: {
            company: true,
            organization: true,
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

    // パスワードを除外
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("ユーザーの取得中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "ログインしてください" }, { status: 401 })
    }

    const formData = await request.formData()
    const loginId = formData.get("loginId") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const employeeName = formData.get("employeeName") as string
    const employeeNumber = formData.get("employeeNumber") as string
    const organizationId = formData.get("organizationId") as string
    const avatarFile = formData.get("avatar") as File | null
    const role = formData.get("role") as "USER" | "SUPER_USER" | "ADMIN" | "USER_ADMIN"

    const userId = session.user.id
    const thisUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        employee: {
          select: {
            companyId: true,
          },
        },
      },
    })
    if (!thisUser?.employee?.companyId) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    let avatarUrl
    if (avatarFile) {
      try {
        avatarUrl = await uploadFileToS3(avatarFile, thisUser.employee.companyId, "avatar")
      } catch (error) {
        console.error("アバターのアップロード中にエラーが発生しました:", error)
        return NextResponse.json({ error: "アバターのアップロードに失敗しました" }, { status: 500 })
      }
    }

    let hashedPassword
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        loginId,
        email,
        ...(hashedPassword && { password: hashedPassword }),
        ...(avatarUrl && { avatar: avatarUrl }),
        role,
        employee: {
          upsert: {
            create: {
              name: employeeName,
              number: employeeNumber,
              companyId: thisUser.employee.companyId,
              organizationId,
            },
            update: {
              name: employeeName,
              number: employeeNumber,
              companyId: thisUser.employee.companyId,
              organizationId,
            },
          },
        },
      },
      include: {
        employee: {
          include: {
            organization: true,
            leadOrganizations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })

    // パスワードを除外
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("ユーザーの更新中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "ログインしてください" }, { status: 401 })  
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        employee: {
          delete: true,
        },
      },
    })

    return NextResponse.json({ message: "ユーザーが削除されました" }, { status: 200 })
  } catch (error) {
    console.error("ユーザーの削除中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}