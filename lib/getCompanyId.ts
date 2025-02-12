import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"



/**
 * 認証セッションから会社IDを取得する関数
 * @returns 会社ID
 */
export async function getCompanyId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const userId = session.user.id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employee: true },
  })

  if (!user?.employee?.companyId) throw new Error("Company ID is required")
  return user.employee.companyId
}
