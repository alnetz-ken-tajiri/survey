"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { getQuestionTypeColor, getQuestionTypeIcon } from "@/utils/question-utils"
import { Folder } from "lucide-react"
import type { Question } from "@/contexts/question-group-context"

interface QuestionCardProps {
  question: Question
  isSelected: boolean
  showDescription: boolean
  showOptions: boolean
  showTags: boolean
  showCategory: boolean
  toggleSelect: (id: string) => void
  addQuestion: (question: Question) => void
  isAlreadyAdded: boolean
}

export function QuestionCard({
  question,
  isSelected,
  showDescription,
  showOptions,
  showTags,
  showCategory,
  toggleSelect,
  addQuestion,
  isAlreadyAdded,
}: QuestionCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card
        className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${
          isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : ""
        }`}
        onClick={() => toggleSelect(question.id)}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start">
            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(question.id)} className="mt-1 mr-3" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {question.name}
                  {question.role === "CATEGORY" && (
                    <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                      カテゴリー
                    </Badge>
                  )}
                </CardTitle>
                <Badge variant="outline" className={`${getQuestionTypeColor(question.type)} flex items-center gap-1`}>
                  {getQuestionTypeIcon(question.type)}
                  {question.type}
                </Badge>
              </div>
              {showDescription && question.description && (
                <CardDescription className="mt-1 line-clamp-2">{question.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {showCategory && question.category && (
          <CardContent className="p-4 pt-0">
            <div className="text-xs font-medium text-muted-foreground mb-1">カテゴリー:</div>
            <div className="flex items-center">
              <Folder className="h-3.5 w-3.5 mr-1.5 text-yellow-600" />
              <span className="text-sm">{question.category.name}</span>
            </div>
          </CardContent>
        )}

        {showOptions && question.questionOptions && question.questionOptions.length > 0 && (
          <CardContent className="p-4 pt-0">
            <div className="text-xs font-medium text-muted-foreground mb-1">選択肢:</div>
            <div className="flex flex-wrap gap-1">
              {question.questionOptions.map((option) => (
                <Badge key={option.id} variant="secondary" className="text-xs">
                  {option.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}

        {showTags && question.tags && question.tags.length > 0 && (
          <CardContent className="p-4 pt-0">
            <div className="text-xs font-medium text-muted-foreground mb-1">タグ:</div>
            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}

        <CardFooter className="p-4 pt-0 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (!isAlreadyAdded) {
                addQuestion(question)
              } else {
                toast({
                  title: "既に追加済みです",
                  description: "この質問は既に質問グループに追加されています。",
                  variant: "default",
                })
              }
            }}
          >
            {isAlreadyAdded ? "追加済み" : "追加"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
