import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { uploadFileToS3 } from "@/lib/s3/upload" // S3アップロード関数をインポート

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }
    const thisUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        employee: {
          include: {
            company: true,
          },
        },
      },
    })

    if (!thisUser) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }
    const companyId = thisUser.employee?.companyId
    if (!companyId) {
      return NextResponse.json({ error: "会社が見つかりません" }, { status: 404 })
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

    if (!loginId || !email || !password || !role) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 })
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // アバターの処理
    let avatarUrl
    if (avatarFile) {
      try {
        avatarUrl = await uploadFileToS3(avatarFile, companyId, "avatar")
      } catch (error) {
        console.error("アバターのアップロード中にエラーが発生しました:", error)
        return NextResponse.json({ error: "アバターのアップロードに失敗しました" }, { status: 500 })
      }
    }

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        loginId,
        email,
        password: hashedPassword,
        avatar: avatarUrl,
        role,
        employee:
          employeeName || employeeNumber || organizationId
            ? {
                create: {
                  name: employeeName,
                  number: employeeNumber,
                  organizationId,
                  companyId,
                },
              }
            : undefined,
      },
      include: {
        employee: {
          include: {
            organization: true,
          },
        },
      },
    })

    // パスワードを除外
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("ユーザーの作成中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }
    const thisUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        employee: {
          include: {
            company: true,
          },
        },
      },
    })
    
    const companyId = thisUser?.employee?.companyId

    const users = await prisma.user.findMany({
      include: {
        employee: {
          include: {
            organization: true,
          },
        },
      },
      where: {
        employee: {
          companyId: companyId,
        },
      },
    })


    // パスワードを除外
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json(usersWithoutPassword)
  } catch (error) {
    console.error("ユーザー一覧の取得中にエラーが発生しました:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

