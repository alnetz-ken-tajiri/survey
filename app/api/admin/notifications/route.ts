import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

/**
 * 管理者が通知を作成する
 * URL: /api/admin/notifications
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: { include: { company: true } } },
    })
  
    if (!user || !user.employee?.company) {
      return NextResponse.json({ error: "User or company not found" }, { status: 400 })
    }
  
    const { title, message, importanceLevel, userIds } = await request.json()
  
    try {
      const notifications = await Promise.all(
        userIds.map((userId: string) =>
          prisma.notification.create({
            data: {
              title,
              message,
              importanceLevel,
              userId,
              companyId: user.employee?.company?.id,
              createdBy: session.user.id,
            },
          }),
        ),
      )
  
      return NextResponse.json(notifications, { status: 201 })
    } catch (error) {
      console.error("Error creating notification:", error)
      return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }
  }

/**
 * 管理者が通知を取得する
 * URL: /api/admin/notifications
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
    
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
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
    });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
        where: {
            companyId: user.employee?.company?.id,
        },
    });

    return NextResponse.json(notifications);
}
