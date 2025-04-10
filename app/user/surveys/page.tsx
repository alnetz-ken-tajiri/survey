"use client"

import { Card } from "@/components/ui/card"
import SurveyContent from "@/components/user/surveys/survey-content"
import SurveyProgress from "@/components/user/surveys/survey-progress"
import { SurveyProvider, useSurvey } from "@/contexts/survey-context"

function SurveyPageContent() {
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
      <Card className="rounded-sm border border-[#2f3136] bg-[#25262b] mt-20 shadow-sm overflow-hidden">
        <div className="p-4 ">
          <SurveyContent surveyId={""} />
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

