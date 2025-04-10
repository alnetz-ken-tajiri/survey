"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, Search, ArrowLeft, FileText, CheckSquare, Circle, ListFilter } from "lucide-react"
import Image from "next/image"

interface Survey {
  id: string
  name: string
  startDate: string | null
  deadline: string | null
  image: string | null
  status: string
  questionGroup: QuestionGroup
  surveyTargets: SurveyTarget[]
}

interface QuestionGroup {
  id: string
  name: string
  description: string | null
  fileUrl: string | null
  questionGroupQuestions: QuestionGroupQuestion[]
}

interface QuestionGroupQuestion {
  questionId: string
  question: Question
}

interface Question {
  id: string
  name: string
  description: string | null
  type: string
}

interface SurveyTarget {
  id: string
  status: string
  user: {
    id: string
    email: string
    employee: {
      name: string | null
      number: string | null
    } | null
  }
  responses: Response[]
}

interface Response {
  id: string
  questionId: string
  questionName: string
  responseDetails: ResponseDetail[]
}

interface ResponseDetail {
  id: string
  questionOptionId: string | null
  optionLabel: string | null
  optionValue: string | null
  textValue: string | null
}

export default function SurveyResponses({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchSurveyResponses = async () => {
      try {
        const response = await axios.get(`/api/admin/surveys/${params.id}/responses`)
        setSurvey(response.data)
        console.log("取得したサーベイデータ:", JSON.stringify(response.data, null, 2))
      } catch (error) {
        console.error("サーベイ回答の取得中にエラーが発生しました:", error)
        toast({
          title: "エラーが発生しました",
          description: "サーベイ回答の取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurveyResponses()
  }, [params.id])

  const filteredTargets =
    survey?.surveyTargets.filter(
      (target) =>
        target.user.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.user.employee?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const renderQuestionResponse = (question: Question, responses: Response[]) => {
    // 質問IDに一致するレスポンスを探す
    const response = responses.find((r) => r.questionId === question.id)

    if (!response || !response.responseDetails || response.responseDetails.length === 0) {
      return <p>回答なし</p>
    }

    return (
      <div>
        {response.responseDetails.map((detail, index) => {
          // ファイルタイプの場合
          if (question.type === "FILE" && detail.textValue?.startsWith("/uploads/")) {
            return (
              <div key={index} className="flex items-center mb-2">
                <FileText className="mr-2 h-4 w-4" />
                <a
                  href={detail.textValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  アップロードされたファイル {index + 1}
                </a>
              </div>
            )
          }
          // チェックボックスタイプの場合
          else if (question.type === "CHECKBOX" && detail.optionLabel) {
            return (
              <div key={index} className="flex items-center mb-2">
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>
                  {detail.optionLabel}: {detail.optionValue}
                </span>
              </div>
            )
          }
          // ラジオボタンタイプの場合
          else if (question.type === "RADIO" && detail.optionLabel) {
            return (
              <div key={index} className="flex items-center mb-2">
                <Circle className="mr-2 h-4 w-4" />
                <span>
                  {detail.optionLabel}: {detail.optionValue}
                </span>
              </div>
            )
          }
          // セレクトタイプの場合
          else if (question.type === "SELECT" && detail.optionLabel) {
            return (
              <div key={index} className="flex items-center mb-2">
                <ListFilter className="mr-2 h-4 w-4" />
                <span>
                  {detail.optionLabel}: {detail.optionValue}
                </span>
              </div>
            )
          }
          // テキストタイプの場合
          else if (question.type === "TEXT" && detail.textValue && !detail.textValue.startsWith("/uploads/")) {
            return (
              <p key={index} className="mb-2">
                {detail.textValue}
              </p>
            )
          }
          return null
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!survey) {
    return <div>サーベイが見つかりません。</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" onClick={() => router.push("/admin/surveys")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        サーベイ一覧に戻る
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{survey.name}</CardTitle>
          <CardDescription>
            開始日: {survey.startDate ? format(new Date(survey.startDate), "yyyy/MM/dd", { locale: ja }) : "未設定"}
            {" | "}
            締切日: {survey.deadline ? format(new Date(survey.deadline), "yyyy/MM/dd", { locale: ja }) : "未設定"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <StatusBadge variant={survey.status === "ACTIVE" ? "default" : "secondary"}>
              {survey.status === "ACTIVE" ? "アクティブ" : "非アクティブ"}
            </StatusBadge>
            <span>{filteredTargets.length} 件の回答</span>
          </div>
          <div>
            <h3 className="font-semibold mb-2">質問グループ: {survey.questionGroup.name}</h3>
            <p>{survey.questionGroup.description}</p>
            {survey.image && (
              <div className="relative h-48 mt-4 rounded-lg overflow-hidden">
                <Image
                  src={survey.image || "/placeholder.svg"}
                  alt={survey.name}
                  fill
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="名前、社員番号、メールアドレスで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>回答者</TableHead>
            <TableHead>社員番号</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>回答</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTargets.map((target) => (
            <TableRow key={target.id}>
              <TableCell>{target.user.employee?.name || "未設定"}</TableCell>
              <TableCell>{target.user.employee?.number || "未設定"}</TableCell>
              <TableCell>{target.user.email}</TableCell>
              <TableCell>
                <StatusBadge variant={target.status === "COMPLETED" ? "success" : "warning"}>
                  {target.status === "COMPLETED" ? "完了" : "未完了"}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="responses">
                    <AccordionTrigger>回答を表示</AccordionTrigger>
                    <AccordionContent>
                      {survey.questionGroup.questionGroupQuestions.map((qgq) => (
                        <Card key={qgq.questionId} className="mb-4">
                          <CardHeader>
                            <CardTitle className="text-lg">{qgq.question.name}</CardTitle>
                            {qgq.question.description && <CardDescription>{qgq.question.description}</CardDescription>}
                          </CardHeader>
                          <CardContent>{renderQuestionResponse(qgq.question, target.responses)}</CardContent>
                        </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

