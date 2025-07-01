"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import QuestionCard from "./question-card"
import { useSurvey } from "@/contexts/survey-context"
import type { Question } from "@/contexts/survey-context"

interface TextQuestionProps {
  question: Question
  number: number
}

export default function TextQuestion({ question, number }: TextQuestionProps) {
  const { state, setAnswer } = useSurvey()
  const [value, setValue] = useState("")

  useEffect(() => {
    const existingAnswer = state.answers[question.id]
    if (existingAnswer) {
      setValue(existingAnswer.value as string)
    }
  }, [question.id, state.answers])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    setAnswer({
      questionId: question.id,
      type: "TEXT",
      value: newValue,
    })
  }

  return (
    <QuestionCard title={question.name} description={question.description} number={number}>
      <Textarea
        id={question.id}
        value={value}
        onChange={handleChange}
        placeholder="回答を入力してください"
        className="min-h-24 w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
      />
    </QuestionCard>
  )
}

