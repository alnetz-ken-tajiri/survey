import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Type, Radio, List, CheckSquare, FileText } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useSurvey } from "@/contexts/SurveyContext"
import type { QuestionOption } from "@/lib/api"
import type React from "react"
import { useEffect } from "react"
interface QuestionProps {
  question: string
  id: string
  options?: QuestionOption[]
}

const QuestionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "TEXT":
      return <Type className="h-4 w-4 text-indigo-600" />
    case "RADIO":
      return <Radio className="h-4 w-4 text-indigo-600" />
    case "SELECT":
      return <List className="h-4 w-4 text-indigo-600" />
    case "CHECKBOX":
      return <CheckSquare className="h-4 w-4 text-indigo-600" />
    case "FILE":
      return <FileText className="h-4 w-4 text-indigo-600" />
    case "CALENDAR":
      return <CalendarIcon className="h-4 w-4 text-indigo-600" />
    default:
      return null
  }
}

export const TextQuestion: React.FC<QuestionProps> = ({ question, id }) => {
  const { form } = useSurvey()
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <QuestionIcon type="text" />
        <Label htmlFor={id} className="text-xs font-medium text-indigo-800">
          {question}
        </Label>
      </div>
      <Input
        id={id}
        {...form.register(id)}
        className="w-full border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
      />
      {form.formState.errors[id] && (
        <p className="text-xs text-red-500">{form.formState.errors[id]?.message as string}</p>
      )}
    </div>
  )
}

export const RadioQuestion: React.FC<QuestionProps> = ({ question, id, options = [] }) => {
  const { form } = useSurvey()
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <QuestionIcon type="radio" />
        <Label className="text-xs font-medium text-indigo-800">{question}</Label>
      </div>
      <RadioGroup
        onValueChange={(value) => form.setValue(id, value, { shouldValidate: true })}
        value={form.watch(id)}
        className="flex flex-col space-y-1"
      >
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2 option-container">
            <RadioGroupItem
              value={option.value}
              id={`${id}-${option.id}`}
              className="text-indigo-600 border-indigo-400"
            />
            <Label htmlFor={`${id}-${option.id}`} className="text-xs text-indigo-700">
              {option.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {form.formState.errors[id] && (
        <p className="text-xs text-red-500">{form.formState.errors[id]?.message as string}</p>
      )}
    </div>
  )
}

export const SelectQuestion: React.FC<QuestionProps> = ({ question, id, options = [] }) => {
  const { form } = useSurvey()
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <QuestionIcon type="select" />
        <Label htmlFor={id} className="text-xs font-medium text-indigo-800">
          {question}
        </Label>
      </div>
      <Select onValueChange={(value) => form.setValue(id, value, { shouldValidate: true })} value={form.watch(id)}>
        <SelectTrigger
          id={id}
          className="w-full border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
        >
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.value}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {form.formState.errors[id] && (
        <p className="text-xs text-red-500">{form.formState.errors[id]?.message as string}</p>
      )}
    </div>
  )
}

export const CheckboxQuestion: React.FC<QuestionProps> = ({ question, id, options = [] }) => {
  const { form } = useSurvey()
  const watchedValue: string[] = form.watch(id) || []

  const handleChange = (optionId: string, checked: boolean) => {
    const newValue = checked ? [...watchedValue, optionId] : watchedValue.filter((item: string) => item !== optionId)

    console.log("newValue", newValue)
    console.log("id", id)
    console.log("optionId", optionId)

    form.setValue(id, newValue, { shouldValidate: true })
  }

  useEffect(() => {
    console.log("watchedValue", watchedValue)
  }, [watchedValue])

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <QuestionIcon type="checkbox" />
        <Label className="text-xs font-medium text-indigo-800">{question}</Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2 option-container">
            <Checkbox
              id={`${id}-${option.id}`}
              checked={watchedValue.includes(option.id)}
              onCheckedChange={(checked) => handleChange(option.id, checked as boolean)}
              className="text-indigo-600 border-indigo-400 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
            />
            <Label htmlFor={`${id}-${option.id}`} className="text-xs text-indigo-700">
              {option.name}
            </Label>
          </div>
        ))}
      </div>
      {form.formState.errors[id] && (
        <p className="text-xs text-red-500">{form.formState.errors[id]?.message as string}</p>
      )}
    </div>
  )
}

export const FileQuestion: React.FC<QuestionProps> = ({ question, id }) => {
  const { form } = useSurvey()

  const fileList = form.watch(id)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{question}</Label>
      <Input type="file" id={id} {...form.register(id)} />

      {fileList && fileList.length > 0 && (
        <p className="text-sm text-muted-foreground">選択されたファイル: {fileList[0].name}</p>
      )}
    </div>
  )
}

export const CalendarQuestion: React.FC<QuestionProps> = ({ question, id }) => {
  const { form } = useSurvey()
  const date = form.watch(id) ? new Date(form.watch(id)) : undefined

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <QuestionIcon type="calendar" />
        <Label htmlFor={id} className="text-xs font-medium text-indigo-800">
          {question}
        </Label>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal border-indigo-300 focus:ring-indigo-500 transition-all duration-300 ease-in-out",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>日付を選択</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => form.setValue(id, newDate?.toISOString(), { shouldValidate: true })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {form.formState.errors[id] && (
        <p className="text-xs text-red-500">{form.formState.errors[id]?.message as string}</p>
      )}
    </div>
  )
}

