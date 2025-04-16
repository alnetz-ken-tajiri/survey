import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // ※ 既定のサインイン画面など「全員アクセスOKにしたい」パスは
    //    下記の分岐より先に処理して、return NextResponse.next() で早期returnする。

    // 1) /initialize は特に保護せず通す
    if (path === "/initialize") {
      return NextResponse.next()
    }

    // 2) superuserSession のチェックなど、独自要件はここで
    const superuserSession = req.cookies.get("superuser_session")
    if (path === "/superuser/login") {
      if (superuserSession) {
        return NextResponse.redirect(new URL("/superuser", req.url))
      }
      return NextResponse.next()
    }

    // 3) ルートパス `/` にアクセスした場合
    if (path === "/") {
      // 管理者など → /admin
      if (["ADMIN", "SUPER_USER", "USER_ADMIN"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      // 一般ユーザー → /user （アンケート一覧など）
      if (token?.role === "USER") {
        return NextResponse.redirect(new URL("/user/surveys", req.url))
      }
    }

    // 4) /admin 配下は ADMIN / SUPER_USER / USER_ADMIN のみ
    if (path.startsWith("/admin")) {
      if (!["ADMIN", "SUPER_USER", "USER_ADMIN"].includes(token?.role as string)) {
        // 権限がなければリダイレクト
        return NextResponse.redirect(new URL("/user/surveys", req.url))
      }
      // 権限OKなら通す
      return NextResponse.next()
    }

    // 5) /user 配下の保護
    if (path.startsWith("/user")) {
      // 未ログインや無権限の場合はサインイン画面へ
      if (!token?.role) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }

      // 5-1) ADMIN / SUPER_USER / USER_ADMIN はすべて /user 配下OK
      if (["ADMIN", "SUPER_USER", "USER_ADMIN"].includes(token?.role as string)) {
        return NextResponse.next()
      }

      // 5-2) USER ロールだけはさらに制限: 「/user/surveys」以下のみOK
      if (token?.role === "USER") {
        if (path.startsWith("/user/surveys")) {
          // OK
          return NextResponse.next()
        } else {
          // surveys以外にはアクセスさせたくないので、強制リダイレクト
          return NextResponse.redirect(new URL("/user/surveys", req.url))
        }
      }
    }

    // それ以外のパスは特に保護しないので通す
    return NextResponse.next()
  },
  {
    callbacks: {
      // NextAuth のデフォルト: 「token があれば authorized」
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
)

export const config = {
  matcher: ["/", "/admin/:path*", "/user/:path*", "/initialize"],
}
