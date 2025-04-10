import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/** 1回答=1レコード（質問ごとの偏差値も付与） */
export type FlattenedRecord = {
  surveyTargetId: string
  userId: string
  employeeNumber?: string | null
  /** 追加: 所属情報 */
  organizationId?: string | null
  organizationName?: string | null

  questionId: string
  questionName: string
  tags: string[] // 質問に紐づくタグ（複数可）
  numericValue: number | null
  optionLabel?: string
  createdAt: Date
  /** 質問単位での偏差値 */
  questionDeviation?: number | null
}

/** タグ展開時にカテゴリーを付与 */
export type FlattenedWithCategory = FlattenedRecord & {
  category: string
}

/** カテゴリー(タグ)ごとの偏差値 */
export type FlattenedWithCategoryDeviation = FlattenedWithCategory & {
  categoryDeviation?: number | null
}

/** 平均・標準偏差を計算（母分散） */
function calcMeanAndStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) {
    return { mean: 0, std: 0 }
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  const std = Math.sqrt(variance)
  return { mean, std }
}

/** 偏差値 = 50 + 10 * ((x - mean) / std) */
function calcDeviationValue(x: number, mean: number, std: number): number {
  return 50 + 10 * ((x - mean) / std)
}

/**
 * 質問単位で「questionDeviation」を計算して付与して返す。
 */
function calcQuestionDeviation(data: FlattenedRecord[]): FlattenedRecord[] {
  // 1. questionId ごとにグルーピング
  const grouped = data.reduce((acc, row) => {
    const qid = row.questionId
    if (!acc[qid]) {
      acc[qid] = []
    }
    acc[qid].push(row)
    return acc
  }, {} as Record<string, FlattenedRecord[]>)

  // 2. 各 questionId 内で数値を集計し、mean/stdを算出
  const meanStdMap = new Map<string, { mean: number; std: number }>()
  for (const [qid, rows] of Object.entries(grouped)) {
    const values = rows
      .map(r => r.numericValue)
      .filter((v): v is number => v !== null)
    const { mean, std } = calcMeanAndStd(values)
    meanStdMap.set(qid, { mean, std })
  }

  // 3. 各行に questionDeviation を付与
  return data.map(row => {
    const stat = meanStdMap.get(row.questionId)
    if (!stat) return row
    const { mean, std } = stat

    let questionDeviation: number | null = null
    if (row.numericValue !== null && std !== 0) {
      questionDeviation = calcDeviationValue(row.numericValue, mean, std)
    } else if (row.numericValue !== null && std === 0) {
      // 全員同じ値で回答している場合など
      questionDeviation = 50
    }
    return {
      ...row,
      questionDeviation,
    }
  })
}

/**
 * タグ配列を「category」として展開する（複数タグ → 行を複製）
 */
function expandByTags(
  data: FlattenedRecord[],
  noTagPlaceholder = "NoTag"
): FlattenedWithCategory[] {
  return data.flatMap(row => {
    if (row.tags.length === 0) {
      return [{ ...row, category: noTagPlaceholder }]
    }
    return row.tags.map(tag => ({
      ...row,
      category: tag,
    }))
  })
}

/**
 * カテゴリー(タグ)単位で「categoryDeviation」を計算して付与。
 */
function calcCategoryDeviation(
  data: FlattenedWithCategory[]
): FlattenedWithCategoryDeviation[] {
  // 1. categoryごとにグルーピング
  const grouped = data.reduce((acc, row) => {
    const cat = row.category
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(row)
    return acc
  }, {} as Record<string, FlattenedWithCategory[]>)

  // 2. 各カテゴリー内で mean, std を算出
  const result: FlattenedWithCategoryDeviation[] = []
  for (const [cat, rows] of Object.entries(grouped)) {
    const values = rows
      .map(r => r.numericValue)
      .filter((v): v is number => v !== null)
    const { mean, std } = calcMeanAndStd(values)

    for (const row of rows) {
      let categoryDeviation: number | null = null
      if (row.numericValue !== null && std !== 0) {
        categoryDeviation = calcDeviationValue(row.numericValue, mean, std)
      } else if (row.numericValue !== null && std === 0) {
        categoryDeviation = 50
      }
      result.push({
        ...row,
        categoryDeviation,
      })
    }
  }
  return result
}

