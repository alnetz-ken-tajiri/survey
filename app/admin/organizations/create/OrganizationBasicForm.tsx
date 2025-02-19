"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useOrganizationContext } from "../ClientPage"
import { useSwrData } from "@/hooks/useSwrData"
import axios from "axios"
import { mutate } from "swr"
import { useEffect } from "react"
import { hasTopLevel } from "@/lib/utils"

const formSchema = z.object({
  id: z.string().optional(),
  companyId: z.string().optional(),
  name: z.string().min(1, { message: "組織名は必須です" }),
  parentId: z.string().nullable().optional(),
  leaderId: z.string().nullable().optional(),
  deleted: z.boolean().default(false),
})

type OrganizationBasicFormData = z.infer<typeof formSchema>

export default function OrganizationBasicForm() {
  const { toast } = useToast()
  const { handler, state, data } = useOrganizationContext()
  const { organization } = state
  const { organizations: tree } = data

  const isTopLevel = hasTopLevel(tree?.relationships || [])
  const { data: organizations, isLoading: isLoadingOrgs } = useSwrData<any[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations`,
  )
  const { data: employees, isLoading: isLoadingEmployees } = useSwrData<any[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employees`,
  )

  const hasTopLevelOrganization = organizations?.some((org) => org.parentId === null)

  const form = useForm<OrganizationBasicFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      parentId: hasTopLevelOrganization ? undefined : null,
      leaderId: null,
      deleted: false,
    },
  })

  const onSubmit = async (data: OrganizationBasicFormData) => {
    try {
      const submissionData = {
        ...data,
        parentId: data.parentId || null,
        leaderId: data.leaderId || null,
      }
      if (state.updateFormState?.id) {
        await axios.put(`/api/admin/organizations/${state.updateFormState.id}`, submissionData)
      } else {
        await axios.post("/api/admin/organizations", submissionData)
      }
      handler.mutate()
      mutate(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations`)
      toast({
        title: "Success",
        description: state.updateFormState?.id ? "組織を更新しました。" : "組織を作成しました。",
      })
      handler.resetUpdateFormState()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: state.updateFormState?.id ? "組織の更新に失敗しました。" : "組織の作成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    form.reset()
    handler.resetUpdateFormState()
  }

  useEffect(() => {
    if (state.updateFormState) {
      form.reset({
        id: state.updateFormState.id,
        name: state.updateFormState.name,
        parentId: state.updateFormState.parentId || null,
        leaderId: state.updateFormState.leaderId || null,
        deleted: state.updateFormState.deleted || false,
      })
    } else {
      form.reset({
        name: "",
        parentId: hasTopLevelOrganization ? undefined : null,
        leaderId: null,
        deleted: false,
      })
    }
  }, [state.updateFormState, form, hasTopLevelOrganization])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>組織名</FormLabel>
              <FormControl>
                <Input placeholder="組織名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>親組織</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                  value={field.value || "null"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="親組織を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingOrgs ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : (
                      <>
                        {!isTopLevel && <SelectItem value="null">親組織なし</SelectItem>}
                        {organizations
                          ?.filter((org) => org.id !== organization?.id)
                          .map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leaderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>代表者</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                  value={field.value || "null"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="代表者を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">代表者なし</SelectItem>
                    {isLoadingEmployees ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : (
                      employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="deleted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">削除</FormLabel>
                <FormDescription>この組織を削除します</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="submit">{state.updateFormState?.id ? "更新" : "登録"}</Button>
          {state.updateFormState && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

