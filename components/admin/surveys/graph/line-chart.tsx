"use client"

import { useMemo } from "react"
import Plot from "react-plotly.js"
import type { RawRecord } from "@/types/admin/surveys/surveys"
import type { Data, Layout } from "plotly.js"

interface LineChartProps {
  data: RawRecord[]
  useDeviation: boolean
  mode: "categories" | "questions"
}

export default function LineChart({ data, useDeviation, mode }: LineChartProps) {
  const plotData = useMemo(() => {
    if (data.length === 0) return []

    if (mode === "categories") {
      return renderCategoriesLineChart()
    } else {
      return renderQuestionsLineChart()
    }
  }, [data, useDeviation, mode])

  const layout: Partial<Layout> = useMemo(() => {
    if (mode === "categories") {
      return {
        title: useDeviation ? "カテゴリー別平均偏差値" : "カテゴリー別平均スコア",
        xaxis: {
          title: "カテゴリー",
          type: "category" as const,
        },
        yaxis: {
          title: useDeviation ? "平均偏差値" : "平均スコア",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        legend: { orientation: "h" as const, y: -0.2 },
        autosize: true,
      }
    } else {
      return {
        title: useDeviation ? "質問別偏差値" : "質問別回答値",
        xaxis: {
          title: "質問",
          type: "category" as const,
        },
        yaxis: {
          title: useDeviation ? "偏差値" : "回答値",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        legend: { orientation: "h" as const, y: -0.2 },
        autosize: true,
      }
    }
  }, [mode, useDeviation])

  function renderCategoriesLineChart() {
    // ユーザーごとにデータをグループ化
    const users = Array.from(new Set(data.map((item) => item.employeeNumber)))

    // カテゴリーを取得（ソートして順序を固定）
    const categories = Array.from(new Set(data.map((item) => item.category))).sort()

    // ユーザーごとのトレースを作成
    return users.map((user) => {
      const userData = data.filter((item) => item.employeeNumber === user)

      // カテゴリーごとの平均値を計算
      const values = categories.map((category) => {
        const categoryData = userData.filter((item) => item.category === category)
        if (categoryData.length === 0) return null

        if (useDeviation) {
          return categoryData.reduce((sum, item) => sum + item.categoryDeviation, 0) / categoryData.length
        } else {
          return categoryData.reduce((sum, item) => sum + item.numericValue, 0) / categoryData.length
        }
      })

      return {
        x: categories,
        y: values,
        type: "scatter" as const,
        mode: "lines+markers" as const,
        name: user,
        line: { shape: "spline" as const },
        marker: { size: 8 },
        connectgaps: true,
      }
    }) as Data[]
  }

  function renderQuestionsLineChart() {
    // ユーザーごとにデータをグループ化
    const users = Array.from(new Set(data.map((item) => item.employeeNumber)))

    // 質問を取得（ソートして順序を固定）
    const questions = Array.from(new Set(data.map((item) => item.questionName))).sort()

    // ユーザーごとのトレースを作成
    return users.map((user) => {
      const userData = data.filter((item) => item.employeeNumber === user)

      // 質問ごとの値を取得
      const values = questions.map((question) => {
        const questionData = userData.find((item) => item.questionName === question)
        if (!questionData) return null

        if (useDeviation) {
          // モックデータの偏差値を使用
          return questionData.questionDeviation
        } else {
          return questionData.numericValue
        }
      })

      return {
        x: questions,
        y: values,
        type: "scatter" as const,
        mode: "lines+markers" as const,
        name: user,
        line: { shape: "spline" as const },
        marker: { size: 8 },
        connectgaps: true,
      }
    }) as Data[]
  }

  return <Plot data={plotData} layout={layout} style={{ width: "100%", height: "100%" }} useResizeHandler={true} />
}

