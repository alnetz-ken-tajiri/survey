"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Folder } from "lucide-react"
import { useQuestionGroup } from "@/contexts/question-group-context"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function QuestionListFilter() {
  const { filterType, setFilterType, selectedCategories, setSelectedCategories, categories } = useQuestionGroup()
  const [isOpen, setIsOpen] = useState(false)

  // 親カテゴリーとその子カテゴリーを整理
  const parentCategories = categories.filter((cat) => cat.parentId === null)
  const childCategoriesMap = new Map<string, any[]>()

  categories
    .filter((cat) => cat.parentId !== null)
    .forEach((cat) => {
      if (cat.parentId) {
        if (!childCategoriesMap.has(cat.parentId)) {
          childCategoriesMap.set(cat.parentId, [])
        }
        const children = childCategoriesMap.get(cat.parentId)
        if (children) {
          children.push(cat)
        }
      }
    })

  // カテゴリー名を取得する関数
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "不明なカテゴリー"
  }

  // カテゴリーの選択状態を切り替える
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  // 選択されたカテゴリーをすべて解除
  const clearCategories = () => {
    setSelectedCategories([])
  }

  return (
    <div className="flex items-center space-x-4 mb-4">
      <div className="flex items-center">
        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm font-medium">フィルター:</span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        <div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="質問タイプ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのタイプ</SelectItem>
              <SelectItem value="TEXT">テキスト</SelectItem>
              <SelectItem value="CHECKBOX">チェックボックス</SelectItem>
              <SelectItem value="RADIO">ラジオボタン</SelectItem>
              <SelectItem value="SELECT">セレクト</SelectItem>
              <SelectItem value="FILE">ファイル</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full justify-between h-9">
                {selectedCategories.length > 0
                  ? `${selectedCategories.length}個のカテゴリーを選択中`
                  : "カテゴリーを選択"}
                <Folder className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="p-2 flex items-center justify-between">
                <span className="text-sm font-medium">カテゴリー</span>
                {selectedCategories.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCategories} className="h-8 px-2">
                    <X className="h-4 w-4 mr-1" />
                    クリア
                  </Button>
                )}
              </div>
              <ScrollArea className="h-72">
                <div className="p-2">
                  <div className="flex items-center mb-2">
                    <Checkbox
                      id="all-categories"
                      checked={selectedCategories.length === 0}
                      onCheckedChange={() => clearCategories()}
                    />
                    <label htmlFor="all-categories" className="ml-2 text-sm">
                      すべてのカテゴリー
                    </label>
                  </div>
                  {parentCategories.map((category) => (
                    <div key={category.id} className="mb-1">
                      <div className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 text-sm font-medium">
                          {category.name}
                        </label>
                      </div>
                      {childCategoriesMap.has(category.id) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {childCategoriesMap.get(category.id)?.map((childCat) => (
                            <div key={childCat.id} className="flex items-center">
                              <Checkbox
                                id={`category-${childCat.id}`}
                                checked={selectedCategories.includes(childCat.id)}
                                onCheckedChange={() => toggleCategory(childCat.id)}
                              />
                              <label htmlFor={`category-${childCat.id}`} className="ml-2 text-sm">
                                {childCat.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 選択されたカテゴリーを表示 */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCategories.map((categoryId) => (
            <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
              {getCategoryName(categoryId)}
              <Button variant="ghost" size="sm" onClick={() => toggleCategory(categoryId)} className="h-4 w-4 p-0 ml-1">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
