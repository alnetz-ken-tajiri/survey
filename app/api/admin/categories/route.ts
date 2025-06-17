import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCompanyId } from "@/lib/getCompanyId";

const prisma = new PrismaClient();

function buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category,
      children: buildCategoryTree(categories, category.id),
    }));
}

export async function GET(request: Request) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID not found" },
        { status: 400 }
      );
    }
    const categories = await prisma.category.findMany({
      where: { companyId: companyId, deletedAt: null },
      orderBy: {
        createdAt: "asc",
      },
    });

    const categoryTree = buildCategoryTree(categories);

    return NextResponse.json(categoryTree);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID not found" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        parentId,
        companyId: companyId,
      },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
} 