"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { UserSelector } from "@/components/admin/surveys/graph/user-selector"
import { BarChart3, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface FilterCardProps {
  users: { id: string; name: string }[]
  selectedUsers: string[]
  onSelectedUsersChange: (users: string[]) => void
  useDeviation: boolean
  onUseDeviationChange: (useDeviation: boolean) => void
  dataPoints: number
}

export function FilterCard({
  users,
  selectedUsers,
  onSelectedUsersChange,
  useDeviation,
  onUseDeviationChange,
  dataPoints,
}: FilterCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // フィルターが適用されているかどうかを確認
  const hasActiveFilters = selectedUsers.length > 0 || useDeviation

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">サーベイデータ分析</h2>
          <Badge variant="outline" className="ml-2">
            {dataPoints} データポイント
          </Badge>
        </div>

        <Button variant="outline" className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Filter className="h-4 w-4" />
          フィルター設定
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {selectedUsers.length > 0 && useDeviation ? "2" : "1"}
            </Badge>
          )}
        </Button>
      </div>

      {/* 現在のフィルター状態を表示 */}
      <Card className="mb-6 bg-gray-50 border-gray-200">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">ユーザー:</span>
              <span>{selectedUsers.length === 0 ? "すべて" : `${selectedUsers.length}名選択中`}</span>
            </div>

            <div className="w-px h-4 bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <span className="font-medium">表示モード:</span>
              <span>{useDeviation ? "偏差値" : "生の値"}</span>
            </div>

            <div className="w-px h-4 bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{dataPoints}</span>
              <span className="text-gray-500">データポイント</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* フィルター設定ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              データフィルター設定
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
            {/* ユーザーフィルター (8列) */}
            <div className="lg:col-span-8">
              <UserSelector users={users} selectedUsers={selectedUsers} onChange={onSelectedUsersChange} />
            </div>

            {/* 表示モード (4列) */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-2 block">表示モード</Label>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">偏差値表示</div>
                      <div className="text-xs text-muted-foreground">
                        {useDeviation ? "偏差値で表示" : "生の値で表示"}
                      </div>
                    </div>
                    <Switch
                      checked={useDeviation}
                      onCheckedChange={onUseDeviationChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 p-4 rounded-lg border bg-blue-50 text-blue-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">データポイント</div>
                    <div className="text-xl font-bold">{dataPoints}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>適用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

