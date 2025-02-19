"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, Edit, Plus, FileText } from "lucide-react"
import Link from "next/link"

interface CompanyDetail {
  id: string
  companyName: string
  companyCode: string
  createdAt: string
  updatedAt: string
  companyDetail?: {
    address?: string
    phone?: string
    email?: string
    website?: string
    corporateNumber?: string
    establishedDate?: string
    representativeName?: string
    businessDescription?: string
    numberOfEmployees?: number
    capital?: number
    fiscalYearEnd?: number
    industry?: string
    logoUrl?: string
    linkedinUrl?: string
    twitterUrl?: string
    facebookUrl?: string
  }
}

interface Organization {
  id: string
  name: string
  leaderId: string | null
  leader: {
    id: string
    name: string
  } | null
  organizationDetail: {
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
  } | null
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const [companyResponse, organizationsResponse] = await Promise.all([
          axios.get(`/api/superuser/companies/${params.id}`),
          axios.get(`/api/superuser/organizations?companyId=${params.id}`),
        ])
        setCompany(companyResponse.data)
        setOrganizations(organizationsResponse.data)
      } catch (error) {
        console.error("Error fetching company details:", error)
        toast({
          title: "エラーが発生しました",
          description: "会社詳細情報の取得中にエラーが発生しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Link
        href="/superuser/companies"
        className="flex items-center mb-4 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        会社一覧に戻る
      </Link>
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{company?.companyName} - 詳細情報</CardTitle>
          <Link href={`/superuser/companies/${params.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> 編集
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {company?.companyDetail && (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              {Object.entries(company.companyDetail).map(([key, value]) => {
                if (value) {
                  return (
                    <div key={key} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{value.toString()}</dd>
                    </div>
                  )
                }
                return null
              })}
            </dl>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>トップレベル組織一覧</CardTitle>
          <Link href={`/superuser/companies/${params.id}/organizations/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 新規トップレベル組織登録
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>組織名</TableHead>
                <TableHead>リーダー</TableHead>
                <TableHead>住所</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.leader?.name || "未設定"}</TableCell>
                  <TableCell>{org.organizationDetail?.address || "未設定"}</TableCell>
                  <TableCell>{org.organizationDetail?.phone || "未設定"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/superuser/companies/${params.id}/organizations/${org.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" /> 詳細
                        </Button>
                      </Link>
                      <Link href={`/superuser/companies/${params.id}/organizations/${org.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-2" /> 編集
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

