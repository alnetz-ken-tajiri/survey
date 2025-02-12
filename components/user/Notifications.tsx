import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"

type Notification = {
  id: string
  message: string
}

export function Notifications() {
  // この例では、ハードコードされたデータを使用していますが、実際にはAPIから取得するべきです
  const notifications: Notification[] = [
    { id: "1", message: "新しいサーベイが利用可能です：「2024年度 従業員満足度調査」" },
    { id: "2", message: "サーベイ「リモートワーク実態調査」の回答期限は明日までです" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-4 w-4" />
          通知
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li key={notification.id} className="text-sm">
              {notification.message}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

