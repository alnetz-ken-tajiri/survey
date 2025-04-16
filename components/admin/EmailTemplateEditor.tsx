"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Variable } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import cn from "classnames"
import axios from "axios"
import type { Prisma } from "@prisma/client"
import { Editor } from "@/components/ui/editor"

// ====== Types ======
type Survey = Prisma.SurveyGetPayload<{
  include: {
    questionGroup: {
      include: {
        questionGroupQuestions: {
          include: {
            question: {
              include: {
                tags: true
                questionOptions: true
              }
            }
          }
        }
      }
    }
  }
}>

interface EmailTemplateEditorProps {
  surveyId: string
  initialData?: EmailTemplateData
}

interface EmailTemplateData {
  id?: string
  name: string
  subject: string
  content: string
  variables: string[]
}

// 表示用のラベルは定数として管理
const AVAILABLE_VARIABLES = {
  "user.name": "回答者名",
  "user.email": "メールアドレス",
  "survey.name": "サーベイ名",
  "survey.url": "サーベイURL",
  "date.response": "回答日",
  "date.deadline": "締切日",
} as const

// テンプレート内の変数を検出する関数
function detectVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) || []
  return matches.map((match) => match.replace(/[{}]/g, "")).filter((key) => key in AVAILABLE_VARIABLES)
}

export function EmailTemplateEditor({ surveyId, initialData }: EmailTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState("edit")
  const [templateData, setTemplateData] = useState<EmailTemplateData>(() => {
    const defaultContent = getDefaultTemplate()
    return (
      initialData || {
        name: "",
        subject: "",
        content: defaultContent,
        variables: detectVariables(defaultContent),
      }
    )
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) State to store the fetched survey
  // ─────────────────────────────────────────────────────────────────────────────
  const [surveyData, setSurveyData] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Fetch survey data inside useEffect
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSurveyData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await axios.get<Survey>(`/api/admin/surveys/${surveyId}`)
        setSurveyData(data)
      } catch (error) {
        console.error("Failed to fetch survey data:", error)
        setError("サーベイデータの取得に失敗しました。")
        // エラーが発生しても、最低限の機能は提供する
        toast({
          title: "エラー",
          description: "サーベイデータの取得に失敗しました。一部の機能が制限される場合があります。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurveyData()
  }, [surveyId, toast])



  // ─────────────────────────────────────────────────────────────────────────────
  // Validation function
  // ─────────────────────────────────────────────────────────────────────────────
  const validateTemplate = () => {
    const errors: string[] = []
    if (!templateData.name.trim()) {
      errors.push("テンプレート名は必須です")
    }
    if (!templateData.subject.trim()) {
      errors.push("件名は必須です")
    }
    if (!templateData.content.trim()) {
      errors.push("本文は必須です")
    }
    return errors
  }

  const insertVariable = (variable: string) => {
    const newContent = templateData.content + `{{${variable}}}`
    setTemplateData((prev) => ({
      ...prev,
      content: newContent,
      variables: detectVariables(newContent),
    }))
  }

  const handleContentChange = (content: string) => {
    setTemplateData((prev) => ({
      ...prev,
      content,
      variables: detectVariables(content),
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Save handler
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errors = validateTemplate()
    if (errors.length > 0) {
      toast({
        title: "入力エラー",
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      })
      return
    }

    try {
      // 保存前に最終的な変数を検出
      const finalVariables = detectVariables(templateData.content)

      const response = await fetch(`/api/admin/surveys/${surveyId}/emailTemplate`, {
        method: initialData?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...templateData,
          id: initialData?.id,
          name: templateData.name.trim(),
          subject: templateData.subject.trim(),
          content: templateData.content.trim(),
          variables: finalVariables,
        }),
      })

      if (!response.ok) throw new Error("Failed to save template")

      const savedTemplate = await response.json()
      console.log("Saved template:", savedTemplate)

      toast({
        title: "テンプレートを保存しました",
        description: "メールテンプレートが正常に保存されました。",
      })
    } catch (error) {
      console.error("Failed to save template:", error)
      toast({
        title: "エラー",
        description: "テンプレートの保存に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>メールテンプレートの編集</CardTitle>
          <CardDescription>
            サーベイ送信時に使用するメールテンプレートをカスタマイズできます。
            {isLoading && " データを読み込み中..."}
            {error && <span className="text-red-500"> {error}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">テンプレート名</Label>
              <Input
                id="name"
                value={templateData.name}
                onChange={(e) => setTemplateData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例: リマインダーメール"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">件名</Label>
              <Input
                id="subject"
                value={templateData.subject}
                onChange={(e) => setTemplateData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="例: サーベイご回答のお願い"
                required
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="edit">編集</TabsTrigger>
                <TabsTrigger value="preview">プレビュー</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Label className="w-full">利用可能な変数</Label>
                  {Object.entries(AVAILABLE_VARIABLES).map(([key, label]) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className={cn(
                        "cursor-pointer hover:bg-secondary/80",
                        templateData.variables.includes(key) ? "bg-primary text-primary-foreground" : "",
                      )}
                      onClick={() => insertVariable(key)}
                    >
                      <Variable className="w-3 h-3 mr-1" />
                      {label}
                    </Badge>
                  ))}
                </div>
                <Editor
                  value={templateData.content}
                  onChange={handleContentChange}
                  placeholder="メール本文を入力してください..."
                />
              </TabsContent>
              <TabsContent value="preview">
                <Card>
                  <CardContent className="prose max-w-none p-6">
                    {isLoading ? (
                      <div className="py-4 text-center">プレビューを読み込み中...</div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: replaceVariables(templateData.content, {
                            "user.name": "山田太郎",
                            "user.email": "yamada@example.com",
                            "survey.name": surveyData?.name ?? "従業員満足度調査",
                            "survey.url": `${process.env.NEXT_PUBLIC_APP_URL}/user/surveys/${surveyId}`,
                            "date.response": "2024年2月14日",
                            "date.deadline": surveyData?.deadline
                              ? new Date(surveyData.deadline).toLocaleDateString()
                              : "2024年3月31日",
                          }),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline">キャンセル</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                保存
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// A default HTML template for the editor
function getDefaultTemplate() {
  return `
<p>{{user.name}} 様</p>

<p>お世話になっております。<br>
{{survey.name}}へのご回答をお願いいたします。</p>

<p>以下のURLからアクセスしてください：<br>
<a href="{{survey.url}}">{{survey.url}}</a></p>

<p>回答期限：{{date.deadline}}</p>

<p>ご協力のほど、よろしくお願いいたします。</p>
  `.trim()
}

// Simple utility to replace {{variable}} placeholders in the template
function replaceVariables(content: string, variables: Record<string, string>) {
  return content.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return variables[key] ?? `{{${key}}}`
  })
}
