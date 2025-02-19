"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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

export default function EditOrganizationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        const response = await axios.get(`/api/superuser/organizations/${params.organizationId}`)
        const { name, leaderId, organizationDetail } = response.data
        form.reset({
          name,
          leaderId: leaderId || "",
          organizationDetail: {
            address: organizationDetail?.address || "",
            phone: organizationDetail?.phone || "",
            email: organizationDetail?.email || "",
            website: organizationDetail?.website || "",
          },
        })
      } catch (error) {
        console.error("Error fetching organization details:", error)
        toast({
          title: "エラーが発生しました",
          description: "組織詳細情報の取得中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizationDetails()
  }, [params.organizationId, form, toast])

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)
    try {
      await axios.put(`/api/superuser/organizations/${params.organizationId}`, data)
      toast({
        title: "更新成功",
        description: "組織情報が正常に更新されました。",
      })
      router.push(`/superuser/companies/${params.id}`)
    } catch (error) {
      console.error("Error updating organization:", error)
      toast({
        title: "エラーが発生しました",
        description: "組織情報の更新中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
          <CardTitle>組織情報編集</CardTitle>
        </CardHeader>
        <CardContent>
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
                    更新中...
                  </>
                ) : (
                  "更新"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

