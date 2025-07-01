"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import QuestionCard from "./question-card"
import { useSurvey } from "@/contexts/survey-context"
import type { Question } from "@/contexts/survey-context"

interface RadioQuestionProps {
  question: Question
  number: number
}

export default function RadioQuestion({ question, number }: RadioQuestionProps) {
  const { state, setAnswer } = useSurvey()
  const [value, setValue] = useState("")
  const [optionId, setOptionId] = useState("")

  useEffect(() => {
    const existingAnswer = state.answers[question.id]
    if (existingAnswer) {
      setValue(existingAnswer.value as string)
      if (existingAnswer.optionId) {
        setOptionId(existingAnswer.optionId as string)
      }
    }
  }, [question.id, state.answers])

  const handleChange = (newValue: string, newOptionId: string) => {
    setValue(newValue)
    setOptionId(newOptionId)

    setAnswer({
      questionId: question.id,
      type: "RADIO",
      value: newValue,
      optionId: newOptionId,
    })
  }

  return (
    <QuestionCard title={question.name} description={question.description} number={number}>
      {/* モバイルでは縦並び、タブレット以上では横並び */}
      <div className="flex flex-col md:flex-row md:flex-wrap md:justify-between w-full space-y-2 md:space-y-0 md:gap-2">
        {question.questionOptions.map((option) => {
          const isSelected = value === option.value
          return (
            <motion.div
              key={option.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChange(option.value, option.id)}
              className={`
                flex items-center p-3 rounded-md cursor-pointer transition-all
                md:flex-1 md:min-w-0 md:justify-center md:flex-col md:py-4
                ${
                  isSelected
                    ? "bg-gray-50 border-2 border-gray-900"
                    : "border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                }
              `}
            >
              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center mr-3 md:mr-0 md:mb-2 transition-all
                  ${isSelected ? "border-[5px] border-gray-900" : "border-2 border-gray-400"}
                `}
              />
              <span className="text-sm text-gray-700 md:text-center">{option.name}</span>
            </motion.div>
          )
        })}
      </div>
    </QuestionCard>
  )
}
