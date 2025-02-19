"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import Tree from "react-d3-tree"
import { Card } from "@/components/ui/card"
import { useOrganizationContext } from "./ClientPage"
import type { TreeResponse } from "@/app/api/admin/organizations/tree/route"

export default function OrganizationTree() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null)
  const {
    state: { organization, setOrganization, selectedNodeId, setSelectedNodeId, isLoading, isValidating },
    data: { organizations },
  } = useOrganizationContext()

  useEffect(() => {
    if (organizations) {
      const tree = buildTree(organizations.organizations, organizations.relationships)
      if (tree) {
        setTreeData(tree)
      }
    }
  }, [organizations])

  const initialScale = 0.7
  const containerRef = useRef<HTMLDivElement>(null)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [translate, setTranslate] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (containerRef.current && !translate) {
      const { offsetWidth, offsetHeight } = containerRef.current
      setDimensions({
        width: offsetWidth,
        height: offsetHeight,
      })
      setTranslate({
        x: offsetWidth / 2,
        y: 100,
      })
    }
  }, [translate])

  const defaultTreeData = {
    name: "",
    children: [],
  }

  useEffect(() => {
    if (organization) {
      console.log(organization)
    }
  }, [organization])

  function renderCustomNode({ nodeDatum, toggleNode }: any) {
    const isSelected = selectedNodeId === nodeDatum.id

    return (
      <foreignObject key={nodeDatum.id} width="200" height="100" x="-100" y="-50">
        <div
          className={`p-2 rounded-lg cursor-pointer shadow-sm ${isSelected ? "bg-primary/10" : "bg-background"}`}
          style={{ border: "2px solid hsl(var(--primary))" }}
          onClick={() => {
            setOrganization(nodeDatum)
            setSelectedNodeId(nodeDatum.id)
          }}
        >
          <h3 className="font-semibold text-primary">{nodeDatum.name}</h3>
          {nodeDatum.attributes?.leader && (
            <p className="text-sm text-muted-foreground">代表者: {nodeDatum.attributes.leader}</p>
          )}
        </div>
      </foreignObject>
    )
  }

  return (
    <Card className="h-[70vh] p-4">
      {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}
      {isValidating && <Loader2 className="w-6 h-6 animate-spin" />}
      <div ref={containerRef} className="w-full h-full" style={{ visibility: isLoading ? "hidden" : "visible" }}>
        {translate && (
          <Tree
            data={treeData || defaultTreeData}
            translate={translate}
            zoom={initialScale}
            scaleExtent={{ min: 0.1, max: 2 }}
            orientation="vertical"
            pathFunc="elbow"
            separation={{ siblings: 2, nonSiblings: 2 }}
            nodeSize={{ x: 120, y: 100 }}
            renderCustomNodeElement={renderCustomNode}
          />
        )}
      </div>
    </Card>
  )
}




export interface TreeNode {
  id: string
  name: string
  attributes?: {
    leader?: string
  }
  organizationDetail?: {
    address?: string
    phone?: string
    email?: string
    website?: string
  }
  children?: TreeNode[]
}

export function buildTree(
  organizations: TreeResponse["organizations"],
  relationships: TreeResponse["relationships"],
): TreeNode | null {
  const nodeMap = new Map<string, TreeNode>()

  // Create nodes for all organizations
  organizations.forEach((org) => {
    nodeMap.set(org.id, {
      id: org.id,
      name: org.name,
      attributes: {
        leader: org.leader?.name,
      },
      organizationDetail: org.organizationDetail
      ? {
          address: org.organizationDetail.address ?? undefined,
          phone: org.organizationDetail.phone ?? undefined,
          email: org.organizationDetail.email ?? undefined,
          website: org.organizationDetail.website ?? undefined,
        }
      : undefined,
      children: [],
    })
  })

  // Build the tree structure
  relationships.forEach((rel) => {
    if (rel.depth === 1) {
      const parent = nodeMap.get(rel.ancestorId)
      const child = nodeMap.get(rel.descendantId)
      if (parent && child) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(child)
      }
    }
  })

  // Find the root node (node with no parent)
  const rootNode = Array.from(nodeMap.values()).find((node) => {
    return !relationships.some((rel) => rel.depth === 1 && rel.descendantId === node.id)
  })

  return rootNode || null
}

