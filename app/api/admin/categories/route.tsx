import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId")
  const categories = await prisma.category.findMany({ where: { companyId } })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const { name, parentId } = await request.json()
  const category = await prisma.category.create({ data: { name, parentId } })
  return NextResponse.json(category)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const category = await prisma.category.delete({ where: { id } })
  return NextResponse.json(category)
}  


