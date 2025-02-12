"use client"

import { Separator } from "@/components/ui/separator"
import OrganizationTree from "./OrganizationTree"
import CreateForm from "./create/CreateForm"
import { useOrganization } from "@/hooks/useOrganization"
import { ToastProvider } from "@/components/ui/toast"
import { createContext, useContext, type ReactNode } from "react"

export const OrganizationContext = createContext<ReturnType<typeof useOrganization> | undefined>(undefined)

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const organizationData = useOrganization()

  return <OrganizationContext.Provider value={organizationData}>{children}</OrganizationContext.Provider>
}

export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganizationContext must be used within an OrganizationProvider")
  }
  return context
}

export default function ClientPage() {
  return (
    <OrganizationProvider>
      <ToastProvider>
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <h1 className="text-3xl font-bold">組織構造</h1>
            <p className="text-sm text-muted-foreground">Organization</p>
            <p className="mt-2">組織構造を設定します。部署を設定することで、従業員の所属部署を管理できます。</p>
            <p className="mt-1">
              更新する際は、<em>対象ノード</em>をクリックし、Formに入力してください
            </p>
            <Separator className="my-4" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-3/4">
              <OrganizationTree />
            </div>
            <div className="w-full sm:w-1/4">
              <CreateForm />
            </div>
          </div>
        </div>
      </ToastProvider>
    </OrganizationProvider>
  )
}

