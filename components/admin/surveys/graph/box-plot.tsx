"use client"

import { useMemo } from "react"
import Plot from "react-plotly.js"
import type { RawRecord } from "@/types/admin/surveys/surveys"
import type { Data, Layout } from "plotly.js"

interface BoxPlotProps {
  data: RawRecord[]
  useDeviation: boolean
  mode: "categories" | "questions"
}

export default function BoxPlot({ data, useDeviation, mode }: BoxPlotProps) {
  const plotData = useMemo(() => {
    if (data.length === 0) return []

    if (mode === "categories") {
      return renderCategoriesBoxPlot()
    } else {
      return renderQuestionsBoxPlot()
    }
  }, [data, useDeviation, mode])

  const layout: Partial<Layout> = useMemo(() => {
    if (mode === "categories") {
      return {
        title: useDeviation ? "カテゴリー別偏差値分布（箱ひげ図）" : "カテゴリー別回答分布（箱ひげ図）",
        yaxis: {
          title: useDeviation ? "偏差値" : "回答値",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        autosize: true,
      }
    } else {
      return {
        title: useDeviation ? "質問別偏差値分布（箱ひげ図）" : "質問別回答分布（箱ひげ図）",
        yaxis: {
          title: useDeviation ? "偏差値" : "回答値",
          range: useDeviation ? [30, 70] : [0, 5],
        },
        autosize: true,
      }
    }
  }, [mode, useDeviation])

  function renderCategoriesBoxPlot() {
    const categories = Array.from(new Set(data.map((item) => item.category)))

    return categories.map((category) => {
      const categoryData = data.filter((item) => item.category === category)

      // 表示する値を選択（生の値または偏差値）
      const values = useDeviation
        ? categoryData.map((item) => item.categoryDeviation)
        : categoryData.map((item) => item.numericValue)

      return {
        type: "box" as const,
        y: values,
        name: category,
        boxpoints: "all" as const,
        jitter: 0.3,
        pointpos: -1.8,
      }
    })
  }

  function renderQuestionsBoxPlot() {
    const questions = Array.from(new Set(data.map((item) => item.questionName)))

    return questions.map((question) => {
      const questionData = data.filter((item) => item.questionName === question)

      // 表示する値を選択（生の値または偏差値）
      const values = useDeviation
        ? questionData.map((item) => item.questionDeviation)
        : questionData.map((item) => item.numericValue)

      return {
        type: "box" as const,
        y: values,
        name: question,
        boxpoints: "all" as const,
        jitter: 0.3,
        pointpos: -1.8,
      }
    })
  }

  return (
    <Plot data={plotData as Data[]} layout={layout} style={{ width: "100%", height: "100%" }} useResizeHandler={true} />
  )
}

