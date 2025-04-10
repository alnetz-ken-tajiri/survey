"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

// 共通スタイルをインポートして使用
import { gradientButtonClass } from "@/styles/admin/questionGroups/styles"

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
            <Keyboard className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>キーボードショートカット</TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>キーボードショートカット</DialogTitle>
            <DialogDescription>このフォームで使用できるキーボードショートカットの一覧です。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <div className="text-right font-medium">Ctrl + Shift + A</div>
              <div>質問追加ダイアログを開く</div>
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <div className="text-right font-medium">Ctrl + Shift + S</div>
              <div>フォームを送信</div>
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <div className="text-right font-medium">Ctrl + Shift + K</div>
              <div>キーボードショートカット一覧を表示</div>
            </div>
          </div>
          <DialogFooter>
            {/* 閉じるボタンのスタイル */}
            <Button type="button" onClick={() => setIsOpen(false)} className={gradientButtonClass}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

