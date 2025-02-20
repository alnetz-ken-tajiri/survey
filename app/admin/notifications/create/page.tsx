import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import NotificationForm from "./NotificationForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getUsers() {
  return await prisma.user.findMany({
    include: { employee: true },
  })
}

export default async function CreateNotificationPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const users = await getUsers()

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">新規通知作成</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationForm users={users} />
        </CardContent>
      </Card>
    </div>
  )
}

