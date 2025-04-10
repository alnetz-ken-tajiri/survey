"use client"

import type React from "react"

import { createContext, useContext, type ReactNode, useState, useCallback, useEffect } from "react"
import axios from "axios"
import { toast } from "@/hooks/use-toast"
import type { Question, Category } from "./question-group-context"

interface QuestionSearchContextType {
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  searchResults: Question[]
  isSearchLoading: boolean
  selectedQuestions: string[]
  setSelectedQuestions: React.Dispatch<React.SetStateAction<string[]>>
  openSearch: boolean
  setOpenSearch: React.Dispatch<React.SetStateAction<boolean>>
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  sortOrder: string
  setSortOrder: React.Dispatch<React.SetStateAction<string>>
  showDescription: boolean
  setShowDescription: React.Dispatch<React.SetStateAction<boolean>>
  showOptions: boolean
  setShowOptions: React.Dispatch<React.SetStateAction<boolean>>
  showTags: boolean
  setShowTags: React.Dispatch<React.SetStateAction<boolean>>
  showCategory: boolean
  setShowCategory: React.Dispatch<React.SetStateAction<boolean>>
  tagFilter: string
  setTagFilter: React.Dispatch<React.SetStateAction<string>>
  availableTags: Array<{ id: string; name: string }>
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  categories: Category[]
  selectedCategories: string[]
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>
  toggleSelectQuestion: (id: string) => void
  searchQuestions: (search: string, type?: string, categoryIds?: string[]) => Promise<void>
  addSelectedQuestions: () => void
  filterType: string
  setFilterType: React.Dispatch<React.SetStateAction<string>>
}

const QuestionSearchContext = createContext<QuestionSearchContextType | undefined>(undefined)

interface QuestionSearchProviderProps {
  children: ReactNode
  append: (question: Question) => void
  filterType: string
}

export function QuestionSearchProvider({
  children,
  append,
  filterType: initialFilterType,
}: QuestionSearchProviderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Question[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [openSearch, setOpenSearch] = useState(false)
  const [activeTab, setActiveTab] = useState("existing")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [showDescription, setShowDescription] = useState<boolean>(true)
  const [showOptions, setShowOptions] = useState<boolean>(true)
  const [showTags, setShowTags] = useState<boolean>(true)
  const [showCategory, setShowCategory] = useState<boolean>(true)
  const [tagFilter, setTagFilter] = useState<string>("")
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string }>>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterType, setFilterType] = useState<string>(initialFilterType)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const fetchTags = useCallback(async () => {
    try {
      const response = await axios.get("/api/admin/hashtags")
      setAvailableTags(response.data)
    } catch (error) {
      console.error("タグの取得中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "タグの取得に失敗しました。",
        variant: "destructive",
      })
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/admin/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("カテゴリーの取得中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "カテゴリーの取得に失敗しました。",
        variant: "destructive",
      })
    }
  }, [])

  const searchQuestions = useCallback(
    async (search: string, type = "all", categoryIds: string[] = []) => {
      try {
        setIsSearchLoading(true)
        let url = `/api/admin/questions/search?q=${search}`
        if (type !== "all") {
          url += `&type=${type}`
        }
        url += `&sort=${sortOrder}`

        // カテゴリーフィルターを追加（複数選択対応）
        if (categoryIds.length > 0) {
          url += `&categoryIds=${categoryIds.join(",")}`
        }

        // タグフィルターを追加
        if (selectedTags.length > 0) {
          url += `&tags=${selectedTags.join(",")}`
        }

        // 検索文字列が空の場合は最近の質問のみを取得
        if (!search.trim() && type === "all" && selectedTags.length === 0 && categoryIds.length === 0) {
          url += "&recent=true"
        }

        const response = await axios.get(url)
        setSearchResults(response.data)
      } catch (error) {
        console.error("質問の検索中にエラーが発生しました:", error)
        toast({
          title: "エラーが発生しました",
          description: "質問の検索に失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsSearchLoading(false)
      }
    },
    [selectedTags, sortOrder],
  )

  useEffect(() => {
    // 検索が開かれていない場合は何もしない
    if (!openSearch) return

    // 検索文字列が短すぎる場合は、最近の質問のみを取得
    if (searchTerm.length < 2) {
      const timer = setTimeout(() => {
        searchQuestions("", filterType, selectedCategories)
      }, 100)
      return () => clearTimeout(timer)
    }

    // 通常の検索の場合は、より長いdebounce時間を使用
    const debounceTimer = setTimeout(() => {
      searchQuestions(searchTerm, filterType, selectedCategories)
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, searchQuestions, openSearch, filterType, selectedCategories])

  useEffect(() => {
    fetchTags()
    fetchCategories()
  }, [fetchTags, fetchCategories])

  // toggleSelectQuestionをuseCallbackでラップ
  const toggleSelectQuestion = useCallback((id: string) => {
    setSelectedQuestions((prev) => (prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]))
  }, [])

  // addSelectedQuestionsをuseCallbackでラップ
  const addSelectedQuestions = useCallback(() => {
    const questionsToAdd = searchResults.filter((q) => selectedQuestions.includes(q.id))
    questionsToAdd.forEach((question) => {
      append(question)
    })
    setSelectedQuestions([])
    setOpenSearch(false)
  }, [searchResults, selectedQuestions, append, setOpenSearch])

  return (
    <QuestionSearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearchLoading,
        selectedQuestions,
        setSelectedQuestions,
        openSearch,
        setOpenSearch,
        activeTab,
        setActiveTab,
        sortOrder,
        setSortOrder,
        showDescription,
        setShowDescription,
        showOptions,
        setShowOptions,
        showTags,
        setShowTags,
        showCategory,
        setShowCategory,
        tagFilter,
        setTagFilter,
        availableTags,
        selectedTags,
        setSelectedTags,
        categories,
        selectedCategories,
        setSelectedCategories,
        toggleSelectQuestion,
        searchQuestions,
        addSelectedQuestions,
        filterType,
        setFilterType,
      }}
    >
      {children}
    </QuestionSearchContext.Provider>
  )
}

export function useQuestionSearch() {
  const context = useContext(QuestionSearchContext)
  if (context === undefined) {
    throw new Error("useQuestionSearch must be used within a QuestionSearchProvider")
  }
  return context
}
