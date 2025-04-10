"use client"

import { useMemo } from "react"
import Plot from "react-plotly.js"
import type { RawRecord } from "@/types/admin/surveys/surveys"
import type { Data, Layout } from "plotly.js"

interface BarChartProps {
  data: RawRecord[]
  useDeviation: boolean
  mode: "categories" | "questions"
}

export default function BarChart({ data, useDeviation, mode }: BarChartProps) {
  const plotData = useMemo(() => {
    if (data.length === 0) return []

    if (mode === "categories") {
      return renderCategoriesBarChart()
    } else {
      return renderQuestionsBarChart()
    }
  }, [data, useDeviation, mode])

  const layout: Partial<Layout> = useMemo(() => {
    if (mode === "categories") {
      return {
        title: useDeviation ? "カテゴリー別平均偏差値" : "カテゴリー別平均スコア",
        xaxis: { title: "カテゴリー" },
        yaxis: {
          title: useDeviation ? "平均偏差値" : "平均スコア",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        barmode: "group" as const,
        autosize: true,
      }
    } else {
      return {
        title: useDeviation ? "質問別偏差値" : "質問別回答値",
        xaxis: { title: "質問" },
        yaxis: {
          title: useDeviation ? "偏差値" : "回答値",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        barmode: "group" as const,
        autosize: true,
      }
    }
  }, [mode, useDeviation])

  function renderCategoriesBarChart() {
    // カテゴリー別の平均値を計算
    const categories = Array.from(new Set(data.map((item) => item.category)))

    // ユーザー別のデータを準備
    const users = Array.from(new Set(data.map((item) => item.employeeNumber)))

    return users.map((user) => {
      const userData = data.filter((item) => item.employeeNumber === user)
      const userCategories = Array.from(new Set(userData.map((item) => item.category)))

      const userCategoryAverages = userCategories.map((category) => {
        const categoryData = userData.filter((item) => item.category === category)

        if (useDeviation) {
          // 偏差値の平均を計算
          const sum = categoryData.reduce((acc, item) => acc + item.categoryDeviation, 0)
          return sum / categoryData.length
        } else {
          // 生の値の平均を計算
          const sum = categoryData.reduce((acc, item) => acc + item.numericValue, 0)
          return sum / categoryData.length
        }
      })

      return {
        x: userCategories,
        y: userCategoryAverages,
        type: "bar" as const,
        name: user,
      }
    })
  }

  function renderQuestionsBarChart() {
    // 質問別の値を計算
    const questions = Array.from(new Set(data.map((item) => item.questionName)))

    // ユーザー別のデータを準備
    const users = Array.from(new Set(data.map((item) => item.employeeNumber)))

    return users.map((user) => {
      const userData = data.filter((item) => item.employeeNumber === user)

      // 各質問のデータを取得
      const values = questions
        .map((question) => {
          const questionData = userData.find((item) => item.questionName === question)
          if (!questionData) return null

          return useDeviation ? questionData.questionDeviation : questionData.numericValue
        })
        .filter(Boolean) as number[]

      return {
        x: questions,
        y: values,
        type: "bar" as const,
        name: user,
      }
    })
  }

  return (
    <Plot data={plotData as Data[]} layout={layout} style={{ width: "100%", height: "100%" }} useResizeHandler={true} />
  )
}

