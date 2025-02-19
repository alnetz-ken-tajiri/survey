import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function isAuthenticated() {
  const superuserSession = cookies().get("superuser_session")
  return superuserSession !== undefined
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        organizationDetail: true,
        leader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Error fetching organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, leaderId, organizationDetail } = await request.json()

    const updatedOrganization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name,
        leaderId,
        organizationDetail: {
          upsert: {
            create: organizationDetail,
            update: organizationDetail,
          },
        },
      },
      include: {
        organizationDetail: true,
        leader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    console.error("Error updating organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.organization.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Organization deleted successfully" })
  } catch (error) {
    console.error("Error deleting organization:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

