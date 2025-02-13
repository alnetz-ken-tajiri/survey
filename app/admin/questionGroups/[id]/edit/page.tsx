"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Accordion } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import QuestionItem from "../../create/QuestionItem"
import ImageUpload from "../../create/ImageUpload"

// 質問タイプの定義
const QuestionType = {
  TEXT: "TEXT",
  RADIO: "RADIO",
  CHECKBOX: "CHECKBOX",
  SELECT: "SELECT",
  FILE: "FILE",
} as const

// Zodスキーマの定義
const questionOptionSchema = z.object({
  name: z.string().min(1, "選択肢名は必須です"),
  value: z.string().min(1, "選択肢の値は必須です"),
})

const questionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "質問名は必須です"),
  description: z.string().nullable().optional(),
  type: z.enum([QuestionType.TEXT, QuestionType.RADIO, QuestionType.CHECKBOX, QuestionType.SELECT, QuestionType.FILE]),
  questionOptions: z.array(questionOptionSchema).optional(),
})

const questionGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "質問セット名は必須です"),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  questionGroupQuestions: z
    .array(
      z.object({
        question: questionSchema,
      }),
    )
    .min(1, "少なくとも1つの質問が必要です"),
})

type QuestionGroupFormValues = z.infer<typeof questionGroupSchema>

export default function EditQuestionGroup({ params }: { params: { id: string } }) {
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<QuestionGroupFormValues>({
    resolver: zodResolver(questionGroupSchema),
    defaultValues: {
      id: params.id,
      name: "",
      description: "",
      fileUrl: "",
      questionGroupQuestions: [],
    },
    mode: "onChange",
  })

  useEffect(() => {
    const fetchQuestionGroup = async () => {
      try {
        const response = await axios.get(`/api/admin/questionGroups/${params.id}`)
        console.log("Fetched data:", response.data)
        const formattedData = {
          ...response.data,
          questionGroupQuestions: response.data.questionGroupQuestions.map((item: any) => ({
            question: {
              ...item.question,
              description: item.question.description ?? undefined,
              questionOptions: item.question.questionOptions || [],
            },
          })),
        }
        form.reset(formattedData)
        setExpandedQuestions(formattedData.questionGroupQuestions.map((_: any, index: number) => `question-${index}`))
      } catch (error) {
        console.error("Error fetching question group:", error)
        toast({
          title: "エラーが発生しました",
          description: "質問セットの取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestionGroup()
  }, [params.id, form, toast])

  // フォームの状態を監視
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form value changed:", name, value)
      console.log("Form is valid:", form.formState.isValid)
      console.log("Form errors:", form.formState.errors)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const renderErrors = (errors: any, parentKey = "") => {
    return Object.entries(errors).map(([key, error]: [string, any]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key
      if (error && typeof error === "object" && error.type) {
        return (
          <li key={fullKey}>
            {fullKey}: {error.message}
          </li>
        )
      } else if (error && typeof error === "object") {
        return (
          <li key={fullKey}>
            {fullKey}
            <ul>{renderErrors(error, fullKey)}</ul>
          </li>
        )
      }
      return null
    })
  }

  const removeQuestion = (indexToRemove: number) => {
    form.setValue(
      "questionGroupQuestions",
      form.getValues("questionGroupQuestions").filter((_, index) => index !== indexToRemove),
    )
    setExpandedQuestions(expandedQuestions.filter((id) => id !== `question-${indexToRemove}`))
  }

  const onSubmit = async (data: QuestionGroupFormValues) => {
    console.log("onSubmit called with data:", data)
    try {
      // データを整形
      const formattedData = {
        ...data,
        questionGroupQuestions: data.questionGroupQuestions.map(({ question }) => ({
          question: {
            ...question,
            description: question.description ?? undefined,
            questionOptions: question.questionOptions?.filter((option) => option.name && option.value) || [],
          },
        })),
      }
      console.log("Formatted data:", formattedData)

      const response = await axios.put(`/api/admin/questionGroups/${params.id}`, formattedData)
      console.log("API response:", response.data)
      toast({
        title: "質問セットが更新されました",
        description: "質問セットが正常に保存されました。",
      })
      router.push("/admin/questionGroups")
    } catch (error) {
      console.error("Error updating question group:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問セットの更新中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">質問セットの編集</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問セット名</FormLabel>
                <FormControl>
                  <Input placeholder="質問セット名を入力" {...field} />
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
                  <Textarea placeholder="質問セットの説明を入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fileUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>画像</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <h2 className="text-xl font-semibold mb-4">質問</h2>
            <Accordion type="multiple" value={expandedQuestions} onValueChange={setExpandedQuestions}>
              {form.watch("questionGroupQuestions").map((item, index) => (
                <QuestionItem
                  key={index}
                  questionIndex={index}
                  form={form}
                  removeQuestion={() => removeQuestion(index)}
                  expandedQuestions={expandedQuestions}
                  setExpandedQuestions={setExpandedQuestions}
                  question={{
                    ...item.question,
                    description: item.question.description ?? undefined,
                  }}
                />
              ))}
            </Accordion>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                const newQuestionId = `question-${form.getValues("questionGroupQuestions").length}`
                form.setValue("questionGroupQuestions", [
                  ...form.getValues("questionGroupQuestions"),
                  { question: { name: "", type: QuestionType.TEXT } },
                ])
                setExpandedQuestions([...expandedQuestions, newQuestionId])
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> 質問を追加
            </Button>
          </div>

          {Object.keys(form.formState.errors).length > 0 && (
            <div className="text-red-500">
              <p>フォームにエラーがあります：</p>
              <ul>{renderErrors(form.formState.errors)}</ul>
            </div>
          )}

          <Button
            type="submit"
            onClick={() => {
              console.log("Submit button clicked")
              console.log("Form is valid:", form.formState.isValid)
              console.log("Form errors:", form.formState.errors)
            }}
          >
            質問セットを更新
          </Button>
        </form>
      </Form>
    </div>
  )
}

