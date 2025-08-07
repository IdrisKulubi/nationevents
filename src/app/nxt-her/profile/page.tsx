import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, MapPin } from "lucide-react"
import { redirect } from "next/navigation"

export default async function NxtHerProfilePage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "nxt_her_attendee") {
    redirect("/nxt-her/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Profile
          </h1>
          <p className="text-lg text-gray-600">
            Manage your Nxt Her Summit profile and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your basic information from Google account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{session.user.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Badge variant="secondary">
                      {session.user.role === "nxt_her_attendee" ? "Summit Attendee" : session.user.role}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Event Type</label>
                    <Badge variant="outline">
                      {session.user.eventType === "nxt_her_summit" ? "Nxt Her Summit" : "General"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Status</label>
                    <Badge variant={session.user.profileCompleted ? "default" : "destructive"}>
                      {session.user.profileCompleted ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">User ID</label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {session.user.id}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button>
                    Complete Profile Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
                <Button className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Find Attendees
                </Button>
                <Button className="w-full" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Event Location
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Session Debug Info</CardTitle>
                <CardDescription>
                  Technical information for debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}