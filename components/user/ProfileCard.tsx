"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProfileCard() {
  const { data: session } = useSession()

  if (!session) {
    return <div>ログインしていません</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール</CardTitle>
      </CardHeader>
      <CardContent>
        <p>名前: {session.user?.name}</p>
        <p>メール: {session.user?.email}</p>
      </CardContent>
    </Card>
  )
}

