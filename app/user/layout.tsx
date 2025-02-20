// app/user/layout.tsx
"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { LogoutButton } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/hooks/useWebSocket"
import { NotificationPopover } from "@/components/NotificationPopover"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { notifications } = useWebSocket(`wss://8yg0beud0h.execute-api.ap-northeast-1.amazonaws.com/dev?userId=${session?.user?.id}`);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/user" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            HuCups サーベイ
          </Link>
          <nav className="space-x-2 flex items-center">
            <NotificationPopover notifications={notifications} />
            <Link href="/user/profile" passHref>
              <Button variant="ghost">プロフィール</Button>
            </Link>
            <Link href="/user/surveys" passHref>
              <Button variant="ghost">サーベイ一覧</Button>
            </Link>
            {(session?.user?.role === "ADMIN" ||
              session?.user?.role === "SUPER_USER" ||
              session?.user?.role === "USER_ADMIN") && (
              <Link href="/admin" passHref>
                <Button variant="outline">管理画面</Button>
              </Link>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          © 2024 HuCups サーベイ. All rights reserved.
        </div>
      </footer>
    </div>
  )
}