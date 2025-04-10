"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name: string
}

interface UserSelectorProps {
  users: User[]
  selectedUsers: string[]
  onChange: (users: string[]) => void
}

export function UserSelector({ users, selectedUsers, onChange }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users
    return users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [users, searchQuery])

  const handleUserChange = (userId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedUsers, userId])
    } else {
      onChange(selectedUsers.filter((id) => id !== userId))
    }
  }

  const clearSelection = () => {
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">ユーザー選択</Label>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={clearSelection}>
              クリア
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Badge variant="secondary" className="text-xs">
            {selectedUsers.length === 0 ? "すべてのユーザー" : `${selectedUsers.length} / ${users.length}`}
          </Badge>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center px-3 py-2 border-b bg-gray-50">
          <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
          <Input
            placeholder="ユーザーを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
          />
        </div>

        <ScrollArea className="h-[180px] bg-white">
          <div className="p-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-2 rounded-md px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleUserChange(user.id, !!checked)}
                  className="h-4 w-4 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <label htmlFor={`user-${user.id}`} className="text-sm flex-grow cursor-pointer">
                  {user.name}
                </label>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">ユーザーが見つかりません</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

