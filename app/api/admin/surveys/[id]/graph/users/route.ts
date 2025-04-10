import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * ユーザ一覧を取得する
 * url: /api/admin/surveys/[id]/graph/users
 * @param request 
 * @returns 
 */
export  async function GET(request: NextRequest) {

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const thisUser = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        include: {
            employee:true
        },
    });

    if (!thisUser || !thisUser.employee) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const users = await prisma.user.findMany({
       
        include: {
            employee: {
                include: {
                    organization: true,
                }
            }
        },
        where: {
            employee: {
                companyId: thisUser.employee.companyId,
            }
        },
    });
    return NextResponse.json(users);
}
