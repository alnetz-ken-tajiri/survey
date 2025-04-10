import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma"; // 本番用
import { surveyPure } from "@/data/mock-survey-pure"; // テスト用

// ---------- 統計量計算ヘルパー ---------- //
function computeStats(arr: number[]): {
  mean: number;
  std: number;
  min: number;
  Q1: number;
  median: number;
  Q3: number;
  max: number;
} {
  if (arr.length === 0) {
    return { mean: 0, std: 0, min: 0, Q1: 0, median: 0, Q3: 0, max: 0 };
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const n = arr.length;
  const mean = arr.reduce((s, v) => s + v, 0) / n;
  const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
  const std = Math.sqrt(variance);

  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

  const lower =
    n % 2 === 0
      ? sorted.slice(0, n / 2)
      : sorted.slice(0, Math.floor(n / 2));
  const Q1 =
    lower.length % 2 === 0
      ? (lower[lower.length / 2 - 1] + lower[lower.length / 2]) / 2
      : lower[Math.floor(lower.length / 2)];

  const upper =
    n % 2 === 0
      ? sorted.slice(n / 2)
      : sorted.slice(Math.floor(n / 2) + 1);
  const Q3 =
    upper.length % 2 === 0
      ? (upper[upper.length / 2 - 1] + upper[upper.length / 2]) / 2
      : upper[Math.floor(upper.length / 2)];

  return { mean, std, min: sorted[0], Q1, median, Q3, max: sorted[n - 1] };
}

function standardizeScores(arr: number[], mean: number, std: number): number[] {
  if (std === 0) return arr.map(() => 50);
  return arr.map((v) => 50 + 10 * ((v - mean) / std));
}

// スコアの数値に対してラベルを返すサンプル関数
function getScoreLabel(score: number): string {
  if (score <= 1) return "非常に低い";
  if (score <= 2) return "低い";
  if (score <= 3) return "普通";
  if (score <= 4) return "高い";
  if (score >= 5) return "非常に高い";
  return "";
}

const getOptionKey = (optionId: string | null, optionLabel: string) =>
  optionId ? optionId : `null-${optionLabel}`;

function buildFullCategoryPath(category: any): string {
  let path = category.name;
  let current = category;
  while (current.parent) {
    current = current.parent;
    path = `${current.name} > ${path}`;
  }
  return path;
}

// ---------- 出力型 ---------- //
type OverallAggregation = {
  normalQuestionId: string;
  normalQuestionName: string;
  count: number;
  scores: number[];
  standardizedScores: number[];
  scoreLabels: string[]; // 追加：スコアごとのラベル
  userIds: string[]; // ユニークなユーザーID
  rawStats: ReturnType<typeof computeStats>;
  standardizedStats: ReturnType<typeof computeStats>;
};

type CategoryAggregation = {
  categoryQuestionId: string;
  categoryQuestionName: string;
  categoryOptionId: string;
  categoryOptionName: string;
  normalQuestionId: string;
  normalQuestionName: string;
  count: number;
  scores: number[];
  standardizedScores: number[];
  scoreLabels: string[];
  userIds: string[];
  rawStats: ReturnType<typeof computeStats>;
  standardizedStats: ReturnType<typeof computeStats>;
};

type QuestionCategoryAggregation = {
  questionCategoryId: string;
  questionCategoryName: string;
  count: number;
  scores: number[];
  standardizedScores: number[];
  scoreLabels: string[];
  userIds: string[];
  rawStats: ReturnType<typeof computeStats>;
  standardizedStats: ReturnType<typeof computeStats>;
};

type QuestionCategoryUserAggregation = {
  questionCategoryId: string;
  questionCategoryName: string;
  userCategoryQuestionId: string;
  userCategoryQuestionName: string;
  userCategoryOptionId: string;
  userCategoryOptionName: string;
  normalQuestionId: string;
  normalQuestionName: string;
  count: number;
  scores: number[];
  standardizedScores: number[];
  scoreLabels: string[];
  userIds: string[];
  rawStats: ReturnType<typeof computeStats>;
  standardizedStats: ReturnType<typeof computeStats>;
};

// ---------- クエリパラメータパース ---------- //
// attr は "catQId:option1|option2,catQId:option3|option4,..." の形式
// qcat は 通常質問自体のカテゴリーID（カンマ区切り）
const parseAttrFilters = (
  searchParams: URLSearchParams
): Record<string, string[]> => {
  const rawAttr = searchParams.get("attr");
  const result: Record<string, string[]> = {};
  if (rawAttr) {
    rawAttr.split(",").forEach((part) => {
      const [catQId, values] = part.split(":").map((x) => x.trim());
      if (catQId && values) {
        result[catQId] = values
          .split("|")
          .map((x) => x.trim())
          .filter((x) => x);
      }
    });
  }
  return result;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const attrFilters = parseAttrFilters(searchParams);
  const filterQcat: string[] =
    searchParams.get("qcat")?.split(",").map((x) => x.trim()).filter((x) => x) ||
    [];

  // ---------- サーベイ取得 (本来は Prisma 等) ---------- //
  const survey = surveyPure;

  // ---------- 質問の振り分け ---------- //
  const categoryQuestions: Record<string, { id: string; name: string }> = {};
  const normalQuestions: Record<string, { id: string; name: string }> = {};
  const normalQuestionCategory: Record<
    string,
    { questionCategoryId: string; questionCategoryName: string }
  > = {};

  survey.questionGroup.questionGroupQuestions.forEach((qgq) => {
    const q = qgq.question;
    if (q.role === "CATEGORY") {
      categoryQuestions[q.id] = { id: q.id, name: q.name };
    } else if (q.role === "NORMAL") {
      normalQuestions[q.id] = { id: q.id, name: q.name };
      if (q.category && q.category.id) {
        const fullPath = buildFullCategoryPath(q.category);
        normalQuestionCategory[q.id] = {
          questionCategoryId: q.category.id,
          questionCategoryName: fullPath,
        };
      }
    }
  });

  // ---------- 集計用オブジェクト ---------- //
  let overallStats: Record<
    string,
    { normalQuestionName: string; scores: number[]; userIds: string[] }
  > = {};
  let categoryStats: Record<
    string,
    {
      categoryQuestionName: string;
      categoryOptionName: string;
      normalQuestionName: string;
      scores: number[];
      userIds: string[];
    }
  > = {};
  let questionCategoryStats: Record<
    string,
    { questionCategoryName: string; scores: number[]; userIds: string[] }
  > = {};
  let questionCategoryUserStats: Record<
    string,
    {
      questionCategoryName: string;
      userCategoryQuestionId: string;
      userCategoryQuestionName: string;
      userCategoryOptionId: string;
      userCategoryOptionName: string;
      normalQuestionName: string;
      scores: number[];
      userIds: string[];
    }
  > = {};

  // ---------- (1) 属性フィルタでユーザーを絞る ---------- //
  const filteredTargets = survey.surveyTargets.filter((target) => {
    if (Object.keys(attrFilters).length === 0) return true;
    const answers: Record<string, string[]> = {};
    target.responses.forEach((response) => {
      if (!response.questionId) return;
      if (categoryQuestions[response.questionId]) {
        response.responseDetails.forEach((detail) => {
          const key = getOptionKey(
            detail.questionOptionId,
            detail.optionLabel || ""
          );
          if (!answers[response.questionId]) {
            answers[response.questionId] = [];
          }
          if (!answers[response.questionId].includes(key)) {
            answers[response.questionId].push(key);
          }
        });
      }
    });
    return Object.entries(attrFilters).every(([catQId, options]) => {
      const userAnswers = answers[catQId] || [];
      return userAnswers.some((ans) => options.includes(ans));
    });
  });

  // ---------- (2) フィルタ済ユーザーの回答を集計 ---------- //
  filteredTargets.forEach((target) => {
    // (2-1) ユーザーの属性回答一覧
    const userCategoryAnswers: Record<
      string,
      { optionKey: string; optionLabel: string; questionName: string }[]
    > = {};
    target.responses.forEach((response) => {
      if (!response.questionId) return;
      if (categoryQuestions[response.questionId]) {
        response.responseDetails.forEach((detail) => {
          const key = getOptionKey(
            detail.questionOptionId,
            detail.optionLabel || ""
          );
          if (!userCategoryAnswers[response.questionId]) {
            userCategoryAnswers[response.questionId] = [];
          }
          if (!userCategoryAnswers[response.questionId].some((ans) => ans.optionKey === key)) {
            userCategoryAnswers[response.questionId].push({
              optionKey: key,
              optionLabel: detail.optionLabel || "",
              questionName: categoryQuestions[response.questionId].name,
            });
          }
        });
      }
    });

    // (2-2) 通常質問の回答を集計
    target.responses.forEach((response) => {
      if (!response.questionId) return;
      if (!normalQuestions[response.questionId]) return;
      const normalQId = normalQuestions[response.questionId].id;
      const normalQName = normalQuestions[response.questionId].name;
      response.responseDetails.forEach((detail) => {
        const rawVal = Number(detail.optionValue);
        if (isNaN(rawVal)) return;
        const respondentId = target.user.id;

        // (A) overallStats (質問単位)
        if (!overallStats[normalQId]) {
          overallStats[normalQId] = {
            normalQuestionName: normalQName,
            scores: [],
            userIds: [],
          };
        }
        overallStats[normalQId].scores.push(rawVal);
        if (!overallStats[normalQId].userIds.includes(respondentId)) {
          overallStats[normalQId].userIds.push(respondentId);
        }

        // (B) 属性別集計 (「属性質問×選択肢×通常質問」単位)
        Object.entries(userCategoryAnswers).forEach(([catQId, ansArr]) => {
          ansArr.forEach((ans) => {
            const catKey = `${catQId}:${ans.optionKey}:${normalQId}`;
            if (!categoryStats[catKey]) {
              categoryStats[catKey] = {
                categoryQuestionName: ans.questionName,
                categoryOptionName: ans.optionLabel,
                normalQuestionName: normalQName,
                scores: [],
                userIds: [],
              };
            }
            categoryStats[catKey].scores.push(rawVal);
            if (!categoryStats[catKey].userIds.includes(respondentId)) {
              categoryStats[catKey].userIds.push(respondentId);
            }
          });
        });

        // (C) 質問カテゴリー別集計 (通常質問の所属カテゴリー単位)
        const qcInfo = normalQuestionCategory[normalQId];
        if (qcInfo) {
          const catId = qcInfo.questionCategoryId;
          if (!questionCategoryStats[catId]) {
            questionCategoryStats[catId] = {
              questionCategoryName: qcInfo.questionCategoryName,
              scores: [],
              userIds: [],
            };
          }
          questionCategoryStats[catId].scores.push(rawVal);
          if (!questionCategoryStats[catId].userIds.includes(respondentId)) {
            questionCategoryStats[catId].userIds.push(respondentId);
          }
        }

        // (D) 「質問カテゴリー」×「回答者属性」別集計 (1ユーザー1行に制限)
        if (!qcInfo) return;
        let alreadyRegistered = false;
        for (const [userCatQId, ansArr] of Object.entries(userCategoryAnswers)) {
          if (alreadyRegistered) break;
          for (const ans of ansArr) {
            if (
              Object.keys(attrFilters).length > 0 &&
              (!attrFilters[userCatQId] || !attrFilters[userCatQId].includes(ans.optionKey))
            ) {
              continue;
            }
            const finalKey = `${qcInfo.questionCategoryId}:${respondentId}:${normalQId}`;
            if (!questionCategoryUserStats[finalKey]) {
              questionCategoryUserStats[finalKey] = {
                questionCategoryName: qcInfo.questionCategoryName,
                userCategoryQuestionId: userCatQId,
                userCategoryQuestionName: ans.questionName,
                userCategoryOptionId: ans.optionKey,
                userCategoryOptionName: ans.optionLabel,
                normalQuestionName: normalQName,
                scores: [],
                userIds: [],
              };
            }
            if (!questionCategoryUserStats[finalKey].userIds.includes(respondentId)) {
              questionCategoryUserStats[finalKey].scores.push(rawVal);
              questionCategoryUserStats[finalKey].userIds.push(respondentId);
            }
            alreadyRegistered = true;
            break;
          }
        }
      });
    });
  });

  // ---------- 統計量算出ヘルパー ---------- //
  function calcAggregation(scores: number[]): {
    count: number;
    rawStats: ReturnType<typeof computeStats>;
    standardizedScores: number[];
    standardizedStats: ReturnType<typeof computeStats>;
  } {
    const count = scores.length;
    const raw = computeStats(scores);
    const stdScores = standardizeScores(scores, raw.mean, raw.std);
    const stdStats = computeStats(stdScores);
    return {
      count,
      rawStats: raw,
      standardizedScores: stdScores,
      standardizedStats: stdStats,
    };
  }

  // ---------- (3) 集計結果の整形 ---------- //
  // (A) overall: 質問単位
  let overallAggregations: OverallAggregation[] = Object.entries(overallStats).map(
    ([normalQId, obj]) => {
      const agg = calcAggregation(obj.scores);
      return {
        normalQuestionId: normalQId,
        normalQuestionName: obj.normalQuestionName,
        count: agg.count,
        scores: obj.scores,
        standardizedScores: agg.standardizedScores,
        scoreLabels: obj.scores.map(getScoreLabel),
        userIds: obj.userIds,
        rawStats: agg.rawStats,
        standardizedStats: agg.standardizedStats,
      };
    }
  );

  // (B) category: 属性質問×選択肢×通常質問単位
  let categoryAggregations: CategoryAggregation[] = Object.entries(categoryStats).map(
    ([key, obj]) => {
      const [catQId, catOptionId, normalQId] = key.split(":");
      const agg = calcAggregation(obj.scores);
      return {
        categoryQuestionId: catQId,
        categoryQuestionName: obj.categoryQuestionName,
        categoryOptionId: catOptionId,
        categoryOptionName: obj.categoryOptionName,
        normalQuestionId: normalQId,
        normalQuestionName: obj.normalQuestionName,
        count: agg.count,
        scores: obj.scores,
        standardizedScores: agg.standardizedScores,
        scoreLabels: obj.scores.map(getScoreLabel),
        userIds: obj.userIds,
        rawStats: agg.rawStats,
        standardizedStats: agg.standardizedStats,
      };
    }
  );

  // (C) questionCategory: 質問カテゴリー単位
  let questionCategoryAggregations: QuestionCategoryAggregation[] = Object.entries(questionCategoryStats).map(
    ([catId, obj]) => {
      const agg = calcAggregation(obj.scores);
      return {
        questionCategoryId: catId,
        questionCategoryName: obj.questionCategoryName,
        count: agg.count,
        scores: obj.scores,
        standardizedScores: agg.standardizedScores,
        scoreLabels: obj.scores.map(getScoreLabel),
        userIds: obj.userIds,
        rawStats: agg.rawStats,
        standardizedStats: agg.standardizedStats,
      };
    }
  );

  // (D) questionCategoryUser: 質問カテゴリー×回答者属性 (1ユーザー1行)
  let questionCategoryUserAggregations: QuestionCategoryUserAggregation[] = Object.entries(questionCategoryUserStats).map(
    ([key, obj]) => {
      const agg = calcAggregation(obj.scores);
      const [questionCategoryId, , normalQId] = key.split(":");
      return {
        questionCategoryId,
        questionCategoryName: obj.questionCategoryName,
        userCategoryQuestionId: obj.userCategoryQuestionId,
        userCategoryQuestionName: obj.userCategoryQuestionName,
        userCategoryOptionId: obj.userCategoryOptionId,
        userCategoryOptionName: obj.userCategoryOptionName,
        normalQuestionId: normalQId,
        normalQuestionName: obj.normalQuestionName,
        count: agg.count,
        scores: obj.scores,
        standardizedScores: agg.standardizedScores,
        scoreLabels: obj.scores.map(getScoreLabel),
        userIds: obj.userIds,
        rawStats: agg.rawStats,
        standardizedStats: agg.standardizedStats,
      };
    }
  );

  // ---------- (4) 質問カテゴリフィルタ (qcat) ---------- //
  if (filterQcat.length) {
    overallAggregations = overallAggregations.filter((agg) => {
      const qcInfo = normalQuestionCategory[agg.normalQuestionId];
      return qcInfo && filterQcat.includes(qcInfo.questionCategoryId);
    });
    categoryAggregations = categoryAggregations.filter((agg) => {
      const qcInfo = normalQuestionCategory[agg.normalQuestionId];
      return qcInfo && filterQcat.includes(qcInfo.questionCategoryId);
    });
    questionCategoryAggregations = questionCategoryAggregations.filter((agg) =>
      filterQcat.includes(agg.questionCategoryId)
    );
    questionCategoryUserAggregations = questionCategoryUserAggregations.filter(
      (agg) => filterQcat.includes(agg.questionCategoryId)
    );
  }

  // ---------- (5) JSON レスポンス ---------- //
  return NextResponse.json({
    surveyId: survey.id,
    surveyName: survey.name,
    appliedAttrFilters: attrFilters,
    appliedQuestionCategories: filterQcat,
    overallAggregations,
    categoryAggregations,
    questionCategoryAggregations,
    questionCategoryUserAggregations,
  });
}
