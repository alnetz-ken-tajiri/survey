"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, User, Users, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface UserFilterProps {
  users: { id: string; name: string }[]
  selectedUsers: string[]
  onChange: (selectedUsers: string[]) => void
}

export function UserFilter({ users, selectedUsers, onChange }: UserFilterProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const allSelected = selectedUsers.includes("all")

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users
    return users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [users, searchQuery])

  const handleAllChange = (checked: boolean) => {
    if (checked) {
      onChange(["all"])
    } else {
      onChange([])
    }
  }

  const handleUserChange = (userId: string, checked: boolean) => {
    if (checked) {
      // 「すべて」が選択されている場合は解除して、選択したユーザーのみを選択
      const newSelected = allSelected ? [userId] : [...selectedUsers, userId]
      onChange(newSelected)
    } else {
      // チェックを外した場合は、そのユーザーを選択から削除
      onChange(selectedUsers.filter((id) => id !== userId))
    }
  }

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <div className="flex items-center px-3 py-2 border-b bg-muted/20">
        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          placeholder="ユーザーを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
        />
      </div>

      <div className="p-2">
        <div
          className={cn(
            "flex items-center space-x-2 rounded-md px-3 py-2 transition-colors",
            allSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted cursor-pointer",
          )}
          onClick={() => handleAllChange(!allSelected)}
        >
          <div
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-md border",
              allSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30",
            )}
          >
            {allSelected && <Check className="h-3.5 w-3.5" />}
          </div>
          <div className="flex items-center space-x-2">
            <Users className={cn("h-4 w-4", allSelected ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("font-medium", allSelected ? "text-primary" : "")}>すべてのユーザー</span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[180px]">
        <div className="p-2 pt-0 space-y-1">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center space-x-2 rounded-md px-3 py-2 transition-colors",
                selectedUsers.includes(user.id) && !allSelected
                  ? "bg-secondary/50 border border-secondary/30"
                  : "hover:bg-muted cursor-pointer",
              )}
              onClick={() => !allSelected && handleUserChange(user.id, !selectedUsers.includes(user.id))}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-md border",
                  selectedUsers.includes(user.id) || allSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30",
                )}
              >
                {(selectedUsers.includes(user.id) || allSelected) && <Check className="h-3.5 w-3.5" />}
              </div>
              <div className="flex items-center space-x-2">
                <User
                  className={cn(
                    "h-4 w-4",
                    selectedUsers.includes(user.id) || allSelected
                      ? allSelected
                        ? "text-muted-foreground"
                        : "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    allSelected ? "text-muted-foreground" : "",
                    selectedUsers.includes(user.id) && !allSelected ? "text-primary" : "",
                  )}
                >
                  {user.name}
                </span>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">ユーザーが見つかりません</div>
          )}
        </div>
      </ScrollArea>

      {!allSelected && selectedUsers.length > 0 && (
        <div className="p-2 border-t bg-muted/20 flex flex-wrap gap-1">
          {selectedUsers.map((userId) => {
            const user = users.find((u) => u.id === userId)
            return user ? (
              <Badge
                key={userId}
                variant="outline"
                className="flex items-center gap-1 bg-secondary/30 hover:bg-secondary/40"
              >
                {user.name}
                <button
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                  onClick={() => handleUserChange(userId, false)}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}

