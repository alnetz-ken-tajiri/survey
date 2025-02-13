"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SurveyTarget {
  id: string
  survey: {
    id: string
    name: string
    status: "ACTIVE" | "INACTIVE"
    questionGroupId: string
  }
  status: "ACTIVE" | "INACTIVE" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

}

export function SurveyListCard() {
  const { data: session } = useSession()
  const [surveyTargets, setSurveyTargets] = useState<SurveyTarget[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSurveyTargets = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get(`/api/user/${session.user.id}/surveyTargets`)
          setSurveyTargets(response.data)
        } catch (error) {
          console.error("サーベイターゲットの取得中にエラーが発生しました:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchSurveyTargets()
  }, [session])

  if (isLoading) {
    return <div>サーベイを読み込み中...</div>
  }

  const getStatusBadge = (status: SurveyTarget["status"] | SurveyTarget["survey"]["status"]) => {
    const statusColors = {
      ACTIVE: "bg-green-500",
      INACTIVE: "bg-gray-500",
      NOT_STARTED: "bg-yellow-500",
      IN_PROGRESS: "bg-blue-500",
      COMPLETED: "bg-purple-500",
    }
    return <Badge className={`${statusColors[status]} text-white`}>{status}</Badge>
  }

  const canAnswer = (surveyStatus: SurveyTarget["survey"]["status"], targetStatus: SurveyTarget["status"]) => {
    return surveyStatus === "ACTIVE" && ["ACTIVE", "NOT_STARTED", "IN_PROGRESS"].includes(targetStatus)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>対象サーベイ</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>サーベイ名</TableHead>
              <TableHead>サーベイステータス</TableHead>
              <TableHead>回答ステータス</TableHead>
              <TableHead>アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveyTargets.map((target) => (
              <TableRow key={target.id}>
                <TableCell>{target.survey.name}</TableCell>
                <TableCell>{getStatusBadge(target.survey.status)}</TableCell>
                <TableCell>{getStatusBadge(target.status)}</TableCell>
                <TableCell>
                  {canAnswer(target.survey.status, target.status) ? (
                    <Button asChild>
                      <Link href={`/survey/${target.survey.id}`}>回答する</Link>
                    </Button>
                  ) : (
                    <Button disabled>回答不可</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

