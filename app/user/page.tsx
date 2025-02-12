import { Suspense } from "react"
import { ProfileCard } from "@/components/user/ProfileCard"
import { SurveyListCard } from "@/components/user/SurveyListCard"

export default function UserPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">ユーザーページ</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>プロフィールを読み込み中...</div>}>
          <ProfileCard />
        </Suspense>
        <Suspense fallback={<div>サーベイを読み込み中...</div>}>
          <SurveyListCard />
        </Suspense>
      </div>
    </div>
  )
}

