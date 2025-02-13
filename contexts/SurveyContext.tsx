"use client"

import React, { createContext, useContext, useState } from "react"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Question, QuestionOption } from "@/lib/api"
import { useSwrData } from "@/hooks/useSwrData"
import { useSession } from "next-auth/react"
import type { Prisma } from "@prisma/client"

type User = Prisma.UserGetPayload<{
  include: {
    employee: true
  }
}>

interface APIQuestion {
  id: string
  name: string
  type: string
  questionOptions: QuestionOption[]
}

interface APIResponse {
  surveyId: string
  id: string
  name: string
  description: string | null
  questionGroupQuestions: {
    question: APIQuestion
  }[]
  createdAt: string
  fileUrl: string
}

// コンテキスト型
interface SurveyContextType {
  currentQuestionIndex: number
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>
  isQuestionAnswered: boolean[]
  setIsQuestionAnswered: React.Dispatch<React.SetStateAction<boolean[]>>
  form: UseFormReturn<any>
  questions: Question[]
  isLoadingApiResponse: boolean
  surveyData: APIResponse | null
  userData: User | null
  isLoadingUser: boolean
  surveyId: string
  headerColor: string
  setHeaderColor: React.Dispatch<React.SetStateAction<string>>
}

function convertAPIQuestionToQuestion(apiQuestion: APIQuestion): Question {
  return {
    id: apiQuestion.id,
    text: apiQuestion.name,
    type: mapQuestionType(apiQuestion.type),
    options: apiQuestion.questionOptions,
  }
}

function mapQuestionType(apiType: string): Question["type"] {
  switch (apiType.toUpperCase()) {
    case "TEXT":
      return "TEXT"
    case "RADIO":
      return "RADIO"
    case "SELECT":
      return "SELECT"
    case "CHECKBOX":
      return "CHECKBOX"
    case "FILE":
      return "FILE"
    case "CALENDAR":
      return "CALENDAR"
    default:
      throw new Error(`Unknown question type: ${apiType}`)
  }
}

// カスタムフック: ロジックを集約
const useSurveyLogic = (surveyId: string): SurveyContextType => {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const { data: userData = null, isLoading: isLoadingUser } = useSwrData<User>(
    process.env.NEXT_PUBLIC_API_URL + `/api/user/users/${userId}`,
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [isQuestionAnswered, setIsQuestionAnswered] = React.useState<boolean[]>([])
  const { data: apiResponse = null, isLoading: isLoadingApiResponse } = useSwrData<APIResponse>(
    `/api/user/surveys/${surveyId}/questionGroups`,
  )
  const [headerColor, setHeaderColor] = useState("from-blue-500 to-purple-500")

  const questions: Question[] = React.useMemo(() => {
    if (!apiResponse) return []
    return apiResponse.questionGroupQuestions.map(({ question }) => convertAPIQuestionToQuestion(question))
  }, [apiResponse])

  // 動的にZodスキーマを生成
  const schema = z.object(
    questions.reduce(
      (acc, question) => {
        switch (question.type) {
          case "TEXT":
            acc[question.id] = z.string().min(1, { message: "この項目は必須です" })
            break
          case "RADIO":
          case "SELECT":
            acc[question.id] = z.string().min(1, { message: "選択してください" })
            break
          case "CHECKBOX":
            acc[question.id] = z.array(z.string()).min(1, { message: "少なくとも1つ選択してください" })
            break
          case "FILE":
            acc[question.id] = z.instanceof(FileList).refine((val) => val.length > 0, {
              message: "ファイルをアップロードしてください",
            })
            break
          case "CALENDAR":
            acc[question.id] = z.string().min(1, { message: "日付を選択してください" })
            break
        }
        return acc
      },
      {} as Record<string, any>,
    ),
  )

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name && type !== "blur") {
        const index = questions.findIndex((q) => q.id === name)
        if (index !== -1) {
          setIsQuestionAnswered((prev) => {
            const newState = [...prev]
            newState[index] = !!value[name]
            return newState
          })
          form.trigger(name)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, questions])

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    isQuestionAnswered,
    setIsQuestionAnswered,
    form,
    questions,
    isLoadingApiResponse,
    surveyData: apiResponse,
    userData,
    isLoadingUser,
    surveyId,
    headerColor,
    setHeaderColor,
  }
}

// Contextの作成
const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

// Contextから値を取得するカスタムフック
export const useSurvey = (): SurveyContextType => {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error("useSurvey must be used within a SurveyProvider")
  }
  return context
}

// Providerコンポーネント：ロジックはuseSurveyLogicで取得し、Contextに流す
export const SurveyProvider: React.FC<{ children: React.ReactNode; questionGroupId: string }> = ({
  children,
  questionGroupId,
}) => {
  const value = useSurveyLogic(questionGroupId)

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
}

