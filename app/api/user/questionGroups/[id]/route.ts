import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * 質問グループを取得する
 * 
 * url: /api/user/questionGroups/[id]
 * method: GET
 * @param request 
 * @param param1 
 * @returns 
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }
    const sessionUser = session.user
    if (!sessionUser) {
        return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 401 })
    }

    if (!params.id) {
        return NextResponse.json({ error: "質問グループのIDが指定されていません" }, { status: 400 })
    }

    try {
        const questionGroup = await prisma.questionGroup.findUnique({
            where: {

                id: params.id,
                deletedAt: null,
            },
            include: {
                questionGroupQuestions: {
                    include: {
                        question: {
                            include: {
                                questionOptions: true,
                            },
                        },
                    },

                },
            },
        })

        console.log(questionGroup)

        if (!questionGroup) {
            return NextResponse.json({ error: "質問グループが見つかりません" }, { status: 404 })
        }

        return NextResponse.json(questionGroup)
    } catch (error) {
        console.error("Error fetching question group:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

}

