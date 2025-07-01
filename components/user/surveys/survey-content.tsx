"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react"
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
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <p className="text-gray-600">読み込み中...</p>
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
        <div className="rounded-full bg-gray-900 p-4 shadow-lg">
          <CheckCircle className="h-16 w-16 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">回答を送信しました</h2>
        <p className="text-gray-600">ご協力ありがとうございました</p>
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
    <div className="space-y-6">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={state.currentPage}
          custom={direction}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
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
      
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePrevPage}
          disabled={state.currentPage === 0}
          className="h-12 px-6 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          前へ
        </Button>

        {isLastPage ? (
          <Button
            onClick={submitSurvey}
            disabled={state.isSubmitting}
            className="h-12 px-8 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
          >
            {state.isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                送信中...
              </div>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                送信する
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNextPage}
            className="h-12 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200"
          >
            次へ
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"
        >
          {state.error}
        </motion.div>
      )}
    </div>
  )
}

