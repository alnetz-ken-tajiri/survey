import { FileText, CheckSquare, Radio, ListFilter, FileUp, Info } from "lucide-react"

// 質問タイプに対応するアイコンを取得する関数
export const getQuestionTypeIcon = (type: string) => {
  switch (type) {
    case "TEXT":
      return <FileText className="h-4 w-4" />
    case "CHECKBOX":
      return <CheckSquare className="h-4 w-4" />
    case "RADIO":
      return <Radio className="h-4 w-4" />
    case "SELECT":
      return <ListFilter className="h-4 w-4" />
    case "FILE":
      return <FileUp className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

// 質問タイプに対応する色を取得する関数
export const getQuestionTypeColor = (type: string) => {
  switch (type) {
    case "TEXT":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
    case "CHECKBOX":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
    case "RADIO":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
    case "SELECT":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800"
    case "FILE":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700"
  }
}

// CSVパース関数
export const parseCSV = (content: string) => {
  const lines = content.split("\n")
  const headers = lines[0].split(",")

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = line.split(",")
      const question = {
        name: values[0],
        description: values[1] || "",
        type: values[2],
        options: values[3] || "",
      }

      return question
    })
}

