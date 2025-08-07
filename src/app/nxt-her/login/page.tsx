import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NxtHerLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Nxt Her Summit</CardTitle>
            <CardDescription>
              Login to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Login functionality will be implemented in the next phase of development.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/nxt-her/register">
                  Register for Summit
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}