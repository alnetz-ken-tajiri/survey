"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { QuestionPreview } from "@/components/QuestionPreview"
import { Card } from "@/components/ui/card"

const questionGroupSchema = z.object({
  name: z.string().min(1, "質問グループ名は必須です"),
  description: z.string().optional(),
  questions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      type: z.string(),
      questionOptions: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
    }),
  ),
})

type QuestionGroupFormValues = z.infer<typeof questionGroupSchema>

interface Question {
  id: string
  name: string
  description: string | null
  type: string
  questionOptions?: Array<{ id: string; name: string; value: string }>
}

export default function EditQuestionGroup({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Question[]>([])
  const [openSearch, setOpenSearch] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<QuestionGroupFormValues>({
    resolver: zodResolver(questionGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      questions: [],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  const searchQuestions = useCallback(async (search: string) => {
    try {
      const response = await axios.get(`/api/admin/questions/search?q=${search}`)
      setSearchResults(response.data)
    } catch (error) {
      console.error("質問の検索中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問の検索に失敗しました。",
        variant: "destructive",
      })
    }
  }, [])

  useEffect(() => {
    const fetchQuestionGroup = async () => {
      try {
        const response = await axios.get(`/api/admin/questionGroups/${params.id}`)
        const questionGroup = response.data
        form.reset({
          name: questionGroup.name,
          description: questionGroup.description,
          questions: questionGroup.questionGroupQuestions.map((qgq: any) => qgq.question),
        })
      } catch (error) {
        console.error("質問グループの取得中にエラーが発生しました:", error)
        toast({
          title: "エラーが発生しました",
          description: "質問グループの取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestionGroup()
  }, [params.id, form])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (openSearch) {
        searchQuestions(searchTerm)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, searchQuestions, openSearch])

  const addQuestion = (question: Question) => {
    if (!form.getValues("questions").some((q) => q.id === question.id)) {
      append(question)
      setSearchTerm("")
      setOpenSearch(false)
    }
  }

  const removeQuestion = (index: number) => {
    remove(index)
  }

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

  const onSubmit = async (data: QuestionGroupFormValues) => {
    try {
      await axios.put(`/api/admin/questionGroups/${params.id}`, data)
      toast({
        title: "質問グループが更新されました",
        description: "質問グループが正常に保存されました。",
      })
      router.push("/admin/questionGroups")
    } catch (error) {
      console.error("質問グループの更新中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問グループの更新中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">質問グループの編集</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="p-6">
            <div className="space-y-6">
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
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">質問一覧</h2>
              <Popover open={openSearch} onOpenChange={setOpenSearch}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    質問を追加
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput placeholder="質問を検索..." value={searchTerm} onValueChange={setSearchTerm} />
                    <CommandList>
                      <CommandEmpty>質問が見つかりません</CommandEmpty>
                      <CommandGroup>
                        {searchResults.map((question) => (
                          <CommandItem key={question.id} onSelect={() => addQuestion(question)} className="p-2">
                            <QuestionPreview question={question} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {fields.length === 0 ? (
              <Card className="p-6">
                <div className="text-center text-muted-foreground">質問が追加されていません</div>
              </Card>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <QuestionPreview question={field} />
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveQuestionUp(index)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveQuestionDown(index)}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/questionGroups")}>
              キャンセル
            </Button>
            <Button type="submit">質問グループを更新</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

