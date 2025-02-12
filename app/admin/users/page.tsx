"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import axios from "axios"
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import type { Prisma } from "@prisma/client"

type User = Prisma.UserGetPayload<{
  include: {
    employee: {
      include: {
        leadOrganizations: true
      }
    }
  }
}>

const columnHelper = createColumnHelper<User>()

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>("/api/admin/users")
      setUsers(response.data)
    } catch (error) {
      console.error("ユーザー情報の取得中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "ユーザー情報の取得に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("本当にこのユーザーを削除しますか？")) {
      try {
        await axios.delete(`/api/admin/users/${id}`)
        toast({
          title: "ユーザーが削除されました",
          description: "ユーザー情報が正常に削除されました。",
        })
        fetchUsers()
      } catch (error) {
        console.error("ユーザーの削除中にエラーが発生しました:", error)
        toast({
          title: "エラーが発生しました",
          description: "ユーザーの削除に失敗しました。",
          variant: "destructive",
        })
      }
    }
  }

  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      columnHelper.accessor("loginId", {
        header: "ログインID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "メールアドレス",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("role", {
        header: "ロール",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.employee?.name ?? "-", {
        id: "employeeName",
        header: "従業員名",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.employee?.number ?? "-", {
        id: "employeeNumber",
        header: "従業員番号",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "actions",
        header: "操作",
        cell: (props) => (
          <>
            <Link href={`/admin/users/${props.row.original.id}/edit`}>
              <Button variant="outline" className="mr-2">
                編集
              </Button>
            </Link>
            <Button variant="destructive" onClick={() => handleDelete(props.row.original.id)}>
              削除
            </Button>
          </>
        ),
      }),
    ],
    [handleDelete], // Added handleDelete to dependencies
  )

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ユーザー一覧</h1>
        <Link href="/admin/users/create">
          <Button>新規ユーザー作成</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left p-2 bg-gray-100 border">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

