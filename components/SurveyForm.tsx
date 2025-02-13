"use client"

import { useState, useMemo } from "react"
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

const COLOR_MAP: { [key: string]: { bg: string; text: string } } = {
  "from-blue-500": { bg: "bg-blue-500 hover:bg-blue-600", text: "text-blue-600" },
  "from-green-500": { bg: "bg-green-500 hover:bg-green-600", text: "text-green-600" },
  "from-red-500": { bg: "bg-red-500 hover:bg-red-600", text: "text-red-600" },
  "from-yellow-500": { bg: "bg-yellow-500 hover:bg-yellow-600", text: "text-yellow-600" },
  "from-indigo-500": { bg: "bg-indigo-500 hover:bg-indigo-600", text: "text-indigo-600" },
  "from-gray-800": { bg: "bg-gray-800 hover:bg-gray-900", text: "text-gray-800" },
}

const getButtonColor = (headerColor: string) => {
  const [color] = headerColor.split(" ")
  return COLOR_MAP[color] || { bg: "bg-blue-500 hover:bg-blue-600", text: "text-blue-600" }
}

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
    surveyId,
    headerColor,
  } = useSurvey()

  const buttonColor = useMemo(() => getButtonColor(headerColor), [headerColor])

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData()
      formData.append("surveyId", surveyId)

      const questionGroupId = surveyData?.id
      if (!questionGroupId) {
        throw new Error("QuestionGroupId is missing")
      }

      const questionGroup = {
        id: questionGroupId,
        questions: Object.entries(data).map(([questionId, answer]) => ({
          id: questionId,
          answer: Array.isArray(answer) ? answer : [answer],
        })),
      }
      formData.append("questionGroup", JSON.stringify(questionGroup))

      Object.entries(data).forEach(([questionId, value]) => {
        if (value instanceof FileList) {
          Array.from(value).forEach((file) => {
            formData.append(`files.${questionId}`, file)
          })
        }
      })

      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/user/responses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

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
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className={`space-y-2 bg-gradient-to-r ${headerColor} text-white rounded-t-lg p-6`}>
        <CardTitle className="text-2xl font-bold">サーベイ回答フォーム</CardTitle>
        <CardDescription className="text-lg text-blue-100">以下の質問にお答えください。</CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          {questions.map((q, index) => (
            <Button
              key={q.id}
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn(
                "text-xs font-medium",
                currentQuestionIndex === index ? `bg-white ${buttonColor.text}` : `${buttonColor.bg} text-white`,
                isQuestionAnswered[index] && "ring-2 ring-white",
              )}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{`Q${currentQuestionIndex + 1}. ${currentQuestion.text}`}</h3>
                  <QuestionComponent
                    question={currentQuestion.text}
                    id={currentQuestion.id}
                    options={currentQuestion.options}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between items-center mt-6">
            <Button
              type="button"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className={cn(buttonColor.bg, "text-white")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              前の質問
            </Button>
            {isLastQuestion ? (
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={loading || !form.formState.isValid}
                className={cn(buttonColor.bg, "text-white")}
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
                className={cn(buttonColor.bg, "text-white")}
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

