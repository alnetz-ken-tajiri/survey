"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  loginId: string
  email: string
  employee: {
    name: string
    number: string
  }
  emailStatus: "SENT" | "PENDING" | "CANCELLED" | "NOT_SENT"
  responseStatus: "COMPLETED" | "NOT_ANSWERED"
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[] // 変更: string[] 型に修正
}

export default function SendEmailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, templatesResponse] = await Promise.all([
          axios.get(`/api/admin/surveys/${params.id}/users`),
          axios.get(`/api/admin/surveys/${params.id}/emailTemplate`),
        ])
        setUsers(usersResponse.data)
        setTemplates(templatesResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "エラーが発生しました",
          description: "データの取得中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  const filteredUsers = users.filter(
    (user) =>
      user.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee.number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  const handleSendEmails = async () => {
    if (!selectedTemplate) {
      toast({
        title: "テンプレートを選択してください",
        description: "メール送信にはテンプレートの選択が必要です。",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const response = await axios.post("/api/admin/mailNotifications", {
        surveyId: params.id,
        allSelected: false,
        selectedUserIds: selectedUsers,
        templateId: selectedTemplate,
      })
      toast({
        title: "メール送信完了",
        description: `${response.data.results.length}件のメールを送信しました。`,
      })
      router.push("/admin/surveys")
    } catch (error) {
      console.error("Error sending emails:", error)
      toast({
        title: "エラーが発生しました",
        description: "メール送信中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getEmailStatusBadge = (status: User["emailStatus"]) => {
    switch (status) {
      case "SENT":
        return <Badge variant="default">送信済み</Badge>
      case "PENDING":
        return <Badge variant="default">送信中</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">キャンセル</Badge>
      case "NOT_SENT":
        return <Badge variant="secondary">未送信</Badge>
    }
  }

  const getResponseStatusBadge = (status: User["responseStatus"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">回答済み</Badge>
      case "NOT_ANSWERED":
        return <Badge variant="secondary">未回答</Badge>
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>メール送信</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="ユーザーを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="テンプレートを選択" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSelectAll}>
              {selectedUsers.length === filteredUsers.length ? "全選択解除" : "全選択"}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">選択</TableHead>
                <TableHead>ログインID</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>名前</TableHead>
                <TableHead>社員番号</TableHead>
                <TableHead>メール送信状況</TableHead>
                <TableHead>回答状況</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>{user.loginId}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.employee.name}</TableCell>
                  <TableCell>{user.employee.number}</TableCell>
                  <TableCell>{getEmailStatusBadge(user.emailStatus)}</TableCell>
                  <TableCell>{getResponseStatusBadge(user.responseStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button onClick={handleSendEmails} disabled={isSending || selectedUsers.length === 0 || !selectedTemplate}>
              {isSending ? "送信中..." : "メール送信"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

