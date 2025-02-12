import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    setErrorMessage("")
    try {
      const response = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Error searching images:", error)
      setErrorMessage("画像の検索に失敗しました。もう一度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleSearch()
    }
  }

  const handleSelectImage = (imageUrl: string) => {
    onChange(imageUrl)
    setIsSearchOpen(false)
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full h-48">
          <Image
            src={value || "/placeholder.svg"}
            alt="Selected image"
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Input type="file" accept="image/*" onChange={handleFileUpload} />
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">画像を検索</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] sm:h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>画像を検索</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4 flex-grow overflow-hidden">
                <div className="flex items-center space-x-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="キーワードを入力"
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? "検索中..." : "検索"}
                  </Button>
                </div>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                <div className="grid grid-cols-2 gap-4 overflow-y-auto flex-grow">
                  {searchResults.map((image) => (
                    <div
                      key={image.id}
                      className="cursor-pointer"
                      onClick={() => handleSelectImage(image.urls.regular)}
                    >
                      <Image
                        src={image.urls.thumb || "/placeholder.svg"}
                        alt={image.alt_description || "Unsplash image"}
                        width={150}
                        height={150}
                        className="rounded-md w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

