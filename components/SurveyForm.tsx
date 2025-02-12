"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  TextQuestion,
  RadioQuestion,
  SelectQuestion,
  CheckboxQuestion,
  FileQuestion,
  CalendarQuestion,
} from "./QuestionComponents"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import cn from "classnames"
import { useSurvey } from "@/contexts/SurveyContext"
import axios from "axios"
const questionComponents = {
  TEXT: TextQuestion,
  RADIO: RadioQuestion,
  SELECT: SelectQuestion,
  CHECKBOX: CheckboxQuestion,
  FILE: FileQuestion,
  CALENDAR: CalendarQuestion,
}

export function SurveyForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    isQuestionAnswered,
    form,
    questions,
    isLoadingApiResponse,
    surveyData,
  } = useSurvey()

  const onSubmit = async (data: any) => {
    try {
      console.log("Original data", data)

      // FormDataオブジェクトを作成
      const formData = new FormData()

      // QuestionGroupIdを取得
      const questionGroupId = surveyData?.id
      if (!questionGroupId) {
        throw new Error("QuestionGroupId is missing")
      }

      // QuestionGroup オブジェクトを作成
      const questionGroup = {
        id: questionGroupId,
        questions: Object.entries(data).map(([questionId, answer]) => ({
          id: questionId,
          answer: Array.isArray(answer) ? answer : [answer],
        })),
      }

      console.log("Formatted questionGroup", questionGroup)

      // FormDataにQuestionGroupオブジェクトを追加
      formData.append("questionGroup", JSON.stringify(questionGroup))

      // ファイルの処理
      Object.entries(data).forEach(([questionId, value]) => {
        if (value instanceof FileList) {
          Array.from(value).forEach((file, index) => {
            formData.append(`files.${questionId}`, file)
          })
        }
      })

      // axiosでFormDataを送信
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/user/responses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("response", response)
      setLoading(true)

      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "送信完了",
        description: "回答ありがとうございました。",
      })
    } catch (error) {
      console.error("Failed to submit survey:", error)
      toast({
        title: "エラー",
        description: "回答の送信に失敗しました。後でもう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const QuestionComponent = questionComponents[currentQuestion.type as keyof typeof questionComponents]

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1 && isQuestionAnswered[currentQuestionIndex]) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1

  if (isLoadingApiResponse) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto question-container">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-400 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold">サーベイ回答フォーム</CardTitle>
        <CardDescription className="text-indigo-100">以下の質問にお答えください。</CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          {questions.map((q, index) => (
            <Button
              key={q.id}
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn(
                "text-xs",
                currentQuestionIndex === index ? "bg-indigo-100 text-indigo-800" : "",
                isQuestionAnswered[index] ? "text-indigo-600" : "text-gray-500",
              )}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-6 question-container">
        <form className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="question-container">
                <CardHeader className="p-4">
                  <CardTitle className="question-title text-sm">{`Q${currentQuestionIndex + 1}. ${currentQuestion.text}`}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <QuestionComponent
                    question={currentQuestion.text}
                    id={currentQuestion.id}
                    options={currentQuestion.options}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between items-center mt-4">
            <Button
              type="button"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              前の質問
            </Button>
            {isLastQuestion ? (
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()} //手動送信しないとバグる
                disabled={loading || !form.formState.isValid}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  "回答を送信"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goToNextQuestion}
                disabled={!isQuestionAnswered[currentQuestionIndex]}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                次の質問
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

