import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Users, FileText, AlertCircle } from "lucide-react"

// モックデータ
const stats = [
  { title: "総ユーザー数", value: "1,234", icon: Users },
  { title: "アクティブサーベイ", value: "56", icon: FileText },
  { title: "今月の回答数", value: "8,901", icon: BarChart },
  { title: "未対応の問い合わせ", value: "23", icon: AlertCircle },
]

const recentSurveys = [
  { id: 1, title: "従業員満足度調査 2024", responses: 89, deadline: "2024-03-31" },
  { id: 2, title: "リモートワーク実態調査", responses: 156, deadline: "2024-04-15" },
  { id: 3, title: "新入社員フィードバック", responses: 34, deadline: "2024-05-01" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Surveys */}
      <Card>
        <CardHeader>
          <CardTitle>最近のサーベイ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSurveys.map((survey) => (
              <div key={survey.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{survey.title}</h3>
                  <p className="text-sm text-gray-500">
                    回答数: {survey.responses} | 締切: {survey.deadline}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  詳細
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button>TEST</Button>
          <Button variant="outline">TEST</Button>
          <Button variant="outline">TEST</Button>
        </CardContent>
      </Card>

    </div>
  )
}

