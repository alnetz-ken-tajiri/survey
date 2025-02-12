// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

// シングルトンで PrismaClient を生成
const prisma = new PrismaClient()

export default prisma
