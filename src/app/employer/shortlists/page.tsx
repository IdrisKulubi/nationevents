import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  employers, 
  jobSeekers,
  shortlists,
  jobs,
  events
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  Calendar, 
  Mail, 
  Phone, 
  Settings,
  Plus,
  Filter,
  Users,
  Eye,
  Trash2
} from "lucide-react";

export default async function EmployerShortlistsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user info to check role
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const currentUser = user[0];
  
  // Get employer profile
  const employerProfile = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, session.user.id))
    .limit(1);

  // For admin users without employer profile, create a mock employer
  const employer = employerProfile[0] || {
    id: "admin_mock_employer",
    userId: session.user.id,
    companyName: "Admin Portal Access",
  };

  // Get shortlisted candidates (for real employers)
  const shortlistedCandidates = employerProfile[0] ? await db
    .select({
      shortlist: shortlists,
      jobSeeker: jobSeekers,
      user: users,
      job: jobs,
      event: events,
    })
    .from(shortlists)
    .leftJoin(jobSeekers, eq(jobSeekers.id, shortlists.jobSeekerId))
    .leftJoin(users, eq(users.id, jobSeekers.userId))
    .leftJoin(jobs, eq(jobs.id, shortlists.jobId))
    .leftJoin(events, eq(events.id, shortlists.eventId))
    .where(eq(shortlists.employerId, employer.id))
    .orderBy(desc(shortlists.createdAt)) : [];

  // Group by list name
  const shortlistsByName = shortlistedCandidates.reduce((acc, item) => {
    const listName = item.shortlist.listName;
    if (!acc[listName]) {
      acc[listName] = [];
    }
    acc[listName].push(item);
    return acc;
  }, {} as Record<string, typeof shortlistedCandidates>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interested":
        return "bg-blue-100 text-blue-800";
      case "maybe":
        return "bg-yellow-100 text-yellow-800";
      case "not_interested":
        return "bg-red-100 text-red-800";
      case "contacted":
        return "bg-purple-100 text-purple-800";
      case "interviewed":
        return "bg-green-100 text-green-800";
      case "offered":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shortlists</h1>
          <p className="text-gray-600 mt-2">
            Manage your saved candidates and track their progress
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>
      </div>

      {/* Admin Notice */}
      {currentUser.role === "admin" && !employerProfile[0] && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Admin Mode</h3>
                <p className="text-orange-800 text-sm">
                  You&apos;re viewing shortlist management as an administrator
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{shortlistedCandidates.length}</p>
                <p className="text-sm text-gray-600">Total Shortlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {shortlistedCandidates.filter(c => c.shortlist.status === "interested").length}
                </p>
                <p className="text-sm text-gray-600">Interested</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {shortlistedCandidates.filter(c => c.shortlist.status === "interviewed").length}
                </p>
                <p className="text-sm text-gray-600">Interviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(shortlistsByName).length}</p>
                <p className="text-sm text-gray-600">Lists</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shortlists */}
      {Object.keys(shortlistsByName).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No shortlists created yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your candidate shortlists to organize and track promising applicants
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Shortlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(shortlistsByName).map(([listName, candidates]) => (
            <Card key={listName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    {listName}
                    <Badge variant="outline" className="ml-2">
                      {candidates.length} candidates
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage List
                    </Button>
                    <Button size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.map((item) => (
                    <div
                      key={item.shortlist.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {item.user?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {item.user?.name}
                              </h3>
                              <p className="text-sm text-gray-600">{item.user?.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(item.shortlist.status || '')}>
                                {item.shortlist.status}
                              </Badge>
                              <Badge className={getPriorityColor(item.shortlist.priority || '')}>
                                {item.shortlist.priority} priority
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {item.jobSeeker?.experience && (
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm mb-1">Experience</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {item.jobSeeker.experience}
                                </p>
                              </div>
                            )}
                            {item.job && (
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm mb-1">Applied for</h4>
                                <p className="text-sm text-gray-600">{item.job.title}</p>
                              </div>
                            )}
                          </div>

                          {item.shortlist.notes && (
                            <div className="mb-3">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">Notes</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {item.shortlist.notes}
                              </p>
                            </div>
                          )}

                          {item.shortlist.tags && item.shortlist.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.shortlist.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Added {new Date(item.shortlist.createdAt).toLocaleDateString()}</span>
                            {item.event && (
                              <span>Event: {item.event.name}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-6">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Guide */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Star className="h-5 w-5" />
            Shortlist Management Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900">Organize by Role</h3>
              <p className="text-green-800 text-sm mt-1">
                Create separate lists for different positions or departments
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900">Track Progress</h3>
              <p className="text-green-800 text-sm mt-1">
                Update candidate status as they move through your hiring process
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900">Take Action</h3>
              <p className="text-green-800 text-sm mt-1">
                Reach out to candidates and schedule interviews directly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 