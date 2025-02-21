"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { LogoutButton } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/hooks/useWebSocket"
import { NotificationPopover } from "@/components/NotificationPopover"
import { Home, User, ClipboardList, Settings } from "lucide-react"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const { notifications, isLoading } = useWebSocket(wsUrl || "")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setWsUrl(`wss://8yg0beud0h.execute-api.ap-northeast-1.amazonaws.com/dev?userId=${session.user.id}`)
    }
  }, [status, session])

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      <header className="bg-[#25262b] border-b border-[#2f3136]">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href="/user"
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-600 transition-all"
            >
              HuCups サーベイ
            </Link>
            <nav className="flex items-center gap-2">
              {wsUrl && <NotificationPopover notifications={notifications} isLoading={isLoading} />}
              <NavLink href="/user" icon={<Home className="w-4 h-4" />}>
                ホーム
              </NavLink>
              <NavLink href="/user/profile" icon={<User className="w-4 h-4" />}>
                プロフィール
              </NavLink>
              <NavLink href="/user/surveys" icon={<ClipboardList className="w-4 h-4" />}>
                サーベイ一覧
              </NavLink>
              {(session?.user?.role === "ADMIN" ||
                session?.user?.role === "SUPER_USER" ||
                session?.user?.role === "USER_ADMIN") && (
                <NavLink href="/admin" icon={<Settings className="w-4 h-4" />}>
                  管理画面
                </NavLink>
              )}
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      <footer className="bg-[#25262b] border-t border-[#2f3136] mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          © 2024 HuCups サーベイ. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <Button variant="ghost" className="text-gray-100 hover:text-white hover:bg-[#2f3136] transition-colors">
        {icon}
        <span className="ml-2">{children}</span>
      </Button>
    </Link>
  )
}

