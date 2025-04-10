"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterPanel } from "./filter-panel"
import { SearchResultsList } from "./search-results-list"
import { NewQuestionForm } from "./new-question-form"
import { useQuestionSearch } from "@/contexts/question-search-context"
import { gradientButtonClass } from "@/styles/admin/questionGroups/styles"

export function QuestionSearchDialog() {
  const { openSearch, setOpenSearch, activeTab, setActiveTab } = useQuestionSearch()
  const { selectedQuestions, addSelectedQuestions } = useQuestionSearch()

  return (
    <Dialog open={openSearch} onOpenChange={setOpenSearch} modal={false}>
      <DialogTrigger asChild>
        <Button type="button" variant="default" size="sm" className={gradientButtonClass}>
          <Search className="mr-2 h-4 w-4" />
          質問を検索
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>質問を検索して追加</DialogTitle>
          <DialogDescription>既存の質問から選択するか、新しい質問を作成して質問グループに追加します</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b">
            <TabsList>
              <TabsTrigger value="existing">既存の質問</TabsTrigger>
              <TabsTrigger value="new">新規作成</TabsTrigger>
            </TabsList>
            <Button
              onClick={addSelectedQuestions}
              disabled={selectedQuestions.length === 0}
              className={gradientButtonClass}
            >
              追加
            </Button>
          </div>

          <TabsContent value="existing" className="flex-1 flex flex-col overflow-auto">
            <div className="grid grid-cols-[250px_1fr] gap-4 h-full">
              <FilterPanel />
              <SearchResultsList />
            </div>
          </TabsContent>

          <TabsContent value="new" className="p-4 space-y-4 overflow-auto">
            <NewQuestionForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

