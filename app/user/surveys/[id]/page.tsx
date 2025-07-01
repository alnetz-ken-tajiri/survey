"use client"

import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import SurveyContent from "@/components/user/surveys/survey-content"
import SurveyProgress from "@/components/user/surveys/survey-progress"
import { SurveyProvider, useSurvey } from "@/contexts/survey-context"
import { motion } from "framer-motion"
import Image from "next/image"

function SurveyPageContent() {
  const params = useParams()
  const surveyId = params.id as string
  const { state } = useSurvey()
  const totalQuestions = state.survey?.questionGroup.questionGroupQuestions.length || 0
  const answeredQuestions = Object.keys(state.answers).length
  const currentPage = state.currentPage
  const totalPages = Math.ceil(totalQuestions / state.questionsPerPage)

  return (
    <div className="min-h-screen bg-neutral-100 pt-24 pb-2">
      {/* Fixed Progress Bar */}
      <SurveyProgress
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        currentPage={currentPage}
        totalPages={totalPages}
      />
      
      {/* Main Content with padding for fixed header and progress */}
      <div className="pt-10 pb-6 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            {/* Header Section with Survey Image */}
            <div className="mb-4">
              {(state.survey?.image || state.survey?.questionGroup?.fileUrl) ? (
                <div className="relative h-24 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={state.survey.image || state.survey.questionGroup.fileUrl || ""}
                    alt={state.survey.name || "Survey"}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="flex-1 flex items-start">
                      <h1 className="text-xl font-bold text-white drop-shadow-2xl bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">
                        {state.survey?.name || "サーベイ回答"}
                      </h1>
                    </div>
                    <div className="flex justify-between items-end gap-4">
                      <p className="text-sm text-white drop-shadow-xl bg-black/40 px-2 py-1 rounded backdrop-blur-sm flex-1">
                        {state.survey?.questionGroup?.description || "以下の質問にお答えください"}
                      </p>
                      {state.survey?.deadline && (
                        <p className="text-xs text-white drop-shadow-xl bg-black/40 px-2 py-1 rounded backdrop-blur-sm whitespace-nowrap">
                          期限: {new Date(state.survey.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {state.survey?.name || "サーベイ回答"}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {state.survey?.questionGroup?.description || "以下の質問にお答えください"}
                  </p>
                </div>
              )}
            </div>

            {/* Survey Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="p-6">
                <SurveyContent surveyId={surveyId} />
              </div>
            </Card>

            {/* Compact Footer */}
            <div className="text-center mt-4">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-gray-500 text-xs">powered by</span>
                <Image
                  src="/images/Sinmido_logo.png"
                  alt="Sinmido"
                  width={40}
                  height={16}
                  className="opacity-60"
                  priority
                />
              </div>
              <p className="text-gray-400 text-xs">© 2024 Sinmido. All rights reserved.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SurveyPage() {
  return (
    <SurveyProvider>
      <SurveyPageContent />
    </SurveyProvider>
  )
}

