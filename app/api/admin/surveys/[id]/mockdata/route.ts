import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const { raw, grouped, pivoted, questionTagMap } = getDynamicMockSurveyData();
  return NextResponse.json({ raw, grouped, pivoted, questionTagMap });
}

export type RawRecord = {
  surveyTargetId: string;
  userId: string;
  employeeNumber: string;
  questionId: string;
  questionName: string;
  tags: string[];
  numericValue: number;
  optionLabel: string;
  createdAt: string;
  questionDeviation: number;
  category: string;
  categoryDeviation: number;
};

export type GroupedRecord = {
  userId: string;
  employeeNumber: string;
  category: string;
  rows: RawRecord[];
};

export type PivotedRecord = Record<string, any>;

function getDynamicMockSurveyData(): {
  raw: RawRecord[];
  grouped: GroupedRecord[];
  pivoted: PivotedRecord[];
  questionTagMap: Record<string, string>;
} {
  // モックユーザと質問（カテゴリ）を定義
  const users = [
    { userId: "cm7d0hfbw00020cl4gedv6u14", employeeNumber: "admin" },
    { userId: "cm7x9xyz00031uvw", employeeNumber: "user2" }
  ];

  // 各カテゴリごとに複数の質問を定義
  const questions = [
    { questionId: "q1", questionName: "技術スキル1", category: "技術スキル", tags: ["技術スキル"] },
    { questionId: "q2", questionName: "技術スキル2", category: "技術スキル", tags: ["技術スキル"] },
    { questionId: "q3", questionName: "チームワーク1", category: "チームワーク", tags: ["チームワーク"] },
    { questionId: "q4", questionName: "チームワーク2", category: "チームワーク", tags: ["チームワーク"] },
    { questionId: "q5", questionName: "ストレスチェック1", category: "ストレスチェック", tags: ["ストレスチェック"] },
    { questionId: "q6", questionName: "ストレスチェック2", category: "ストレスチェック", tags: ["ストレスチェック"] }
  ];

  // ランダムな数値(1〜5)を返すユーティリティ
  function randomScore(): number {
    return Math.floor(Math.random() * 5) + 1;
  }

  // optionLabel は数値によって決定（例: 1,2 → "不満", 3 → "普通", 4,5 → "満足"）
  function getOptionLabel(score: number): string {
    if (score <= 2) return "不満";
    if (score === 3) return "普通";
    return "満足";
  }

  // ここでは偏差値はダミー値として固定またはランダムで設定
  function randomDeviation(): number {
    // 40〜65 の間をランダムに設定
    return Math.floor(Math.random() * 26) + 40;
  }

  const raw: RawRecord[] = [];
  // 各ユーザごとに全質問の回答を生成
  for (const user of users) {
    for (const question of questions) {
      const score = randomScore();
      raw.push({
        surveyTargetId: "survey1",
        userId: user.userId,
        employeeNumber: user.employeeNumber,
        questionId: question.questionId,
        questionName: question.questionName,
        tags: question.tags,
        numericValue: score,
        optionLabel: getOptionLabel(score),
        createdAt: new Date().toISOString(),
        questionDeviation: 50, // ダミー固定値
        category: question.category,
        categoryDeviation: randomDeviation()
      });
    }
  }

  // grouped: ユーザ＋カテゴリーごとにグルーピング
  const groupedMap: Record<string, GroupedRecord> = {};
  raw.forEach(row => {
    const key = `${row.userId}##${row.category}`;
    if (!groupedMap[key]) {
      groupedMap[key] = {
        userId: row.userId,
        employeeNumber: row.employeeNumber,
        category: row.category,
        rows: []
      };
    }
    groupedMap[key].rows.push(row);
  });
  const grouped = Object.values(groupedMap);

  // pivoted: ユーザごとにワイド形式に変換（各質問名をキーとして numericValue をセット）
  const pivotedMap: Record<string, Record<string, any>> = {};
  // questionTagMap: 各質問名がどのタグに属しているかを記録
  const questionTagMap: Record<string, string> = {};
  raw.forEach(row => {
    if (!pivotedMap[row.userId]) {
      pivotedMap[row.userId] = {
        userId: row.userId,
        employeeNumber: row.employeeNumber
      };
    }
    // 同一ユーザ内で、各質問名をキーとして numericValue をセット（重複があれば上書き）
    pivotedMap[row.userId][row.questionName] = row.numericValue;
    // questionTagMap: 質問名→タグ（最初のタグを採用）
    if (!questionTagMap[row.questionName] && row.tags && row.tags.length > 0) {
      questionTagMap[row.questionName] = row.tags[0];
    }
  });
  const pivoted = Object.values(pivotedMap);

  return { raw, grouped, pivoted, questionTagMap };
}
