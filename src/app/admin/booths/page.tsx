import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, events, booths, employers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Plus, 
  MapPin, 
  Users, 
  Settings, 
  Calendar,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Power,
  TrendingUp,
  Activity
} from "lucide-react";
import { AdminBoothModal } from "@/components/admin/admin-booth-modal";

export default async function AdminBoothsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check admin access
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    redirect("/dashboard");
  }

  // Get all events for dropdown (including inactive ones for admin view)
  const allEventsRaw = await db
    .select()
    .from(events)
    .orderBy(desc(events.createdAt));

  // Transform events to match the Event interface expected by AdminBoothModal
  const allEvents = allEventsRaw.map(event => ({
    id: event.id,
    name: event.name,
    venue: event.venue,
    startDate: event.startDate,
    endDate: event.endDate,
    isActive: event.isActive ?? true // Convert null to true (default active state)
  }));

  // Get all booths with event and employer information
  const allBooths = await db
    .select({
      booth: booths,
      event: events,
      employer: employers,
    })
    .from(booths)
    .leftJoin(events, eq(events.id, booths.eventId))
    .leftJoin(employers, eq(employers.id, booths.employerId))
    .orderBy(desc(booths.createdAt));

  // Calculate statistics
  const totalBooths = allBooths.length;
  const activeBooths = allBooths.filter(b => b.booth.isActive).length;
  const totalEvents = new Set(allBooths.map(b => b.booth.eventId)).size;
  const totalCompanies = new Set(allBooths.map(b => b.booth.employerId)).size;

  const getBoothSizeColor = (size: string) => {
    switch (size) {
      case "large": return "bg-purple-100 text-purple-800 border-purple-300";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-300";
      case "small": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booth Management</h1>
          <p className="text-gray-600 mt-2">
            Manage exhibition booths across all events and track company participation
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <AdminBoothModal
            events={allEvents}
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Booth
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Booths Card */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/60 group hover:scale-105">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {totalBooths}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    🏢 Exhibition booths
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Total Booths
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Across all events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Booths Card */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-950/40 dark:via-green-900/30 dark:to-emerald-950/60 group hover:scale-105">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Power className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {activeBooths}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {Math.round((activeBooths / totalBooths) * 100) || 0}% of total
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Active Booths
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events with Booths Card */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 dark:from-violet-950/40 dark:via-purple-900/30 dark:to-violet-950/60 group hover:scale-105">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-violet-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {totalEvents}
                  </div>
                  <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                    📅 With booth setups
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Events
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Have booth allocations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participating Companies Card */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-orange-900/30 dark:to-amber-950/60 group hover:scale-105">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {totalCompanies}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    🏢 Participating
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Companies
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  With booth presence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booths List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              All Booths
            </CardTitle>
            <Badge variant="outline" className="bg-slate-50">
              {allBooths.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {allBooths.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Booths Configured Yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start by adding booth configurations for events. Manage booth allocations, sizes, and equipment requirements.
              </p>
              <AdminBoothModal
                events={allEvents}
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Booth
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {allBooths.map((item) => {
                const booth = item.booth;
                const event = item.event;
                const employer = item.employer;
                
                return (
                  <div
                    key={booth.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200 bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Booth {booth.boothNumber}
                          </h3>
                          <Badge variant={booth.isActive ? "default" : "secondary"}>
                            {booth.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge className={getBoothSizeColor(booth.size || "medium")}>
                            {(booth.size || "medium").toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span>{booth.location || "Location TBD"}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>{event?.name || "No event assigned"}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 text-purple-500" />
                            <span>{employer?.companyName || "No company"}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Settings className="h-4 w-4 text-orange-500" />
                            <span>{booth.equipment?.length || 0} equipment items</span>
                          </div>
                        </div>

                        {booth.specialRequirements && (
                          <p className="text-gray-600 text-sm mt-2 p-2 bg-gray-50 rounded-lg">
                            <strong>Special Requirements:</strong> {booth.specialRequirements}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>Created {new Date(booth.createdAt).toLocaleDateString()}</span>
                          {event && (
                            <span>Event: {new Date(event.startDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Activity className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Add New Booth</h3>
            <p className="text-blue-800 text-sm mb-4">
              Configure a new booth with specific requirements and allocate it to an event
            </p>
            <AdminBoothModal
              events={allEvents}
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                  Setup Booth
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Booth Analytics</h3>
            <p className="text-green-800 text-sm mb-4">
              View booth utilization, visitor analytics, and performance metrics
            </p>
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 w-full">
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-2">Bulk Management</h3>
            <p className="text-purple-800 text-sm mb-4">
              Manage multiple booths, equipment allocation, and event assignments
            </p>
            <Button variant="outline" className="border-purple-600 text-purple-700 hover:bg-purple-50 w-full">
              Bulk Actions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 