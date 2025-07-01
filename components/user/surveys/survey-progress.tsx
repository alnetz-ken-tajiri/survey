"use client"

import { motion } from "framer-motion"

interface SurveyProgressProps {
  totalQuestions: number
  answeredQuestions: number
  currentPage: number
  totalPages: number
}

export default function SurveyProgress({
  totalQuestions,
  answeredQuestions,
  currentPage,
  totalPages,
}: SurveyProgressProps) {
  const progressPercentage = (answeredQuestions / totalQuestions) * 100

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4 pt-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700 font-medium">
            {answeredQuestions} / {totalQuestions} 問回答済み
          </span>
          <span className="text-gray-700 font-medium">
            ページ {currentPage + 1} / {totalPages}
          </span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gray-900 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  )
}

