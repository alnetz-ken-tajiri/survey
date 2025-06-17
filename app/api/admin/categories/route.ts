import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCompanyId } from "@/lib/getCompanyId";

const prisma = new PrismaClient();

function buildCategoryTree(categories: any[]): any[] {
  const categoryMap: { [key: string]: any } = {};
  const rootCategories: any[] = [];

  categories.forEach((category) => {
    categoryMap[category.id] = { ...category, children: [] };
  });

  categories.forEach((category) => {
    if (category.parentId && categoryMap[category.parentId]) {
      categoryMap[category.parentId].children.push(categoryMap[category.id]);
    } else {
      rootCategories.push(categoryMap[category.id]);
    }
  });

  return rootCategories;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required as a query parameter" },
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
    const body = await request.json();
    const { name, parentId, companyId } = body;

    if (!name || !companyId) {
      return NextResponse.json(
        { error: "Name and companyId are required" },
        { status: 400 }
      );
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