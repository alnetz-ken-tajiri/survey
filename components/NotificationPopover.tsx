import { Bell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  title: string
  message: string
  createdAt: string
}

interface NotificationPopoverProps {
  notifications: Notification[]
  isLoading?: boolean
}

export function NotificationPopover({ notifications, isLoading = false }: NotificationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {!isLoading && notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h4 className="font-medium leading-none mb-4">通知</h4>
        <ScrollArea className="h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">新しい通知はありません</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-b pb-2 last:border-b-0">
                  <h5 className="font-medium">{notification.title}</h5>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

