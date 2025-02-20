import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

async function getNotifications(companyId: string) {
  return await prisma.notification.findMany({
    where: { companyId: companyId },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { employee: { include: { company: true } } },
  })

  if (!user || !user.employee?.company) {
    return <div>User or company not found</div>
  }

  const notifications = await getNotifications(user.employee.company.id)

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">管理者通知ページ</CardTitle>
          <Link href="/admin/notifications/create">
            <Button>新規通知作成</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>メッセージ</TableHead>
                <TableHead>重要度</TableHead>
                <TableHead>作成日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        notification.importanceLevel === "HIGH"
                          ? "destructive"
                          : notification.importanceLevel === "MEDIUM"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {notification.importanceLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{notification.createdAt.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

