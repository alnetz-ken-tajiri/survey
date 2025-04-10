"use client"

import { useRef, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, X, ChevronUp, ChevronDown, ListFilter, Folder } from "lucide-react"
import { getQuestionTypeColor, getQuestionTypeIcon } from "@/utils/question-utils"
import { useQuestionGroup } from "@/contexts/question-group-context"

export function QuestionList() {
  const {
    fields,
    filteredQuestions,
    expandedQuestions,
    setExpandedQuestions,
    toggleAllQuestions,
    remove: removeQuestion,
    move,
    categories,
  } = useQuestionGroup()

  const accordionRef = useRef<HTMLDivElement>(null)

  // カテゴリー情報を取得する関数
  const getCategoryName = useCallback(
    (categoryId: string | null) => {
      if (!categoryId) return null
      const category = categories.find((c) => c.id === categoryId)
      return category ? category.name : null
    },
    [categories],
  )

  // 展開状態に基づいて各アイテムの高さを推定
  const estimateAccordionSize = useCallback(
    (index: number) => {
      const isExpanded = expandedQuestions.includes(filteredQuestions[index]?.id || "")
      // 選択肢の数に基づいて高さを動的に計算
      const question = filteredQuestions[index]
      const optionsCount = question?.questionOptions?.length || 0
      const baseHeight = 300 // 基本の高さ
      const optionsHeight = optionsCount * 30 // 選択肢ごとの追加高さ
      return isExpanded ? baseHeight + optionsHeight : 60 // 展開時と折りたたみ時のサイズ推定
    },
    [expandedQuestions, filteredQuestions],
  )

  const accordionVirtualizer = useVirtualizer({
    count: filteredQuestions.length,
    getScrollElement: () => accordionRef.current,
    estimateSize: estimateAccordionSize,
    overscan: 5,
    getItemKey: (index) => filteredQuestions[index]?.id || index,
  })

  const accordionVirtualRows = accordionVirtualizer.getVirtualItems()

  const moveQuestionUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1)
    }
  }

  const moveQuestionDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1)
    }
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-1"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900/50">
        <CardTitle className="text-lg font-semibold flex items-center">
          <ListFilter className="h-5 w-5 mr-2 text-blue-600" />
          質問リスト
        </CardTitle>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAllQuestions}
            className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300 transition-colors"
          >
            {(() => {
              const filteredIds = filteredQuestions.map((q) => q.id)
              const expandedFilteredCount = expandedQuestions.filter((id) => filteredIds.includes(id)).length
              return expandedFilteredCount >= filteredIds.length / 2 ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  すべて折りたたむ
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  すべて展開
                </>
              )
            })()}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            質問が追加されていません。「質問を検索」ボタンから質問を追加してください。
          </div>
        ) : (
          // スクロール可能な領域の高さを明示的に設定
          <div className="w-full max-h-[600px] overflow-auto" ref={accordionRef}>
            {filteredQuestions.length > 0 && (
              <div
                className="relative w-full"
                style={{
                  height: `${accordionVirtualizer.getTotalSize()}px`,
                  contain: "strict",
                }}
              >
                {accordionVirtualRows.map((virtualRow) => {
                  const field = filteredQuestions[virtualRow.index]
                  const index = fields.findIndex((f) => f.id === field.id)
                  const isExpanded = expandedQuestions.includes(field.id)

                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      className="absolute top-0 left-0 w-full"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                        height: `${virtualRow.size}px`, // 明示的に高さを設定
                      }}
                    >
                      <div className="border-b last:border-b-0 h-full">
                        {/* 折りたたみ時の表示 */}
                        <div
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors flex items-center justify-between w-full cursor-pointer"
                          onClick={() => {
                            setExpandedQuestions((prev) =>
                              prev.includes(field.id) ? prev.filter((id) => id !== field.id) : [...prev, field.id],
                            )
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant="outline"
                              className={`${getQuestionTypeColor(field.type)} flex items-center gap-1`}
                            >
                              {getQuestionTypeIcon(field.type)}
                              {field.type}
                            </Badge>
                            <span className="font-medium">{field.name}</span>
                            {field.role === "CATEGORY" && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                カテゴリー
                              </Badge>
                            )}
                            {field.categoryId && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 flex items-center"
                              >
                                <Folder className="h-3 w-3 mr-1 text-blue-600" />
                                {getCategoryName(field.categoryId)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveQuestionUp(index)
                              }}
                              disabled={index === 0}
                              className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveQuestionDown(index)
                              }}
                              disabled={index === fields.length - 1}
                              className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeQuestion(index)
                              }}
                              className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>

                        {/* 展開時の表示 - 余白を減らした新しいレイアウト */}
                        {isExpanded && (
                          <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-900/20">
                            <div className="space-y-2">
                              {/* 役割 */}
                              <div className="flex items-start">
                                <div className="w-24 shrink-0 font-medium text-muted-foreground">役割:</div>
                                <div className="flex-1">
                                  {field.role === "CATEGORY" ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-100 text-yellow-800 border-yellow-300"
                                    >
                                      カテゴリー
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">通常</Badge>
                                  )}
                                </div>
                              </div>

                              {/* カテゴリー */}
                              {field.categoryId && (
                                <div className="flex items-start">
                                  <div className="w-24 shrink-0 font-medium text-muted-foreground">カテゴリー:</div>
                                  <div className="flex-1 flex items-center">
                                    <Folder className="h-4 w-4 mr-1.5 text-yellow-600" />
                                    {getCategoryName(field.categoryId) || "不明なカテゴリー"}
                                  </div>
                                </div>
                              )}

                              {/* タイプ */}
                              <div className="flex items-start">
                                <div className="w-24 shrink-0 font-medium text-muted-foreground">タイプ:</div>
                                <div className="flex-1">
                                  <Badge
                                    variant="outline"
                                    className={`${getQuestionTypeColor(field.type)} flex items-center gap-1 w-fit`}
                                  >
                                    {getQuestionTypeIcon(field.type)}
                                    {field.type}
                                  </Badge>
                                </div>
                              </div>

                              {/* 質問名 */}
                              <div className="flex items-start">
                                <div className="w-24 shrink-0 font-medium text-muted-foreground">質問名:</div>
                                <div className="flex-1 font-medium">{field.name}</div>
                              </div>

                              {/* 説明 */}
                              <div className="flex items-start">
                                <div className="w-24 shrink-0 font-medium text-muted-foreground">説明:</div>
                                <div className="flex-1">{field.description || "なし"}</div>
                              </div>

                              {/* 選択肢 */}
                              {field.questionOptions && field.questionOptions.length > 0 && (
                                <div className="flex items-start">
                                  <div className="w-24 shrink-0 font-medium text-muted-foreground">選択肢:</div>
                                  <div className="flex-1">
                                    <ul className="space-y-1">
                                      {field.questionOptions.map(
                                        (option: { id: string; name: string; value: string }) => (
                                          <li key={option.id} className="flex items-center gap-2">
                                            <Badge variant="secondary" className="font-medium">
                                              {option.name}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">値: {option.value}</span>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
