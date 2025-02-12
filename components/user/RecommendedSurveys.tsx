import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type RecommendedSurvey = {
  id: string
  title: string
  description: string
}

export function RecommendedSurveys() {
  // この例では、ハードコードされたデータを使用していますが、実際にはAPIから取得するべきです
  const recommendedSurveys: RecommendedSurvey[] = [
    {
      id: "1",
      title: "新入社員フィードバック",
      description: "入社後3ヶ月の新入社員を対象とした適応状況調査です。",
    },
    {
      id: "2",
      title: "職場環境改善アンケート",
      description: "より良い職場環境づくりのためのご意見をお聞かせください。",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>おすすめのサーベイ</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recommendedSurveys.map((survey) => (
            <li key={survey.id}>
              <h3 className="font-medium">{survey.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{survey.description}</p>
              <Link href={`/survey/${survey.id}`}>
                <Button variant="outline" size="sm">
                  回答する
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

