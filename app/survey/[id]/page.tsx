"use client"

import { SurveyForm } from "@/components/SurveyForm"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { SurveyLayout } from "@/components/SurveyLayout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSurvey } from "@/contexts/SurveyContext"

const SurveyProvider = dynamic(() => import("@/contexts/SurveyContext").then((mod) => mod.SurveyProvider), {
  ssr: false,
})

function SurveyContent() {
  const { isLoadingApiResponse, surveyData } = useSurvey()
  const router = useRouter()

  if (isLoadingApiResponse) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>サーベイデータの取得に失敗しました。</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/user")} variant="outline">
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    )
  }

  if (surveyData.isCompleted) {
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>回答済み</AlertTitle>
            <AlertDescription>このサーベイは既に回答済みです。</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/user")} variant="outline">
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SurveyLayout>
      <SurveyForm />
    </SurveyLayout>
  )
}

export default function SurveyPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <SurveyProvider questionGroupId={id}>
      <SurveyContent />
    </SurveyProvider>
  )
}

