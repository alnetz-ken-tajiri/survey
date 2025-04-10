"use client"

import { FormDescription } from "@/components/ui/form"

import { useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionSearchDialog } from "@/components/admin/questionGroups/question-search-dialog"
import { QuestionList } from "@/components/admin/questionGroups/question-list"
import { QuestionListFilter } from "@/components/admin/questionGroups/question-list-filter"
import { KeyboardShortcutsDialog } from "@/components/admin/questionGroups/keyboard-shortcuts-dialog"
import { CSVImportExport } from "@/components/admin/questionGroups/csv-import-export"
import { QuestionGroupProvider, useQuestionGroup } from "@/contexts/question-group-context"
import { QuestionSearchProvider, useQuestionSearch } from "@/contexts/question-search-context"
import { useHotkeys } from "react-hotkeys-hook"
import { gradientButtonClass } from "@/styles/admin/questionGroups/styles"

function CreateQuestionGroupForm() {
  const { form, onSubmit, isPublic } = useQuestionGroup()
  const [activeTab, setActiveTab] = useState("basic")
  const { setOpenSearch } = useQuestionSearch()

  // キーボードショートカット
  useHotkeys("ctrl+shift+a", () => setOpenSearch(true), { preventDefault: true })
  useHotkeys("ctrl+shift+s", () => form.handleSubmit(onSubmit)(), { preventDefault: true })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">質問グループの作成</CardTitle>
                <CardDescription>質問グループを作成して、アンケートに使用できます。</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <CSVImportExport />
                <KeyboardShortcutsDialog />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">基本情報</TabsTrigger>
                <TabsTrigger value="questions">質問管理</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>質問グループ名</FormLabel>
                      <FormControl>
                        <Input placeholder="質問グループ名を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>説明</FormLabel>
                      <FormControl>
                        <Textarea placeholder="質問グループの説明を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">公開設定</FormLabel>
                        <FormDescription>公開すると、他のユーザーもこの質問グループを使用できます。</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="questions" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">質問の管理</h3>
                    <QuestionSearchDialog />
                  </div>

                  {/* 質問リストフィルターを追加 */}
                  <QuestionListFilter />

                  <QuestionList />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
            <Button type="submit" className={gradientButtonClass}>
              保存
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

const CreateQuestionGroup = () => {
  const [filterType, setFilterType] = useState("all")

  return (
    <QuestionGroupProvider>
      {({ append }) => (
        <QuestionSearchProvider append={append} filterType={filterType}>
          <CreateQuestionGroupForm />
        </QuestionSearchProvider>
      )}
    </QuestionGroupProvider>
  )
}

export default CreateQuestionGroup
