"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, Plus, FileText, Trash2 } from "lucide-react"
import Link from "next/link"

interface Company {
  id: string
  companyName: string
  companyCode: string
  createdAt: string
  updatedAt: string
}

export default function CompanyListPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/superuser/companies")
      setCompanies(response.data)
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "エラーが発生しました",
        description: "会社情報の取得中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("本当にこの会社を削除しますか？")) {
      try {
        await axios.delete(`/api/superuser/companies/${id}`)
        toast({
          title: "削除成功",
          description: "会社が正常に削除されました。",
        })
        fetchCompanies()
      } catch (error) {
        console.error("Error deleting company:", error)
        toast({
          title: "エラーが発生しました",
          description: "会社の削除中にエラーが発生しました。",
          variant: "destructive",
        })
      }
    }
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.companyCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>会社一覧</CardTitle>
          <Link href="/superuser/companies/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 新規会社登録
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="会社名または会社コードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>会社名</TableHead>
                <TableHead>会社コード</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>更新日</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.companyName}</TableCell>
                  <TableCell>{company.companyCode}</TableCell>
                  <TableCell>{new Date(company.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(company.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/superuser/companies/${company.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" /> 詳細
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(company.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> 削除
                      </Button>
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

