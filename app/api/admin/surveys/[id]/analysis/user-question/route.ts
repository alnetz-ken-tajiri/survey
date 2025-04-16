import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma, QuestionRole } from "@prisma/client";

type SurveyTarget = Prisma.SurveyTargetGetPayload<{
  include: {
    user: {
      include: {
        employee: true,
      },
    },
    responses: {
      where: {
        question: {
          role: "NORMAL",
        },
      },
      include: {
        question: {
          include: {
            category: {
              include: {
                children: true,
                parent: true,
              },
            },
          },
        },
        responseDetails: true,
      },
    },
  },
}>;

// GETは省略（従来通り）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const surveyId = params.id;
  try {
    const surveyTargets = await prisma.surveyTarget.findMany({
      where: { surveyId },
      include: {
        user: {
          include: {
            employee: true,
          },
        },
        responses: {
          where: {
            question: {
              role: "NORMAL",
            },
          },
          include: {
            question: {
              include: {
                category: true,
              },
            },
            responseDetails: true,
          },
        },
      },
    });

    const resultData = aggregateScores(surveyTargets);
    return NextResponse.json(resultData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

/** 
 * 新しいフィルタインターフェース
 * filters (既存) ... カテゴリー質問（ユーザー属性）用
 * questionCategoryIds (追加) ... 質問自体のカテゴリID一覧
 */
interface Filter {
  questionId: string;
  optionIds: string[];
}
interface RequestBody {
  filters?: Filter[];
  questionCategoryIds?: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { surveyId: string } }
) {
  const surveyId = params.surveyId;
  try {
    const body = (await request.json()) as RequestBody;
    const filters = body.filters ?? [];
    const questionCategoryIds = body.questionCategoryIds ?? [];

    // 1. AND 条件の配列を作る (カテゴリー質問でのユーザー属性絞り込み)
    const categoryConditions = filters.map((f) => ({
      responses: {
        some: {
          question: {
            role: QuestionRole.CATEGORY,
            id: f.questionId,
          },
          responseDetails: {
            some: {
              questionOptionId: {
                in: f.optionIds,
              },
            },
          },
        },
      },
    }));

    // 2-a. SurveyTarget を絞り込む (ユーザー属性)
    // 2-b. ただし「responses(質問)を更にカテゴリIDで絞り込み」も組み合わせる
    //     ここで "responses.where" には "role=NORMAL" & categoryId in questionCategoryIds
    //     ただし、questionCategoryIds が空なら絞り込みしない (=全NORMAL)
    const surveyTargets = await prisma.surveyTarget.findMany({
      where: {
        surveyId,
        AND: categoryConditions,
      },
      include: {
        user: {
          include: {
            employee: true,
          },
        },
        // ★追加: "role=NORMAL" AND (categoryId in questionCategoryIds) 
        responses: {
          where: {
            question: {
              role: "NORMAL",
              // ★ 新たに categoryId 絞り込みを追加
              ...(questionCategoryIds.length > 0
                ? { categoryId: { in: questionCategoryIds } }
                : {}),
            },
          },
          include: {
            question: {
              include: {
                category: {
                  include: {
                    parent: true,
                    children: true,
                  },
                },
              },
            },
            responseDetails: true,
          },
        },
      },
    });

    // 3. 集計ロジック（GETと共通）
    const resultData = aggregateScores(surveyTargets);

    return NextResponse.json(resultData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

function aggregateScores(surveyTargets: SurveyTarget[]) {
  const scoreMap = new Map<
    string,
    {
      userId: string;
      userName: string;
      questionId: string;
      questionName: string;
      questionRole: string;
      totalScore: number;
    }
  >();

  for (const target of surveyTargets) {
    const userId = target.userId;
    const userName = target.user.employee?.name ?? "UNKNOWN_USER_NAME";

    for (const response of target.responses) {
      const qId = response.questionId ?? "UNKNOWN_QUESTION_ID";
      const qName = response.questionName ?? "UNKNOWN_QUESTION_NAME";
      const qRole = response.question?.role ?? "UNKNOWN_QUESTION_ROLE";

      const mapKey = `${userId}::${qId}`;
      if (!scoreMap.has(mapKey)) {
        scoreMap.set(mapKey, {
          userId,
          userName,
          questionId: qId,
          questionName: qName,
          questionRole: String(qRole),
          totalScore: 0,
        });
      }

      let accumulateScore = 0;
      for (const detail of response.responseDetails) {
        if (detail.optionValue) {
          const val = Number(detail.optionValue);
          if (!isNaN(val)) {
            accumulateScore += val;
          }
        }
      }
      scoreMap.get(mapKey)!.totalScore += accumulateScore;
    }
  }

  return Array.from(scoreMap.values());
}
