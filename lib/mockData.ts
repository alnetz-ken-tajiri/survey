import { Question } from './api'

export const mockQuestions: Question[] = [
  {
    id: "name",
    text: "お名前を教えてください",
    type: "TEXT"
  },
  {
    id: "age",
    text: "年齢を選択してください",
    type: "SELECT",
    options: ["18-24", "25-34", "35-44", "45-54", "55+"]
  },
  {
    id: "gender",
    text: "性別を選択してください",
    type: "RADIO",
    options: ["男性", "女性", "その他", "回答しない"]
  },
  {
    id: "interests",
    text: "興味のある分野を選択してください（複数選択可）",
    type: "CHECKBOX",
    options: ["技術", "デザイン", "マーケティング", "ビジネス", "教育"]
  },
  {
    id: "resume",
    text: "履歴書をアップロードしてください",
    type: "FILE"
  },
  {
    id: "interview_date",
    text: "希望する面接日を選択してください",
    type: "CALENDAR"
  },
  {
    id: "additional_info",
    text: "追加情報があれば記入してください",
    type: "TEXT"
  }
]

