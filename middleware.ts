import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // ルートパスへのアクセスをロールに基づいてリダイレクト
    if (path === "/") {
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url))
      } else if (["USER", "SUPER_USER", "USER_ADMIN"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/user", req.url))
      }
    }

    // 管理者ルートの保護
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user", req.url))
    }

    // ユーザールートの保護
    if (path.startsWith("/user") && !["USER", "SUPER_USER", "USER_ADMIN", "ADMIN"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
)

export const config = {
  matcher: ["/((?!auth).*)", "/admin/:path*", "/user/:path*"],
}