/**
 * 「userId, category」単位でまとめ、簡易集計(平均など)を返す。
 */
function groupByUserAndCategory(
  data: FlattenedWithCategoryDeviation[]
) {
  const grouped = data.reduce((acc, row) => {
    const key = `${row.userId}##${row.category}`
    if (!acc[key]) {
      acc[key] = {
        userId: row.userId,
        employeeNumber: row.employeeNumber,
        category: row.category,
        rows: [] as FlattenedWithCategoryDeviation[],
      }
    }
    acc[key].rows.push(row)
    return acc
  }, {} as Record<string, {
    userId: string
    employeeNumber?: string | null
    category: string
    rows: FlattenedWithCategoryDeviation[]
  }>)
  const result = Object.values(grouped).map(group => {
    const numericValues = group.rows
      .map(r => r.numericValue)
      .filter((v): v is number => v !== null)
    const categoryDeviationValues = group.rows
      .map(r => r.categoryDeviation)
      .filter((v): v is number => v !== null)
    const avgNumeric =
      numericValues.length > 0
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        : null
    const avgCategoryDeviation =
      categoryDeviationValues.length > 0
        ? categoryDeviationValues.reduce((a, b) => a + b, 0) / categoryDeviationValues.length
        : null
    return {
      userId: group.userId,
      employeeNumber: group.employeeNumber,
      category: group.category,
      rows: group.rows,
      numericValues,
      categoryDeviationValues,
      avgNumeric,
      avgCategoryDeviation,
    }
  })
  return result
}

/**
 * ユーザ×質問名をワイド化（pivot）する際に、
 * 各質問に複数のタグがある場合、行を複製してタグ情報も含めた形で返す。
 */
function pivotByUserDetailedWithCategory(
  data: FlattenedWithCategoryDeviation[]
): Array<Record<string, any>> {
  const grouped = data.reduce((acc, row) => {
    if (!acc[row.userId]) {
      acc[row.userId] = {
        userId: row.userId,
        employeeNumber: row.employeeNumber,
      }
    }
    // ここでは row.category をキーにしてグループ化
    if (!acc[row.userId][row.category]) {
      acc[row.userId][row.category] = []
    }
    // 格納する内容は { questionName, numericValue, questionDeviation, categoryDeviation } など
    acc[row.userId][row.category].push({
      questionName: row.questionName,
      numericValue: row.numericValue,
      questionDeviation: row.questionDeviation ?? null,
      categoryDeviation: row.categoryDeviation ?? null,
      tags: row.tags,
    })
    return acc
  }, {} as Record<string, Record<string, any>>)

  return Object.values(grouped)
}

/** 質問セット全体でのユーザー偏差値をまとめる用 */
export type UserOverallDeviation = {
  userId: string
  employeeNumber?: string | null
  avgScore: number | null
  overallDeviation: number | null
}

/**
 * 質問セット全体の回答値でユーザー間の偏差値を計算する関数
 */
function calcOverallUserDeviation(data: FlattenedRecord[]): UserOverallDeviation[] {
  // userIdごとにnumericValueを集約
  const userGrouped = data.reduce((acc, row) => {
    if (row.numericValue === null) return acc

    if (!acc[row.userId]) {
      acc[row.userId] = {
        userId: row.userId,
        employeeNumber: row.employeeNumber,
        numericValues: [] as number[],
      }
    }
    acc[row.userId].numericValues.push(row.numericValue)
    return acc
  }, {} as Record<
    string,
    { userId: string; employeeNumber?: string | null; numericValues: number[] }
  >)

  // ユーザーごとの平均
  const userAverages = Object.values(userGrouped).map(user => ({
    userId: user.userId,
    employeeNumber: user.employeeNumber,
    avgScore:
      user.numericValues.reduce((a, b) => a + b, 0) / user.numericValues.length,
  }))

  // 全ユーザーの平均/標準偏差 -> overallDeviation算出
  const values = userAverages.map(u => u.avgScore)
  const { mean, std } = calcMeanAndStd(values)

  return userAverages.map(user => ({
    ...user,
    overallDeviation: std !== 0 ? calcDeviationValue(user.avgScore, mean, std) : 50,
  }))
}

