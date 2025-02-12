import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function ProgressSummary() {
  // この例では、ハードコードされた値を使用していますが、実際にはAPIから取得するべきです
  const completedSurveys = 3
  const totalSurveys = 5
  const progressPercentage = (completedSurveys / totalSurveys) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>進捗状況</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {completedSurveys} / {totalSurveys} サーベイ完了
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

