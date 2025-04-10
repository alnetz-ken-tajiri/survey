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
    <div className="fixed top-16 left-0 right-0 z-50 bg-[#25262b]/95 backdrop-blur-sm border-b border-[#2f3136] shadow-sm">
      <div className="container mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-blue-300 font-medium">
            {answeredQuestions} / {totalQuestions} 問回答済み
          </span>
          <span className="text-blue-300 font-medium">
            ページ {currentPage + 1} / {totalPages}
          </span>
        </div>
        <div className="relative h-1 bg-[#2f3136] rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  )
}

