"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const UserRole = {
  USER: "USER",
  SUPER_USER: "SUPER_USER",
  ADMIN: "ADMIN",
  USER_ADMIN: "USER_ADMIN",
} as const

const userSchema = z.object({
  loginId: z.string().min(1, "必須項目です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上である必要があります"),
  avatar: z.any().optional(),
  employeeName: z.string().optional(),
  employeeNumber: z.string().optional(),
  organizationId: z.string().optional(),
  role: z.enum([UserRole.USER, UserRole.SUPER_USER, UserRole.ADMIN, UserRole.USER_ADMIN]),
})

type UserFormValues = z.infer<typeof userSchema>

export default function CreateUser() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      loginId: "",
      email: "",
      password: "",
      avatar: undefined,
      employeeName: "",
      employeeNumber: "",
      organizationId: "",
      role: UserRole.USER,
    },
  })

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get("/api/admin/organizations")
        setOrganizations(response.data)
      } catch (error) {
        console.error("Error fetching organizations:", error)
        toast({
          title: "エラーが発生しました",
          description: "組織情報の取得に失敗しました。",
          variant: "destructive",
        })
      }
    }

    fetchOrganizations()
  }, [])

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("loginId", data.loginId)
      formData.append("email", data.email)
      formData.append("password", data.password)
      if (data.employeeName) formData.append("employeeName", data.employeeName)
      if (data.employeeNumber) formData.append("employeeNumber", data.employeeNumber)
      if (data.organizationId) formData.append("organizationId", data.organizationId)
      if (data.avatar && data.avatar[0]) formData.append("avatar", data.avatar[0])
      formData.append("role", data.role)

      await axios.post("/api/admin/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast({
        title: "ユーザーが作成されました",
        description: "新しいユーザーが正常に作成されました。",
      })
      router.push("/admin/users")
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "エラーが発生しました",
        description: "ユーザーの作成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      form.setValue("avatar", [file])
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>ユーザー作成</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback>{form.watch("loginId")?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="avatar"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>アバター</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleAvatarChange(e)
                          onChange(e.target.files)
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="loginId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ログインID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>従業員名</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>従業員番号</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所属組織</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="所属組織を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ロール</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="ロールを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.USER}>ユーザー</SelectItem>
                      <SelectItem value={UserRole.SUPER_USER}>スーパーユーザー</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>管理者</SelectItem>
                      <SelectItem value={UserRole.USER_ADMIN}>ユーザー兼管理者</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "作成中..." : "ユーザーを作成"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

