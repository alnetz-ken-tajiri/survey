"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Filter,
  Tag,
  SortAsc,
  Settings,
  FileText,
  CheckSquare,
  Radio,
  ListFilter,
  FileUp,
  Search,
  Folder,
  X,
} from "lucide-react"
import { useQuestionSearch } from "@/contexts/question-search-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/contexts/question-group-context"

export function FilterPanel() {
  const {
    filterType,
    setFilterType,
    tagFilter,
    setTagFilter,
    availableTags,
    selectedTags,
    setSelectedTags,
    sortOrder,
    setSortOrder,
    showDescription,
    setShowDescription,
    showOptions,
    setShowOptions,
    showTags,
    setShowTags,
    showCategory,
    setShowCategory,
    categories,
    selectedCategories,
    setSelectedCategories,
  } = useQuestionSearch()

  // カテゴリーの階層構造を作成
  const categoryMap = new Map<string, Category>()
  categories.forEach((cat) => categoryMap.set(cat.id, cat))

  // 親カテゴリーとその子カテゴリーを整理
  const parentCategories = categories.filter((cat) => cat.parentId === null)
  const childCategoriesMap = new Map<string, Category[]>()

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
    <div className="border-r pr-4 pt-4">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Filter className="h-4 w-4 mr-1.5" />
            質問タイプ
          </h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox id="filter-all" checked={filterType === "all"} onCheckedChange={() => setFilterType("all")} />
              <label htmlFor="filter-all" className="ml-2 text-sm">
                すべて
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="filter-text"
                checked={filterType === "TEXT"}
                onCheckedChange={() => setFilterType("TEXT")}
              />
              <label htmlFor="filter-text" className="ml-2 text-sm flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                テキスト
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="filter-checkbox"
                checked={filterType === "CHECKBOX"}
                onCheckedChange={() => setFilterType("CHECKBOX")}
              />
              <label htmlFor="filter-checkbox" className="ml-2 text-sm flex items-center">
                <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                チェックボックス
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="filter-radio"
                checked={filterType === "RADIO"}
                onCheckedChange={() => setFilterType("RADIO")}
              />
              <label htmlFor="filter-radio" className="ml-2 text-sm flex items-center">
                <Radio className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                ラジオボタン
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="filter-select"
                checked={filterType === "SELECT"}
                onCheckedChange={() => setFilterType("SELECT")}
              />
              <label htmlFor="filter-select" className="ml-2 text-sm flex items-center">
                <ListFilter className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                セレクト
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="filter-file"
                checked={filterType === "FILE"}
                onCheckedChange={() => setFilterType("FILE")}
              />
              <label htmlFor="filter-file" className="ml-2 text-sm flex items-center">
                <FileUp className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                ファイル
              </label>
            </div>
          </div>
        </div>

        {/* カテゴリーフィルターを複数選択に変更 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center">
              <Folder className="h-4 w-4 mr-1.5" />
              カテゴリー
            </h3>
            {selectedCategories.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCategories} className="h-6 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                クリア
              </Button>
            )}
          </div>
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
          <ScrollArea className="h-40">
            {parentCategories.map((category) => (
              <div key={category.id} className="mb-1">
                <div className="flex items-center">
                  <Checkbox
                    id={`search-category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label htmlFor={`search-category-${category.id}`} className="ml-2 text-sm font-medium">
                    {category.name}
                  </label>
                </div>
                {childCategoriesMap.has(category.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {childCategoriesMap.get(category.id)?.map((childCat) => (
                      <div key={childCat.id} className="flex items-center">
                        <Checkbox
                          id={`search-category-${childCat.id}`}
                          checked={selectedCategories.includes(childCat.id)}
                          onCheckedChange={() => toggleCategory(childCat.id)}
                        />
                        <label htmlFor={`search-category-${childCat.id}`} className="ml-2 text-sm">
                          {childCat.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Tag className="h-4 w-4 mr-1.5" />
            タグで絞り込み
          </h3>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="relative">
            <Input
              placeholder="タグを検索..."
              value={tagFilter || ""}
              onChange={(e) => setTagFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="mt-2 max-h-40 overflow-y-auto">
            {availableTags
              .filter((tag) => tag.name.toLowerCase().includes(tagFilter.toLowerCase()))
              .slice(0, 20) // 表示数を制限
              .map((tag) => (
                <div key={tag.id} className="flex items-center">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTags((prev) => [...prev, tag.id])
                      } else {
                        setSelectedTags((prev) => prev.filter((id) => id !== tag.id))
                      }
                    }}
                  />
                  <label htmlFor={`tag-${tag.id}`} className="ml-2 text-sm">
                    <span className="text-blue-500">#{tag.name}</span>
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <SortAsc className="h-4 w-4 mr-1.5" />
            並び替え
          </h3>
          <Select defaultValue="newest" onValueChange={(value) => setSortOrder(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">新しい順</SelectItem>
              <SelectItem value="oldest">古い順</SelectItem>
              <SelectItem value="name-asc">名前（昇順）</SelectItem>
              <SelectItem value="name-desc">名前（降順）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Settings className="h-4 w-4 mr-1.5" />
            表示オプション
          </h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox
                id="show-description"
                checked={showDescription}
                onCheckedChange={(checked) => setShowDescription(!!checked)}
              />
              <label htmlFor="show-description" className="ml-2 text-sm">
                説明を表示
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="show-options"
                checked={showOptions}
                onCheckedChange={(checked) => setShowOptions(!!checked)}
              />
              <label htmlFor="show-options" className="ml-2 text-sm">
                選択肢を表示
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox id="show-tags" checked={showTags} onCheckedChange={(checked) => setShowTags(!!checked)} />
              <label htmlFor="show-tags" className="ml-2 text-sm">
                タグを表示
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="show-category"
                checked={showCategory}
                onCheckedChange={(checked) => setShowCategory(!!checked)}
              />
              <label htmlFor="show-category" className="ml-2 text-sm">
                カテゴリーを表示
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
