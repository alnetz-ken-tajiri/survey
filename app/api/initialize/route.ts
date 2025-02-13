import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { user, employee, company } = await req.json()

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(user.password, 10)

    // トランザクションでデータを一括投入
    const result = await prisma.$transaction(async (tx) => {
      // 会社の作成
      const createdCompany = await tx.company.create({
        data: {
          companyName: company.companyName,
          companyCode: company.companyCode,
        },
      })

      // ユーザーの作成
      const createdUser = await tx.user.create({
        data: {
          loginId: user.loginId,
          email: user.email,
          password: hashedPassword,
          role: user.role,
        },
      })

      // 従業員の作成
      const createdEmployee = await tx.employee.create({
        data: {
          name: employee.name,
          number: employee.number,
          userId: createdUser.id,
          companyId: createdCompany.id,
        },
      })

      return { user: createdUser, employee: createdEmployee, company: createdCompany }
    })

    return NextResponse.json({ message: "初期データの設定が完了しました", data: result })
  } catch (error) {
    console.error("初期化エラー:", error)
    return NextResponse.json({ error: "初期データの設定に失敗しました" }, { status: 500 })
  }
}

