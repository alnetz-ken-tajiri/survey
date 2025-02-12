"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { LogoutButton } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/user" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            HuCups サーベイ
          </Link>
          <nav className="space-x-4">
            <Link href="/user/profile" className="text-gray-600 hover:text-gray-900">
              プロフィール
            </Link>
            <Link href="/user/surveys" className="text-gray-600 hover:text-gray-900">
              サーベイ一覧
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" passHref>
                <Button variant="outline" className="text-gray-600 hover:text-gray-900">
                  管理画面
                </Button>
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

