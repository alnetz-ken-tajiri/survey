"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, LineChart, PieChart, Users } from "lucide-react"

interface DataSummaryProps {
  dataPoints: number
  categoryCount: number
  questionCount: number
  userCount: number
  averageDeviation?: number
}

export function DataSummary({
  dataPoints,
  categoryCount,
  questionCount,
  userCount,
  averageDeviation = 50,
}: DataSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      <Card className="bg-gradient-to-br from-background to-muted/20 shadow-sm border-muted/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">データポイント</p>
              <p className="text-2xl font-bold">{dataPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/20 shadow-sm border-muted/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">カテゴリー</p>
              <p className="text-2xl font-bold">{categoryCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/20 shadow-sm border-muted/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <LineChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">質問</p>
              <p className="text-2xl font-bold">{questionCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/20 shadow-sm border-muted/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ユーザー</p>
              <p className="text-2xl font-bold">{userCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

