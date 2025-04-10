"use client"

import { createContext, useReducer, useCallback, useContext, type ReactNode } from "react"

// 質問タイプの定義
export type QuestionType = "TEXT" | "CHECKBOX" | "FILE" | "SELECT" | "RADIO"

// 質問オプションの型定義
export interface QuestionOption {
  id: string
  questionId: string
  name: string
  value: string
}

// 質問の型定義
export interface Question {
  id: string
  name: string
  description: string
  companyId: string
  public: boolean
  order: number
  type: QuestionType
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  questionOptions: QuestionOption[]
}

// 質問グループと質問の関連付け
export interface QuestionGroupQuestion {
  questionGroupId: string
  questionId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  question: Question
}

// 質問グループの型定義
export interface QuestionGroup {
  id: string
  companyId: string
  name: string
  description: string
  fileUrl: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  questionGroupQuestions: QuestionGroupQuestion[]
}

// サーベイの型定義
export interface Survey {
  id: string
  companyId: string
  image: string
  name: string
  startDate: string
  deadline: string
  questionGroupId: string
  createdAt: string
  status: "ACTIVE" | "INACTIVE"
  updatedAt: string
  deletedAt: string | null
  surveyTargets: any[]
  questionGroup: QuestionGroup
}

// 回答の型定義
export type AnswerType = "TEXT" | "CHECKBOX" | "FILE" | "SELECT" | "RADIO"

export interface Answer {
  questionId: string
  type: AnswerType
  value: string | string[] | File | null
  // 選択式回答用のオプションID
  optionId?: string | string[] | null
}

// サーベイの状態
interface SurveyState {
  survey: Survey | null
  answers: Record<string, Answer>
  currentPage: number
  isSubmitting: boolean
  isCompleted: boolean
  error: string | null
  questionsPerPage: number
}

// サーベイのアクション
type SurveyAction =
  | { type: "SET_SURVEY"; payload: Survey }
  | { type: "SET_ANSWER"; payload: Answer }
  | { type: "CHANGE_PAGE"; payload: number }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "RESET" }

// 初期状態
const initialState: SurveyState = {
  survey: null,
  answers: {},
  currentPage: 0,
  isSubmitting: false,
  isCompleted: false,
  error: null,
  questionsPerPage: 5,
}

// リデューサー
function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case "SET_SURVEY":
      return { ...state, survey: action.payload }
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload },
      }
    case "CHANGE_PAGE":
      return { ...state, currentPage: action.payload }
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, error: null }
    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitting: false, isCompleted: true }
    case "SUBMIT_ERROR":
      return { ...state, isSubmitting: false, error: action.payload }
    case "RESET":
      return initialState
    default:
      return state
  }
}

// コンテキストの型定義
interface SurveyContextType {
  state: SurveyState
  setSurvey: (survey: Survey) => void
  setAnswer: (answer: Answer) => void
  changePage: (page: number) => void
  submitSurvey: () => Promise<void>
  resetSurvey: () => void
  getPageQuestions: () => Question[]
  getTotalPages: () => number
}

// コンテキストの作成
const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

// プロバイダーコンポーネント
export function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(surveyReducer, initialState)

  const setSurvey = useCallback((survey: Survey) => {
    dispatch({ type: "SET_SURVEY", payload: survey })
  }, [])

  const setAnswer = useCallback((answer: Answer) => {
    dispatch({ type: "SET_ANSWER", payload: answer })
  }, [])

  const changePage = useCallback((page: number) => {
    dispatch({ type: "CHANGE_PAGE", payload: page })
  }, [])

  // 回答が有効かチェックする関数
  const isAnswerValid = useCallback((answer: Answer | undefined): boolean => {
    if (!answer) return false

    // 値がnullの場合は無効
    if (answer.value === null) return false

    // 空文字列の場合は無効
    if (typeof answer.value === "string" && answer.value.trim() === "") return false

    // 空の配列の場合は無効
    if (Array.isArray(answer.value) && answer.value.length === 0) return false

    return true
  }, [])

  // submitSurvey関数を修正して、typeフィールドを活用します
  const submitSurvey = useCallback(async () => {
    if (!state.survey) return

    console.log("サーベイの送信開始...", state.answers)
    console.log("サーベイのID...", state.survey)
    dispatch({ type: "SUBMIT_START" })

    try {
      // 回答データを準備
      const formData = new FormData()
      // ファイル以外の回答をまとめるオブジェクトを用意
      const answersData: Record<
        string,
        { type: AnswerType; value: string | string[] | File | null; optionId?: string | string[] | null }
      > = {}

      Object.entries(state.answers).forEach(([questionId, answer]) => {
        if (answer.type === "FILE" && answer.value instanceof File) {
          // ファイルの場合は answersData には null をセットして、ファイル自体は別で添付
          answersData[questionId] = {
            type: answer.type,
            value: null,
            optionId: answer.optionId ?? null,
          }
          formData.append(`file.${questionId}`, answer.value)
        } else {
          // 非ファイルの場合はそのままセット
          answersData[questionId] = {
            type: answer.type,
            value: answer.value,
            optionId: answer.optionId ?? null,
          }
        }
      })

      // サーベイIDとまとめた回答を追加
      formData.append("surveyId", state.survey.id)
      formData.append("answers", JSON.stringify(answersData))

      // FormDataの内容をデバッグ用に表示
      const formDataDebug: Record<string, any> = {}
      formData.forEach((value, key) => {
        formDataDebug[key] = value instanceof File ? `File: ${value.name}` : value
      })
      console.log("FormDataの内容:", formDataDebug)

      // APIリクエスト
      const response = await fetch("/api/user/responses", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "サーベイの送信に失敗しました")
      }

      // 成功
      dispatch({ type: "SUBMIT_SUCCESS" })
    } catch (error) {
      console.error("Survey submission error:", error)
      dispatch({
        type: "SUBMIT_ERROR",
        payload: error instanceof Error ? error.message : "サーベイの送信に失敗しました。",
      })
    }
  }, [state.survey, state.answers])

  const resetSurvey = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const getPageQuestions = useCallback(() => {
    if (!state.survey) return []
    const startIndex = state.currentPage * state.questionsPerPage
    return state.survey.questionGroup.questionGroupQuestions
      .slice(startIndex, startIndex + state.questionsPerPage)
      .map((qqg) => qqg.question)
  }, [state.survey, state.currentPage, state.questionsPerPage])

  const getTotalPages = useCallback(() => {
    if (!state.survey) return 0
    return Math.ceil(state.survey.questionGroup.questionGroupQuestions.length / state.questionsPerPage)
  }, [state.survey, state.questionsPerPage])

  return (
    <SurveyContext.Provider
      value={{
        state,
        setSurvey,
        setAnswer,
        changePage,
        submitSurvey,
        resetSurvey,
        getPageQuestions,
        getTotalPages,
      }}
    >
      {children}
    </SurveyContext.Provider>
  )
}

// カスタムフック
export function useSurvey() {
  const context = useContext(SurveyContext)

  if (context === undefined) {
    throw new Error("useSurvey must be used within a SurveyProvider")
  }

  return context
}

