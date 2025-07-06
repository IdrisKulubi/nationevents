import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, employers, booths, events } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Settings, Plus, Users, Wrench, Building, Home } from "lucide-react";
import { BoothCreationModal } from "@/components/employer/booth-creation-modal";
import Link from "next/link";

export default async function EmployerBoothsPage() {
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

  // Get events (all events for admin, active events for employers)
  const eventsQuery = db
    .select()
    .from(events)
    .orderBy(desc(events.startDate));
    
  // Only filter by active status if not admin
  if (currentUser.role !== "admin") {
    eventsQuery.where(eq(events.isActive, true));
  }
  
  const activeEvents = await eventsQuery;

  // Get employer's booths
  const employerBooths = await db
    .select({
      booth: booths,
      event: events,
    })
    .from(booths)
    .leftJoin(events, eq(events.id, booths.eventId))
    .where(eq(booths.employerId, employer.id))
    .orderBy(desc(booths.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booth Management</h1>
          <p className="text-gray-600 mt-2 dark:text-gray-900">
            Configure and manage your exhibition booth setup
          </p>
        </div>
        <BoothCreationModal events={activeEvents} />
      </div>

      {/* Admin Notice */}
      {currentUser.role === "admin" && !employerProfile[0] && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Admin Mode - Use Admin Interface</h3>
                <p className="text-amber-800 text-sm mb-3">
                  As an administrator, you should use the dedicated Admin Booth Management interface to create and manage booths for companies.
                </p>
                <div className="flex gap-3">
                  <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Link href="/admin/booths">
                      <Building className="h-4 w-4 mr-2" />
                      Go to Admin Booth Management
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="border-amber-600 text-amber-700 hover:bg-amber-50">
                    <Link href="/admin">
                      <Home className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Active Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 group hover:scale-105"
                >
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/20 transition-colors duration-300" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{event.name}</h3>
                        {event.isActive ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-xs">
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <BoothCreationModal 
                        events={[event]} 
                        trigger={
                          <Button variant="outline" size="sm" className="w-full group-hover:bg-blue-50 transition-colors">
                            <Plus className="h-4 w-4 mr-2" />
                            Setup Booth
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Booths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Your Booths
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employerBooths.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No booths configured yet
              </h3>
              <p className="text-gray-600 mb-6">
                Set up your booth to start connecting with job seekers at events
              </p>
              <BoothCreationModal 
                events={activeEvents}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Setup Your First Booth
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {employerBooths.map((item) => (
                <div
                  key={item.booth.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Booth {item.booth.boothNumber}
                      </h3>
                      <p className="text-gray-600 mt-1">{item.booth.location}</p>
                      {item.event && (
                        <p className="text-sm text-blue-600 mt-1">
                          {item.event.name}
                        </p>
                      )}
                    </div>
                    <Badge variant={item.booth.isActive ? "default" : "secondary"}>
                      {item.booth.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Size: {item.booth.size}</span>
                    </div>
                    {item.booth.equipment && item.booth.equipment.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <Wrench className="h-4 w-4 mt-0.5" />
                        <div>
                          <span>{item.booth.equipment.length} equipment items</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.booth.equipment.slice(0, 3).map((eq, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {eq}
                              </Badge>
                            ))}
                            {item.booth.equipment.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.booth.equipment.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {item.booth.specialRequirements && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Special Requirements:</strong> {item.booth.specialRequirements}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Slots
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booth Setup Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <MapPin className="h-5 w-5" />
            Booth Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-blue-900">Choose Event</h3>
              <p className="text-blue-800 text-sm mt-1">
                Select which event you want to participate in
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-blue-900">Configure Booth</h3>
              <p className="text-blue-800 text-sm mt-1">
                Set up your booth details and requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-blue-900">Add Time Slots</h3>
              <p className="text-blue-800 text-sm mt-1">
                Create interview slots for candidates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 