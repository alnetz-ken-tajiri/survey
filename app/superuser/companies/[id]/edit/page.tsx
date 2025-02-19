"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const companySchema = z.object({
  companyName: z.string().min(1, "会社名は必須です"),
  companyCode: z.string().min(1, "会社コードは必須です"),
  companyDetail: z
    .object({
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
      website: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
      corporateNumber: z.string().length(13, "法人番号は13桁で入力してください").optional().or(z.literal("")),
      establishedDate: z.string().optional(),
      representativeName: z.string().optional(),
      businessDescription: z.string().optional(),
      numberOfEmployees: z
        .number()
        .int("整数を入力してください")
        .positive("正の数を入力してください")
        .optional()
        .nullable(),
      capital: z.number().positive("正の数を入力してください").optional().nullable(),
      fiscalYearEnd: z.number().int().min(1).max(12, "1から12の数字を入力してください").optional().nullable(),
      industry: z.string().optional(),
      logoUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
      linkedinUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
      twitterUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
      facebookUrl: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
    })
    .optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

export default function CompanyDetailEditPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [companyName, setCompanyName] = useState("")

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      companyCode: "",
      companyDetail: {
        address: "",
        phone: "",
        email: "",
        website: "",
        corporateNumber: "",
        establishedDate: "",
        representativeName: "",
        businessDescription: "",
        numberOfEmployees: undefined,
        capital: undefined,
        fiscalYearEnd: undefined,
        industry: "",
        logoUrl: "",
        linkedinUrl: "",
        twitterUrl: "",
        facebookUrl: "",
      },
    },
  })

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get(`/api/superuser/companies/${params.id}`)
        const { name, companyDetail, companyCode } = response.data
        setCompanyName(name)
        if (companyDetail) {
          form.reset({
            companyName: name,
            companyCode: companyCode,
            companyDetail: {
              ...companyDetail,
              establishedDate: companyDetail.establishedDate
                ? format(new Date(companyDetail.establishedDate), "yyyy-MM-dd")
                : undefined,
            },
          })
        }
      } catch (error) {
        console.error("Error fetching company details:", error)
        toast({
          title: "エラーが発生しました",
          description: "会社詳細情報の取得中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [params.id, form, toast])

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const cleanedData = {
        ...data,
        companyDetail: data.companyDetail
          ? Object.fromEntries(
              Object.entries(data.companyDetail).filter(([_, value]) => value !== "" && value !== undefined),
            )
          : undefined,
      }
      await axios.put(`/api/superuser/companies/${params.id}`, cleanedData)
      toast({
        title: "更新成功",
        description: "会社情報が正常に更新されました。",
      })
      router.push(`/superuser/companies/${params.id}`)
    } catch (error) {
      console.error("Error updating company:", error)
      toast({
        title: "エラーが発生しました",
        description: "会社情報の更新中にエラーが発生しました。",
        variant: "destructive",
      })
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
        詳細ページに戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{companyName} - 詳細情報編集</CardTitle>
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
              <FormField
                control={form.control}
                name="companyDetail.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>住所</FormLabel>
                    <FormControl>
                      <Input placeholder="住所を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input placeholder="電話番号を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input placeholder="メールアドレスを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ウェブサイト</FormLabel>
                    <FormControl>
                      <Input placeholder="ウェブサイトURLを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.corporateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>法人番号</FormLabel>
                    <FormControl>
                      <Input placeholder="13桁の法人番号を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.establishedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>設立日</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.representativeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>代表者名</FormLabel>
                    <FormControl>
                      <Input placeholder="代表者名を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>事業内容</FormLabel>
                    <FormControl>
                      <Textarea placeholder="事業内容を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.numberOfEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>従業員数</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="従業員数を入力"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.capital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>資本金</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="資本金を入力"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>単位: 円</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.fiscalYearEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>決算月</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1-12の数字を入力"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>業種</FormLabel>
                    <FormControl>
                      <Input placeholder="業種を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ロゴURL</FormLabel>
                    <FormControl>
                      <Input placeholder="ロゴ画像のURLを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="LinkedInのURLを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter URL</FormLabel>
                    <FormControl>
                      <Input placeholder="TwitterのURLを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyDetail.facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="FacebookのURLを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">更新</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

