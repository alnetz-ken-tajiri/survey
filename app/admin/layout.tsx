import type React from "react"
import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">HuCups 管理画面</h1>
        </div>
        <nav className="mt-8">
          <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700">
            Home
          </Link>
          <Link href="/admin/users" className="block py-2 px-4 hover:bg-gray-700">
            ユーザー管理
          </Link>
          <Link href="/admin/surveys" className="block py-2 px-4 hover:bg-gray-700">
            サーベイ管理
          </Link>
          <Link href="/user" className="block py-2 px-4 hover:bg-gray-700 bg-black">
            ユーザーページ
          </Link>
        </nav>


      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">管理画面</h2>
            <LogoutButton />
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

