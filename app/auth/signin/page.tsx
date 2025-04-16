"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SignIn() {
  const { toast } = useToast() // toast フックを使用
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    // URLクエリから callbackUrl を取得（App Routerの場合）
    // ─────────────────────────────────────────
    // useSearchParamsフックなどで取る書き方（App Router想定）
    // (Pages Routerなら useRouter().query.callbackUrl など別の書き方)
    const searchParams = new URLSearchParams(window.location.search)
    const callbackUrl = searchParams.get("callbackUrl") || "/"
  
    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl, // 取得したcallbackUrlを渡す
      redirect: true, 
    })
  
    // redirect=trueの場合、ログイン成功時は即リロード＆リダイレクトし、
    // ここでのreturnは呼ばれない(エラー時は呼ばれる)
    if (res?.error) {
      toast({
        title: "ログイン失敗",
        description: res.error,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-700 ">
      <motion.h1
        className="text-4xl font-bold text-white mb-8 tracking-wide"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        HuCups
      </motion.h1>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-[350px] shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">ログイン</CardTitle>
            <CardDescription className="text-center">アカウントにサインインしてください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCredentialsSignIn}>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                メール・パスワードでログイン
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full bg-white hover:bg-gray-100" onClick={() => signIn("google")}>
              <FaGoogle className="mr-2" />
              Googleでログイン
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center">
          <Link href="/auth/register" className="text-sm text-blue-600 hover:underline">
            新規登録はこちら
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

