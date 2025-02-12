import axios from "axios"

export interface QuestionOption {
  id: string
  value: string
  name: string
}

export interface Question {
  id: string
  text: string
  type: "TEXT" | "SELECT" | "RADIO" | "CHECKBOX" | "FILE" | "CALENDAR"
  options?: QuestionOption[]
}

interface APIQuestion {
  id: string
  name: string
  type: string
  questionOptions: QuestionOption[]
}

interface APIResponse {
  id: string
  name: string
  description: string | null
  questionGroupQuestions: {
    question: APIQuestion
  }[]
}

export const fetchQuestionGroup = async (id: string): Promise<Question[]> => {
  try {
    const response = await axios.get<APIResponse>(`/api/user/questionGroups/${id}`)
    return convertAPIResponseToQuestions(response.data)
  } catch (error) {
    console.error("Failed to fetch question group:", error)
    throw error
  }
}

const convertAPIResponseToQuestions = (apiResponse: APIResponse): Question[] => {
  return apiResponse.questionGroupQuestions.map(({ question }) => ({
    id: question.id,
    type: mapQuestionType(question.type),
    text: question.name,
    options: question.questionOptions,
  }))
}

const mapQuestionType = (apiType: string): Question["type"] => {
  switch (apiType.toUpperCase()) {
    case "TEXT":
      return "TEXT"
    case "RADIO":
      return "RADIO"
    case "SELECT":
      return "SELECT"
    case "CHECKBOX":
      return "CHECKBOX"
    case "FILE":
      return "FILE"
    case "CALENDAR":
      return "CALENDAR"
    default:
      return "TEXT" // デフォルトはtextとする
  }
}

