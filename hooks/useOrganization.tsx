import { useCallback, useEffect, useState } from "react"
import type { Prisma } from "@prisma/client"
import type { TreeResponse } from "@/app/api/admin/organizations/tree/route"
import { useSwrData } from "@/hooks/useSwrData"

type Organization = Prisma.OrganizationGetPayload<{
  include: { leader: true }
}>

type UpdateFormState = {
  id: string
  name: string
  parentId?: string | null
  leaderId?: string | null
  deleted?: boolean
}

export const useOrganization = () => {
  const {
    data: organizations,
    isLoading,
    isValidating,
    mutate: mutateOrganizations,
  } = useSwrData<TreeResponse>("/api/admin/organizations/tree")

  const [organization, setOrganization] = useState<Organization | undefined>(undefined)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [updateFormState, setUpdateFormState] = useState<UpdateFormState | null>(null)

  useEffect(() => {
    if (organizations && organization) {
      const org = organizations.organizations.find((org) => org.id === organization.id)
      const rel = organizations.relationships.find((rel) => rel.descendantId === org?.id && rel.depth === 1)
      if (org) {
        setUpdateFormState({
          id: org.id,
          name: org.name,
          parentId: rel?.ancestorId ?? null,
          leaderId: org.leader?.id ?? null,
          deleted: org.deletedAt !== null,
        })
      }
    }
  }, [organizations, organization])

  const mutate = useCallback(() => {
    mutateOrganizations()
  }, [mutateOrganizations])

  const resetUpdateFormState = useCallback(() => {
    setUpdateFormState(null)
    setSelectedNodeId(null)
    setOrganization(undefined)
  }, [])

  return {
    state: {
      organization,
      setOrganization,
      selectedNodeId,
      setSelectedNodeId,
      updateFormState,
      setUpdateFormState,
      isValidating,
      isLoading,
    },
    data: {
      organizations,
    },
    handler: {
      mutate,
      resetUpdateFormState,
    },
  }
}

