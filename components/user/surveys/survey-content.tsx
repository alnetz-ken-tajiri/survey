"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronLeft, ChevronRight, Send } from "lucide-react"
import SurveyQuestion from "./survey-question"
import { useSurvey } from "@/contexts/survey-context"

interface SurveyContentProps {
  surveyId: string
}

export default function SurveyContent({ surveyId }: SurveyContentProps) {
  const { state, setSurvey, submitSurvey, changePage, getPageQuestions, getTotalPages } = useSurvey()
  const [isLoading, setIsLoading] = useState(true)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setIsLoading(true)

        // APIからサーベイデータを取得
        const response = await fetch(`/api/user/surveys/${surveyId}`)

        if (!response.ok) {
          throw new Error("サーベイデータの取得に失敗しました")
        }

        const surveyData = await response.json()
        setSurvey(surveyData)
      } catch (error) {
        console.error("Error fetching survey:", error)
        // エラー状態を設定する場合はここで
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurvey()
  }, [setSurvey, surveyId])

  if (isLoading || !state.survey) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px] space-y-4">
        <div className="w-8 h-8 rounded-full border-3 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-gray-300">読み込み中...</p>
      </div>
    )
  }

  if (state.isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center space-y-6 py-8"
      >
        <div className="rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-4 shadow-lg">
          <CheckCircle className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-100">回答を送信しました</h2>
        <p className="text-gray-400">ご協力ありがとうございました</p>
      </motion.div>
    )
  }

  const currentPageQuestions = getPageQuestions()
  const totalPages = getTotalPages()
  const isLastPage = state.currentPage === totalPages - 1

  const handleNextPage = () => {
    setDirection(1)
    changePage(state.currentPage + 1)
  }

  const handlePrevPage = () => {
    setDirection(-1)
    changePage(state.currentPage - 1)
  }

  return (
    <div className="space-y-4 pt-12">
      {state.survey.image && (
        <div className="relative w-full aspect-[21/5] rounded-lg overflow-hidden shadow-md">
          <Image
            src={state.survey.image || "/placeholder.svg"}
            alt={state.survey.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-md">{state.survey.name}</h1>
            <p className="text-sm text-white/90">回答期限: {new Date(state.survey.deadline).toLocaleDateString()}</p>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={state.currentPage}
          custom={direction}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {currentPageQuestions.map((question, index) => (
            <SurveyQuestion
              key={question.id}
              question={question}
              number={state.currentPage * state.questionsPerPage + index + 1}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="sticky bottom-0 left-0 right-0 bg-[#25262b]/90 backdrop-blur-sm border-t border-[#2f3136] p-4 mt-8 shadow-md">
        <div className="container max-w-3xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={state.currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 border-[#3b3d42] bg-[#2f3136] text-gray-200 hover:bg-[#3b3d42] transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>

          {isLastPage ? (
            <Button
              onClick={submitSurvey}
              disabled={state.isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-70 shadow-sm"
            >
              {state.isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  送信する
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextPage}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors shadow-sm"
            >
              次へ
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm mt-4"
        >
          {state.error}
        </motion.div>
      )}
    </div>
  )
}

