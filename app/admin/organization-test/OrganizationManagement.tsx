"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import * as Dialog from "@radix-ui/react-dialog"
import Tree from "react-d3-tree"
import { useSwrData } from "@/hooks/useSwrData"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Organization = {
  id: string
  name: string
  parentId: string | null
  leaderId: string | null
}

type Employee = {
  id: string
  name: string
}

type TreeNode = {
  name: string
  attributes?: {
    id: string
    leaderId: string
  }
  children?: TreeNode[]
}

export default function OrganizationManagement() {
  const {
    data: organizations,
    mutate,
    isLoading: isLoadingOrgs,
  } = useSwrData<Organization[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations`)
  const { data: employees, isLoading: isLoadingEmployees } = useSwrData<Employee[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employees`,
  )
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [treeData, setTreeData] = useState<TreeNode | null>(null)

  const { control, register, handleSubmit, reset } = useForm<Organization>()

  useEffect(() => {
    if (selectedOrg) {
      reset(selectedOrg)
    }
  }, [selectedOrg, reset])

  const buildTreeData = useCallback((orgs: Organization[]): TreeNode => {
    const map = new Map<string, TreeNode>()
    orgs.forEach((org) => {
      map.set(org.id, {
        name: org.name,
        attributes: {
          id: org.id,
          leaderId: org.leaderId || "",
        },
        children: [],
      })
    })

    orgs.forEach((org) => {
      if (org.parentId) {
        const parent = map.get(org.parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(map.get(org.id)!)
        }
      }
    })

    // ルートノードを見つける（親を持たない組織）
    const rootNodes = orgs.filter((org) => !org.parentId).map((org) => map.get(org.id)!)

    // 複数のルートノードがある場合は、それらを直接返す
    return rootNodes.length > 1 ? { name: "組織構造", children: rootNodes } : rootNodes[0]
  }, [])

  useEffect(() => {
    if (organizations) {
      setTreeData(buildTreeData(organizations))
    }
  }, [organizations, buildTreeData])

  const onSubmit = async (data: Organization) => {
    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        mutate()
        setIsDialogOpen(false)
        setSelectedOrg(null)
      }
    } catch (error) {
      console.error("Failed to save organization:", error)
    }
  }

  const handleNodeClick = (nodeData: any) => {
    const org = organizations?.find((o) => o.id === nodeData.data.attributes.id)
    if (org) {
      setSelectedOrg(org)
      setIsDialogOpen(true)
    }
  }

  const handleNodeDragStop = (nodeData: any, targetData: any) => {
    if (nodeData.id === targetData.id) return

    const updatedOrg = {
      ...organizations?.find((org) => org.id === nodeData.id),
      parentId: targetData.id,
    }

    onSubmit(updatedOrg as Organization)
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">組織管理</h1>
      <Button
        onClick={() => {
          setSelectedOrg(null)
          setIsDialogOpen(true)
        }}
      >
        新規組織追加
      </Button>

      <div style={{ width: "100%", height: "400px" }}>
        {treeData && (
          <Tree
            data={treeData}
            orientation="vertical"
            pathFunc="step"
            onNodeClick={handleNodeClick}
            onNodeDragStop={handleNodeDragStop}
            translate={{ x: 200, y: 50 }}
            draggable
          />
        )}
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-xl font-bold mb-4">{selectedOrg ? "組織編集" : "新規組織追加"}</Dialog.Title>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">組織名</Label>
                <Input id="name" {...register("name", { required: true })} />
              </div>
              <div>
                <Label htmlFor="parentId">親組織</Label>
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger>
                        <SelectValue placeholder="親組織を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">親組織なし</SelectItem>
                        {isLoadingOrgs ? (
                          <SelectItem value="0" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          organizations?.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="leaderId">リーダー</Label>
                <Controller
                  name="leaderId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger>
                        <SelectValue placeholder="リーダーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">リーダーなし</SelectItem>
                        {isLoadingEmployees ? (
                          <SelectItem value="0" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          employees?.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="submit">保存</Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Card>
  )
}

