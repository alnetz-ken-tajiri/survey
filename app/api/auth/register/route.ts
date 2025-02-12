import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { loginId, email, password, companyName, companyCode, employeeNumber } = body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { loginId }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "このメールアドレスまたはログインIDは既に使用されています" }, { status: 400 })
    }

    // Check if company exists or create new one
    let company = await prisma.company.findFirst({
      where: {
        companyCode: companyCode,
      },
    })

    if (!company) {
      company = await prisma.company.create({
        data: {
          id: crypto.randomUUID(), // Generate a UUID for the company id
          companyName,
          companyCode,
        },
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and employee in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(), // Generate a UUID for the user id
          loginId,
          email,
          password: hashedPassword,
        },
      })

      // Create employee
      const employee = await prisma.employee.create({
        data: {
          id: crypto.randomUUID(), // Generate a UUID for the employee id
          name: loginId, // You might want to add a separate name field in the form
          userId: user.id,
          number: employeeNumber,
          companyId: company.id,
        },
      })

      return { user, employee }
    })

    return NextResponse.json({ message: "ユーザーが正常に作成されました" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "登録中にエラーが発生しました" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

