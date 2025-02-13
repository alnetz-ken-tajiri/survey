import type React from "react"
import { useSurvey } from "@/contexts/SurveyContext"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react"
import { ColorPicker } from "./ColorPicker"

const colorOptions = [
  "from-blue-500 to-purple-500",
  "from-green-500 to-teal-500",
  "from-red-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-indigo-500 to-blue-500",
  "from-gray-800 to-black",
]

interface SurveyLayoutProps {
  children: React.ReactNode
}

export const SurveyLayout: React.FC<SurveyLayoutProps> = ({ children }) => {
  const { surveyData, userData, isLoadingApiResponse, isLoadingUser, headerColor, setHeaderColor } = useSurvey()

  if (isLoadingApiResponse || isLoadingUser) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-background py-5 relative">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <div
              className={`h-48 bg-cover bg-center relative bg-gradient-to-r ${headerColor}`}
              style={{
                backgroundImage: `url(${surveyData?.fileUrl || "/placeholder.svg"})`,
              }}
            >
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <CardTitle className="text-4xl font-bold text-white mb-2">{surveyData?.name}</CardTitle>
                  <CardDescription className="text-xl text-white/80">{surveyData?.description}</CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder-user.jpg" alt={userData?.employee?.name || "User"} />
                    <AvatarFallback>{userData?.employee?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{userData?.employee?.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <UserIcon className="mr-1 h-4 w-4" />
                      {userData?.employee?.number}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>作成日: {format(new Date(surveyData?.createdAt || ""), "yyyy年MM月dd日")}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    <span>回答日: {format(new Date(), "yyyy年MM月dd日")}</span>
                  </div>
                </div>
              </div>
              {children}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <ColorPicker colors={colorOptions} selectedColor={headerColor} onColorChange={setHeaderColor} />
      </div>
    </div>
  )
}

const LoadingSkeleton: React.FC = () => (
  <div className="container mx-auto py-10 px-4 max-w-5xl">
    <Card>
      <div className="h-48">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="w-full h-64 rounded-lg" />
      </CardContent>
    </Card>
  </div>
)

