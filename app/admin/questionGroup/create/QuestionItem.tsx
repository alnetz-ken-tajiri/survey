import type React from "react"
import { type UseFormReturn, useFieldArray } from "react-hook-form"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Trash2, Plus } from "lucide-react"

interface QuestionItemProps {
  questionIndex: number
  form: UseFormReturn<any>
  removeQuestion: () => void
  expandedQuestions: string[]
  setExpandedQuestions: React.Dispatch<React.SetStateAction<string[]>>
  question: {
    type: "RADIO" | "CHECKBOX" | "SELECT" | "TEXT" | "FILE"
    name: string
    id?: string
    questionOptions?: { name: string; value: string }[]
    description?: string
  }
}

export default function QuestionItem({
  questionIndex,
  form,
  removeQuestion,
  expandedQuestions,
  setExpandedQuestions,
  question,
}: QuestionItemProps) {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: `questionGroupQuestions.${questionIndex}.question.questionOptions`,
  })

  const questionType = form.watch(`questionGroupQuestions.${questionIndex}.question.type`)

  return (
    <AccordionItem value={`question-${questionIndex}`}>
      <AccordionTrigger>
        質問 {questionIndex + 1}: {form.watch(`questionGroupQuestions.${questionIndex}.question.name`) || "(無題)"}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`questionGroupQuestions.${questionIndex}.question.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問</FormLabel>
                <FormControl>
                  <Input placeholder="質問を入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`questionGroupQuestions.${questionIndex}.question.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問タイプ</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="質問タイプを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TEXT">テキスト</SelectItem>
                    <SelectItem value="RADIO">ラジオボタン</SelectItem>
                    <SelectItem value="CHECKBOX">チェックボックス</SelectItem>
                    <SelectItem value="SELECT">セレクトボックス</SelectItem>
                    <SelectItem value="FILE">ファイル</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {["RADIO", "CHECKBOX", "SELECT"].includes(questionType) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">選択肢</h3>
              {optionFields.map((optionField, optionIndex) => (
                <div key={optionField.id} className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name={`questionGroupQuestions.${questionIndex}.question.questionOptions.${optionIndex}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="選択肢名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`questionGroupQuestions.${questionIndex}.question.questionOptions.${optionIndex}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="値" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optionIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ name: "", value: "" })}>
                <Plus className="mr-2 h-4 w-4" /> 選択肢を追加
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              removeQuestion()
              setExpandedQuestions(expandedQuestions.filter((id) => id !== `question-${questionIndex}`))
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> 質問を削除
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

