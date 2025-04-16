"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // ログアウト処理をここに実装
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      ログアウト
    </Button>
  )
}

