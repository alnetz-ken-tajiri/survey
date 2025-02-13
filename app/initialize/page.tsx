"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function InitializePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const userData = {
      loginId: formData.get("loginId"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    }

    const employeeData = {
      name: formData.get("employeeName"),
      number: formData.get("employeeNumber"),
    }

    const companyData = {
      companyName: formData.get("companyName"),
      companyCode: formData.get("companyCode"),
    }

    try {
      const response = await fetch("/api/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userData, employee: employeeData, company: companyData }),
      })

      if (!response.ok) {
        throw new Error("データの初期化に失敗しました")
      }

      toast({
        title: "成功",
        description: "初期データの設定が完了しました",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">初期データ設定</h1>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginId">ログインID</Label>
            <Input id="loginId" name="loginId" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">ロール</Label>
            <Select name="role" defaultValue="USER">
              <SelectTrigger>
                <SelectValue placeholder="ロールを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">ユーザー</SelectItem>
                <SelectItem value="SUPER_USER">スーパーユーザー</SelectItem>
                <SelectItem value="ADMIN">管理者</SelectItem>
                <SelectItem value="USER_ADMIN">ユーザー兼管理者</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeName">従業員名</Label>
            <Input id="employeeName" name="employeeName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeNumber">従業員番号</Label>
            <Input id="employeeNumber" name="employeeNumber" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">会社名</Label>
            <Input id="companyName" name="companyName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyCode">会社コード</Label>
            <Input id="companyCode" name="companyCode" required />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            初期データを設定
          </Button>
        </form>
      </div>
    </div>
  )
}

