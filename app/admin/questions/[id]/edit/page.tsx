"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Plus, Trash2, X, Check } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const QuestionType = {
  TEXT: "TEXT",
  RADIO: "RADIO",
  CHECKBOX: "CHECKBOX",
  SELECT: "SELECT",
  FILE: "FILE",
} as const

const questionOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "選択肢名は必須です"),
  value: z.string().min(1, "選択肢の値は必須です"),
})

const questionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "質問名は必須です"),
  description: z.string().optional(),
  public: z.boolean(),
  type: z.enum([QuestionType.TEXT, QuestionType.RADIO, QuestionType.CHECKBOX, QuestionType.SELECT, QuestionType.FILE]),
  questionOptions: z.array(questionOptionSchema).optional(),
  hashtags: z.array(z.string()),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface HashtagResult {
  id: string
  name: string
}

export default function EditQuestion({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [newHashtag, setNewHashtag] = useState("")
  const [hashtagSearch, setHashtagSearch] = useState("")
  const [hashtagResults, setHashtagResults] = useState<HashtagResult[]>([])
  const [openHashtag, setOpenHashtag] = useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      public: false,
      type: QuestionType.TEXT,
      questionOptions: [],
      hashtags: [],
    },
  })

  const questionType = form.watch("type")
  const hashtags = form.watch("hashtags")

  const searchHashtags = useCallback(async (search: string) => {
    try {
      const response = await axios.get(`/api/admin/hashtags?search=${search}`)
      setHashtagResults(response.data)
    } catch (error) {
      console.error("ハッシュタグの検索中にエラーが発生しました:", error)
    }
  }, [])

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/api/admin/questions/${params.id}`)
        const questionData = response.data
        form.reset({
          ...questionData,
          hashtags: questionData.tags.map((tag: { name: string }) => tag.name),
        })
      } catch (error) {
        console.error("Error fetching question:", error)
        toast({
          title: "エラーが発生しました",
          description: "質問の読み込み中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestion()
  }, [params.id, form])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (openHashtag) {
        searchHashtags(hashtagSearch)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [hashtagSearch, searchHashtags, openHashtag])

  const addHashtag = async (tag: string) => {
    if (tag && !hashtags.includes(tag)) {
      let newTag = tag
      if (!hashtagResults.some((result) => result.name === tag)) {
        try {
          const response = await axios.post("/api/admin/hashtags", { name: tag })
          newTag = response.data.name
        } catch (error) {
          console.error("新しいハッシュタグの作成中にエラーが発生しました:", error)
          toast({
            title: "エラーが発生しました",
            description: "新しいハッシュタグの作成に失敗しました。",
            variant: "destructive",
          })
          return
        }
      }
      form.setValue("hashtags", [...hashtags, newTag])
      setHashtagSearch("")
      // 新しいタグを追加した後、検索結果を更新
      setHashtagResults((prevResults) => [...prevResults, { id: Date.now().toString(), name: newTag }])
    }
  }

  const removeHashtag = (tag: string) => {
    form.setValue(
      "hashtags",
      hashtags.filter((t) => t !== tag),
    )
  }

  const onSubmit = async (data: QuestionFormValues) => {
    try {
      const formattedData = {
        ...data,
        questionOptions: data.questionOptions?.filter((option) => option.name && option.value) || [],
      }

      await axios.put(`/api/admin/questions/${params.id}`, formattedData)
      toast({
        title: "質問が更新されました",
        description: "質問が正常に保存されました。",
      })
      router.push("/admin/questions")
    } catch (error) {
      console.error("Error updating question:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問の更新中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">質問の編集</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問</FormLabel>
                <FormControl>
                  <Input placeholder="質問を入力" {...field} />
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
                  <Textarea placeholder="質問の説明を入力" {...field} />
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
                  <FormDescription>この質問を公開するかどうかを設定します</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問タイプ</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="質問タイプを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={QuestionType.TEXT}>テキスト</SelectItem>
                    <SelectItem value={QuestionType.RADIO}>ラジオボタン</SelectItem>
                    <SelectItem value={QuestionType.CHECKBOX}>チェックボックス</SelectItem>
                    <SelectItem value={QuestionType.SELECT}>セレクトボックス</SelectItem>
                    <SelectItem value={QuestionType.FILE}>ファイル</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {["RADIO", "CHECKBOX", "SELECT"].includes(questionType) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">選択肢</h3>
              {form.watch("questionOptions")?.map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name={`questionOptions.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="選択肢名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`questionOptions.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="値" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const currentOptions = form.getValues("questionOptions") || []
                      form.setValue(
                        "questionOptions",
                        currentOptions.filter((_, i) => i !== index),
                      )
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentOptions = form.getValues("questionOptions") || []
                  form.setValue("questionOptions", [...currentOptions, { name: "", value: "" }])
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> 選択肢を追加
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <FormLabel>ハッシュタグ</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-primary text-primary-foreground px-2 py-1 rounded-full flex items-center"
                >
                  #{tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => removeHashtag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Popover
              open={openHashtag}
              onOpenChange={(open) => {
                setOpenHashtag(open)
                if (open) {
                  searchHashtags("")
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openHashtag}
                  className="w-full justify-between"
                >
                  {hashtagSearch ? `#${hashtagSearch}` : "ハッシュタグを選択または追加"}
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="ハッシュタグを検索..."
                    value={hashtagSearch}
                    onValueChange={setHashtagSearch}
                  />
                  <CommandList>
                    <CommandEmpty>ハッシュタグが見つかりません</CommandEmpty>
                    <CommandGroup>
                      {hashtagResults.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => {
                            addHashtag(tag.name)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", hashtags.includes(tag.name) ? "opacity-100" : "opacity-0")}
                          />
                          {tag.name}
                        </CommandItem>
                      ))}
                      {hashtagSearch && !hashtagResults.some((tag) => tag.name === hashtagSearch) && (
                        <CommandItem
                          onSelect={() => {
                            addHashtag(hashtagSearch)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          新しいタグとして追加: {hashtagSearch}
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit">質問を更新</Button>
        </form>
      </Form>
    </div>
  )
}

