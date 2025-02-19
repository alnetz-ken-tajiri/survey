import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const organizationDetail = await prisma.organizationDetail.findUnique({
      where: { organizationId: params.id },
    })

    if (!organizationDetail) {
      return NextResponse.json({ error: "Organization detail not found" }, { status: 404 })
    }

    return NextResponse.json(organizationDetail)
  } catch (error) {
    console.error("Error fetching organization detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { address, phone, email, website } = body

    const organizationDetail = await prisma.organizationDetail.create({
      data: {
        organizationId: params.id,
        address,
        phone,
        email,
        website,
      },
    })

    return NextResponse.json(organizationDetail, { status: 201 })
  } catch (error) {
    console.error("Error creating organization detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { address, phone, email, website } = body

    const updatedOrganizationDetail = await prisma.organizationDetail.update({
      where: { organizationId: params.id },
      data: {
        address,
        phone,
        email,
        website,
      },
    })

    return NextResponse.json(updatedOrganizationDetail)
  } catch (error) {
    console.error("Error updating organization detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.organizationDetail.delete({
      where: { organizationId: params.id },
    })

    return NextResponse.json({ message: "Organization detail deleted successfully" })
  } catch (error) {
    console.error("Error deleting organization detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

