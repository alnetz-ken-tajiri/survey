import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { SurveyTargetStatus } from "@prisma/client"

/**
 * 質問グループを取得する
 * 
 * url: /api/user/surveys/[id]/questionGroups
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
        const survey = await prisma.survey.findUnique({
            where: {
                id: params.id,
                deletedAt: null,
            },
            include: {
                questionGroup: true,
                surveyTargets: {
                    where: {
                        userId: sessionUser.id,
                    }
                }
            },
        })

        if (!survey) {
            return NextResponse.json({ error: "調査が見つかりません" }, { status: 404 })
        }

        const questionGroup = await prisma.questionGroup.findUnique({
            where: {

                id: survey?.questionGroupId,
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



        // 調査の画像を追加　本来ならサーベイレスポンスをベースにしたい　TODO
        let questionGroupWithSurveyId = { ...questionGroup, surveyId: survey.id, fileUrl: survey.image , isCompleted: false}

        if (!questionGroupWithSurveyId) {
            return NextResponse.json({ error: "質問グループが見つかりません" }, { status: 404 })
        }

        //回答済みの場合
        if (survey.surveyTargets.length > 0 && survey.surveyTargets[0].status === SurveyTargetStatus.COMPLETED) {
            questionGroupWithSurveyId = { ...questionGroup, surveyId: survey.id, fileUrl: survey.image,  isCompleted: true }
        }


        return NextResponse.json(questionGroupWithSurveyId)
    } catch (error) {
        console.error("Error fetching question group:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

}

