"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface CategoryResult {
  id: string
  name: string
  parentId: string | null
  children?: CategoryResult[]
}

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: CategoryResult[]
  onCategoryCreated: (category: CategoryResult) => void
  companyId: string | null
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  categories,
  onCategoryCreated,
  companyId,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("")
  const [parentId, setParentId] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: "エラー",
        description: "カテゴリー名を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post("/api/admin/categories", {
        name,
        parentId: parentId === "null" || parentId === "" ? null : parentId,
        companyId: companyId,
      })

      toast({
        title: "カテゴリーが作成されました",
        description: "新しいカテゴリーが正常に作成されました。",
      })

      onCategoryCreated(response.data)
      setName("")
      setParentId(undefined)
      onOpenChange(false)
    } catch (error) {
      console.error("カテゴリーの作成中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "カテゴリーの作成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // カテゴリーのフラット化（階層構造を平坦なリストに変換）
  const flattenCategories = (
    categories: CategoryResult[],
    depth = 0,
  ): { id: string; name: string; depth: number }[] => {
    let result: { id: string; name: string; depth: number }[] = []

    categories.forEach((category) => {
      result.push({ id: category.id, name: category.name, depth })
      if (category.children && category.children.length > 0) {
        result = [...result, ...flattenCategories(category.children, depth + 1)]
      }
    })

    return result
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新規カテゴリー作成</DialogTitle>
          <DialogDescription>
            新しいカテゴリーを作成します。必要に応じて親カテゴリーを選択してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                カテゴリー名
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="カテゴリー名を入力"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                親カテゴリー
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="col-span-3" id="parent">
                  <SelectValue placeholder="親カテゴリーを選択（オプション）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">なし（トップレベル）</SelectItem>
                  {flattenCategories(categories).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {Array(category.depth).fill("　").join("")}
                      {category.depth > 0 ? "└ " : ""}
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

