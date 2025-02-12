import { NextResponse } from "next/server"
import { createApi } from "unsplash-js"

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const result = await unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: 10,
    })

    if (result.type === "error") {
      throw new Error(`Unsplash API error: ${result.errors.join(", ")}`)
    }

    return NextResponse.json(result.response)
  } catch (error) {
    console.error("Error searching Unsplash:", error)
    return NextResponse.json(
      { error: "Failed to search images", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

