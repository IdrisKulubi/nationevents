import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/services/nxt-her-dashboard";
import { WelcomeScreen } from "@/components/nxt-her/dashboard/welcome-screen";
import { DashboardStats } from "@/components/nxt-her/dashboard/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/nxt-her/auth/logout-button"

export default async function NxtHerDashboardPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "nxt_her_attendee") {
    redirect("/nxt-her/login");
  }

  const dashboardData = await getDashboardData(session.user.email!);
  
  if (!dashboardData) {
    redirect("/nxt-her/register");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Personalized Welcome Screen */}
        <div className="mb-8">
          <WelcomeScreen data={dashboardData} />
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats stats={dashboardData.stats} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Sessions you might be interested in based on your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="border-l-4 border-purple-500 pl-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{session.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.startTime).toLocaleDateString()} at{" "}
                              {new Date(session.startTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            <p className="text-sm mt-1">{session.description}</p>
                            {session.speakers.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Speakers: {session.speakers.map(s => s.name).join(", ")}
                              </p>
                            )}
                          </div>
                          {session.isBookmarked && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              Bookmarked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming sessions found.</p>
                )}
                <Link href="/nxt-her/agenda">
                  <Button className="w-full mt-4" variant="outline">
                    View Full Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Forum Activity</CardTitle>
                <CardDescription>
                  Join the conversation in our discussion forums
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentForumActivity.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentForumActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-600">
                            {activity.authorName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <strong>{activity.authorName}</strong> {activity.isReply ? 'replied to' : 'started a discussion in'} <strong>{activity.forumTitle}</strong>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{activity.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent forum activity.</p>
                )}
                <Button className="w-full mt-4" variant="outline">
                  Join Discussions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Complete your profile to enhance networking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profile Completion</span>
                    <span className="text-sm font-medium">{dashboardData.profileCompletion.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${dashboardData.profileCompletion.percentage}%` }}
                    ></div>
                  </div>
                  {dashboardData.profileCompletion.missingFields.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Complete: {dashboardData.profileCompletion.missingFields.slice(0, 2).join(', ')}
                      {dashboardData.profileCompletion.missingFields.length > 2 && ` and ${dashboardData.profileCompletion.missingFields.length - 2} more`}
                    </p>
                  )}
                </div>
                <div className="space-y-2 mt-4">
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                  <Link href="/nxt-her/networking">
                    <Button className="w-full" variant="outline">
                      Networking Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Networking Suggestions</CardTitle>
                <CardDescription>
                  Connect with attendees who share your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.suggestedConnections.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.suggestedConnections.slice(0, 2).map((suggestion) => (
                      <div key={suggestion.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {suggestion.attendeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{suggestion.attendeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.attendeeJobTitle && suggestion.attendeeOrganization
                              ? `${suggestion.attendeeJobTitle} at ${suggestion.attendeeOrganization}`
                              : suggestion.attendeeOrganization || "Professional"}
                          </p>
                          {suggestion.commonInterests.length > 0 && (
                            <p className="text-xs text-green-600">
                              Common: {suggestion.commonInterests.slice(0, 2).join(', ')}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">Connect</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No networking suggestions available.</p>
                )}
                <Link href="/nxt-her/networking">
                  <Button className="w-full mt-4" variant="outline">
                    Manage Networking
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Browse Sessions
                </Button>
                <Button className="w-full" variant="outline">
                  Find Attendees
                </Button>
                <Button className="w-full" variant="outline">
                  Join Forums
                </Button>
                <LogoutButton className="w-full" variant="outline">
                  Logout
                </LogoutButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}