import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // /initialize へのアクセス処理
    if (path === "/initialize") {
      return NextResponse.next()
    }

    // ルートパスへのアクセスをロールに基づいてリダイレクト
    if (path === "/") {
      if (["ADMIN", "SUPER_USER", "USER_ADMIN"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/admin", req.url))
      } else if (token?.role === "USER") {
        return NextResponse.redirect(new URL("/user", req.url))
      }
    }

    // 管理者ルートの保護
    if (path.startsWith("/admin") && !["ADMIN", "SUPER_USER", "USER_ADMIN"].includes(token?.role as string)) {
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
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path === "/initialize") {
          return true
        }
        return !!token
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
)

export const config = {
  matcher: ["/", "/admin/:path*", "/user/:path*", "/initialize"],
}

