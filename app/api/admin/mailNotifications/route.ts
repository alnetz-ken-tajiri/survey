import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import nodemailer from "nodemailer"
import { MailNotificationStatus, MailNotificationType } from "@prisma/client"

interface SendBulkRequest {
  surveyId: string
  allSelected: boolean
  selectedUserIds?: string[]
  excludedUserIds?: string[]
  templateId: string // 追加: テンプレートIDを受け取る
}

export async function POST(request: NextRequest) {
  try {
    const {
      surveyId,
      allSelected,
      selectedUserIds = [],
      excludedUserIds = [],
      templateId,
    } = (await request.json()) as SendBulkRequest
    console.log(surveyId, allSelected, selectedUserIds, excludedUserIds, templateId)

    if (!surveyId || !templateId) {
      return NextResponse.json({ message: "surveyId and templateId are required" }, { status: 400 })
    }

    // テンプレートを取得
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    let targets = []
    if (allSelected) {
      targets = await prisma.surveyTarget.findMany({
        where: {
          surveyId,
          userId: { notIn: excludedUserIds },
        },
        include: { user: true, survey: true },
      })
    } else {
      if (selectedUserIds.length === 0) {
        return NextResponse.json({ message: "No users selected to send." }, { status: 400 })
      }
      targets = await prisma.surveyTarget.findMany({
        where: {
          surveyId,
          userId: { in: selectedUserIds },
        },
        include: { user: true, survey: true },
      })
    }

    if (targets.length === 0) {
      return NextResponse.json({ message: "送信対象がありません" }, { status: 200 })
    }

    const transporter = nodemailer.createTransport({
      host: "email-smtp.ap-northeast-1.amazonaws.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SES_SMTP_USER || "AKIAQWVP7ZRUGUDKWHOA",
        pass: process.env.SES_SMTP_PASS || "BGGImAxMlTVqwPx/N71VxfXQAU+cFGlUS7l1wBonumJm",
      },
    })

    const results = []

    for (const target of targets) {
      const recipientEmail = target.user.email
      if (!recipientEmail) {
        results.push({
          userId: target.userId,
          status: "SKIPPED - no email",
        })
        continue
      }

      const mailNotification = await prisma.mailNotification.create({
        data: {
          surveyTargetId: target.id,
          mailType: MailNotificationType.SURVEY_REMINDER,
          status: MailNotificationStatus.PENDING,
        },
      })

      let sendStatus = "SENT"
      let sendError = null
      try {
        // 変数置換後の件名と本文を生成
        const subject = replaceVariables(template.subject, {
          "user.name": target.user.loginId,
          "user.email": target.user.email,
          "survey.name": target.survey.name,
          "survey.url": `${process.env.NEXT_PUBLIC_APP_URL}/surveys/${target.surveyId}`,
          "date.response": new Date().toLocaleDateString(),
          "date.deadline": target.survey.deadline ? new Date(target.survey.deadline).toLocaleDateString() : "未設定",
        })

        const bodyHtml = replaceVariables(template.content, {
          "user.name": target.user.loginId,
          "user.email": target.user.email,
          "survey.name": target.survey.name,
          "survey.url": `${process.env.NEXT_PUBLIC_APP_URL}/surveys/${target.surveyId}`,
          "date.response": new Date().toLocaleDateString(),
          "date.deadline": target.survey.deadline ? new Date(target.survey.deadline).toLocaleDateString() : "未設定",
        })

        // CID 添付用に、HTML 内の base64 画像を cid に置換し、添付データを生成
        let htmlWithCID = bodyHtml
        const attachments = []
        // 正規表現で最初の data URI 画像を検出（例: JPEG 画像）
        const regex = /data:(image\/[a-zA-Z]+);base64,([^"']+)/i
        const match = htmlWithCID.match(regex)
        if (match) {
          const mimeType = match[1] // 例: image/jpeg
          const base64Data = match[2]
          // CID 参照に置換（src 属性部分のみ置換）
          htmlWithCID = htmlWithCID.replace(/data:(image\/[a-zA-Z]+);base64,[^"']+/i, "cid:embeddedImage")
          attachments.push({
            filename: `image.${mimeType.split("/")[1]}`,
            content: Buffer.from(base64Data, "base64"),
            cid: "embeddedImage",
          })
        }

        await transporter.sendMail({
          from: "surveyhucups@gmail.com",
          to: recipientEmail,
          subject,
          html: htmlWithCID,
          attachments,
        })
      } catch (error) {
        console.error("メール送信失敗:", error)
        sendStatus = "FAILED"
        sendError = error
      }

      if (sendStatus === "SENT") {
        await prisma.mailNotification.update({
          where: { id: mailNotification.id },
          data: {
            status: MailNotificationStatus.SENT,
            sentAt: new Date(),
          },
        })
      } else {
        await prisma.mailNotification.update({
          where: { id: mailNotification.id },
          data: {
            status: MailNotificationStatus.CANCELLED,
          },
        })
      }

      results.push({
        userId: target.userId,
        userName: target.user.loginId,
        email: recipientEmail,
        mailNotificationId: mailNotification.id,
        status: sendStatus,
        error: sendError ? String(sendError) : null,
      })
    }

    return NextResponse.json(
      {
        message: "メール送信処理が完了しました",
        results,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in sendBulk route:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

function replaceVariables(content: string, variables: Record<string, string>) {
  return content.replace(/\{\{([^}]+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`)
}
