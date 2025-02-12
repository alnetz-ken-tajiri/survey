"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Survey } from "@/lib/mockSurveys"

export function SurveyCard({ survey }: { survey: Survey }) {
  const router = useRouter()

  const handleStartSurvey = () => {
    if (!survey.isCompleted) {
      router.push(`/survey/${survey.id}`)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={survey.imageUrl || "/placeholder.svg"}
          alt={survey.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        <CardDescription>{survey.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">締切: {survey.deadline}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={survey.isCompleted}
          variant={survey.isCompleted ? "secondary" : "default"}
          onClick={handleStartSurvey}
        >
          {survey.isCompleted ? "回答済み" : "回答開始"}
        </Button>
      </CardFooter>
    </Card>
  )
}

