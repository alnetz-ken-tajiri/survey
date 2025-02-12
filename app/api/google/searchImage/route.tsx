import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_API_KEY
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from Google API")
    }

    const data = await response.json()
    return NextResponse.json(data.items || [])
  } catch (error) {
    console.error("Error searching Google Images:", error)
    return NextResponse.json({ error: "Failed to search images" }, { status: 500 })
  }
}

