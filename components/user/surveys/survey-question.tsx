"use client"

import TextQuestion from "@/components/user/surveys/text-question"
import CheckboxQuestion from "@/components/user/surveys/checkbox-question"
import FileQuestion from "@/components/user/surveys/file-question"
import SelectQuestion from "@/components/user/surveys/select-question"
import RadioQuestion from "@/components/user/surveys/radio-question"
import type { Question } from "@/contexts/survey-context"

interface SurveyQuestionProps {
  question: Question
  number: number
}

export default function SurveyQuestion({ question, number }: SurveyQuestionProps) {
  switch (question.type) {
    case "TEXT":
      return <TextQuestion question={question} number={number} />
    case "CHECKBOX":
      return <CheckboxQuestion question={question} number={number} />
    case "FILE":
      return <FileQuestion question={question} number={number} />
    case "SELECT":
      return <SelectQuestion question={question} number={number} />
    case "RADIO":
      return <RadioQuestion question={question} number={number} />
    default:
      return <div>未対応の質問タイプです: {question.type}</div>
  }
}

