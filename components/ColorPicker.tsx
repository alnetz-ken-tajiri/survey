"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Paintbrush, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorOption {
  id: string
  name: string
  class: string
}

const colorOptions: ColorOption[] = [
  { id: "blue", name: "ブルー", class: "from-blue-500 to-purple-500" },
  { id: "green", name: "グリーン", class: "from-green-500 to-teal-500" },
  { id: "red", name: "レッド", class: "from-red-500 to-pink-500" },
  { id: "yellow", name: "イエロー", class: "from-yellow-500 to-orange-500" },
  { id: "indigo", name: "インディゴ", class: "from-indigo-500 to-blue-500" },
  { id: "black", name: "ブラック", class: "from-gray-800 to-black" },
]

interface ColorPickerProps {
  colors: string[]
  selectedColor: string
  onColorChange: (color: string) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleColorChange = (colorClass: string) => {
    onColorChange(colorClass)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-white"
        >
          <div
            className={cn(
              "w-full h-full rounded-full bg-gradient-to-r flex items-center justify-center",
              selectedColor,
            )}
          >
            <Paintbrush className="h-5 w-5 text-white" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-3">テーマカラーを選択</h4>
          <div className="grid gap-2">
            {colorOptions.map((color) => (
              <Button
                key={color.id}
                variant="outline"
                className={cn(
                  "w-full h-14 rounded-lg justify-start gap-2 border-2",
                  color.class === selectedColor ? "border-primary" : "border-transparent",
                )}
                onClick={() => handleColorChange(color.class)}
              >
                <div className={cn("w-8 h-8 rounded-full bg-gradient-to-r", color.class)} />
                <span className="text-sm font-medium">{color.name}</span>
                {color.class === selectedColor && <Check className="h-4 w-4 ml-auto" />}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

