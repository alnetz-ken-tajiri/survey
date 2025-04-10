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
            className="w-full p-2 text-left bg-[#1a1b1e] text-gray-200 border border-[#3b3d42] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <SelectValue placeholder="選択してください" />
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectTrigger>
          <SelectContent className="bg-[#2f3136] border border-[#3b3d42] shadow-lg rounded-lg overflow-hidden">
            {question.questionOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.value}
                className="p-2 cursor-pointer text-gray-200 hover:bg-blue-900/30 transition-colors data-[highlighted]:bg-blue-900/50 data-[highlighted]:text-blue-300"
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

