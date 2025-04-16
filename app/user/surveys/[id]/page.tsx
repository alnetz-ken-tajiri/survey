"use client"

import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import SurveyContent from "@/components/user/surveys/survey-content"
import SurveyProgress from "@/components/user/surveys/survey-progress"
import { SurveyProvider, useSurvey } from "@/contexts/survey-context"

function SurveyPageContent() {
  const params = useParams()
  const surveyId = params.id as string
  const { state } = useSurvey()
  const totalQuestions = state.survey?.questionGroup.questionGroupQuestions.length || 0
  const answeredQuestions = Object.keys(state.answers).length
  const currentPage = state.currentPage
  const totalPages = Math.ceil(totalQuestions / state.questionsPerPage)

  return (
    <>
      <SurveyProgress
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        currentPage={currentPage}
        totalPages={totalPages}
      />
      <Card className="border border-[#2f3136] bg-[#25262b] mt-24 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4">
          <SurveyContent surveyId={surveyId} />
        </div>
      </Card>
    </>
  )
}

export default function SurveyPage() {
  return (
    <SurveyProvider>
      <SurveyPageContent />
    </SurveyProvider>
  )
}

