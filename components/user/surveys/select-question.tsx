"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QuestionCard from "./question-card"
import { useSurvey } from "@/contexts/survey-context"
import type { Question } from "@/contexts/survey-context"

interface SelectQuestionProps {
  question: Question
  number: number
}

export default function SelectQuestion({ question, number }: SelectQuestionProps) {
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

  const handleChange = (newValue: string) => {
    setValue(newValue)

    // 選択された値に対応するオプションIDを見つける
    const selectedOption = question.questionOptions.find((option) => option.value === newValue)
    if (selectedOption) {
      setOptionId(selectedOption.id)

      setAnswer({
        questionId: question.id,
        type: "SELECT",
        value: newValue,
        optionId: selectedOption.id,
      })
    }
  }

  return (
    <QuestionCard title={question.name} description={question.description} number={number}>
      <div className="relative">
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger
            id={question.id}
            className="w-full p-2 text-left bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
          >
            <SelectValue placeholder="選択してください" />
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
            {question.questionOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.value}
                className="p-2 cursor-pointer text-gray-900 hover:bg-gray-50 transition-colors data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900"
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </QuestionCard>
  )
}

