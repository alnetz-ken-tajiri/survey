"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrganizationBasicForm from "./OrganizationBasicForm"
import OrganizationDetailForm from "./OrganizationDetailForm"
import { useOrganizationContext } from "../ClientPage"

export default function CreateForm() {
  const { state } = useOrganizationContext()
  const { organization } = state

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">基本情報</TabsTrigger>
        <TabsTrigger value="detail" disabled={!organization}>
          詳細情報
        </TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <OrganizationBasicForm />
      </TabsContent>
      <TabsContent value="detail">{organization && <OrganizationDetailForm />}</TabsContent>
    </Tabs>
  )
}

