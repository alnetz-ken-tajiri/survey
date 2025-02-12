import NextAuth, { type AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import type { User } from "next-auth"

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) : Promise<User | null> {

        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("メールアドレスとパスワードを入力してください")
          }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // If no user or no password, return null.
        if (!user || !user.password) {
          console.log("ユーザーが見つかりません")
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          console.log("パスワードが間違っています")
          return null
        }

        return {
          id: user.id, // Make sure to return the id here
          email: user.email,
          name: user.loginId,
          role: user.role,
          image : user.avatar,
        }
      } catch (error) {
        console.error("認証エラー:", error)
        return null
      }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT Token before:", token)
      console.log("JWT User:", user)
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log(session)
      console.log(token)

      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
}

export const handler = NextAuth(authOptions)

