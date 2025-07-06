import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, events } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users as UsersIcon, 
  Building2,
  CheckCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Settings,
  Play
} from "lucide-react";
import { setupHuaweiJobFair2025, getHuaweiEventStatus } from "@/lib/actions/huawei-event-setup";

async function SetupAction(formData: FormData) {
  "use server";
  
  try {
    await setupHuaweiJobFair2025();
    redirect("/admin/setup-huawei?success=true");
  } catch (error) {
    console.error("Setup error:", error);
    redirect("/admin/setup-huawei?error=true");
  }
}

export default async function HuaweiSetupPage() {
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

  // Check if Huawei event already exists
  const existingEvents = await db
    .select()
    .from(events)
    .where(
      and(
        ilike(events.name, "%Huawei%"),
        eq(events.isActive, true)
      )
    );

  const eventStatus = await getHuaweiEventStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Huawei Job Fair Setup</h1>
          <p className="text-gray-600 mt-2">
            Initialize the Huawei Nation Job Fair 2025 with all required configurations
          </p>
        </div>
        {!eventStatus.exists && (
          <form action={SetupAction}>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              <Play className="h-4 w-4 mr-2" />
              Setup Huawei Event
            </Button>
          </form>
        )}
      </div>

      {/* Event Status */}
      {eventStatus.exists ? (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-900">Event Ready</CardTitle>
                <p className="text-green-800 text-sm">
                  Huawei Job Fair is configured and ready to go
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Event Dates</h3>
                <p className="text-green-800 text-sm">
                  {eventStatus.event?.startDate ? new Date(eventStatus.event.startDate).toLocaleDateString() : 'Jun 5-6, 2025'}
                </p>
              </div>
              <div className="text-center">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Venue</h3>
                <p className="text-green-800 text-sm">
                  {eventStatus.event?.venue || 'UON Graduation Square, Nairobi'}
                </p>
              </div>
              <div className="text-center">
                <UsersIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Capacity</h3>
                <p className="text-green-800 text-sm">
                  {eventStatus.event?.maxAttendees || '5,000'} attendees
                </p>
              </div>
              <div className="text-center">
                <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Checkpoints</h3>
                <p className="text-green-800 text-sm">
                  {eventStatus.infrastructure?.checkpoints || 7} configured
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-green-200">
              <h3 className="font-semibold text-green-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  <a href="/admin/reports">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Impact Reports
                  </a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  <a href="/admin/crowd-control">
                    <Zap className="h-4 w-4 mr-2" />
                    Manage Crowd Control
                  </a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  <a href="/admin/events">
                    <Settings className="h-4 w-4 mr-2" />
                    Event Settings
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-yellow-900">Setup Required</CardTitle>
                <p className="text-yellow-800 text-sm">
                  Huawei Job Fair needs to be initialized
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-yellow-800">
                Click the &quot;Setup Huawei Event&quot; button to automatically configure:
              </p>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Event details for July 8th, 2025 at UON Graduation Square
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Capacity planning for 5,000+ job seekers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  7 strategic checkpoints for crowd control
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Batch entry management system
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  70 employer booth allocation planning
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Job Seeker Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Pre-registration with CV upload</li>
              <li>• PIN-based verification system</li>
              <li>• Ticket number assignment</li>
              <li>• Batch entry management</li>
              <li>• Real-time attendance tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Employer Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Booth setup and management</li>
              <li>• Interview scheduling system</li>
              <li>• Candidate profile viewing</li>
              <li>• Shortlisting functionality</li>
              <li>• Real-time analytics</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Impact Reporting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Comprehensive engagement metrics</li>
              <li>• Employer performance analytics</li>
              <li>• Progression tracking (interview → hire)</li>
              <li>• PDF report generation</li>
              <li>• Huawei partnership insights</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Crowd Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Time-based batch entry</li>
              <li>• Real-time capacity monitoring</li>
              <li>• Checkpoint status tracking</li>
              <li>• Emergency flow controls</li>
              <li>• Traffic optimization</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• PIN verification system</li>
              <li>• Security personnel interface</li>
              <li>• Incident reporting</li>
              <li>• Access control management</li>
              <li>• Offline verification support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Ready Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Complete database schema</li>
              <li>• Authentication system</li>
              <li>• File upload (CV) system</li>
              <li>• Notification framework</li>
              <li>• Mobile-responsive design</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Event Specifications */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Huawei Nation Job Fair 2025 Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-red-900 mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-red-800">Event Name:</span>
                  <span className="font-medium text-red-900">Huawei Nation Job Fair 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Dates:</span>
                  <span className="font-medium text-red-900">July 8th, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Venue:</span>
                  <span className="font-medium text-red-900">UON Graduation Square, Nairobi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Duration:</span>
                  <span className="font-medium text-red-900">2 Days</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-4">Capacity Planning</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-red-800">Expected Job Seekers:</span>
                  <span className="font-medium text-red-900">5,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Participating Employers:</span>
                  <span className="font-medium text-red-900">50-70</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Batch Size:</span>
                  <span className="font-medium text-red-900">~280 per hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Checkpoints:</span>
                  <span className="font-medium text-red-900">7 Strategic Points</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 