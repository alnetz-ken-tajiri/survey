
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";


export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    const employees = await prisma.employee.findMany({
      where: {
        user: {
          id: userId,

        },
        deletedAt: null,
      },
      include: {
        
      },
    });

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
