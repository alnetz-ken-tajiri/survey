"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface QuestionCardProps {
  children: ReactNode
  title: string
  description?: string
  number: number
}

export default function QuestionCard({ children, title, description, number }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 text-white font-medium mr-3 shadow-sm text-sm">
          {number}
        </div>
        <div className="flex-grow">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
          {description && <p className="text-xs text-gray-600 mb-3">{description}</p>}
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

