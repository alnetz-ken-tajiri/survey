import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function setCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return setCorsHeaders(new Response(null, { status: 204 }));
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const category = await prisma.category.findUnique({
      where: { id: id },
    });
    if (!category || category.deletedAt) {
      return setCorsHeaders(
        NextResponse.json({ error: 'Category not found' }, { status: 404 })
      );
    }
    return setCorsHeaders(NextResponse.json(category));
  } catch (error) {
    console.error(`Failed to fetch category with id ${params.id}:`, error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Failed to fetch category' },
        { status: 500 }
      )
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, parentId } = body;

    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: {
        name,
        parentId,
      },
    });
    return setCorsHeaders(NextResponse.json(updatedCategory));
  } catch (error) {
    console.error(`Failed to update category with id ${params.id}:`, error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      )
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.category.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
    return setCorsHeaders(new NextResponse(null, { status: 204 }));
  } catch (error) {
    console.error(`Failed to delete category with id ${params.id}:`, error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      )
    );
  }
} 