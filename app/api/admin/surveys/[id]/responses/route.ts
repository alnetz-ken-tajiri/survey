import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

    try {
        const { id } = params

        const survey = await prisma.survey.findUnique({
            where: { id },
            include: {
                questionGroup: {
                    include: {
                        questionGroupQuestions: {
                            include: {
                                question: true,
                            },
                        },
                    },
                },
                surveyTargets: {
                    include: {
                        user: {
                            include: {
                                employee: true,
                            },
                        },
                        responses: {
                            include: {
                                responseDetails: true,
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json(survey)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch survey" }, { status: 500 })
    }
}

