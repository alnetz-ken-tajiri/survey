"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useOrganizationContext } from "../ClientPage"
import axios from "axios"
import { useEffect } from "react"
import { mutate } from "swr"

const formSchema = z.object({
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email("有効なメールアドレスを入力してください").optional().or(z.literal("")),
  website: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
})

type OrganizationDetailFormData = z.infer<typeof formSchema>

export default function OrganizationDetailForm() {
  const { toast } = useToast()
  const { state, handler } = useOrganizationContext()
  const { organization } = state

  const form = useForm<OrganizationDetailFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      phone: "",
      email: "",
      website: "",
    },
  })

  const onSubmit = async (data: OrganizationDetailFormData) => {
    if (!organization) {
      toast({
        title: "Error",
        description: "組織が選択されていません。",
        variant: "destructive",
      })
      return
    }

    try {
      if (organization.organizationDetail) {
        await axios.put(`/api/admin/organizations/${organization.id}/detail`, data)
      } else {
        await axios.post(`/api/admin/organizations/${organization.id}/detail`, data)
      }
      handler.mutate()
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations`)
      toast({
        title: "Success",
        description: "組織詳細を更新しました。",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "組織詳細の更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (organization?.organizationDetail) {
      form.reset({
        address: organization.organizationDetail.address || "",
        phone: organization.organizationDetail.phone || "",
        email: organization.organizationDetail.email || "",
        website: organization.organizationDetail.website || "",
      })
    } else {
      form.reset({
        address: "",
        phone: "",
        email: "",
        website: "",
      })
    }
  }, [organization, form])

  console.log(organization?.organizationDetail)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>住所</FormLabel>
                <FormControl>
                  <Input placeholder="住所" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>電話番号</FormLabel>
                <FormControl>
                  <Input placeholder="電話番号" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input placeholder="メールアドレス" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webサイト</FormLabel>
                <FormControl>
                  <Input placeholder="Webサイト" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">更新</Button>
      </form>
    </Form>
  )
}

