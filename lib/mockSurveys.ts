export interface Survey {
    id: string
    title: string
    description: string
    deadline: string
    isCompleted: boolean
    imageUrl: string
  }
  
  export const mockSurveys: Survey[] = [
    {
      id: "1",
      title: "従業員満足度調査",
      description: "職場環境と仕事の満足度に関する匿名アンケートです。",
      deadline: "2024-03-31",
      isCompleted: false,
      imageUrl:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "2",
      title: "リモートワーク実態調査",
      description: "在宅勤務の効率性と課題を把握するための調査です。",
      deadline: "2024-04-15",
      isCompleted: true,
      imageUrl:
        "https://images.unsplash.com/photo-1585974738771-84483dd9f89f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "3",
      title: "新入社員フィードバック",
      description: "入社後3ヶ月の新入社員を対象とした適応状況調査です。",
      deadline: "2024-05-01",
      isCompleted: false,
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    },
  ]
  
  