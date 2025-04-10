"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function MultiSelect({ options, selected, onChange, className }: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (option: string) => {
    // "all"が選択されている場合は、"all"を除外して他のオプションだけを選択
    if (option === "all" && selected.includes("all")) {
      onChange([])
      return
    }

    // "all"以外のオプションが選択解除された場合
    const newSelected = selected.filter((s) => s !== option)

    // 選択されたオプションがなくなった場合は"all"を選択
    if (newSelected.length === 0) {
      onChange(["all"])
      return
    }

    // "all"が含まれていて他のオプションも選択された場合は"all"を除外
    if (newSelected.includes("all") && newSelected.length > 1) {
      onChange(newSelected.filter((s) => s !== "all"))
      return
    }

    onChange(newSelected)
  }

  const handleSelect = (option: Option) => {
    // "all"が選択された場合
    if (option.value === "all") {
      onChange(["all"])
      return
    }

    // "all"以外のオプションが選択された場合
    let newSelected: string[]

    // 現在"all"が選択されている場合は、"all"を除外して新しいオプションを追加
    if (selected.includes("all")) {
      newSelected = [option.value]
    } else {
      // 既に選択されている場合は選択解除
      if (selected.includes(option.value)) {
        newSelected = selected.filter((s) => s !== option.value)
        // 選択されたオプションがなくなった場合は"all"を選択
        if (newSelected.length === 0) {
          newSelected = ["all"]
        }
      } else {
        // 選択されていない場合は追加
        newSelected = [...selected, option.value]
      }
    }

    onChange(newSelected)
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex flex-wrap gap-1 border rounded-md p-1 min-h-10"
        onClick={() => {
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        {selected.length > 0 ? (
          selected.map((value) => {
            const option = options.find((o) => o.value === value)
            return (
              <Badge key={value} variant="secondary" className="flex items-center gap-1">
                {option?.label}
                <button
                  className="rounded-full outline-none"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnselect(value)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })
        ) : (
          <span className="text-muted-foreground text-sm py-1.5 px-1">ユーザーを選択...</span>
        )}
        <CommandPrimitive.Input
          ref={inputRef}
          value={inputValue}
          onValueChange={setInputValue}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          className="ml-2 flex-1 outline-none bg-transparent"
        />
      </div>
      <div className="relative">
        {open && (
          <div className="absolute top-1 w-full z-10">
            <Command className="rounded-lg border shadow-md">
              <CommandGroup>
                {options
                  .filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((option) => {
                    const isSelected = selected.includes(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleSelect(option)}
                        className={`flex items-center gap-2 ${isSelected ? "bg-accent" : ""}`}
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                            isSelected ? "bg-primary border-primary" : ""
                          }`}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-sm bg-white" />}
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            </Command>
          </div>
        )}
      </div>
    </div>
  )
}

