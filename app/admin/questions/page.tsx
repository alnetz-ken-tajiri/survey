"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Pencil, Trash2, Plus } from "lucide-react"

type Question = {
  id: string
  name: string
  description: string | null
  public: boolean
  type: string
  tags: { name: string }[]
  createdAt: string
}

export default function QuestionList() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/admin/questions")
      setQuestions(response.data)
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("本当にこの質問を削除しますか？")) {
      try {
        await axios.delete(`/api/admin/questions?id=${id}`)
        toast({
          title: "質問が削除されました",
          description: "質問が正常に削除されました。",
        })
        fetchQuestions()
      } catch (error) {
        console.error("Error deleting question:", error)
        toast({
          title: "エラーが発生しました",
          description: "質問の削除に失敗しました。",
          variant: "destructive",
        })
      }
    }
  }

  const filteredQuestions = questions
    .filter(
      (question) =>
        question.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .filter((question) => filterType === "all" || question.type === filterType)
    .sort((a, b) => {
      if (sortBy === "createdAt") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">質問一覧</h1>
        <Button onClick={() => router.push("/admin/questions/create")}>
          <Plus className="mr-2 h-4 w-4" /> 新規作成
        </Button>
      </div>

      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="タイプでフィルタ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="TEXT">テキスト</SelectItem>
            <SelectItem value="RADIO">ラジオボタン</SelectItem>
            <SelectItem value="CHECKBOX">チェックボックス</SelectItem>
            <SelectItem value="SELECT">セレクトボックス</SelectItem>
            <SelectItem value="FILE">ファイル</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">作成日時</SelectItem>
            <SelectItem value="name">質問名</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>質問</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>公開</TableHead>
              <TableHead>タグ</TableHead>
              <TableHead>作成日時</TableHead>
              <TableHead>アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>{question.name}</TableCell>
                <TableCell>{question.type}</TableCell>
                <TableCell>{question.public ? "公開" : "非公開"}</TableCell>
                <TableCell>
                  {question.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </TableCell>
                <TableCell>{new Date(question.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

