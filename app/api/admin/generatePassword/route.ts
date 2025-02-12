import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  const { length, useSpecialChars, useNumbers, useUppercase } = await request.json()

  let charset = 'abcdefghijklmnopqrstuvwxyz'
  if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (useNumbers) charset += '0123456789'
  if (useSpecialChars) charset += '!@#$%^&*()_+{}[]|:;<>,.?/~'

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  return NextResponse.json({ password, hashedPassword })
}
