import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({ where: { id: params.id } })
  return NextResponse.json(category)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { name, parentId } = await request.json()
  const category = await prisma.category.update({ where: { id: params.id }, data: { name, parentId } })
  return NextResponse.json(category)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const category = await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json(category)
}
