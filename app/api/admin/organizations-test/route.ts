import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createOrganization, updateOrganization } from "@/app/api/admin/organizations-test/service"


export async function GET(request: NextRequest) {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        leader: {
          select: {
            id: true,
            name: true,
          },
        },
        ancestorRelationships: {
          where: { depth: 1 },
          select: { ancestorId: true },
        },
      },
    })

    const formattedOrganizations = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      parentId: org.ancestorRelationships[0]?.ancestorId || null,
      leaderId: org.leaderId,
      leaderName: org.leader?.name,
    }))

    return NextResponse.json(formattedOrganizations)
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    let organization

    if (data.id) {
      organization = await updateOrganization(data.id, data)
    } else {
      organization = await createOrganization(data)
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Error creating/updating organization:", error)
    return NextResponse.json({ error: "Failed to create/update organization" }, { status: 500 })
  }
}

