"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { useSwrData } from "@/hooks/useSwrData"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ImageUpload from "./ImageUpload"

interface QuestionGroup {
  id: string
  name: string
  description: string | null
  image: string
}

const formSchema = z.object({
  name: z.string().min(1, "サーベイ名は必須です"),
  questionGroupId: z.string().min(1, "質問グループを選択してください"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  image: z.string().optional(),
})

export default function CreateSurveyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: questionGroups = [], isLoading } = useSwrData<QuestionGroup[]>("/api/admin/questionGroups")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      questionGroupId: "",
      status: "INACTIVE",
      image: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post("/api/admin/surveys", {
        ...values,
        image: values.image || null,
      })
      toast({
        title: "サーベイが作成されました",
        description: `サーベイID: ${response.data.surveyId}`,
      })
      router.push("/admin/surveys")
    } catch (error) {
      console.error("Error creating survey:", error)
      toast({
        title: "エラーが発生しました",
        description: "サーベイの作成中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>サーベイ作成</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サーベイ名</FormLabel>
                    <FormControl>
                      <Input placeholder="サーベイ名を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="questionGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>質問グループ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="質問グループを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {questionGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ステータス</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ステータスを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">アクティブ</SelectItem>
                        <SelectItem value="INACTIVE">非アクティブ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サーベイ画像</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ""} onChange={field.onChange} onRemove={() => field.onChange("")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "作成中..." : "サーベイを作成"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

