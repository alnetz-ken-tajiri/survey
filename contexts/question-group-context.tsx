"use client"

import { useEffect } from "react"

import type React from "react"

import { createContext, useContext, type ReactNode, useState, useCallback, useMemo } from "react"
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// カテゴリーの型定義を追加
export interface Category {
  id: string
  name: string
  parentId: string | null
  companyId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// スキーマ定義
export const questionGroupSchema = z.object({
  name: z.string().min(1, "質問グループ名は必須です"),
  description: z.string().optional(),
  public: z.boolean().default(false),
  questions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      type: z.string(),
      role: z.enum(["NORMAL", "CATEGORY"]).optional(),
      categoryId: z.string().nullable().optional(),
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

export const newQuestionSchema = z.object({
  name: z.string().min(1, "質問名は必須です"),
  description: z.string().optional(),
  type: z.enum(["TEXT", "CHECKBOX", "RADIO", "SELECT", "FILE"]),
  role: z.enum(["NORMAL", "CATEGORY"]).default("NORMAL"),
  categoryId: z.string().nullable().optional(),
  options: z
    .array(
      z.object({
        name: z.string().min(1, "オプション名は必須です"),
        value: z.string().min(1, "値は必須です"),
      }),
    )
    .optional(),
})

export type QuestionGroupFormValues = z.infer<typeof questionGroupSchema>
export type NewQuestionFormValues = z.infer<typeof newQuestionSchema>

export interface Question {
  id: string
  name: string
  description: string | null
  type: string
  role: "NORMAL" | "CATEGORY"
  categoryId: string | null
  questionOptions?: Array<{ id: string; name: string; value: string }>
  tags?: Array<{ id: string; name: string }>
  category?: Category | null
}

// CSVインポート用の型
export interface CSVQuestion {
  name: string
  description: string
  type: string
  role?: "NORMAL" | "CATEGORY"
  categoryId?: string
  options?: string // "option1:value1,option2:value2" 形式
}

interface QuestionGroupContextType {
  form: UseFormReturn<QuestionGroupFormValues>
  newQuestionForm: UseFormReturn<NewQuestionFormValues>
  fields: Record<string, any>[]
  append: (value: Question) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
  expandedQuestions: string[]
  setExpandedQuestions: React.Dispatch<React.SetStateAction<string[]>>
  filterType: string
  setFilterType: React.Dispatch<React.SetStateAction<string>>
  filterCategory: string | null
  setFilterCategory: React.Dispatch<React.SetStateAction<string | null>>
  filteredQuestions: Record<string, any>[]
  toggleAllQuestions: () => void
  onSubmit: (data: QuestionGroupFormValues) => Promise<void>
  handleCreateNewQuestion: (data: NewQuestionFormValues) => Promise<void>
  isPublic: boolean
  selectedType: string
  selectedCategory: string | null
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>
  optionFields: Record<string, any>[]
  appendOption: (value: { name: string; value: string }) => void
  removeOption: (index: number) => void
  categories: Category[]
  fetchCategories: () => Promise<void>
  selectedCategories: string[]
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>
}

const QuestionGroupContext = createContext<QuestionGroupContextType | undefined>(undefined)

type QuestionGroupProviderProps = {
  children: ReactNode | ((context: QuestionGroupContextType) => React.ReactNode)
}

export function QuestionGroupProvider({ children }: QuestionGroupProviderProps) {
  const router = useRouter()
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const form = useForm<QuestionGroupFormValues>({
    resolver: zodResolver(questionGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      public: false,
      questions: [],
    },
  })

  const newQuestionForm = useForm<NewQuestionFormValues>({
    resolver: zodResolver(newQuestionSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "TEXT",
      role: "NORMAL",
      categoryId: null,
      options: [],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: newQuestionForm.control,
    name: "options",
  })

  // カテゴリー一覧を取得
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/admin/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("カテゴリーの取得中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "カテゴリーの取得に失敗しました。",
        variant: "destructive",
      })
    }
  }, [])

  // コンポーネントマウント時にカテゴリーを取得
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // フィルタリングされた質問リスト
  const filteredQuestions = useMemo(() => {
    return fields.filter((field) => {
      // タイプフィルター
      const typeMatch = filterType === "all" || field.type === filterType

      // カテゴリーフィルター（複数選択対応）
      let categoryMatch = true
      if (selectedCategories.length > 0) {
        categoryMatch = selectedCategories.includes(field.categoryId || "")
      }

      return typeMatch && categoryMatch
    })
  }, [fields, filterType, selectedCategories])

  // すべて展開/折りたたむボタンの処理
  const toggleAllQuestions = useCallback(() => {
    // 現在のフィルタリングされた質問のIDを取得
    const filteredIds = filteredQuestions.map((q) => q.id)

    // 現在展開されているフィルタリング済み質問の数をカウント
    const expandedFilteredCount = expandedQuestions.filter((id) => filteredIds.includes(id)).length

    // 半分以上が展開されている場合は折りたたむ、そうでなければ展開する
    if (expandedFilteredCount >= filteredIds.length / 2) {
      // すべて折りたたむ
      setExpandedQuestions((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      // すべて展開
      setExpandedQuestions((prev) => {
        // 新しい配列を作成して既存の展開状態を維持
        const newExpanded = [...prev]

        // フィルタリングされた質問をすべて追加（重複を避ける）
        filteredIds.forEach((id) => {
          if (!newExpanded.includes(id)) {
            newExpanded.push(id)
          }
        })

        return newExpanded
      })
    }
  }, [filteredQuestions, expandedQuestions])

  const handleCreateNewQuestion = async (data: NewQuestionFormValues) => {
    try {
      // 実際のAPIでは新しい質問を作成するエンドポイントを呼び出す
      const response = await axios.post("/api/admin/questions", data)
      const newQuestion = response.data

      append(newQuestion)
      newQuestionForm.reset({
        name: "",
        description: "",
        type: "TEXT",
        role: "NORMAL",
        categoryId: null,
        options: [],
      })

      toast({
        title: "質問が作成されました",
        description: "新しい質問が追加されました。",
      })
    } catch (error) {
      console.error("質問の作成中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問の作成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: QuestionGroupFormValues) => {
    try {
      await axios.post("/api/admin/questionGroups", data)
      toast({
        title: "質問グループが作成されました",
        description: "質問グループが正常に保存されました。",
      })
      router.push("/admin/questionGroups")
    } catch (error) {
      console.error("質問グループの作成中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問グループの保存に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const isPublic = useMemo(() => form.watch("public"), [form])
  const selectedType = useMemo(() => newQuestionForm.watch("type"), [newQuestionForm])

  const contextValue = {
    form,
    newQuestionForm,
    fields,
    append,
    remove,
    move,
    expandedQuestions,
    setExpandedQuestions,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    filteredQuestions,
    toggleAllQuestions,
    onSubmit,
    handleCreateNewQuestion,
    isPublic,
    selectedType,
    selectedCategory,
    setSelectedCategory,
    optionFields,
    appendOption,
    removeOption,
    categories,
    fetchCategories,
    selectedCategories,
    setSelectedCategories,
  }

  return (
    <QuestionGroupContext.Provider value={contextValue}>
      {typeof children === "function" ? children(contextValue) : children}
    </QuestionGroupContext.Provider>
  )
}

export function useQuestionGroup() {
  const context = useContext(QuestionGroupContext)
  if (context === undefined) {
    throw new Error("useQuestionGroup must be used within a QuestionGroupProvider")
  }
  return context
}
