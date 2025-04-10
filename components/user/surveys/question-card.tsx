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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#2f3136] rounded-lg border border-[#3b3d42] overflow-hidden hover:shadow-md transition-all"
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium mr-3 shadow-sm">
          {number}
        </div>
        <div className="flex-grow">
          <h3 className="text-base font-medium text-gray-100 mb-1">{title}</h3>
          {description && <p className="text-sm text-gray-400 mb-3">{description}</p>}
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

