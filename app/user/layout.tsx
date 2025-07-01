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
import { UserRole } from "@prisma/client"
import Image from "next/image"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const { notifications, isLoading } = useWebSocket(wsUrl || "")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setWsUrl(`wss://8yg0beud0h.execute-api.ap-northeast-1.amazonaws.com/dev?userId=${session.user.id}`)
      setIsAdmin(session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SUPER_USER || session?.user.role === UserRole.USER_ADMIN)
    }
  }, [status, session])

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href="/user"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/hitokara.png"
                alt="Hitokara"
                width={120}
                height={24}
                priority
              />
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
              {isAdmin && (
                <NavLink href="/admin" icon={<Settings className="w-4 h-4" />}>
                  管理画面
                </NavLink>
              )}
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>
      <main className="pt-18 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-gray-500 text-xs">powered by</span>
              <Image
                src="/images/Sinmido_logo.png"
                alt="Sinmido"
                width={50}
                height={20}
                className="opacity-60"
                priority
              />
            </div>
            <p className="text-gray-400 text-xs">© 2024 Sinmido. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
        {icon}
        <span className="ml-2">{children}</span>
      </Button>
    </Link>
  )
}

