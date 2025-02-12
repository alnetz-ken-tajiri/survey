import prisma from "@/lib/prisma"

export async function createOrganization(data: any) {
  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      companyId: data.companyId,
      leaderId: data.leaderId,
    },
  })

  if (data.parentId) {
    await prisma.organizationRelationship.create({
      data: {
        ancestorId: data.parentId,
        descendantId: organization.id,
        depth: 1,
        companyId: data.companyId,
      },
    })
  }

  return organization
}

export async function updateOrganization(id: string, data: any) {
  const organization = await prisma.organization.update({
    where: { id },
    data: {
      name: data.name,
      leaderId: data.leaderId,
    },
  })

  if (data.parentId) {
    // 既存の関係を削除
    await prisma.organizationRelationship.deleteMany({
      where: {
        descendantId: id,
        depth: 1,
      },
    })

    // 新しい関係を作成
    await prisma.organizationRelationship.create({
      data: {
        ancestorId: data.parentId,
        descendantId: id,
        depth: 1,
        companyId: data.companyId,
      },
    })
  }

  return organization
}