/** ヒートマップ用の型 */
type HeatmapData = {
  organizationId: string
  organizationName: string
  category: string
  questionName: string
  avgNumeric: number | null
}

/**
 * ヒートマップ用に「組織×カテゴリー×質問」の平均値をまとめる関数
 */
function generateHeatmapData(
  data: FlattenedWithCategoryDeviation[]
): HeatmapData[] {
  // key: organizationId##category##questionName
  const grouped = data.reduce((acc, row) => {
    const orgId = row.organizationId || "Unknown"
    const orgName = row.organizationName || "Unknown"
    const key = `${orgId}##${row.category}##${row.questionName}`
    if (!acc[key]) {
      acc[key] = {
        organizationId: orgId,
        organizationName: orgName,
        category: row.category,
        questionName: row.questionName,
        numericValues: [] as number[],
      }
    }
    if (row.numericValue !== null) {
      acc[key].numericValues.push(row.numericValue)
    }
    return acc
  }, {} as Record<
    string,
    {
      organizationId: string
      organizationName: string
      category: string
      questionName: string
      numericValues: number[]
    }
  >)

  // 集約: 平均 numericValue
  return Object.values(grouped).map(group => ({
    organizationId: group.organizationId,
    organizationName: group.organizationName,
    category: group.category,
    questionName: group.questionName,
    avgNumeric:
      group.numericValues.length > 0
        ? group.numericValues.reduce((a, b) => a + b, 0) / group.numericValues.length
        : null,
  }))
}

/** ユーザー別ヒートマップ用の型 */
type UserHeatmapData = {
  userId: string
  employeeNumber: string | null
  category: string
  questionName: string
  avgNumeric: number | null
}

/**
 * ユーザー別のヒートマップ用に「userId×category×questionName」の平均値をまとめる関数
 */
function generateHeatmapDataByUser(
  data: FlattenedWithCategoryDeviation[]
): UserHeatmapData[] {
  // key: userId##category##questionName
  const grouped = data.reduce((acc, row) => {
    const uid = row.userId
    const empNo = row.employeeNumber || null
    const key = `${uid}##${row.category}##${row.questionName}`
    if (!acc[key]) {
      acc[key] = {
        userId: uid,
        employeeNumber: empNo,
        category: row.category,
        questionName: row.questionName,
        numericValues: [] as number[],
      }
    }
    if (row.numericValue !== null) {
      acc[key].numericValues.push(row.numericValue)
    }
    return acc
  }, {} as Record<
    string,
    {
      userId: string
      employeeNumber: string | null
      category: string
      questionName: string
      numericValues: number[]
    }
  >)

  // 数値を平均して返す
  return Object.values(grouped).map(group => ({
    userId: group.userId,
    employeeNumber: group.employeeNumber,
    category: group.category,
    questionName: group.questionName,
    avgNumeric:
      group.numericValues.length > 0
        ? group.numericValues.reduce((a, b) => a + b, 0) / group.numericValues.length
        : null,
  }))
}

