"use client"

import { useMemo } from "react"
import Plot from "react-plotly.js"
import type { RawRecord } from "@/types/admin/surveys/surveys"
import type { Data, Layout } from "plotly.js"

interface ViolinPlotProps {
  data: RawRecord[]
  useDeviation: boolean
  mode: "categories" | "questions"
}

export default function ViolinPlot({ data, useDeviation, mode }: ViolinPlotProps) {
  const plotData = useMemo(() => {
    if (data.length === 0) return []

    if (mode === "categories") {
      return renderCategoriesViolinPlot()
    } else {
      return renderQuestionsViolinPlot()
    }
  }, [data, useDeviation, mode])

  const layout: Partial<Layout> = useMemo(() => {
    if (mode === "categories") {
      return {
        title: useDeviation ? "カテゴリー別偏差値分布（バイオリン図）" : "カテゴリー別回答分布（バイオリン図）",
        xaxis: { title: "カテゴリー" },
        yaxis: {
          title: useDeviation ? "偏差値" : "回答値",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        autosize: true,
      }
    } else {
      return {
        title: useDeviation ? "質問別偏差値分布（バイオリン図）" : "質問別回答分布（バイオリン図）",
        xaxis: { title: "質問" },
        yaxis: {
          title: useDeviation ? "偏差値" : "回答値",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        autosize: true,
      }
    }
  }, [mode, useDeviation])

  function renderCategoriesViolinPlot() {
    const categories = Array.from(new Set(data.map((item) => item.category)))

    return categories.map((category) => {
      const categoryData = data.filter((item) => item.category === category)

      // 表示する値を選択（生の値または偏差値）
      const values = useDeviation
        ? categoryData.map((item) => item.categoryDeviation)
        : categoryData.map((item) => item.numericValue)

      return {
        type: "violin" as const,
        x: Array(categoryData.length).fill(category),
        y: values,
        box: { visible: true },
        meanline: { visible: true },
        name: category,
      }
    })
  }

  function renderQuestionsViolinPlot() {
    const questions = Array.from(new Set(data.map((item) => item.questionName)))

    return questions.map((question) => {
      const questionData = data.filter((item) => item.questionName === question)

      // 表示する値を選択（生の値または偏差値）
      const values = useDeviation
        ? questionData.map((item) => item.questionDeviation)
        : questionData.map((item) => item.numericValue)

      return {
        type: "violin" as const,
        x: Array(questionData.length).fill(question),
        y: values,
        box: { visible: true },
        meanline: { visible: true },
        name: question,
      }
    })
  }

  return (
    <Plot data={plotData as Data[]} layout={layout} style={{ width: "100%", height: "100%" }} useResizeHandler={true} />
  )
}

