"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { FaEnvelope, FaLock, FaUser, FaBuilding, FaIdCard } from "react-icons/fa";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import React from 'react'; // Added import for React

interface RegisterFormData {
  loginId: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyCode: string;
  employeeNumber: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    loginId: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyCode: "",
    employeeNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "エラー",
        description: "パスワードが一致しません",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: formData.loginId,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          companyCode: formData.companyCode,
          employeeNumber: formData.employeeNumber,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      toast({
        title: "登録完了",
        description: "アカウントが作成されました。",
      });

      router.push('/auth/signin');
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "登録に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <motion.h1
        className="text-4xl font-bold text-white mb-8 tracking-wide"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        HuCups
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">アカウント登録</CardTitle>
            <CardDescription className="text-center">
              必要な情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginId">ログインID</Label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="loginId"
                    name="loginId"
                    type="text"
                    placeholder="ログインID"
                    className="pl-10"
                    value={formData.loginId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">会社名</Label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="会社名"
                    className="pl-10"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyCode">会社コード</Label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="companyCode"
                    name="companyCode"
                    type="text"
                    placeholder="会社コード"
                    className="pl-10"
                    value={formData.companyCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeNumber">社員番号</Label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="employeeNumber"
                    name="employeeNumber"
                    type="text"
                    placeholder="社員番号"
                    className="pl-10"
                    value={formData.employeeNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "登録中..." : "登録"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              onClick={() => router.push('/auth/signin')}
              className="text-sm"
            >
              すでにアカウントをお持ちの方はこちら
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
