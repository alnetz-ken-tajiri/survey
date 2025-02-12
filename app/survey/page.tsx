"use client"

import { SurveyForm } from "@/components/SurveyForm"
import dynamic from 'next/dynamic'
const SurveyProvider = dynamic(() => import('@/contexts/SurveyContext').then(mod => mod.SurveyProvider), { ssr: false })

export default function SurveyPage() {
  return (
    <SurveyProvider questionGroupId="1">
      <div className="container mx-auto py-10 px-4 min-h-screen ">
        <SurveyForm />
      </div>
    </SurveyProvider>
  )
}

