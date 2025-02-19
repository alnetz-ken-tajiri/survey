import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function isAuthenticated() {
  const superuserSession = cookies().get("superuser_session")
  return superuserSession !== undefined
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { companyId, name, leaderId, organizationDetail } = await request.json()

    // companyIdの存在確認
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })
    if (!company) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 })
    }

    // leaderIdが指定されている場合、その存在確認
    if (leaderId) {
      const leader = await prisma.employee.findUnique({
        where: { id: leaderId },
      })
      if (!leader) {
        return NextResponse.json({ error: "Invalid leader ID" }, { status: 400 })
      }
    }

    // トランザクション内で組織の作成と関連データの挿入を行う
    const result = await prisma.$transaction(async (prisma) => {
      // 組織を作成
      const organization = await prisma.organization.create({
        data: {
          companyId,
          name,
          leaderId: leaderId || null,
          organizationDetail: organizationDetail
            ? {
              create: organizationDetail,
            }
            : undefined,
        },
      })

      // OrganizationRelationshipを作成（自己参照）
      await prisma.organizationRelationship.create({
        data: {
          ancestorId: organization.id,
          descendantId: organization.id,
          companyId,
          depth: 0,
        },
      })

      return organization
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating organization:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Organization with this name already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    // トップレベルの組織のみを取得
    const topLevelOrganizations = await prisma.organization.findMany({
      where: {
        companyId: companyId,
        deletedAt: null,
        // descendantRelationships に「深さ1」のレコードが存在しなければ、トップレベルと判断
        descendantRelationships: {
          none: {
            depth: 1,
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
    });

    return NextResponse.json(topLevelOrganizations)
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

