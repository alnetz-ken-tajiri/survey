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

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: { companyDetail: true },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()
    const { companyName, companyCode, companyDetail } = data

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        companyName,
        companyCode,
        companyDetail: {
          upsert: {
            create: companyDetail,
            update: companyDetail,
          },
        },
      },
      include: { companyDetail: true },
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.company.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ message: "Company deleted successfully" })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

