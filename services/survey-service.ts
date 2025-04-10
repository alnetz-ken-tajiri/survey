// サーベイデータを取得するAPI関数
export async function fetchSurvey(surveyId: string) {
  try {
    const response = await fetch(`/api/surveys/${surveyId}`)
    if (!response.ok) {
      throw new Error("サーベイデータの取得に失敗しました")
    }
    return await response.json()
  } catch (error) {
    console.error("サーベイデータの取得エラー:", error)
    throw error
  }
}

// サーベイ回答を送信するAPI関数
export async function submitSurveyAnswers(surveyId: string, answers: Record<string, any>) {
  try {
    const response = await fetch(`/api/surveys/${surveyId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    })

    if (!response.ok) {
      throw new Error("サーベイ回答の送信に失敗しました")
    }

    return await response.json()
  } catch (error) {
    console.error("サーベイ回答の送信エラー:", error)
    throw error
  }
}

