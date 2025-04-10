"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { RawRecord } from "@/types/admin/surveys/surveys"
import mockData from "@/data/mock-data"

interface GroupedRecord {
  userId: string
  category: string
  avgCategoryDeviation?: number
}

interface DataTableProps {
  data: RawRecord[]
  groupedData: GroupedRecord[]
  overallData: { userId: string; employeeNumber: string; avgScore: number; overallDeviation: number }[]
}

export default function DataTable({ data, groupedData, overallData }: DataTableProps) {
  const [page, setPage] = useState(1)
  const rowsPerPage = 5
  const totalPages = Math.ceil(data.length / rowsPerPage)

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentPageData = data.slice(startIndex, endIndex)

  // カテゴリー偏差値と全体偏差値のマッピングを作成
  const deviationMap = useMemo(() => {
    // ユーザーとカテゴリーごとの平均カテゴリー偏差値のマップ
    const categoryDeviationMap = new Map<string, Map<string, number>>()

    // ユーザーごとの全体偏差値のマップ
    const overallDeviationMap = new Map<string, number>()

    // カテゴリー偏差値のマッピング
    mockData.grouped.forEach((group) => {
      if (!categoryDeviationMap.has(group.userId)) {
        categoryDeviationMap.set(group.userId, new Map<string, number>())
      }
      categoryDeviationMap.get(group.userId)?.set(group.category, group.avgCategoryDeviation || 50)
    })

    // 全体偏差値のマッピング
    mockData.overall.forEach((item) => {
      overallDeviationMap.set(item.userId, item.overallDeviation)
    })

    return {
      getCategoryDeviation: (userId: string, category: string) => {
        return categoryDeviationMap.get(userId)?.get(category) ?? 50
      },
      getOverallDeviation: (userId: string) => {
        return overallDeviationMap.get(userId) ?? 50
      },
    }
  }, [])

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/30">
              <TableHead className="font-semibold">ユーザー</TableHead>
              <TableHead className="font-semibold">カテゴリー</TableHead>
              <TableHead className="font-semibold">質問</TableHead>
              <TableHead className="font-semibold">回答値</TableHead>
              <TableHead className="font-semibold">回答ラベル</TableHead>
              <TableHead className="font-semibold">質問偏差値</TableHead>
              <TableHead className="font-semibold">カテゴリー偏差値</TableHead>
              <TableHead className="font-semibold">全体偏差値</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.map((record, index) => {
              // 既存のデータを使用
              const categoryDeviation = deviationMap.getCategoryDeviation(record.userId, record.category)
              const overallDeviation = deviationMap.getOverallDeviation(record.userId)

              return (
                <TableRow key={index} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-medium">{record.employeeNumber}</TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell>{record.questionName}</TableCell>
                  <TableCell className="text-center">{record.numericValue}</TableCell>
                  <TableCell>{record.optionLabel}</TableCell>
                  <TableCell className="text-center">{record.questionDeviation.toFixed(1)}</TableCell>
                  <TableCell className="text-center">{categoryDeviation.toFixed(1)}</TableCell>
                  <TableCell className="text-center">{overallDeviation.toFixed(1)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="py-4 border-t">
          <Pagination className="mt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className={`${page === 1 ? "pointer-events-none opacity-50" : ""} transition-colors`}
                  aria-disabled={page === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setPage(i + 1)}
                    isActive={page === i + 1}
                    className="transition-colors"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className={`${page === totalPages ? "pointer-events-none opacity-50" : ""} transition-colors`}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

