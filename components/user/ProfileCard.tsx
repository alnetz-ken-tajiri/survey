"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, Mail, User, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function ProfileCard() {
  const { data: session } = useSession()

  if (!session) {
    return <div>ログインしていません</div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full overflow-hidden bg-[#25262b] border-[#2f3136]">
        <div className="h-32 relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
            animate={{
              background: [
                "linear-gradient(to right, #3b82f6, #8b5cf6)",
                "linear-gradient(to right, #8b5cf6, #3b82f6)",
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          />
        </div>
        <CardContent className="relative pt-16">
          <Avatar className="w-32 h-32 absolute -top-16 left-1/2 transform -translate-x-1/2 border-4 border-[#25262b]">
            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
            <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white">{session.user?.name}</h3>
            <p className="text-blue-400">{session.user?.role}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm bg-[#2f3136] p-3 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-gray-100">{session.user?.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm bg-[#2f3136] p-3 rounded-lg">
              <User className="w-5 h-5 text-purple-400" />
              <span className="text-gray-100">ユーザーID: {session.user?.id}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm bg-[#2f3136] p-3 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-gray-100">役割: {session.user?.role}</span>
            </div>
          </div>
          <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white" variant="default">
            <Edit className="w-4 h-4 mr-2" /> プロフィールを編集
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

