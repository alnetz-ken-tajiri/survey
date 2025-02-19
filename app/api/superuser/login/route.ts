import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as bcrypt from "bcrypt"

// 注意: 本番環境では、これらの値を環境変数から取得するべきです
const SUPERUSER_USERNAME = "admin"
const SUPERUSER_PASSWORD = "$2b$10$2jnMQzbGTxrbjkXSi2YZoeRAuwQWfgTrxCeUykNcTV9eDQJVMoEKy" // mnbvcxz00 bcryptでハッシュ化されたパスワード

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (username === SUPERUSER_USERNAME && (await bcrypt.compare(password, SUPERUSER_PASSWORD))) {
    const sessionToken = await bcrypt.hash(username + Date.now().toString(), 10)

    cookies().set("superuser_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
}

