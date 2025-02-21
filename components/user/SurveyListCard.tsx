"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ClipboardList } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

  const getStatusBadge = (status: SurveyTarget["status"] | SurveyTarget["survey"]["status"]) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-500", label: "アクティブ" },
      INACTIVE: { color: "bg-gray-500", label: "非アクティブ" },
      NOT_STARTED: { color: "bg-yellow-500", label: "未開始" },
      IN_PROGRESS: { color: "bg-blue-500", label: "進行中" },
      COMPLETED: { color: "bg-purple-500", label: "完了" },
    }
    const config = statusConfig[status]
    return <Badge className={`${config.color} text-white font-medium`}>{config.label}</Badge>
  }

  const canAnswer = (surveyStatus: SurveyTarget["survey"]["status"], targetStatus: SurveyTarget["status"]) => {
    return surveyStatus === "ACTIVE" && ["ACTIVE", "NOT_STARTED", "IN_PROGRESS"].includes(targetStatus)
  }

  return (
    <Card className="w-full bg-[#25262b] border-[#2f3136]">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">対象サーベイ</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : surveyTargets.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <p className="text-gray-300">現在対象のサーベイはありません。</p>
          </div>
        ) : (
          <AnimatePresence>
            <ul className="space-y-4">
              {surveyTargets.map((target, index) => (
                <motion.li
                  key={target.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-[#2f3136] p-4 rounded-lg border border-[#383a40] hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-white text-lg">{target.survey.name}</h3>
                    {getStatusBadge(target.survey.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">回答状況:</span>
                      {getStatusBadge(target.status)}
                    </div>
                    {canAnswer(target.survey.status, target.status) ? (
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href={`/survey/${target.survey.id}`}>回答する</Link>
                      </Button>
                    ) : (
                      <Button disabled size="sm" className="bg-gray-700 text-gray-300">
                        回答不可
                      </Button>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}

