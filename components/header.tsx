"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // ログアウト処理をここに実装
    router.push("/auth/signin")
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      ログアウト
    </Button>
  )
}

