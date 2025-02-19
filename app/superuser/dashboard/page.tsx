import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SuperuserDashboard() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>スーパーユーザーダッシュボード</CardTitle>
        </CardHeader>
        <CardContent>
          <nav>
            <ul className="space-y-2">
              <li>
                <Link href="/superuser/companies">
                  <Button variant="outline" className="w-full justify-start">
                    会社管理
                  </Button>
                </Link>
              </li>
              {/* 他の管理ページへのリンクをここに追加 */}
            </ul>
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}

