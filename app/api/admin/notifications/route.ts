// src/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { ApiGatewayManagementApi } from "aws-sdk";

/**
 * 管理者が通知を作成し、同時に接続中の各ユーザーに postToConnection で通知を送信する
 * URL: /api/admin/notifications
 */
export async function POST(request: NextRequest) {
  // 認証チェック
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 管理者ユーザー情報取得（会社情報含む）
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { employee: { include: { company: true } } },
  });
  if (!user || !user.employee?.company) {
    return NextResponse.json({ error: "User or company not found" }, { status: 400 });
  }

  // リクエストボディから通知情報と通知対象ユーザーID群を取得
  const { title, message, importanceLevel, userIds } = await request.json();

  try {
    // 各対象ユーザーに対して通知レコードを作成
    const notifications = await Promise.all(
      userIds.map((targetUserId: string) =>
        prisma.notification.create({
          data: {
            title,
            message,
            importanceLevel,
            userId: targetUserId,
            companyId: user.employee?.company?.id,
            createdBy: session.user.id,
          },
        })
      )
    );

    // WS エンドポイントが設定されているか確認
    const wsEndpoint = process.env.WS_ENDPOINT;
    if (!wsEndpoint) {
      console.error("WS_ENDPOINT is not configured.");
      return NextResponse.json(
        { error: "WS_ENDPOINT is not configured" },
        { status: 500 }
      );
    }
    // AWS ApiGatewayManagementApi のインスタンス作成
    const apiGateway = new ApiGatewayManagementApi({ endpoint: wsEndpoint });

    // 複数の通知がある場合、ユーザーごとにまとめる
    const notificationsByUser: { [userId: string]: any[] } = {};
    notifications.forEach((n) => {
      if (!notificationsByUser[n.userId]) {
        notificationsByUser[n.userId] = [];
      }
      notificationsByUser[n.userId].push(n);
    });

    // 各対象ユーザーの接続情報を取得し、通知を送信する
    const sendPromises = Object.keys(notificationsByUser).map(async (targetUserId) => {
      // DBから対象ユーザーの全接続情報を取得（複数の接続がある場合も対応）
      const connections = await prisma.connection.findMany({
        where: { userId: targetUserId },
      });
      const payload = {
        type: "NOTIFY",
        data: notificationsByUser[targetUserId],
      };

      // 各接続に対して postToConnection を呼び出す
      const connectionSendPromises = connections.map(async (conn) => {
        try {
          await apiGateway
            .postToConnection({
              ConnectionId: conn.id,
              Data: JSON.stringify(payload),
            })
            .promise();
          console.log(`Sent notification to connection ${conn.id}`);
        } catch (error: any) {
          console.error(`Error sending notification to connection ${conn.id}:`, error);
          // GoneException (410) が発生した場合は、DB の接続情報を削除するなどの処理を検討
        }
      });
      await Promise.all(connectionSendPromises);
    });
    await Promise.all(sendPromises);

    return NextResponse.json(notifications, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

/**
 * 管理者が通知を取得する
 * URL: /api/admin/notifications
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { employee: { include: { company: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const notifications = await prisma.notification.findMany({
    where: { companyId: user.employee?.company?.id },
  });
  return NextResponse.json(notifications);
}
