import type React from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface QuestionOption {
  id: string
  name: string
  value: string
}

interface Question {
  id: string
  name: string
  description: string | null
  type: string
  questionOptions?: QuestionOption[]
}

interface QuestionPreviewProps {
  question: Question
}

const questionTypeLabels: Record<string, string> = {
  TEXT: "テキスト",
  RADIO: "ラジオボタン",
  CHECKBOX: "チェックボックス",
  SELECT: "セレクトボックス",
  FILE: "ファイル",
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({ question }) => {
  const renderQuestionContent = () => {
    switch (question.type) {
      case "RADIO":
        return (
          <RadioGroup className="space-y-2">
            {question.questionOptions?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} disabled />
                <Label htmlFor={option.id}>{option.name}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "CHECKBOX":
        return (
          <div className="space-y-2">
            {question.questionOptions?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox id={option.id} disabled />
                <Label htmlFor={option.id}>{option.name}</Label>
              </div>
            ))}
          </div>
        )
      case "SELECT":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {question.questionOptions?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "TEXT":
        return <Input placeholder="テキストを入力" disabled />
      case "FILE":
        return <Input type="file" disabled />
      default:
        return <p>未対応の質問タイプです</p>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{question.name}</h3>
          {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
        </div>
        <Badge variant="secondary">{questionTypeLabels[question.type] || question.type}</Badge>
      </div>
      <div className="mt-2">{renderQuestionContent()}</div>
    </div>
  )
}

