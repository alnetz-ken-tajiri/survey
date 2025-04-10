"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileText, CheckSquare, Radio, ListFilter, FileUp, Plus, Trash2, Folder } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuestionGroup } from "@/contexts/question-group-context"
import type { Category } from "@/contexts/question-group-context"

// 共通スタイルをインポートして使用
import { gradientButtonClass } from "@/styles/admin/questionGroups/styles"

export function NewQuestionForm() {
  const {
    newQuestionForm,
    handleCreateNewQuestion,
    selectedType,
    optionFields,
    appendOption,
    removeOption,
    categories,
    selectedCategory,
    setSelectedCategory,
  } = useQuestionGroup()

  // カテゴリーの階層構造を作成
  const categoryMap = new Map<string, Category>()
  categories.forEach((cat) => categoryMap.set(cat.id, cat))

  // 親カテゴリーとその子カテゴリーを整理
  const parentCategories = categories.filter((cat) => cat.parentId === null)
  const childCategoriesMap = new Map<string, Category[]>()

  categories
    .filter((cat) => cat.parentId !== null)
    .forEach((cat) => {
      if (cat.parentId) {
        if (!childCategoriesMap.has(cat.parentId)) {
          childCategoriesMap.set(cat.parentId, [])
        }
        const children = childCategoriesMap.get(cat.parentId)
        if (children) {
          children.push(cat)
        }
      }
    })

  return (
    <Form {...newQuestionForm}>
      <form onSubmit={newQuestionForm.handleSubmit(handleCreateNewQuestion)} className="space-y-4">
        <FormField
          control={newQuestionForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>質問名</FormLabel>
              <FormControl>
                <Input placeholder="質問名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={newQuestionForm.control}
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

        <FormField
          control={newQuestionForm.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>質問タイプ</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="質問タイプを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="TEXT" className="flex items-center">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      テキスト
                    </div>
                  </SelectItem>
                  <SelectItem value="CHECKBOX" className="flex items-center">
                    <div className="flex items-center">
                      <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                      チェックボックス
                    </div>
                  </SelectItem>
                  <SelectItem value="RADIO" className="flex items-center">
                    <div className="flex items-center">
                      <Radio className="h-4 w-4 mr-2 text-purple-600" />
                      ラジオボタン
                    </div>
                  </SelectItem>
                  <SelectItem value="SELECT" className="flex items-center">
                    <div className="flex items-center">
                      <ListFilter className="h-4 w-4 mr-2 text-amber-600" />
                      セレクト
                    </div>
                  </SelectItem>
                  <SelectItem value="FILE" className="flex items-center">
                    <div className="flex items-center">
                      <FileUp className="h-4 w-4 mr-2 text-rose-600" />
                      ファイル
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={newQuestionForm.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>役割</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NORMAL" id="role-normal" />
                    <label
                      htmlFor="role-normal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      通常
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CATEGORY" id="role-category" />
                    <label
                      htmlFor="role-category"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      カテゴリー
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={newQuestionForm.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリー</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === "none" ? null : value)
                  setSelectedCategory(value === "none" ? null : value)
                }}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">カテゴリーなし</SelectItem>
                  {parentCategories.map((category) => (
                    <React.Fragment key={category.id}>
                      <SelectItem value={category.id}>
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 mr-2 text-yellow-600" />
                          {category.name}
                        </div>
                      </SelectItem>
                      {childCategoriesMap.has(category.id) &&
                        childCategoriesMap.get(category.id)?.map((childCat) => (
                          <SelectItem key={childCat.id} value={childCat.id} className="pl-6">
                            ├ {childCat.name}
                          </SelectItem>
                        ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType !== "TEXT" && selectedType !== "FILE" && (
          <div className="space-y-2">
            <FormLabel>選択肢</FormLabel>
            <AnimatePresence>
              {optionFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormField
                    control={newQuestionForm.control}
                    name={`options.${index}.name` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>オプション名</FormLabel>
                        <FormControl>
                          <Input placeholder="オプション名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newQuestionForm.control}
                    name={`options.${index}.value` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>値</FormLabel>
                        <FormControl>
                          <Input placeholder="値" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)} className="mt-6">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendOption({ name: "", value: "" })}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              選択肢を追加
            </Button>
          </div>
        )}

        {/* 質問作成ボタンのスタイル */}
        <Button type="submit" className={gradientButtonClass}>
          質問を作成
        </Button>
      </form>
    </Form>
  )
}
