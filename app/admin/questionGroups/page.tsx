"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreVertical, Pencil, Trash2, Calendar, ListTodo, Globe, Lock, Building } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Question {
  id: string
  name: string
  type: string
}

interface QuestionGroup {
  id: string
  name: string
  description: string | null
  createdAt: string
  public: boolean
  companyId: string
  questionGroupQuestions: Array<{
    question: Question
  }>
  company?: {
    companyName: string
  }
}

interface UserData {
  id: string
  employee: {
    companyId: string
    company: {
      id: string
      companyName: string
    }
  }
}

export default function QuestionGroupList() {
  const router = useRouter()
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([])
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "questions" | "public" | "company">("createdAt")

  useEffect(() => {
    fetchQuestionGroups()
  }, [])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserData()
    }
  }, [status, session?.user?.id])

  const fetchQuestionGroups = async () => {
    try {
      const response = await axios.get("/api/admin/questionGroups")
      setQuestionGroups(response.data)
    } catch (error) {
      console.error("Error fetching question groups:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問グループの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/admin/users/${session?.user?.id}`)
      setUserData(response.data)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "エラーが発生しました",
        description: "ユーザー情報の取得に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("この質問グループを削除してもよろしいですか？")) {
      return
    }

    try {
      await axios.delete(`/api/admin/questionGroups/${id}`)
      toast({
        title: "削除しました",
        description: "質問グループを削除しました。",
      })
      fetchQuestionGroups()
    } catch (error) {
      console.error("Error deleting question group:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問グループの削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  // 自分の会社のグループかどうかをチェック
  const isOwnCompanyGroup = (group: QuestionGroup) => {
    return userData?.employee?.companyId === group.companyId
  }

  const filteredAndSortedGroups = questionGroups
    .filter(
      (group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "questions":
          return b.questionGroupQuestions.length - a.questionGroupQuestions.length
        case "public":
          return (b.public ? 1 : 0) - (a.public ? 1 : 0)
        case "company":
          return (a.company?.companyName || "").localeCompare(b.company?.companyName || "")
        case "createdAt":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-1/3" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  return (
    <TooltipProvider>
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">質問グループ一覧</h1>
            <Button onClick={() => router.push("/admin/questionGroups/create")}>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="質問グループを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value: "createdAt" | "name" | "questions" | "public" | "company") => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">作成日時</SelectItem>
                <SelectItem value="name">グループ名</SelectItem>
                <SelectItem value="questions">質問数</SelectItem>
                <SelectItem value="public">公開状態</SelectItem>
                <SelectItem value="company">会社名</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredAndSortedGroups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">質問グループが見つかりません</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedGroups.map((group) => (
                <Card key={group.id} className="relative overflow-hidden group">
                  <div className="absolute right-2 top-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">メニューを開く</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isOwnCompanyGroup(group) ? (
                          <>
                            <DropdownMenuItem onClick={() => router.push(`/admin/questionGroups/${group.id}/edit`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(group.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem disabled className="text-muted-foreground">
                            <Lock className="mr-2 h-4 w-4" />
                            編集権限なし
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="pr-8 line-clamp-1 text-base">{group.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant={group.public ? "default" : "secondary"} className="flex items-center gap-1">
                              {group.public ? (
                                <>
                                  <Globe className="h-3 w-3" />
                                  <span>公開</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3" />
                                  <span>非公開</span>
                                </>
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {group.public ? "他のユーザーも利用可能" : "作成者のみ利用可能"}
                          </TooltipContent>
                        </Tooltip>

                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">
                            {group.company?.companyName || userData?.employee?.company?.companyName || "不明"}
                          </span>
                        </Badge>

                        {!isOwnCompanyGroup(group) && (
                          <Badge variant="secondary" className="text-xs">
                            他社
                          </Badge>
                        )}
                      </div>
                      {group.description && (
                        <CardDescription className="line-clamp-2 text-xs mt-1">{group.description}</CardDescription>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2 pt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ListTodo className="h-3 w-3" />
                        {group.questionGroupQuestions.length}問
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(group.createdAt), "yyyy/MM/dd", { locale: ja })}
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <div className="flex flex-wrap gap-1 w-full">
                      {group.questionGroupQuestions.slice(0, 3).map(({ question }) => (
                        <Badge key={question.id} variant="outline" className="text-xs">
                          {question.name}
                        </Badge>
                      ))}
                      {group.questionGroupQuestions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.questionGroupQuestions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