/**
 * メインの GET ハンドラー:
 *  - PrismaでSurveyを取得
 *  - (オプション) クエリパラメータ "organizationId" によるフィルタ
 *  - アンケート回答をフラット化
 *  - 質問単位の偏差値計算
 *  - タグ展開（行複製）＋カテゴリー単位偏差値計算
 *  - ユーザ×カテゴリー別集計
 *  - ワイド形式（pivot）
 *  - ユーザー全体偏差値(overall)
 *  - ヒートマップデータ(organization×category×questionの平均)
 *  - APIパラメータ (format) によって返却データを切り替え可能
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)

    // format: "raw", "grouped", "pivoted", "heatmap", "userHeatmap", "all" 等
    const format = searchParams.get("format") || "all"

    // organizationId のフィルタなどはそのまま
    const organizationId = searchParams.get("organizationId")

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questionGroup: {
          include: {
            questionGroupQuestions: {
              include: {
                question: {
                  include: { tags: true },
                },
              },
            },
          },
        },
        surveyTargets: {
          include: {
            user: {
              include: {
                employee: {
                  include: {
                    organization: true,
                  },
                },
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

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    // 質問マッピング
    const questionMap = new Map<
      string,
      { name: string; description: string | null; tags: string[] }
    >()
    survey.questionGroup?.questionGroupQuestions.forEach(qgq => {
      const q = qgq.question
      if (q) {
        questionMap.set(q.id, {
          name: q.name,
          description: q.description,
          tags: q.tags?.map(t => t.name) || [],
        })
      }
    })

    // 組織フィルタ
    const filteredSurveyTargets = organizationId
      ? survey.surveyTargets?.filter(
          target => target.user?.employee?.organizationId === organizationId
        )
      : survey.surveyTargets

    // Flatten
    const flattenedData: FlattenedRecord[] = []
    filteredSurveyTargets?.forEach(target => {
      const userId = target.user?.id || ""
      const employeeNumber = target.user?.employee?.number || null
      const orgId = target.user?.employee?.organization?.id || null
      const orgName = target.user?.employee?.organization?.name || null

      target.responses?.forEach(response => {
        const questionId = response.questionId || ""
        const qInfo = questionMap.get(questionId) || { name: "", description: "", tags: [] }
        response.responseDetails?.forEach(rd => {
          const numericValue = rd.optionValue ? Number(rd.optionValue) : null
          flattenedData.push({
            surveyTargetId: target.id,
            userId,
            employeeNumber,
            organizationId: orgId,
            organizationName: orgName,
            questionId,
            questionName: qInfo.name,
            tags: qInfo.tags,
            numericValue,
            optionLabel: rd.optionLabel || undefined,
            createdAt: response.createdAt,
          })
        })
      })
    })

    // 質問単位の偏差値
    const dataWithQuestionDeviation = calcQuestionDeviation(flattenedData)
    // タグ展開
    const dataWithCategory = expandByTags(dataWithQuestionDeviation)
    // カテゴリ単位の偏差値
    const dataWithCategoryDeviation = calcCategoryDeviation(dataWithCategory)
    // ユーザ×カテゴリー別集計
    const userCategoryData = groupByUserAndCategory(dataWithCategoryDeviation)
    // pivot
    const pivotedData = pivotByUserDetailedWithCategory(dataWithCategoryDeviation)
    // ユーザー全体偏差値
    const userOverallDeviation = calcOverallUserDeviation(dataWithQuestionDeviation)
    // 組織別ヒートマップ
    const orgHeatmapData = generateHeatmapData(dataWithCategoryDeviation)
    // ユーザー別ヒートマップ
    const userHeatmapData = generateHeatmapDataByUser(dataWithCategoryDeviation)

    // format別に返却
    let result: any = {}
    if (format === "raw") {
      result = { raw: dataWithCategoryDeviation }
    } else if (format === "grouped") {
      result = { grouped: userCategoryData }
    } else if (format === "pivoted") {
      result = { pivoted: pivotedData }
    } else if (format === "heatmap") {
      // 組織別ヒートマップのみ返す例
      result = { heatmap: orgHeatmapData }
    } else if (format === "userHeatmap") {
      // ユーザー別ヒートマップのみ返す例
      result = { userHeatmap: userHeatmapData }
    } else {
      // "all"
      result = {
        raw: dataWithCategoryDeviation,
        grouped: userCategoryData,
        pivoted: pivotedData,
        overall: userOverallDeviation,
        heatmap: orgHeatmapData,     // 組織別
        userHeatmap: userHeatmapData // ユーザ別
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in GET:", error)
    return NextResponse.json({ error: "Failed to fetch survey" }, { status: 500 })
  }
}
