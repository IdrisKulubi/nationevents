import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, events, checkpoints, booths } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Users, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  Copy,
  Power,
  Filter,
  Download,
  BarChart3,
  Clock,
  Globe,
  Building
} from "lucide-react";
import { CreateEventModal } from "@/components/admin/create-event-modal";
import { EventActionsMenu } from "@/components/admin/event-actions-menu";

export default async function EventsPage() {
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

  // Get all events with stats
  const allEvents = await db
    .select({
      event: events,
      checkpointCount: count(checkpoints.id),
      boothCount: count(booths.id)
    })
    .from(events)
    .leftJoin(checkpoints, eq(checkpoints.eventId, events.id))
    .leftJoin(booths, eq(booths.eventId, events.id))
    .groupBy(events.id)
    .orderBy(desc(events.createdAt));

  // Get summary stats
  const totalEvents = allEvents.length;
  const activeEvents = allEvents.filter(e => e.event.isActive).length;
  const upcomingEvents = allEvents.filter(e => e.event.startDate > new Date()).length;
  const totalAttendeeCapacity = allEvents.reduce((sum, e) => sum + (e.event.maxAttendees ?? 0), 0);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "job_fair": return "bg-blue-100 text-blue-800 border-blue-300";
      case "conference": return "bg-purple-100 text-purple-800 border-purple-300";
      case "workshop": return "bg-green-100 text-green-800 border-green-300";
      case "networking": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getEventStatus = (event: any) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) return { label: "Completed", color: "bg-gray-100 text-gray-800" };
    if (startDate <= now && endDate >= now) return { label: "Live", color: "bg-green-100 text-green-800" };
    if (startDate > now) return { label: "Upcoming", color: "bg-blue-100 text-blue-800" };
    return { label: "Draft", color: "bg-yellow-100 text-yellow-800" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and monitor your events from start to finish
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
          <CreateEventModal
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events Card */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/60 group hover:scale-105">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {totalEvents}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    +{Math.floor(totalEvents * 0.12)} this month
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Total Events
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All events created
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Events Card */}
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
                    {activeEvents}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {activeEvents > 0 ? '🟢 Live now' : '⏸️ None active'}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Active Events
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently running
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 dark:from-violet-950/40 dark:via-purple-900/30 dark:to-violet-950/60 group hover:scale-105">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-violet-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {upcomingEvents}
                  </div>
                  <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                    {upcomingEvents > 0 ? '📅 Scheduled' : '🔄 Plan ahead'}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Upcoming
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Events scheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Capacity Card */}
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
                    {totalAttendeeCapacity > 999 ? `${(totalAttendeeCapacity / 1000).toFixed(1)}K` : totalAttendeeCapacity.toLocaleString()}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    👥 Max attendees
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Total Capacity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Across all events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              All Events
            </CardTitle>
            <Badge variant="outline">
              {allEvents.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {allEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Events Created Yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first event. Define all the details, set up checkpoints, and manage everything from one place.
              </p>
              <CreateEventModal
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {allEvents.map((item) => {
                const event = item.event;
                const status = getEventStatus(event);
                
                return (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200 bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {event.name}
                          </h3>
                          {event.isActive && (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <Power className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                          <Badge className={getEventTypeColor(event.eventType ?? '')}>
                            {event.eventType?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span>{event.venue}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4 text-purple-500" />
                            <span>{event.maxAttendees?.toLocaleString()} capacity</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 text-orange-500" />
                            <span>{item.checkpointCount} checkpoints • {item.boothCount} booths</span>
                          </div>
                        </div>

                       
                      </div>

                      <EventActionsMenu event={event} />
                    </div>

                    {/* Quick Stats */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>Created {new Date(event.createdAt).toLocaleDateString()}</span>
                         
                       
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Create Job Fair</h3>
            <p className="text-blue-800 text-sm mb-4">
              Set up a comprehensive job fair with booths, interviews, and candidate management
            </p>
            <CreateEventModal
              defaultType="job_fair"
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                  Start Job Fair
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-2">Quick Setup</h3>
            <p className="text-purple-800 text-sm mb-4">
              Use our Huawei Job Fair template for instant setup with all configurations
            </p>
            <Button variant="outline" className="border-purple-600 text-purple-700 hover:bg-purple-50 w-full" asChild>
              <a href="/admin/setup-huawei">
                Huawei Template
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Analytics Hub</h3>
            <p className="text-green-800 text-sm mb-4">
              View comprehensive reports and insights from all your events
            </p>
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 w-full" asChild>
              <a href="/admin/reports">
                View Reports
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}