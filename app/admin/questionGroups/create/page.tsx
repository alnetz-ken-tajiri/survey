"use client"

import { useState } from "react"
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
import { toast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import QuestionItem from "./QuestionItem"
import ImageUpload from "./ImageUpload"

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
  name: z.string().min(1, "質問名は必須です"),
  description: z.string().optional(),
  type: z.enum([QuestionType.TEXT, QuestionType.RADIO, QuestionType.CHECKBOX, QuestionType.SELECT, QuestionType.FILE]),
  questionOptions: z.array(questionOptionSchema).optional(),
})

const questionGroupSchema = z.object({
  name: z.string().min(1, "質問セット名は必須です"),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  questionGroupQuestions: z.array(
    z.object({
      question: questionSchema,
    }),
  ),
})

type QuestionGroupFormValues = z.infer<typeof questionGroupSchema>

export default function CreateQuestionGroup() {
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])
  const router = useRouter()

  const form = useForm<QuestionGroupFormValues>({
    resolver: zodResolver(questionGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      fileUrl: "",
      questionGroupQuestions: [],
    },
  })

  const onSubmit = async (data: QuestionGroupFormValues) => {
    try {
      // データを整形
      const formattedData = {
        ...data,
        questionGroupQuestions: data.questionGroupQuestions.map(({ question }) => ({
          question: {
            ...question,
            questionOptions: question.questionOptions?.filter((option) => option.name && option.value) || [],
          },
        })),
      }

      const response = await axios.post("/api/admin/questionGroups", formattedData)
      toast({
        title: "質問セットが作成されました",
        description: "質問セットが正常に保存されました。",
      })
      router.push("/admin/questionGroups")
    } catch (error) {
      console.error("Error creating question group:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問セットの保存中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">質問セットの作成</h1>
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
                  removeQuestion={() =>
                    form.setValue(
                      "questionGroupQuestions",
                      form.getValues("questionGroupQuestions").filter((_, i) => i !== index),
                    )
                  }
                  expandedQuestions={expandedQuestions}
                  setExpandedQuestions={setExpandedQuestions}
                  question={item.question}
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

          <Button type="submit">質問セットを保存</Button>
        </form>
      </Form>
    </div>
  )
}

