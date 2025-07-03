"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Plus, MoreHorizontal, Mail, Users, FileText, BarChart, GanttChart } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface Survey {
  id: string
  name: string
  image: string
  startDate: string | null
  deadline: string | null
  createdAt: string
  status: string
  questionGroup: {
    name: string
  }
}

export default function SurveyListPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get("/api/admin/surveys")
        setSurveys(response.data)
      } catch (error) {
        console.error("Error fetching surveys:", error)
        toast({
          title: "エラーが発生しました",
          description: "サーベイの取得中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurveys()
  }, [toast])

  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || survey.status === statusFilter),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">サーベイ一覧</h1>
        <Link href="/admin/surveys/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> 新規サーベイ作成
          </Button>
        </Link>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="サーベイを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="ACTIVE">アクティブ</SelectItem>
            <SelectItem value="INACTIVE">非アクティブ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSurveys.map((survey) => (
          <Card key={survey.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative h-48">
                <Image src={survey.image || "/placeholder.svg"} alt={survey.name} layout="fill" objectFit="cover" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl">{survey.name}</CardTitle>
                <Badge variant={survey.status === "ACTIVE" ? "default" : "secondary"}>
                  {survey.status === "ACTIVE" ? "アクティブ" : "非アクティブ"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{survey.questionGroup.name}</p>
              <div className="text-sm">
                <p>
                  開始日:{" "}
                  {survey.startDate ? format(new Date(survey.startDate), "yyyy/MM/dd", { locale: ja }) : "未設定"}
                </p>
                <p>
                  締切日: {survey.deadline ? format(new Date(survey.deadline), "yyyy/MM/dd", { locale: ja }) : "未設定"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground">
                作成日: {format(new Date(survey.createdAt), "yyyy/MM/dd", { locale: ja })}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/surveys/${survey.id}/sendMail`}>
                      <Mail className="mr-2 h-4 w-4" /> メール送信
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/surveys/${survey.id}/targets`}>
                      <Users className="mr-2 h-4 w-4" /> 対象者選択
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/surveys/${survey.id}/mailTemplates`}>
                      <FileText className="mr-2 h-4 w-4" /> メールテンプレート作成
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/surveys/${survey.id}/responses`}>
                      <BarChart className="mr-2 h-4 w-4" /> 回答一覧
                    </Link>
                    
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`https://v0-hucups-syrvey-nf92aa.vercel.app`}>
                      <GanttChart className="mr-2 h-4 w-4" /> グラフ
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

