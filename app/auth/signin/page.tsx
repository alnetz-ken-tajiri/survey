"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function SignIn() {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const searchParams = new URLSearchParams(window.location.search)
      const callbackUrl = searchParams.get("callbackUrl") || "/"

      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (res?.error) {
        toast({
          title: "ログイン失敗",
          description: res.error,
          variant: "destructive",
        })
      } else if (res?.ok && res.url) {
        window.location.href = res.url
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "ログイン処理中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setLoading(true)
    const searchParams = new URLSearchParams(window.location.search)
    const callbackUrl = searchParams.get("callbackUrl") || "/"
    signIn("google", { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-1">
              <Image
                src="/images/hitokara.png"
                alt="Hitokara"
                width={280}
                height={60}
                className="mx-auto mt-4"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome back</h1>
            <p className="text-gray-600 text-lg">Sign in to your Hitokara account</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-10">
                <form onSubmit={handleCredentialsSignIn} className="space-y-6">
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="email" className="text-gray-800 font-semibold text-sm">
                        Email address
                      </Label>
                      <div className="relative mt-2">
                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-14 bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 rounded-xl text-lg pl-12"
                          placeholder="you@example.com"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-gray-800 font-semibold text-sm">
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-14 bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 rounded-xl text-lg pl-12 pr-14"
                          placeholder="••••••••"
                          disabled={loading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  {/* Google Login Button */}
                  {/* <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full h-14 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      <>
                        <FaGoogle className="mr-3 text-red-500" />
                        Sign in with Google
                      </>
                    )}
                  </Button> */}

                  <div className="text-center pt-6">
                    <p className="text-gray-600 text-sm">
                      {"Don't have an account? "}
                      <Link href="/auth/register" className="text-gray-900 font-semibold hover:text-gray-700">
                        Create account
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-gray-500 text-xs">powered by</span>
              <Image
                src="/images/Sinmido_logo.png"
                alt="Sinmido"
                width={50}
                height={20}
                className="opacity-60"
                priority
              />
            </div>
            <p className="text-gray-400 text-xs">© 2024 Sinmido. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
