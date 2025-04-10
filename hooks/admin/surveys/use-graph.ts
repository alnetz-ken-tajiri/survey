"use client"

import { useState, useEffect } from "react"
import mockData from "@/data/mock-data"
import type { RawRecord, GroupedRecord, PivotedRecord, OverallRecord } from "@/types/admin/surveys/surveys"
import type { User } from "@/types/admin/surveys/users"
import axios from "axios"

/**
 * サーベイデータを取得するためのカスタムフック
 * モックデータを使用して、APIリクエストを行わない
 */
export function useGraph(surveyId: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [rawData, setRawData] = useState<RawRecord[]>([])
  const [groupedData, setGroupedData] = useState<GroupedRecord[]>([])
  const [pivotedData, setPivotedData] = useState<PivotedRecord[]>([])
  const [overallData, setOverallData] = useState<OverallRecord[]>([])
  const [questionTagMap, setQuestionTagMap] = useState<Record<string, string>>({})


  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const users = await axios.get(`/api/admin/surveys/${surveyId}/graph/users`)
      const formattedUsers = users.data.map((user: User) => ({
        id: user.employee.number,
        name: `${user.employee.name} (${user.employee.number})`,
      }))
      setUsers(formattedUsers)
      const graphData = await axios.get(`/api/admin/surveys/${surveyId}/graph`)
      setRawData(graphData.data.raw)
      setGroupedData(graphData.data.grouped)
      setPivotedData(graphData.data.pivoted)
      setOverallData(graphData.data.overall)
      setQuestionTagMap(graphData.data.questionTagMap)
      
      setIsLoading(false)
    } catch (err) {
      console.error("Error loading mock data:", err)
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
      setIsLoading(false)
    }
  }


  useEffect(() => {
    // const loadMockData = () => {
    //   setIsLoading(true)
    //   try {
    //     // モックユーザーデータ
    //     const mockUsers: User[] = [
    //       {
    //         id: "cm7d0hfbw00020cl4gedv6u14",
    //         loginId: "admin",
    //         email: "admin@admin.co.jp",
    //         avatar: "https://example.com/avatar.jpg",
    //         role: "ADMIN",
    //         createdAt: "2025-02-20T07:19:24.400Z",
    //         updatedAt: "2025-02-20T07:22:59.885Z",
    //         deletedAt: null,
    //         employee: {
    //           id: "cm7d0kutq00050cl46hp587fz",
    //           name: "admin",
    //           userId: "cm7d0hfbw00020cl4gedv6u14",
    //           number: "admin",
    //           createdAt: "2025-02-20T07:22:44.192Z",
    //           updatedAt: "2025-02-20T07:22:59.885Z",
    //           deletedAt: null,
    //           companyId: "cm7d0dku10000l5037jdkg7m6",
    //           organizationId: null,
    //           organization: null,
    //         },
    //       },
    //     ]

    //     // ユーザーデータをフォーマット
    //     const formattedUsers = mockUsers.map((user) => ({
    //       id: user.employee.number,
    //       name: `${user.employee.name} (${user.employee.number})`,
    //     }))

    //     // モックデータを設定
    //     setUsers(formattedUsers)
    //     setRawData(mockData.raw)
    //     setGroupedData(mockData.grouped)
    //     setPivotedData(mockData.pivoted)
    //     setOverallData(mockData.overall)
    //     setQuestionTagMap(mockData.questionTagMap)

    //     // 遅延をシミュレート
    //     setTimeout(() => {
    //       setIsLoading(false)
    //     }, 500)
    //   } catch (err) {
    //     console.error("Error loading mock data:", err)
    //     setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    //     setIsLoading(false)
    //   }
    // }

    // loadMockData()
    fetchUsers()
  }, [surveyId])


  return {
    isLoading,
    error,
    users,
    rawData,
    groupedData,
    pivotedData,
    overallData,
    questionTagMap,
  }
}

