"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Plus, Edit } from "lucide-react"

interface QuestionGroup {
  id: string
  name: string
  description: string
  fileUrl: string
}

export default function QuestionGroups() {
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuestionGroups = async () => {
      try {
        const response = await axios.get("/api/admin/questionGroups")
        setQuestionGroups(response.data)
      } catch (error) {
        console.error("Error fetching question groups:", error)
        toast({
          title: "エラーが発生しました",
          description: "質問セットの取得に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestionGroups()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">質問セット一覧</h1>
        <Link href="/admin/questionGroups/create" passHref>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> 新規質問セット作成
          </Button>
        </Link>
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {questionGroups.map((group) => (
          <motion.div key={group.id} variants={cardVariants}>
            <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
              <div className="relative h-48">
                <Image
                  src={group.fileUrl || "/placeholder.svg"}
                  alt={group.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold line-clamp-1">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3">{group.description}</p>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Link href={`/admin/questionGroups/${group.id}/edit`} passHref className="w-full">
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" /> 編集
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {questionGroups.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          質問セットがありません。新しい質問セットを作成してください。
        </div>
      )}
    </div>
  )
}

