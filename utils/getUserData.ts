"use client "

import axios from "axios"
import { useSession } from "next-auth/react"
import { Prisma } from "@prisma/client"

type UserData = Prisma.UserGetPayload<{
    include: {
        employee: {
          include: {
            company: true,
            organization: true,
            leadOrganizations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
}>

export async function getUserData(): Promise<UserData | null> {
  const { data: session } = useSession()
  const user = session?.user

  if (!user) {
    return null
  }

  const response  = await axios.get<UserData>(`/api/admin/users/${user.id}`)
  
  return response.data
}