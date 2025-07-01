"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import QuestionCard from "./question-card"
import { useSurvey } from "@/contexts/survey-context"
import type { Question } from "@/contexts/survey-context"

interface CheckboxQuestionProps {
  question: Question
  number: number
}

export default function CheckboxQuestion({ question, number }: CheckboxQuestionProps) {
  const { state, setAnswer } = useSurvey()
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])

  useEffect(() => {
    const existingAnswer = state.answers[question.id]
    if (existingAnswer && Array.isArray(existingAnswer.value)) {
      setSelectedValues(existingAnswer.value)

      // optionIdも復元
      if (existingAnswer.optionId && Array.isArray(existingAnswer.optionId)) {
        setSelectedOptionIds(existingAnswer.optionId)
      }
    }
  }, [question.id, state.answers])

  // handleCheckboxChange関数を修正して、typeフィールドを追加します
  const handleCheckboxChange = (optionValue: string, optionId: string) => {
    let newSelectedValues: string[]
    let newSelectedOptionIds: string[]

    if (selectedValues.includes(optionValue)) {
      // 選択解除
      newSelectedValues = selectedValues.filter((value) => value !== optionValue)
      newSelectedOptionIds = selectedOptionIds.filter((id) => id !== optionId)
    } else {
      // 選択追加
      newSelectedValues = [...selectedValues, optionValue]
      newSelectedOptionIds = [...selectedOptionIds, optionId]
    }

    setSelectedValues(newSelectedValues)
    setSelectedOptionIds(newSelectedOptionIds)

    setAnswer({
      questionId: question.id,
      type: "CHECKBOX",
      value: newSelectedValues,
      optionId: newSelectedOptionIds,
    })
  }

  return (
    <QuestionCard title={question.name} description={question.description} number={number}>
      <div className="grid grid-cols-2 gap-2">
        {question.questionOptions.map((option) => {
          const isSelected = selectedValues.includes(option.value)
          return (
            <motion.div
              key={option.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCheckboxChange(option.value, option.id)}
              className={`
                flex items-center p-2 rounded-md cursor-pointer transition-all
                ${
                  isSelected
                    ? "bg-gray-50 border border-gray-900 text-gray-900"
                    : "border border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                }
              `}
            >
              <div
                className={`
                  w-4 h-4 rounded flex items-center justify-center mr-2 transition-all
                  ${isSelected ? "bg-gray-900" : "border-2 border-gray-400"}
                `}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-700">{option.name}</span>
            </motion.div>
          )
        })}
      </div>
    </QuestionCard>
  )
}

