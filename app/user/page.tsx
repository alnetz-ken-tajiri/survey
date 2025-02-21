import { Suspense } from "react"
import { ProfileCard } from "@/components/user/ProfileCard"
import { SurveyListCard } from "@/components/user/SurveyListCard"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCard } from "@/components/user/StatsCard"

export default function UserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          マイダッシュボード
        </h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Suspense fallback={<Skeleton className="w-full h-[400px] rounded-xl bg-gray-800" />}>
              <ProfileCard />
            </Suspense>
          </div>
          <div className="md:col-span-2 space-y-8">
            <Suspense fallback={<Skeleton className="w-full h-[100px] rounded-xl bg-gray-800" />}>
              <StatsCard />
            </Suspense>
            <Suspense fallback={<Skeleton className="w-full h-[400px] rounded-xl bg-gray-800" />}>
              <SurveyListCard />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

