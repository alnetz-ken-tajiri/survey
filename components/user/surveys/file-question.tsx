"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, FileIcon, X } from "lucide-react"
import QuestionCard from "./question-card"
import { useSurvey } from "@/contexts/survey-context"
import type { Question } from "@/contexts/survey-context"

interface FileQuestionProps {
  question: Question
  number: number
}

export default function FileQuestion({ question, number }: FileQuestionProps) {
  const { state, setAnswer } = useSurvey()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const existingAnswer = state.answers[question.id]
    if (
      existingAnswer &&
      existingAnswer.value &&
      typeof existingAnswer.value === "object" &&
      "name" in existingAnswer.value
    ) {
      setFile(existingAnswer.value as File)
    }
  }, [question.id, state.answers])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setAnswer({
      questionId: question.id,
      type: "FILE",
      value: selectedFile,
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setAnswer({
        questionId: question.id,
        type: "FILE",
        value: droppedFile,
      })
    }
  }

  const removeFile = () => {
    setFile(null)
    setAnswer({
      questionId: question.id,
      type: "FILE",
      value: null,
    })
  }

  return (
    <QuestionCard title={question.name} description={question.description} number={number}>
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center transition-all
            ${
              isDragging
                ? "border-gray-900 bg-gray-50"
                : "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
            }
          `}
        >
          <input
            id={question.id}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <Upload className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-1 text-sm font-medium text-gray-700">ファイルをドラッグ＆ドロップ</p>
          <p className="text-xs text-gray-500">または</p>
          <label
            htmlFor={question.id}
            className="mt-2 inline-flex items-center px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 cursor-pointer transition-colors"
          >
            ファイルを選択
          </label>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-center">
            <FileIcon className="h-6 w-6 text-gray-600 mr-2" />
            <div>
              <p className="font-medium text-gray-900 truncate max-w-xs text-sm">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </motion.div>
      )}
    </QuestionCard>
  )
}

