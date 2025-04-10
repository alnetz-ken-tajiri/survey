export type RawRecord = {
    surveyTargetId: string
    userId: string
    employeeNumber: string
    questionId: string
    questionName: string
    tags: string[]
    numericValue: number
    optionLabel: string
    createdAt: string
    questionDeviation: number
    category: string
    categoryDeviation: number
  }
  
  export type GroupedRecord = {
    userId: string
    employeeNumber: string
    category: string
    rows: RawRecord[]
    numericValues?: number[]
    categoryDeviationValues?: number[]
    avgNumeric?: number
    avgCategoryDeviation?: number
  }
  
  export type PivotedRecord = Record<string, any>
  
  export type QuestionTagMap = Record<string, string>
  
  export type OverallRecord = {
    userId: string
    employeeNumber: string
    avgScore: number
    overallDeviation: number
  }
  
  