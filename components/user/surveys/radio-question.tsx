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
      <div className="grid grid-cols-2 gap-2">
        {question.questionOptions.map((option) => {
          const isSelected = value === option.value
          return (
            <motion.div
              key={option.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChange(option.value, option.id)}
              className={`
                flex items-center p-2 rounded-md cursor-pointer transition-all
                ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 text-blue-300"
                    : "border border-[#3b3d42] hover:border-blue-700 hover:bg-blue-900/20"
                }
              `}
            >
              <div
                className={`
                  w-4 h-4 rounded-full flex items-center justify-center mr-2 transition-all
                  ${isSelected ? "border-[5px] border-blue-500" : "border-2 border-gray-500"}
                `}
              />
              <span className="text-sm text-gray-200">{option.name}</span>
            </motion.div>
          )
        })}
      </div>
    </QuestionCard>
  )
}

