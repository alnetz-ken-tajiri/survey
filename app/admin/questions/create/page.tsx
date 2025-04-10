"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Plus, Trash2, X, Check } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CreateCategoryDialog } from "@/components/admin/questions/create-category-dialog"
import { getUserData } from "@/utils/getUserData"

const QuestionType = {
  TEXT: "TEXT",
  RADIO: "RADIO",
  CHECKBOX: "CHECKBOX",
  SELECT: "SELECT",
  FILE: "FILE",
} as const

const QuestionRole = {
  NORMAL: "NORMAL",
  CATEGORY: "CATEGORY",
} as const

const questionOptionSchema = z.object({
  name: z.string().min(1, "選択肢名は必須です"),
  value: z.string().min(1, "選択肢の値は必須です"),
})

const questionSchema = z.object({
  name: z.string().min(1, "質問名は必須です"),
  description: z.string().optional(),
  public: z.boolean(),
  type: z.enum([
    QuestionType.TEXT,
    QuestionType.RADIO,
    QuestionType.CHECKBOX,
    QuestionType.SELECT,
    QuestionType.FILE,
  ]),
  role: z.enum([QuestionRole.NORMAL, QuestionRole.CATEGORY]),
  categoryId: z.string().optional(),
  questionOptions: z.array(questionOptionSchema).optional(),
  hashtags: z.array(z.string()),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface HashtagResult {
  id: string
  name: string
}

interface CategoryResult {
  id: string
  name: string
  parentId: string | null
  children?: CategoryResult[]
}

interface UserData {
  id: string
  name: string
  email: string
  employee?: {
    id: string
    companyId: string
  }
}

export default function CreateQuestion() {
  const router = useRouter()
  const [hashtagSearch, setHashtagSearch] = useState("")
  const [hashtagResults, setHashtagResults] = useState<HashtagResult[]>([])
  const [openHashtag, setOpenHashtag] = useState(false)
  const [categories, setCategories] = useState<CategoryResult[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      name: "",
      description: "",
      public: false,
      type: QuestionType.TEXT,
      role: QuestionRole.NORMAL,
      questionOptions: [],
      hashtags: [],
    },
  })

  const questionType = form.watch("type")
  const questionRole = form.watch("role")
  const hashtags = form.watch("hashtags")

  // ユーザー情報を取得して companyId を設定
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUser(true)
        const userData = await getUserData()
        if (userData?.employee?.companyId) {
          setCompanyId(userData.employee.companyId)
        }
      } catch (error) {
        console.error("ユーザー情報の取得中にエラーが発生しました:", error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserData()
  }, [])

  const searchHashtags = useCallback(async (search: string) => {
    try {
      const response = await axios.get(`/api/admin/hashtags?search=${search}`)
      setHashtagResults(response.data)
    } catch (error) {
      console.error("ハッシュタグの検索中にエラーが発生しました:", error)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true)
      // companyId がある場合はクエリに含める
      const url = companyId
        ? `/api/admin/categories?companyId=${companyId}`
        : "/api/admin/categories"

      const response = await axios.get(url)
      setCategories(response.data)
    } catch (error) {
      console.error("カテゴリーの取得中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "カテゴリーの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }, [companyId])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (openHashtag) {
        searchHashtags(hashtagSearch)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [hashtagSearch, searchHashtags, openHashtag])

  useEffect(() => {
    // companyId が設定されたらカテゴリーを取得
    if (!isLoadingUser) {
      fetchCategories()
    }
  }, [fetchCategories, isLoadingUser])

  const addHashtag = async (tag: string) => {
    if (tag && !hashtags.includes(tag)) {
      let newTag = tag
      if (!hashtagResults.some((result) => result.name === tag)) {
        try {
          const response = await axios.post("/api/admin/hashtags", { name: tag })
          newTag = response.data.name
        } catch (error) {
          console.error("新しいハッシュタグの作成中にエラーが発生しました:", error)
          toast({
            title: "エラーが発生しました",
            description: "新しいハッシュタグの作成に失敗しました。",
            variant: "destructive",
          })
          return
        }
      }
      form.setValue("hashtags", [...hashtags, newTag])
      setHashtagSearch("")
      // 新しいタグを追加した後、検索結果を更新
      setHashtagResults((prevResults) => [
        ...prevResults,
        { id: Date.now().toString(), name: newTag },
      ])
    }
  }

  const removeHashtag = (tag: string) => {
    form.setValue(
      "hashtags",
      hashtags.filter((t) => t !== tag)
    )
  }

  // 都道府県リスト（すべて網羅したい場合などに利用）
  const ALL_PREFECTURES = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ]

  // テンプレートを適用する関数
  const applyTemplate = (templateName: string) => {
    switch (templateName) {
      // ----------------------------------------------
      // 5段階満足度: 通常版
      // ----------------------------------------------
      case "FIVE_SCALE":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "非常に不満", value: "1" },
          { name: "不満", value: "2" },
          { name: "普通", value: "3" },
          { name: "満足", value: "4" },
          { name: "非常に満足", value: "5" },
        ])
        break

      // ----------------------------------------------
      // 5段階満足度: ネガティブ（逆バージョン）
      // ----------------------------------------------
      case "FIVE_SCALE_NEGATIVE":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "非常に満足", value: "5" },
          { name: "満足", value: "4" },
          { name: "普通", value: "3" },
          { name: "不満", value: "2" },
          { name: "非常に不満", value: "1" },
        ])
        break

      // ----------------------------------------------
      // 同意度: 通常版
      // ----------------------------------------------
      case "AGREEMENT_SCALE":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "全く同意しない", value: "1" },
          { name: "同意しない", value: "2" },
          { name: "どちらでもない", value: "3" },
          { name: "同意する", value: "4" },
          { name: "強く同意する", value: "5" },
        ])
        break

      // ----------------------------------------------
      // 同意度: ネガティブ（逆バージョン）
      // ----------------------------------------------
      case "AGREEMENT_SCALE_NEGATIVE":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "強く同意する", value: "5" },
          { name: "同意する", value: "4" },
          { name: "どちらでもない", value: "3" },
          { name: "同意しない", value: "2" },
          { name: "全く同意しない", value: "1" },
        ])
        break

      // ----------------------------------------------
      // 頻度: 通常版
      // ----------------------------------------------
      case "FREQUENCY_SCALE":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "全くない", value: "1" },
          { name: "まれに", value: "2" },
          { name: "時々", value: "3" },
          { name: "頻繁に", value: "4" },
          { name: "常に", value: "5" },
        ])
        break

      // ----------------------------------------------
      // 頻度: ネガティブ（逆バージョン）
      // ----------------------------------------------
      case "FREQUENCY_SCALE_NEGATIVE":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "常に", value: "5" },
          { name: "頻繁に", value: "4" },
          { name: "時々", value: "3" },
          { name: "まれに", value: "2" },
          { name: "全くない", value: "1" },
        ])
        break

      // ----------------------------------------------
      // 性別（例: 男性 / 女性 / その他）
      // ----------------------------------------------
      case "GENDER":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "男性", value: "male" },
          { name: "女性", value: "female" },
          { name: "その他", value: "other" },
        ])
        break

      // ----------------------------------------------
      // 都道府県（セレクトボックス）
      // ----------------------------------------------
      case "PREFECTURE":
        form.setValue("type", QuestionType.SELECT)
        form.setValue(
          "questionOptions",
          ALL_PREFECTURES.map((pref) => ({
            name: pref,
            value: pref,
          }))
        )
        break

      // ----------------------------------------------
      // 5段階評価：あてはまらない → あてはまる
      // ----------------------------------------------
      case "AGREEMENT_JA":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "あてはまらない", value: "1" },
          { name: "あまりあてはまらない", value: "2" },
          { name: "どちらともいえない", value: "3" },
          { name: "ややあてはまる", value: "4" },
          { name: "あてはまる", value: "5" },
        ])
        break

      // ----------------------------------------------
      // 5段階評価：しばしばある → まったくない
      // ----------------------------------------------
      case "FREQUENCY_JA":
        form.setValue("type", QuestionType.RADIO)
        form.setValue("questionOptions", [
          { name: "しばしばある", value: "1" },
          { name: "ときどきある", value: "2" },
          { name: "まれにある", value: "3" },
          { name: "ほとんどない", value: "4" },
          { name: "まったくない", value: "5" },
        ])
        break

      default:
        // 何もしない or デフォルト処理
        break
    }
  }

  const handleCategoryCreated = (newCategory: CategoryResult) => {
    setCategories((prevCategories) => [...prevCategories, newCategory])
    form.setValue("categoryId", newCategory.id)
  }

  // カテゴリーの階層構造をフラット化
  const flattenCategories = (
    categories: CategoryResult[],
    depth = 0
  ): { id: string; name: string; depth: number }[] => {
    let result: { id: string; name: string; depth: number }[] = []
    categories.forEach((category) => {
      result.push({ id: category.id, name: category.name, depth })
      if (category.children && category.children.length > 0) {
        result = [
          ...result,
          ...flattenCategories(category.children, depth + 1),
        ]
      }
    })
    return result
  }

  const onSubmit = async (data: QuestionFormValues) => {
    try {
      const formattedData = {
        ...data,
        companyId: companyId, // 会社IDを追加
        categoryId:
          data.categoryId === "none" || data.categoryId === ""
            ? null
            : data.categoryId,
        questionOptions:
          data.questionOptions?.filter((option) => option.name && option.value) ||
          [],
      }

      await axios.post("/api/admin/questions", formattedData)
      toast({
        title: "質問が作成されました",
        description: "質問が正常に保存されました。",
      })
      router.push("/admin/questions")
    } catch (error) {
      console.error("質問の作成中にエラーが発生しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "質問の保存中にエラーが発生しました。",
        variant: "destructive",
      })
    }
  }

  if (isLoadingUser) {
    return <div>ユーザー情報を読み込み中...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">質問の作成</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 質問名 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問</FormLabel>
                <FormControl>
                  <Input placeholder="質問を入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 説明 */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>説明</FormLabel>
                <FormControl>
                  <Textarea placeholder="質問の説明を入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 公開設定 */}
          <FormField
            control={form.control}
            name="public"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">公開設定</FormLabel>
                  <FormDescription>
                    この質問を公開するかどうかを設定します
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* カテゴリー選択 & 新規作成 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>カテゴリー</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCategoryDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> 新規カテゴリー
              </Button>
            </div>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">カテゴリーなし</SelectItem>
                      {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>
                          読み込み中...
                        </SelectItem>
                      ) : (
                        flattenCategories(categories).map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {Array(cat.depth).fill("　").join("")}
                            {cat.depth > 0 ? "└ " : ""}
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    この質問が属するカテゴリーを選択してください
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 質問の役割 */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問の役割</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="質問の役割を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={QuestionRole.NORMAL}>通常</SelectItem>
                    <SelectItem value={QuestionRole.CATEGORY}>
                      カテゴリー
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  「カテゴリー」を選択すると、この質問は回答者をグループ分けするために使用されます
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 質問タイプ */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問タイプ</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="質問タイプを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={QuestionType.TEXT}>テキスト</SelectItem>
                    <SelectItem value={QuestionType.RADIO}>
                      ラジオボタン
                    </SelectItem>
                    <SelectItem value={QuestionType.CHECKBOX}>
                      チェックボックス
                    </SelectItem>
                    <SelectItem value={QuestionType.SELECT}>
                      セレクトボックス
                    </SelectItem>
                    <SelectItem value={QuestionType.FILE}>ファイル</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/*
            --------------------------
            テンプレートボタン群
            --------------------------
            ※たとえば type=RADIO のときに表示など、必要に応じて条件分岐
          */}
          {questionType === QuestionType.RADIO && (
            <div className="mt-4 space-y-4">
              <FormLabel>テンプレート</FormLabel>

              {/* --- 通常バージョン（5段階評価・同意度・頻度） --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("FIVE_SCALE")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">5段階評価（満足度）</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      非常に不満 → 非常に満足
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("AGREEMENT_SCALE")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">5段階評価（同意度）</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      全く同意しない → 強く同意する
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("FREQUENCY_SCALE")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">5段階評価（頻度）</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      全くない → 常に
                    </div>
                  </div>
                </Button>
              </div>

              {/* --- ネガティブ（逆バージョン） --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("FIVE_SCALE_NEGATIVE")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">
                      5段階評価（満足度・逆バージョン）
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      非常に満足 → 非常に不満
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("AGREEMENT_SCALE_NEGATIVE")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">5段階評価（同意度・逆）</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      強く同意する → 全く同意しない
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("FREQUENCY_SCALE_NEGATIVE")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">5段階評価（頻度・逆）</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      常に → 全くない
                    </div>
                  </div>
                </Button>
              </div>

              {/* --- 新しい日本語テンプレ（あてはまらない → あてはまる 等） --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("AGREEMENT_JA")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">
                      5段階評価（あてはまらない → あてはまる）
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      あてはまらない → あてはまる
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("FREQUENCY_JA")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">
                      5段階評価（しばしばある → まったくない）
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      しばしばある → まったくない
                    </div>
                  </div>
                </Button>
              </div>

              {/* --- 性別など --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate("GENDER")}
                  className="justify-start text-left h-auto py-3"
                >
                  <div>
                    <div className="font-medium">性別テンプレ</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      男性 / 女性 / その他
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {questionType === QuestionType.SELECT && (
            <div className="mt-4 space-y-4">
              <FormLabel>テンプレート</FormLabel>

              {/* 都道府県テンプレ */}
              <Button
                type="button"
                variant="outline"
                onClick={() => applyTemplate("PREFECTURE")}
                className="justify-start text-left h-auto py-3"
              >
                <div>
                  <div className="font-medium">都道府県テンプレ</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    全国の都道府県を選択肢に追加
                  </div>
                </div>
              </Button>
            </div>
          )}

          {/* 選択肢の入力欄 (RADIO, CHECKBOX, SELECT) の場合のみ表示 */}
          {["RADIO", "CHECKBOX", "SELECT"].includes(questionType) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">選択肢</h3>
              {form.watch("questionOptions")?.map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name={`questionOptions.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="選択肢名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`questionOptions.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder="値" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const currentOptions = form.getValues("questionOptions") || []
                      form.setValue(
                        "questionOptions",
                        currentOptions.filter((_, i) => i !== index)
                      )
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentOptions = form.getValues("questionOptions") || []
                  form.setValue("questionOptions", [
                    ...currentOptions,
                    { name: "", value: "" },
                  ])
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> 選択肢を追加
              </Button>
            </div>
          )}

          {/* ハッシュタグ */}
          <div className="space-y-2">
            <FormLabel>ハッシュタグ</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-primary text-primary-foreground px-2 py-1 rounded-full flex items-center"
                >
                  #{tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => removeHashtag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Popover
              open={openHashtag}
              onOpenChange={(open) => {
                setOpenHashtag(open)
                if (open) {
                  searchHashtags("")
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openHashtag}
                  className="w-full justify-between"
                >
                  {hashtagSearch
                    ? `#${hashtagSearch}`
                    : "ハッシュタグを選択または追加"}
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="ハッシュタグを検索..."
                    value={hashtagSearch}
                    onValueChange={setHashtagSearch}
                  />
                  <CommandList>
                    <CommandEmpty>ハッシュタグが見つかりません</CommandEmpty>
                    <CommandGroup>
                      {hashtagResults.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => {
                            addHashtag(tag.name)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              hashtags.includes(tag.name)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {tag.name}
                        </CommandItem>
                      ))}
                      {hashtagSearch &&
                        !hashtagResults.some((t) => t.name === hashtagSearch) && (
                          <CommandItem
                            onSelect={() => {
                              addHashtag(hashtagSearch)
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            新しいタグとして追加: {hashtagSearch}
                          </CommandItem>
                        )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* 保存ボタン */}
          <Button type="submit">質問を保存</Button>
        </form>
      </Form>

      {/* カテゴリ作成ダイアログ */}
      <CreateCategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categories={categories}
        onCategoryCreated={handleCategoryCreated}
        companyId={companyId}
      />
    </div>
  )
}
