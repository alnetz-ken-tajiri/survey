"use client"

import { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { DialogFooter } from "@/components/ui/dialog"
import { useQuestionSearch } from "@/contexts/question-search-context"
import { type Question, useQuestionGroup } from "@/contexts/question-group-context"
import { QuestionCard } from "./question-card"

export function SearchResultsList() {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearchLoading,
    selectedQuestions,
    toggleSelectQuestion,
    addSelectedQuestions,
    showDescription,
    showOptions,
    showTags,
    showCategory,
    setOpenSearch,
  } = useQuestionSearch()

  const { form, append } = useQuestionGroup()

  const parentRef = useRef<HTMLDivElement>(null)
  const estimateSize = () => 200 // 各行の推定サイズ

  const rowVirtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  const addQuestion = (question: Question) => {
    if (!form.getValues("questions").some((q) => q.id === question.id)) {
      append(question)
      setSearchTerm("")
      setOpenSearch(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="質問を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="p-4 pt-0 pb-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{searchResults.length}件の質問が見つかりました</div>
        <div className="text-sm font-medium">{selectedQuestions.length}件選択中</div>
      </div>

      <div className="flex-1 overflow-auto" ref={parentRef}>
        {isSearchLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">質問が見つかりません</div>
        ) : (
          <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {virtualRows.map((virtualRow) => (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={(el) => {
                  if (el) {
                    rowVirtualizer.measureElement(el)
                  }
                }}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: "0 1rem",
                  paddingTop: virtualRow.index === 0 ? "1rem" : "0.75rem",
                }}
              >
                <QuestionCard
                  question={searchResults[virtualRow.index]}
                  isSelected={selectedQuestions.includes(searchResults[virtualRow.index].id)}
                  showDescription={showDescription}
                  showOptions={showOptions}
                  showTags={showTags}
                  showCategory={showCategory}
                  toggleSelect={toggleSelectQuestion}
                  addQuestion={addQuestion}
                  isAlreadyAdded={form.getValues("questions").some((q) => q.id === searchResults[virtualRow.index].id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter className="px-6 py-4 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm">{selectedQuestions.length}件の質問を選択中</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setOpenSearch(false)}>
              キャンセル
            </Button>
            <Button
              onClick={addSelectedQuestions}
              disabled={selectedQuestions.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              選択した質問を追加
            </Button>
          </div>
        </div>
      </DialogFooter>
    </div>
  )
}
