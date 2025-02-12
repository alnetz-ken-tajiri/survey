import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileSummary() {
  // この例では、ハードコードされたデータを使用していますが、実際にはAPIから取得するべきです
  const user = {
    name: "山田 太郎",
    email: "taro.yamada@example.com",
    department: "営業部",
    avatarUrl: "/placeholder.svg",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">{user.department}</p>
        </div>
      </CardContent>
    </Card>
  )
}

