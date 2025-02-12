import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Activity = {
  id: string
  action: string
  date: string
}

export function RecentActivity() {
  // この例では、ハードコードされたデータを使用していますが、実際にはAPIから取得するべきです
  const activities: Activity[] = [
    { id: "1", action: "サーベイ「従業員満足度調査」を完了しました", date: "2024-03-15" },
    { id: "2", action: "サーベイ「リモートワーク実態調査」を開始しました", date: "2024-03-10" },
    { id: "3", action: "プロフィール情報を更新しました", date: "2024-03-05" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近のアクティビティ</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id} className="text-sm">
              <span className="font-medium">{activity.date}</span>: {activity.action}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

