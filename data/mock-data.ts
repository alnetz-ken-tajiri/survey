import type { RawRecord, GroupedRecord, PivotedRecord } from "@/types/admin/surveys/surveys"

const mockData: {
  raw: RawRecord[]
  grouped: GroupedRecord[]
  pivoted: PivotedRecord[]
  questionTagMap: Record<string, string>
  overall: { userId: string; employeeNumber: string; avgScore: number; overallDeviation: number }[]
} = {
  raw: [
    {
      surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      questionId: "cm7x6loto000yg87kv1ba5hmo",
      questionName: "技術スキル1",
      tags: ["技術スキル"],
      numericValue: 1,
      optionLabel: "非常に不満",
      createdAt: "2025-03-06T10:11:25.516Z",
      questionDeviation: 50,
      category: "技術スキル",
      categoryDeviation: 40,
    },
    {
      surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      questionId: "cm7x6m5an0016g87kuwtggydz",
      questionName: "技術スキル2",
      tags: ["技術スキル"],
      numericValue: 4,
      optionLabel: "満足",
      createdAt: "2025-03-06T10:11:25.863Z",
      questionDeviation: 50,
      category: "技術スキル",
      categoryDeviation: 60,
    },
    {
      surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      questionId: "cm7x6ir4o000kg87k5drk0hex",
      questionName: "チームワーク1",
      tags: ["チームワーク"],
      numericValue: 3,
      optionLabel: "普通",
      createdAt: "2025-03-06T10:11:26.035Z",
      questionDeviation: 50,
      category: "チームワーク",
      categoryDeviation: 60,
    },
    {
      surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      questionId: "cm7x6ok92001eg87khu2cy5gr",
      questionName: "チームワーク2",
      tags: ["チームワーク"],
      numericValue: 2,
      optionLabel: "不満",
      createdAt: "2025-03-06T10:11:26.206Z",
      questionDeviation: 50,
      category: "チームワーク",
      categoryDeviation: 40,
    },
    {
      surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      questionId: "cm7x6g3tb0004g87kd8a1k1l3",
      questionName: "ストレスチェック1",
      tags: ["ストレスチェック"],
      numericValue: 4, // 変更: 3 -> 4
      optionLabel: "満足", // 変更: "普通" -> "満足"
      createdAt: "2025-03-06T10:11:26.378Z",
      questionDeviation: 60, // 変更: 50 -> 60
      category: "ストレスチェック",
      categoryDeviation: 60, // 変更: 50 -> 60
    },
    {
      surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      questionId: "cm7x6gmby000cg87kheuucfej",
      questionName: "ストレスチェック2",
      tags: ["ストレスチェック"],
      numericValue: 2, // 変更: 3 -> 2
      optionLabel: "不満", // 変更: "普通" -> "不満"
      createdAt: "2025-03-06T10:11:26.634Z",
      questionDeviation: 40, // 変更: 50 -> 40
      category: "ストレスチェック",
      categoryDeviation: 40, // 変更: 50 -> 40
    },
  ],
  grouped: [
    {
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      category: "技術スキル",
      rows: [
        {
          surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
          userId: "cm7d0hfbw00020cl4gedv6u14",
          employeeNumber: "admin",
          questionId: "cm7x6loto000yg87kv1ba5hmo",
          questionName: "技術スキル1",
          tags: ["技術スキル"],
          numericValue: 1,
          optionLabel: "非常に不満",
          createdAt: "2025-03-06T10:11:25.516Z",
          questionDeviation: 50,
          category: "技術スキル",
          categoryDeviation: 40,
        },
        {
          surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
          userId: "cm7d0hfbw00020cl4gedv6u14",
          employeeNumber: "admin",
          questionId: "cm7x6m5an0016g87kuwtggydz",
          questionName: "技術スキル2",
          tags: ["技術スキル"],
          numericValue: 4,
          optionLabel: "満足",
          createdAt: "2025-03-06T10:11:25.863Z",
          questionDeviation: 50,
          category: "技術スキル",
          categoryDeviation: 60,
        },
      ],
      numericValues: [1, 4],
      categoryDeviationValues: [40, 60],
      avgNumeric: 2.5,
      avgCategoryDeviation: 50,
    },
    {
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      category: "チームワーク",
      rows: [
        {
          surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
          userId: "cm7d0hfbw00020cl4gedv6u14",
          employeeNumber: "admin",
          questionId: "cm7x6ir4o000kg87k5drk0hex",
          questionName: "チームワーク1",
          tags: ["チームワーク"],
          numericValue: 3,
          optionLabel: "普通",
          createdAt: "2025-03-06T10:11:26.035Z",
          questionDeviation: 50,
          category: "チームワーク",
          categoryDeviation: 60,
        },
        {
          surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
          userId: "cm7d0hfbw00020cl4gedv6u14",
          employeeNumber: "admin",
          questionId: "cm7x6ok92001eg87khu2cy5gr",
          questionName: "チームワーク2",
          tags: ["チームワーク"],
          numericValue: 2,
          optionLabel: "不満",
          createdAt: "2025-03-06T10:11:26.206Z",
          questionDeviation: 50,
          category: "チームワーク",
          categoryDeviation: 40,
        },
      ],
      numericValues: [3, 2],
      categoryDeviationValues: [60, 40],
      avgNumeric: 2.5,
      avgCategoryDeviation: 50,
    },
    {
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      category: "ストレスチェック",
      rows: [
        {
          surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
          userId: "cm7d0hfbw00020cl4gedv6u14",
          employeeNumber: "admin",
          questionId: "cm7x6g3tb0004g87kd8a1k1l3",
          questionName: "ストレスチェック1",
          tags: ["ストレスチェック"],
          numericValue: 4, // 変更
          optionLabel: "満足", // 変更
          createdAt: "2025-03-06T10:11:26.378Z",
          questionDeviation: 60, // 変更
          category: "ストレスチェック",
          categoryDeviation: 60, // 変更
        },
        {
          surveyTargetId: "cm7x6rf3o001pg87ksdtoauc9",
          userId: "cm7d0hfbw00020cl4gedv6u14",
          employeeNumber: "admin",
          questionId: "cm7x6gmby000cg87kheuucfej",
          questionName: "ストレスチェック2",
          tags: ["ストレスチェック"],
          numericValue: 2, // 変更
          optionLabel: "不満", // 変更
          createdAt: "2025-03-06T10:11:26.634Z",
          questionDeviation: 40, // 変更
          category: "ストレスチェック",
          categoryDeviation: 40, // 変更
        },
      ],
      numericValues: [4, 2], // 変更
      categoryDeviationValues: [60, 40], // 変更
      avgNumeric: 3,
      avgCategoryDeviation: 50,
    },
  ],
  pivoted: [
    {
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      技術スキル: [
        {
          questionName: "技術スキル1",
          numericValue: 1,
          questionDeviation: 50,
          categoryDeviation: 40,
          tags: ["技術スキル"],
        },
        {
          questionName: "技術スキル2",
          numericValue: 4,
          questionDeviation: 50,
          categoryDeviation: 60,
          tags: ["技術スキル"],
        },
      ],
      チームワーク: [
        {
          questionName: "チームワーク1",
          numericValue: 3,
          questionDeviation: 50,
          categoryDeviation: 60,
          tags: ["チームワーク"],
        },
        {
          questionName: "チームワーク2",
          numericValue: 2,
          questionDeviation: 50,
          categoryDeviation: 40,
          tags: ["チームワーク"],
        },
      ],
      ストレスチェック: [
        {
          questionName: "ストレスチェック1",
          numericValue: 4, // 変更
          questionDeviation: 60, // 変更
          categoryDeviation: 60, // 変更
          tags: ["ストレスチェック"],
        },
        {
          questionName: "ストレスチェック2",
          numericValue: 2, // 変更
          questionDeviation: 40, // 変更
          categoryDeviation: 40, // 変更
          tags: ["ストレスチェック"],
        },
      ],
    },
  ],
  questionTagMap: {
    技術スキル1: "技術スキル",
    技術スキル2: "技術スキル",
    チームワーク1: "チームワーク",
    チームワーク2: "チームワーク",
    ストレスチェック1: "ストレスチェック",
    ストレスチェック2: "ストレスチェック",
  },
  overall: [
    {
      userId: "cm7d0hfbw00020cl4gedv6u14",
      employeeNumber: "admin",
      avgScore: 2.66666666666667,
      overallDeviation: 50,
    },
  ],
}

export default mockData

