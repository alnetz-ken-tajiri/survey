"use client"

import { SurveyForm } from "@/components/SurveyForm"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { SurveyLayout } from "@/components/SurveyLayout"
const SurveyProvider = dynamic(() => import("@/contexts/SurveyContext").then((mod) => mod.SurveyProvider), {
  ssr: false,
})

export default function SurveyPage() {
  const params = useParams()
  const id = params.id as string

  return (
    
      <SurveyProvider questionGroupId={id}>
        <SurveyLayout>
          <SurveyForm />
        </SurveyLayout>
      </SurveyProvider>
    
  )
}

