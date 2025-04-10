"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import * as Portal from "@radix-ui/react-portal"

interface MinimalQuestionSelectorProps {
  questions: string[]
  selectedQuestions: string[]
  onChange: (selected: string[]) => void
  className?: string
  placeholder?: string
}

export function MinimalQuestionSelector({
  questions,
  selectedQuestions,
  onChange,
  className,
  placeholder = "質問を選択...",
}: MinimalQuestionSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })

  // 検索フィルター
  const filteredQuestions = React.useMemo(() => {
    if (!searchQuery) return questions
    return questions.filter((question) => question.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [questions, searchQuery])

  // 質問の選択・解除
  const toggleQuestion = React.useCallback(
    (question: string, e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      if (selectedQuestions.includes(question)) {
        onChange(selectedQuestions.filter((q) => q !== question))
      } else {
        onChange([...selectedQuestions, question])
      }
    },
    [selectedQuestions, onChange],
  )

  // ポジションの更新
  React.useEffect(() => {
    if (containerRef.current && isOpen) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen])

  // クリックアウトで閉じる
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* トリガー */}
      <div
        className={cn(
          "flex min-h-[40px] w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer",
          className,
        )}
        onClick={handleTriggerClick}
      >
        {selectedQuestions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedQuestions.map((question) => (
              <Badge key={question} variant="secondary" className="mr-1 mb-1">
                {question}
                <button
                  type="button"
                  className="ml-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleQuestion(question)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {/* ドロップダウン */}
      {isOpen && (
        <Portal.Root>
          <div
            ref={dropdownRef}
            onClick={handleDropdownClick}
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 1000,
            }}
          >
            <div className="mt-1 bg-background border rounded-md shadow-md">
              {/* 検索ボックス */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* 質問リスト */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                {filteredQuestions.length === 0 ? (
                  <div className="py-2 text-center text-sm text-muted-foreground">質問が見つかりません。</div>
                ) : (
                  filteredQuestions.map((question) => {
                    const isSelected = selectedQuestions.includes(question)
                    return (
                      <div
                        key={question}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer"
                        onClick={(e) => toggleQuestion(question, e)}
                      >
                        <Checkbox
                          id={`minimal-${question.replace(/\s+/g, "-")}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (typeof checked === "boolean") {
                              toggleQuestion(question)
                            }
                          }}
                          className="cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label
                          htmlFor={`minimal-${question.replace(/\s+/g, "-")}`}
                          className="flex-grow cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {question}
                        </label>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </Portal.Root>
      )}
    </div>
  )
}

