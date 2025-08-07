import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function NxtHerDebugPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Debug Information
          </h1>
          <p className="text-lg text-gray-600">
            Authentication and session debugging
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Current user session data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-4">
                  <div>
                    <strong>User ID:</strong> {session.user?.id || "N/A"}
                  </div>
                  <div>
                    <strong>Name:</strong> {session.user?.name || "N/A"}
                  </div>
                  <div>
                    <strong>Email:</strong> {session.user?.email || "N/A"}
                  </div>
                  <div>
                    <strong>Role:</strong> {session.user?.role || "N/A"}
                  </div>
                  <div>
                    <strong>Event Type:</strong> {session.user?.eventType || "N/A"}
                  </div>
                  <div>
                    <strong>Profile Completed:</strong> {session.user?.profileCompleted ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Image:</strong> {session.user?.image ? (
                      <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full inline-block ml-2" />
                    ) : "N/A"}
                  </div>
                </div>
              ) : (
                <p>No active session</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw Session Data</CardTitle>
              <CardDescription>
                Complete session object for debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(session, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center space-x-4">
          <Button asChild>
            <Link href="/nxt-her/login">
              Go to Login
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/nxt-her/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}