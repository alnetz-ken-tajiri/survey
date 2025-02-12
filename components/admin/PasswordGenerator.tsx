"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"


export default function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [hashedPassword, setHashedPassword] = useState("")
  const [length, setLength] = useState(12)
  const [useSpecialChars, setUseSpecialChars] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useUppercase, setUseUppercase] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const generatePassword = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/generatePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          length,
          useSpecialChars,
          useNumbers,
          useUppercase,
        }),
      })
      const data = await response.json()
      setPassword(data.password)
      setHashedPassword(data.hashedPassword)
    } catch (error) {
      console.error("Error generating password:", error)
      toast({
        title: "エラー",
        description: "パスワードの生成中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "コピーしました",
          description: description,
        })
      },
      (err) => {
        console.error("コピーに失敗しました: ", err)
      },
    )
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <Label htmlFor="password-length">パスワードの長さ: {length}</Label>
        <Slider
          id="password-length"
          min={8}
          max={32}
          step={1}
          value={[length]}
          onValueChange={(value) => setLength(value[0])}
          className="mt-2"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="special-chars">特殊文字を含める</Label>
          <Switch id="special-chars" checked={useSpecialChars} onCheckedChange={setUseSpecialChars} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="numbers">数字を含める</Label>
          <Switch id="numbers" checked={useNumbers} onCheckedChange={setUseNumbers} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="uppercase">大文字を含める</Label>
          <Switch id="uppercase" checked={useUppercase} onCheckedChange={setUseUppercase} />
        </div>
      </div>
      <Button onClick={generatePassword} className="w-full mt-4" disabled={isLoading}>
        {isLoading ? "生成中..." : "パスワードを生成"}
      </Button>
      <div className="mt-4">
        <Label htmlFor="generated-password">生成されたパスワード</Label>
        <div className="flex mt-2">
          <Input id="generated-password" value={password} readOnly className="flex-grow" />
          <Button
            onClick={() => copyToClipboard(password, "パスワードがクリップボードにコピーされました。")}
            className="ml-2"
          >
            コピー
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="hashed-password">ハッシュ化されたパスワード</Label>
        <div className="flex mt-2">
          <Input id="hashed-password" value={hashedPassword} readOnly className="flex-grow" />
          <Button
            onClick={() =>
              copyToClipboard(hashedPassword, "ハッシュ化されたパスワードがクリップボードにコピーされました。")
            }
            className="ml-2"
          >
            コピー
          </Button>
        </div>
      </div>
    </div>
  )
}

