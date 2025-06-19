import { auth } from "@/auth";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  users, 
  jobSeekers, 
  attendanceRecords,
  checkpoints,
  booths,
  employers,
  events
} from "@/db/schema";
import { eq, and, gte, lte, count, sql, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  TrendingUp,
  Shield,
  Activity,
  Zap,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-react";

export default async function CrowdControlPage() {
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

  // Get current active event
  const activeEvent = await db
    .select()
    .from(events)
    .where(eq(events.isActive, true))
    .limit(1);

  if (!activeEvent[0]) {
    return (
      <div className="p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              No Active Event
            </h3>
            <p className="text-yellow-800">
              Please activate an event to manage crowd control.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventId = activeEvent[0].id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get real-time crowd control data
  const [
    totalRegistered,
    checkedInToday,
    checkpointStatus,
    boothCapacity,
    timeSlotDistribution,
    currentActivity
  ] = await Promise.all([
    // Total registered attendees
    db.select({ count: count() })
      .from(jobSeekers)
      .where(eq(jobSeekers.registrationStatus, "approved")),
    
    // Checked in today
    db.select({ count: count() })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.eventId, eventId),
          gte(attendanceRecords.checkInTime, today),
          lte(attendanceRecords.checkInTime, tomorrow)
        )
      ),
    
    // Checkpoint status
    db.select({
      checkpointName: checkpoints.name,
      checkpointType: checkpoints.checkpointType,
      maxCapacity: checkpoints.maxCapacity,
      currentOccupancy: checkpoints.currentOccupancy,
      isActive: checkpoints.isActive
    })
      .from(checkpoints)
      .where(eq(checkpoints.eventId, eventId))
      .orderBy(checkpoints.name),
    
    // Booth capacity status
    db.select({
      boothNumber: booths.boothNumber,
      companyName: employers.companyName,
      location: booths.location,
      size: booths.size,
      currentVisitors: sql<number>`COALESCE(COUNT(CASE WHEN ${attendanceRecords.checkInTime} >= ${today} AND ${attendanceRecords.checkOutTime} IS NULL THEN 1 END), 0)`
    })
      .from(booths)
      .leftJoin(employers, eq(booths.employerId, employers.id))
      .leftJoin(attendanceRecords, and(
        eq(attendanceRecords.checkpointId, booths.id),
        gte(attendanceRecords.checkInTime, today)
      ))
      .where(eq(booths.eventId, eventId))
      .groupBy(booths.id, booths.boothNumber, employers.companyName, booths.location, booths.size),
    
    // Time slot distribution (hourly)
    db.select({
      hour: sql<number>`EXTRACT(HOUR FROM ${attendanceRecords.checkInTime})`,
      count: count()
    })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.eventId, eventId),
          gte(attendanceRecords.checkInTime, today),
          lte(attendanceRecords.checkInTime, tomorrow)
        )
      )
      .groupBy(sql`EXTRACT(HOUR FROM ${attendanceRecords.checkInTime})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${attendanceRecords.checkInTime})`),
    
    // Current activity (last 30 minutes)
    db.select({
      checkpoint: checkpoints.name,
      count: count()
    })
      .from(attendanceRecords)
      .leftJoin(checkpoints, eq(attendanceRecords.checkpointId, checkpoints.id))
      .where(
        and(
          eq(attendanceRecords.eventId, eventId),
          gte(attendanceRecords.checkInTime, new Date(Date.now() - 30 * 60 * 1000))
        )
      )
      .groupBy(checkpoints.name)
      .orderBy(desc(count()))
  ]);

  // Calculate key metrics
  const attendanceRate = totalRegistered[0]?.count > 0 
    ? Math.round((checkedInToday[0]?.count || 0) / totalRegistered[0].count * 100) 
    : 0;

  const totalCapacity = checkpointStatus.reduce((sum, cp) => sum + (cp.maxCapacity || 0), 0);
  const currentOccupancy = checkpointStatus.reduce((sum, cp) => sum + (cp.currentOccupancy || 0), 0);
  const capacityUtilization = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  // Generate time batches for entry management
  const generateTimeBatches = () => {
    const batches = [];
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      const batchSize = Math.floor((totalRegistered[0]?.count || 5000) / (endHour - startHour));
      const currentHourData = timeSlotDistribution.find(slot => slot.hour === hour);
      
      batches.push({
        timeSlot: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`,
        plannedCapacity: batchSize,
        currentAttendees: currentHourData?.count || 0,
        utilization: batchSize > 0 ? Math.round(((currentHourData?.count || 0) / batchSize) * 100) : 0,
        status: hour <= new Date().getHours() ? 'active' : 'upcoming'
      });
    }
    
    return batches;
  };

  const timeBatches = generateTimeBatches();

  const getCapacityColor = (utilization: number) => {
    if (utilization >= 90) return "bg-red-100 text-red-800 border-red-300";
    if (utilization >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  const getBoothCapacity = (size: string) => {
    switch (size) {
      case 'large': return 50;
      case 'medium': return 30;
      case 'small': return 15;
      default: return 25;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crowd Control Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time traffic management for {activeEvent[0].name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Batches
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Shield className="h-4 w-4 mr-2" />
            Emergency Override
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {checkedInToday[0]?.count || 0}
                </p>
                <p className="text-sm text-gray-600">Attendees Today</p>
                <p className="text-xs text-blue-600 font-medium">
                  {attendanceRate}% of registered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {capacityUtilization}%
                </p>
                <p className="text-sm text-gray-600">Capacity Utilization</p>
                <p className="text-xs text-green-600 font-medium">
                  {currentOccupancy}/{totalCapacity} spots
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {checkpointStatus.filter(cp => cp.isActive).length}
                </p>
                <p className="text-sm text-gray-600">Active Checkpoints</p>
                <p className="text-xs text-purple-600 font-medium">
                  {checkpointStatus.length} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {currentActivity.reduce((sum, activity) => sum + activity.count, 0)}
                </p>
                <p className="text-sm text-gray-600">Recent Activity</p>
                <p className="text-xs text-orange-600 font-medium">
                  Last 30 minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Batch Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Time Batch Entry Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {timeBatches.map((batch, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  batch.status === 'active' 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{batch.timeSlot}</h3>
                  <Badge variant={batch.status === 'active' ? 'default' : 'outline'}>
                    {batch.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{batch.currentAttendees}/{batch.plannedCapacity}</span>
                  </div>
                  
                  <Progress value={batch.utilization} className="h-2" />
                  
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${
                      batch.utilization >= 90 ? 'text-red-600' :
                      batch.utilization >= 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {batch.utilization}% utilized
                    </span>
                    <span className="text-gray-500">
                      {batch.plannedCapacity - batch.currentAttendees} remaining
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checkpoint Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Checkpoint Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkpointStatus.map((checkpoint) => {
                const utilization = checkpoint.maxCapacity 
                  ? Math.round((checkpoint.currentOccupancy || 0) / checkpoint.maxCapacity * 100)
                  : 0;
                
                return (
                  <div key={checkpoint.checkpointName} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        checkpoint.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{checkpoint.checkpointName}</h3>
                        <p className="text-sm text-gray-600 capitalize">{checkpoint.checkpointType?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {checkpoint.currentOccupancy || 0}/{checkpoint.maxCapacity || 0}
                        </p>
                        <p className="text-xs text-gray-500">{utilization}% capacity</p>
                      </div>
                      
                      <Badge className={getCapacityColor(utilization)}>
                        {utilization >= 90 ? 'High' : utilization >= 70 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Booth Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {boothCapacity.slice(0, 8).map((booth) => {
                const maxCapacity = getBoothCapacity(booth.size || 'medium');
                const utilization = Math.round((booth.currentVisitors / maxCapacity) * 100);
                
                return (
                  <div key={booth.boothNumber} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Booth {booth.boothNumber}</h3>
                      <p className="text-sm text-gray-600">{booth.companyName}</p>
                      <p className="text-xs text-gray-500">{booth.location}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {booth.currentVisitors}/{maxCapacity}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{booth.size} booth</p>
                      </div>
                      
                      <Badge className={getCapacityColor(utilization)}>
                        {utilization >= 90 ? 'Full' : utilization >= 70 ? 'Busy' : 'Available'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Control Actions */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900">Traffic Control Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-yellow-900 mb-2">Batch Release</h3>
              <p className="text-yellow-800 text-sm mb-4">
                Release next batch of {Math.floor((totalRegistered[0]?.count || 5000) / 9)} attendees
              </p>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                Release Next Batch
              </Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-900 mb-2">Capacity Alert</h3>
              <p className="text-orange-800 text-sm mb-4">
                Temporarily halt entry when capacity reaches 85%
              </p>
              <Button variant="outline" className="border-orange-600 text-orange-600">
                Enable Auto-Hold
              </Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-900 mb-2">Emergency Stop</h3>
              <p className="text-red-800 text-sm mb-4">
                Immediately halt all new entries for safety
              </p>
              <Button className="bg-red-600 hover:bg-red-700">
                Emergency Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 