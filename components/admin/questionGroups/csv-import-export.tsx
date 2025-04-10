"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileUp, FileDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import { parseCSV } from "@/utils/question-utils"
import { useQuestionGroup } from "@/contexts/question-group-context"

// 共通スタイルをインポートして使用
import { gradientButtonClass } from "@/styles/admin/questionGroups/styles"

export function CSVImportExport() {
  const { form, append } = useQuestionGroup()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [csvContent, setCsvContent] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvContent(content)
    }
    reader.readAsText(file)
  }

  const importQuestions = async () => {
    try {
      const parsedQuestions = parseCSV(csvContent)

      // 各質問をAPIに送信して作成
      const createdQuestions = await Promise.all(
        parsedQuestions.map(async (q) => {
          const questionData = {
            name: q.name,
            description: q.description,
            type: q.type,
            options: q.options
              ? q.options.split("|").map((opt) => {
                  const [name, value] = opt.split(":")
                  return { name, value }
                })
              : [],
          }

          const response = await axios.post("/api/admin/questions", questionData)
          return response.data
        }),
      )

      // 作成された質問を追加
      createdQuestions.forEach((question) => {
        append(question)
      })

      setIsImportDialogOpen(false)
      setCsvContent("")

      toast({
        title: "インポート完了",
        description: `${createdQuestions.length}件の質問がインポートされました。`,
      })
    } catch (error) {
      console.error("質問のインポート中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問のインポートに失敗しました。",
        variant: "destructive",
      })
    }
  }

  const exportQuestions = () => {
    const questions = form.getValues("questions")
    let csvData = "name,description,type,options\n"

    questions.forEach((q) => {
      const options = q.questionOptions ? q.questionOptions.map((opt) => `${opt.name}:${opt.value}`).join("|") : ""

      csvData += `${q.name},${q.description || ""},${q.type},${options}\n`
    })

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `question-group-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileUp className="mr-2 h-4 w-4" />
            CSVインポート
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>質問をCSVファイルからインポート</DialogTitle>
            <DialogDescription>
              CSVファイルを選択して質問をインポートします。
              <br />
              ファイルはUTF-8エンコードされている必要があります。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              ファイルを選択
            </Button>
            {csvContent ? (
              <Badge variant="secondary">ファイルが選択されました</Badge>
            ) : (
              <Badge variant="destructive">ファイルが選択されていません</Badge>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsImportDialogOpen(false)}>
              キャンセル
            </Button>
            {/* インポートボタンのスタイル */}
            <Button type="button" onClick={importQuestions} disabled={!csvContent} className={gradientButtonClass}>
              インポート
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={exportQuestions}>
        <FileDown className="mr-2 h-4 w-4" />
        CSVエクスポート
      </Button>
    </>
  )
}

