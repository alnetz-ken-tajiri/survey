"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { useSwrData } from "@/hooks/useSwrData"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface User {
  id: string
  loginId: string
  email: string
  employee: {
    name: string
    number: string
  }
  surveyTargets: {
    id: string
    surveyId: string
    userId: string
    status: string
  }[]
}

/**
 * 対象者選択ページ
 * URL: /admin/surveys/[id]/targets
 */
export default function SelectTargetUsersPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: users = [], isLoading } = useSwrData<User[]>(`/api/admin/surveyTargets/${params.id}`)

  const filteredUsers = users.filter(
    (user) =>
      user.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee.number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const isUserAlreadyTarget = (user: User) => {
    return user.surveyTargets.some((target) => target.surveyId === params.id)
  }

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    const selectableUsers = filteredUsers.filter((user) => !isUserAlreadyTarget(user))
    if (selectedUsers.length === selectableUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(selectableUsers.map((user) => user.id))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await axios.post(`/api/admin/surveyTargets`, {
        surveyId: params.id,
        targetUserIds: selectedUsers,
      })

      toast({
        title: "対象者が設定されました",
        description: `${selectedUsers.length}人のユーザーが対象者として設定されました。`,
      })
      router.push("/admin/surveys")
    } catch (error) {
      console.error("Error setting target users:", error)
      toast({
        title: "エラーが発生しました",
        description: "対象者の設定中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>対象者選択</CardTitle>
          <CardDescription>
            アンケートの対象となるユーザーを選択してください。既に対象となっているユーザーは選択できません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <Input
              placeholder="ユーザーを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedUsers.length === filteredUsers.filter((user) => !isUserAlreadyTarget(user)).length
                ? "全選択解除"
                : "全選択"}
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
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const isAlreadyTarget = isUserAlreadyTarget(user)
                return (
                  <TableRow key={user.id} className={isAlreadyTarget ? "bg-gray-100" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id) || isAlreadyTarget}
                        onCheckedChange={() => !isAlreadyTarget && handleUserSelection(user.id)}
                        disabled={isAlreadyTarget}
                      />
                    </TableCell>
                    <TableCell>{user.loginId}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.employee.name}</TableCell>
                    <TableCell>{user.employee.number}</TableCell>
                    <TableCell>{isAlreadyTarget ? "対象者" : "未設定"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-between items-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="flex items-center space-x-2">
              <span>{selectedUsers.length} 人選択中</span>
              <Button onClick={handleSubmit} disabled={isSubmitting || selectedUsers.length === 0}>
                {isSubmitting ? "設定中..." : "対象者を設定"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

