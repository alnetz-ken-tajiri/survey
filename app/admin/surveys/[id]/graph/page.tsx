"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import BarChart from "@/components/admin/surveys/graph/bar-chart"
import ViolinPlot from "@/components/admin/surveys/graph/violin-plot"
import BoxPlot from "@/components/admin/surveys/graph/box-plot"
import LineChart from "@/components/admin/surveys/graph/line-chart"
import DataTable from "@/components/admin/surveys/graph/data-table"
import { FilterCard } from "@/components/admin/surveys/graph/filter-card"
import { DataSummary } from "@/components/admin/surveys/graph/data-summary"
import { BarChart3, LineChartIcon, PianoIcon as Violin, BoxSelect, ScatterChart, Table2 } from "lucide-react"
import { calculateMean } from "@/utils/statistics"
import { useGraph } from "@/hooks/admin/surveys/use-graph"
import type { RawRecord, GroupedRecord, PivotedRecord, OverallRecord } from "@/types/admin/surveys/surveys"
import { MinimalQuestionSelector } from "@/components/admin/surveys/graph/minimal-question-selector"
import { MinimalCategorySelector } from "@/components/admin/surveys/graph/minimal-category-selector"

export default function GraphPage(params: { params: { id: string } }) {
  // カスタムフックを使用してデータを取得
  const surveyId = params.params?.id || "default-survey-id"
  const { isLoading, error, users, rawData, groupedData, pivotedData, overallData, questionTagMap } =
    useGraph(surveyId)

  // 表示モードの状態
  const [barChartMode, setBarChartMode] = useState<"categories" | "questions">("categories")
  const [violinPlotMode, setViolinPlotMode] = useState<"categories" | "questions">("categories")
  const [boxPlotMode, setBoxPlotMode] = useState<"categories" | "questions">("categories")
  const [lineChartMode, setLineChartMode] = useState<"categories" | "questions">("categories")
  const [scatterMode, setScatterMode] = useState<"questions" | "categories">("questions")

  // フィルター状態
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [useDeviation, setUseDeviation] = useState<boolean>(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [selectedXQuestion, setSelectedXQuestion] = useState<string>("技術スキル1")
  const [selectedYQuestion, setSelectedYQuestion] = useState<string>("チームワーク1")
  const [selectedXCategory, setSelectedXCategory] = useState<string>("技術スキル")
  const [selectedYCategory, setSelectedYCategory] = useState<string>("チームワーク")

  // フィルタリングされたデータ
  const [filteredRawData, setFilteredRawData] = useState<RawRecord[]>([])
  const [filteredGroupedData, setFilteredGroupedData] = useState<GroupedRecord[]>([])
  const [filteredPivotedData, setFilteredPivotedData] = useState<PivotedRecord[]>([])
  const [filteredOverallData, setFilteredOverallData] = useState<OverallRecord[]>([])

  // データが読み込まれたらフィルタリングされたデータを初期化
  useEffect(() => {
    if (!isLoading && !error) {
      setFilteredRawData(rawData)
      setFilteredGroupedData(groupedData)
      setFilteredPivotedData(pivotedData)
      setFilteredOverallData(overallData)
    }
  }, [isLoading, error, rawData, groupedData, pivotedData, overallData])

  // ユニークなカテゴリーと質問
  const uniqueCategories: string[] = useMemo(() => {
    return Array.from(new Set(rawData.map((item) => item.category)))
  }, [rawData])

  const uniqueQuestions: string[] = useMemo(() => {
    return Array.from(new Set(rawData.map((item) => item.questionName)))
  }, [rawData])

  // 平均偏差値を計算
  const averageDeviation = useMemo(() => {
    if (filteredOverallData.length === 0) return 50
    return calculateMean(filteredOverallData.map((item) => item.overallDeviation))
  }, [filteredOverallData])

  // フィルタリングロジック
  useEffect(() => {
    if (isLoading || error || rawData.length === 0) return

    // Filter raw data
    let rawFiltered = [...rawData]

    if (selectedUsers.length > 0) {
      rawFiltered = rawFiltered.filter((item) => selectedUsers.includes(item.employeeNumber))
    }

    if (selectedCategories.length > 0) {
      rawFiltered = rawFiltered.filter((item) => selectedCategories.includes(item.category))
    }

    if (selectedQuestions.length > 0) {
      rawFiltered = rawFiltered.filter((item) => selectedQuestions.includes(item.questionName))
    }

    setFilteredRawData(rawFiltered)

    // Filter grouped data
    let groupedFiltered = [...groupedData]

    if (selectedUsers.length > 0) {
      groupedFiltered = groupedFiltered.filter((item) => selectedUsers.includes(item.employeeNumber))
    }

    if (selectedCategories.length > 0) {
      groupedFiltered = groupedFiltered.filter((item) => selectedCategories.includes(item.category))
    }

    setFilteredGroupedData(groupedFiltered)

    // Filter pivoted data
    let pivotedFiltered = [...pivotedData]

    if (selectedUsers.length > 0) {
      pivotedFiltered = pivotedFiltered.filter((item) => selectedUsers.includes(item.employeeNumber))
    }

    setFilteredPivotedData(pivotedFiltered)

    // Filter overall data
    let overallFiltered = [...overallData]

    if (selectedUsers.length > 0) {
      overallFiltered = overallFiltered.filter((item) => selectedUsers.includes(item.employeeNumber))
    }

    setFilteredOverallData(overallFiltered)
  }, [
    selectedUsers,
    selectedCategories,
    selectedQuestions,
    isLoading,
    error,
    rawData,
    groupedData,
    pivotedData,
    overallData,
  ])

  // ユーザー数を計算（選択ユーザーがない場合は全ユーザー）
  const userCount = selectedUsers.length === 0 ? users.length : selectedUsers.length

  // データポイント数
  const dataPointCount = filteredRawData.length

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-lg font-medium">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-destructive/10 p-8 rounded-lg border border-destructive max-w-md shadow-lg">
          <h2 className="text-xl font-bold text-destructive mb-3">エラーが発生しました</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-primary">サーベイデータ可視化</h1>
          </div>

          {/* Filter Card */}
          <FilterCard
            users={users}
            selectedUsers={selectedUsers}
            onSelectedUsersChange={setSelectedUsers}
            useDeviation={useDeviation}
            onUseDeviationChange={setUseDeviation}
            dataPoints={dataPointCount}
          />

          {/* Graph Tabs */}
          <Tabs defaultValue="bar" className="w-full">
            <TabsList className="grid grid-cols-6 w-full mb-8 h-auto p-1 bg-gray-100 rounded-lg shadow-sm">
              <TabsTrigger
                value="bar"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">棒グラフ</span>
              </TabsTrigger>
              <TabsTrigger
                value="line"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all"
              >
                <LineChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">折れ線グラフ</span>
              </TabsTrigger>
              <TabsTrigger
                value="violin"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all"
              >
                <Violin className="h-4 w-4" />
                <span className="hidden sm:inline">バイオリン図</span>
              </TabsTrigger>
              <TabsTrigger
                value="box"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all"
              >
                <BoxSelect className="h-4 w-4" />
                <span className="hidden sm:inline">箱ひげ図</span>
              </TabsTrigger>
              <TabsTrigger
                value="scatter"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all"
              >
                <ScatterChart className="h-4 w-4" />
                <span className="hidden sm:inline">散布図</span>
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md transition-all"
              >
                <Table2 className="h-4 w-4" />
                <span className="hidden sm:inline">データテーブル</span>
              </TabsTrigger>
            </TabsList>

            {/* Bar Chart Tab */}
            <TabsContent value="bar" className="space-y-6">
              <DataSummary
                dataPoints={dataPointCount}
                categoryCount={selectedCategories.length === 0 ? uniqueCategories.length : selectedCategories.length}
                questionCount={selectedQuestions.length === 0 ? uniqueQuestions.length : selectedQuestions.length}
                userCount={userCount}
                averageDeviation={averageDeviation}
              />
              <Card className="border border-gray-200 shadow-md overflow-hidden bg-white">
                <CardHeader className="border-b bg-gray-50 pb-3">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    カテゴリー別{useDeviation ? "偏差値" : "平均スコア"}
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    各カテゴリーの{useDeviation ? "平均偏差値" : "平均スコア"}を表示しています
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] p-0">
                  <BarChart data={filteredRawData} useDeviation={useDeviation} mode={barChartMode} />
                </CardContent>
                <CardFooter className="border-t p-5 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">表示モード</Label>
                      <Select
                        value={barChartMode}
                        onValueChange={(value) => setBarChartMode(value as "categories" | "questions")}
                      >
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="表示モードを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="categories">カテゴリー別</SelectItem>
                          <SelectItem value="questions">質問別</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">カテゴリー（複数選択可）</Label>
                      <MinimalCategorySelector
                        categories={uniqueCategories}
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                        placeholder="カテゴリーを選択..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">質問（複数選択可）</Label>
                      <MinimalQuestionSelector
                        questions={uniqueQuestions}
                        selectedQuestions={selectedQuestions}
                        onChange={setSelectedQuestions}
                        placeholder="質問を選択..."
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Line Chart Tab */}
            <TabsContent value="line" className="space-y-6">
              <DataSummary
                dataPoints={dataPointCount}
                categoryCount={selectedCategories.length === 0 ? uniqueCategories.length : selectedCategories.length}
                questionCount={selectedQuestions.length === 0 ? uniqueQuestions.length : selectedQuestions.length}
                userCount={userCount}
                averageDeviation={averageDeviation}
              />
              <Card className="data-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <CardTitle className="text-xl font-semibold">
                    {lineChartMode === "categories"
                      ? `カテゴリー別${useDeviation ? "偏差値" : "平均スコア"}推移`
                      : `質問別${useDeviation ? "偏差値" : "回答値"}推移`}
                  </CardTitle>
                  <CardDescription>
                    {lineChartMode === "categories"
                      ? "各カテゴリーの推移を表示しています"
                      : "各質問の回答推移を表示しています"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] p-0 chart-container">
                  <LineChart data={filteredRawData} useDeviation={useDeviation} mode={lineChartMode} />
                </CardContent>
                <CardFooter className="border-t p-5 bg-muted/5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">表示モード</Label>
                      <Select
                        value={lineChartMode}
                        onValueChange={(value) => setLineChartMode(value as "categories" | "questions")}
                      >
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="表示モードを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="categories">カテゴリー別</SelectItem>
                          <SelectItem value="questions">質問別</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">カテゴリー（複数選択可）</Label>
                      <MinimalCategorySelector
                        categories={uniqueCategories}
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                        placeholder="カテゴリーを選択..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">質問（複数選択可）</Label>
                      <MinimalQuestionSelector
                        questions={uniqueQuestions}
                        selectedQuestions={selectedQuestions}
                        onChange={setSelectedQuestions}
                        placeholder="質問を選択..."
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Violin Plot Tab */}
            <TabsContent value="violin" className="space-y-6">
              <DataSummary
                dataPoints={dataPointCount}
                categoryCount={selectedCategories.length === 0 ? uniqueCategories.length : selectedCategories.length}
                questionCount={selectedQuestions.length === 0 ? uniqueQuestions.length : selectedQuestions.length}
                userCount={userCount}
                averageDeviation={averageDeviation}
              />
              <Card className="data-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <CardTitle className="text-xl font-semibold">
                    カテゴリー別回答分布（バイオリン図）{useDeviation ? "（偏差値）" : ""}
                  </CardTitle>
                  <CardDescription>各カテゴリーの回答分布を表示しています</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] p-0 chart-container">
                  <ViolinPlot data={filteredRawData} useDeviation={useDeviation} mode={violinPlotMode} />
                </CardContent>
                <CardFooter className="border-t p-5 bg-muted/5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">表示モード</Label>
                      <Select
                        value={violinPlotMode}
                        onValueChange={(value) => setViolinPlotMode(value as "categories" | "questions")}
                      >
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="表示モードを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="categories">カテゴリー別</SelectItem>
                          <SelectItem value="questions">質問別</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">カテゴリー（複数選択可）</Label>
                      <MinimalCategorySelector
                        categories={uniqueCategories}
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                        placeholder="カテゴリーを選択..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">質問（複数選択可）</Label>
                      <MinimalQuestionSelector
                        questions={uniqueQuestions}
                        selectedQuestions={selectedQuestions}
                        onChange={setSelectedQuestions}
                        placeholder="質問を選択..."
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Box Plot Tab */}
            <TabsContent value="box" className="space-y-6">
              <DataSummary
                dataPoints={dataPointCount}
                categoryCount={selectedCategories.length === 0 ? uniqueCategories.length : selectedCategories.length}
                questionCount={selectedQuestions.length === 0 ? uniqueQuestions.length : selectedQuestions.length}
                userCount={userCount}
                averageDeviation={averageDeviation}
              />
              <Card className="data-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <CardTitle className="text-xl font-semibold">
                    カテゴリー別回答分布（箱ひげ図）{useDeviation ? "（偏差値）" : ""}
                  </CardTitle>
                  <CardDescription>各カテゴリーの四分位数と外れ値を表示しています</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] p-0 chart-container">
                  <BoxPlot data={filteredRawData} useDeviation={useDeviation} mode={boxPlotMode} />
                </CardContent>
                <CardFooter className="border-t p-5 bg-muted/5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">表示モード</Label>
                      <Select
                        value={boxPlotMode}
                        onValueChange={(value) => setBoxPlotMode(value as "categories" | "questions")}
                      >
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="表示モードを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="categories">カテゴリー別</SelectItem>
                          <SelectItem value="questions">質問別</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">カテゴリー（複数選択可）</Label>
                      <MinimalCategorySelector
                        categories={uniqueCategories}
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                        placeholder="カテゴリーを選択..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">質問（複数選択可）</Label>
                      <MinimalQuestionSelector
                        questions={uniqueQuestions}
                        selectedQuestions={selectedQuestions}
                        onChange={setSelectedQuestions}
                        placeholder="質問を選択..."
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Scatter Plot Tab */}
            <TabsContent value="scatter" className="space-y-6">
              <DataSummary
                dataPoints={dataPointCount}
                categoryCount={selectedCategories.length === 0 ? uniqueCategories.length : selectedCategories.length}
                questionCount={selectedQuestions.length === 0 ? uniqueQuestions.length : selectedQuestions.length}
                userCount={userCount}
                averageDeviation={averageDeviation}
              />
              <Card className="data-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <CardTitle className="text-xl font-semibold">
                    相関分析（散布図）{useDeviation ? "（偏差値）" : ""}
                  </CardTitle>
                  <CardDescription>
                    {scatterMode === "questions"
                      ? "質問間の相関関係を表示しています"
                      : "カテゴリー間の相関関係を表示しています"}
                  </CardDescription>
                </CardHeader>
               
                <CardFooter className="border-t p-5 bg-muted/5">
                  <div className="w-full space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">表示モード</Label>
                        <Select
                          value={scatterMode}
                          onValueChange={(value) => setScatterMode(value as "questions" | "categories")}
                        >
                          <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                            <SelectValue placeholder="表示モードを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="questions">質問間</SelectItem>
                            <SelectItem value="categories">カテゴリー間</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {scatterMode === "questions" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">X軸の質問</Label>
                          <Select value={selectedXQuestion} onValueChange={setSelectedXQuestion}>
                            <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                              <SelectValue placeholder="X軸の質問を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueQuestions.map((question) => (
                                <SelectItem key={question} value={question}>
                                  {question}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Y軸の質問</Label>
                          <Select value={selectedYQuestion} onValueChange={setSelectedYQuestion}>
                            <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                              <SelectValue placeholder="Y軸の質問を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueQuestions.map((question) => (
                                <SelectItem key={question} value={question}>
                                  {question}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">X軸のカテゴリー</Label>
                          <Select value={selectedXCategory} onValueChange={setSelectedXCategory}>
                            <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                              <SelectValue placeholder="X軸のカテゴリーを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Y軸のカテゴリー</Label>
                          <Select value={selectedYCategory} onValueChange={setSelectedYCategory}>
                            <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                              <SelectValue placeholder="Y軸のカテゴリーを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Data Table Tab */}
            <TabsContent value="table" className="space-y-6">
              <DataSummary
                dataPoints={dataPointCount}
                categoryCount={selectedCategories.length === 0 ? uniqueCategories.length : selectedCategories.length}
                questionCount={selectedQuestions.length === 0 ? uniqueQuestions.length : selectedQuestions.length}
                userCount={userCount}
                averageDeviation={averageDeviation}
              />
              <Card className="data-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <CardTitle className="text-xl font-semibold">回答データ</CardTitle>
                  <CardDescription>生のデータを表形式で表示しています</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-hidden rounded-md">
                    <DataTable
                      data={filteredRawData}
                      groupedData={filteredGroupedData}
                      overallData={filteredOverallData}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t p-5 bg-muted/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">カテゴリー（複数選択可）</Label>
                      <MinimalCategorySelector
                        categories={uniqueCategories}
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                        placeholder="カテゴリーを選択..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">質問（複数選択可）</Label>
                      <MinimalQuestionSelector
                        questions={uniqueQuestions}
                        selectedQuestions={selectedQuestions}
                        onChange={setSelectedQuestions}
                        placeholder="質問を選択..."
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

