import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// テンプレート変数の定義を定数として管理
const TEMPLATE_VARIABLES = [
  "user.name",
  "user.email",
  "survey.name",
  "survey.url",
  "date.response",
  "date.deadline",
] as const

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, subject, content } = body
    const surveyId = params.id

    // 使用されている変数を検出
    const usedVariables = TEMPLATE_VARIABLES.filter(
      (variable) => content.includes(`{{${variable}}}`) || subject.includes(`{{${variable}}}`),
    )

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        variables: usedVariables, // 直接 String[] として保存
        survey: {
          connect: { id: surveyId },
        },
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Failed to create email template:", error)
    return NextResponse.json({ error: "Failed to create email template" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id, name, subject, content } = body

    // 使用されている変数を検出
    const usedVariables = TEMPLATE_VARIABLES.filter(
      (variable) => content.includes(`{{${variable}}}`) || subject.includes(`{{${variable}}}`),
    )

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name,
        subject,
        content,
        variables: usedVariables, // 直接 String[] として保存
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Failed to update email template:", error)
    return NextResponse.json({ error: "Failed to update email template" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const templates = await prisma.emailTemplate.findMany({
      where: { surveyId: params.id },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Failed to fetch email templates:", error)
    return NextResponse.json({ error: "Failed to fetch email templates" }, { status: 500 })
  }
}

