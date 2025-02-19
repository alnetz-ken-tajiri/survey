"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, ArrowLeft, Info, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const organizationSchema = z.object({
  name: z.string().min(1, "組織名は必須です"),
  leaderId: z.string().optional(),
  organizationDetail: z
    .object({
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
      website: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
    })
    .optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

export default function CreateOrganizationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      leaderId: "",
      organizationDetail: {
        address: "",
        phone: "",
        email: "",
        website: "",
      },
    },
  })

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await axios.post("/api/superuser/organizations", {
        ...data,
        companyId: params.id,
      })
      toast({
        title: "登録成功",
        description: "新しい組織が正常に登録されました。",
      })
      router.push(`/superuser/companies/${params.id}`)
    } catch (error) {
      console.error("Error creating organization:", error)
      if (error instanceof AxiosError && error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error)
      } else {
        setError("組織情報の登録中に予期せぬエラーが発生しました。")
      }
      toast({
        title: "エラーが発生しました",
        description: "組織情報の登録中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Link
        href={`/superuser/companies/${params.id}`}
        className="flex items-center mb-4 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        会社詳細に戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>新規トップレベル組織登録</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>注意</AlertTitle>
            <AlertDescription>
              ここで作成する組織は、会社直下のトップレベル組織となります。
              下位組織の作成は、組織詳細画面から行ってください。
            </AlertDescription>
          </Alert>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>組織名</FormLabel>
                    <FormControl>
                      <Input placeholder="組織名を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leaderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>リーダーID</FormLabel>
                    <FormControl>
                      <Input placeholder="リーダーIDを入力（オプション）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationDetail.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>住所</FormLabel>
                    <FormControl>
                      <Input placeholder="住所を入力（オプション）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationDetail.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input placeholder="電話番号を入力（オプション）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationDetail.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input placeholder="メールアドレスを入力（オプション）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationDetail.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ウェブサイト</FormLabel>
                    <FormControl>
                      <Input placeholder="ウェブサイトURLを入力（オプション）" {...field} />
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
                  "トップレベル組織を登録"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

