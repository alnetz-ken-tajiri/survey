"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const companySchema = z.object({
  companyName: z.string().min(1, "会社名は必須です"),
  companyCode: z.string().min(1, "会社コードは必須です"),
})

type CompanyFormData = z.infer<typeof companySchema>

export default function CreateCompanyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      companyCode: "",
    },
  })

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true)
    try {
      await axios.post("/api/superuser/companies", data)
      toast({
        title: "登録成功",
        description: "新しい会社が正常に登録されました。",
      })
      router.push("/superuser/companies")
    } catch (error) {
      console.error("Error creating company:", error)
      toast({
        title: "エラーが発生しました",
        description: "会社情報の登録中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Link
        href="/superuser/companies"
        className="flex items-center mb-4 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        会社一覧に戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>新規会社登録</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>会社名</FormLabel>
                    <FormControl>
                      <Input placeholder="会社名を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>会社コード</FormLabel>
                    <FormControl>
                      <Input placeholder="会社コードを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  "登録"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

