import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma Client取得方法に合わせて変更
import nodemailer from "nodemailer";
import { MailNotificationStatus, MailNotificationType } from "@prisma/client";

interface SendBulkRequest {
  surveyId: string;
  allSelected: boolean;
  selectedUserIds?: string[];
  excludedUserIds?: string[];
}

/**
 * メール送信
 * url: /api/admin/mailNotifications
 * method: POST
 * body: {
 *   surveyId: string;
 *   allSelected: boolean;
 *   selectedUserIds?: string[];
 *   excludedUserIds?: string[];
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { surveyId, allSelected, selectedUserIds = [], excludedUserIds = [] } =
      (await request.json()) as SendBulkRequest;

    if (!surveyId) {
      return NextResponse.json(
        { message: "surveyId is required" },
        { status: 400 }
      );
    }

    // 1. 対象となる SurveyTarget を検索
    let targets = [];
    if (allSelected) {
      // サーベイに紐づく全ユーザーを取得
      targets = await prisma.surveyTarget.findMany({
        where: {
          surveyId,
          userId: { notIn: excludedUserIds },
        },
        include: { user: true, survey: true },
      });
    } else {
      // 特定ユーザーのみ送信
      if (selectedUserIds.length === 0) {
        return NextResponse.json(
          { message: "No users selected to send." },
          { status: 400 }
        );
      }
      targets = await prisma.surveyTarget.findMany({
        where: {
          surveyId,
          userId: { in: selectedUserIds },
        },
        include: { user: true, survey: true },
      });
    }

    if (targets.length === 0) {
      return NextResponse.json(
        { message: "送信対象がありません" },
        { status: 200 }
      );
    }

    // 2. SMTP 経由で AWS SES に接続するための Transporter 設定
    //    ※環境変数を使うのが望ましいです。
    const transporter = nodemailer.createTransport({
      host: "email-smtp.ap-northeast-1.amazonaws.com", // 東京リージョンのSMTPエンドポイント
      port: 587, // STARTTLS を利用
      secure: false, // TLS は STARTTLS で利用するため false
      auth: {
        // ここには SES SMTP 認証情報を設定します。
        user: process.env.SES_SMTP_USER || "AKIAQWVP7ZRUGUDKWHOA",
        pass: process.env.SES_SMTP_PASS || "BGGImAxMlTVqwPx/N71VxfXQAU+cFGlUS7l1wBonumJm",
      },
    });

    // 結果を格納する配列
    const results = [];

    // 3. 対象ユーザーごとにメール送信処理を実施
    for (const target of targets) {
      const recipientEmail = target.user.email;
      if (!recipientEmail) {
        results.push({
          userId: target.userId,
          status: "SKIPPED - no email",
        });
        continue;
      }

      // 3-1) MailNotification を作成
      const mailNotification = await prisma.mailNotification.create({
        data: {
          surveyTargetId: target.id,
          mailType: MailNotificationType.SURVEY_REMINDER,
          status: MailNotificationStatus.PENDING,
          // scheduledAt: new Date(),
        },
      });

      // 3-2) メール送信
      let sendStatus = "SENT";
      let sendError = null;
      try {
        const subject = `【アンケートのご案内】${target.survey?.name || ""}`;
        const bodyText = `
          こんにちは、${target.user.loginId}さん

          アンケート「${target.survey?.name}」にご回答をお願いします。
        `;
        await transporter.sendMail({
          from: "surveyhucups@gmail.com", // SES で検証済みの送信元アドレス
          to: recipientEmail,
          subject,
          text: bodyText,
        });
      } catch (error) {
        console.error("メール送信失敗:", error);
        sendStatus = "FAILED";
        sendError = error;
      }

      // 3-3) 送信結果に応じて MailNotification を更新
      if (sendStatus === "SENT") {
        await prisma.mailNotification.update({
          where: { id: mailNotification.id },
          data: {
            status: MailNotificationStatus.SENT,
            sentAt: new Date(),
          },
        });
      } else {
        await prisma.mailNotification.update({
          where: { id: mailNotification.id },
          data: {
            status: MailNotificationStatus.CANCELLED,
          },
        });
      }

      // 3-4) 結果を配列に追加
      results.push({
        userId: target.userId,
        userName: target.user.loginId,
        email: recipientEmail,
        mailNotificationId: mailNotification.id,
        status: sendStatus,
        error: sendError ? String(sendError) : null,
      });
    }

    return NextResponse.json(
      {
        message: "メール送信処理が完了しました",
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in sendBulk route:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
