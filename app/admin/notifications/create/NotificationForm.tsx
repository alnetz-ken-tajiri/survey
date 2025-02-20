"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Prisma } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"

type User = Prisma.UserGetPayload<{
  include: {
    employee: true
  }
}>

interface NotificationFormProps {
  users: User[]
}

export default function NotificationForm({ users }: NotificationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    importanceLevel: "LOW" as "LOW" | "MEDIUM" | "HIGH",
    userIds: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUserSelect = (selectedUserIds: string[]) => {
    setFormData((prev) => ({ ...prev, userIds: selectedUserIds }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      toast({
        title: "通知が作成されました",
        description: "新しい通知が正常に作成されました。",
      })
      router.push("/admin/notifications")
      router.refresh()
    } else {
      toast({
        title: "エラー",
        description: "通知の作成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">メッセージ</Label>
        <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="importanceLevel">重要度</Label>
        <Select
          onValueChange={(value) => handleSelectChange(value, "importanceLevel")}
          defaultValue={formData.importanceLevel}
        >
          <SelectTrigger>
            <SelectValue placeholder="重要度を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">低</SelectItem>
            <SelectItem value="MEDIUM">中</SelectItem>
            <SelectItem value="HIGH">高</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="userIds">通知対象ユーザー</Label>
        <MultiSelect
          options={users.map((user) => ({ value: user.id, label: `${user.employee?.name} (${user.email})` }))}
          selected={formData.userIds}
          onChange={handleUserSelect}
        />
      </div>
      <Button type="submit" className="w-full">
        通知を作成
      </Button>
    </form>
  )
}

