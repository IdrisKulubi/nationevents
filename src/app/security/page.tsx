import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users, securityPersonnel, attendanceRecords, securityIncidents, checkpoints } from "@/db/schema";
import { eq, desc, and, gte, or, isNull } from "drizzle-orm";
import { PinVerificationForm } from "@/components/security/pin-verification-form";
import { IncidentReportForm } from "@/components/security/incident-report-form";
import { AttendanceHistory } from "@/components/security/attendance-history";
import { SecurityStats } from "@/components/security/security-stats";
import { CheckpointSelector } from "@/components/security/checkpoint-selector";
import { Checkpoint } from "@/lib/shared/types";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

async function createAdminSecurityRecord(userId: string, userName: string) {
  "use server";
  
  const securityId = `sec-admin-${userId}`;
  
  try {
    await db.insert(securityPersonnel).values({
      id: securityId,
      userId,
      badgeNumber: `ADMIN-${userId.slice(0, 8).toUpperCase()}`,
      department: "Administration",
      clearanceLevel: "advanced",
      isOnDuty: true,
      assignedCheckpoints: [],
    });
    
    return securityId;
  } catch (error) {
    console.error("Failed to create admin security record:", error);
    return null;
  }
}

export default async function SecurityDashboard() {
  const session = await auth();
  
  // Get user info
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session!.user!.id))
    .limit(1);

  const currentUser = user[0];
  const isAdmin = currentUser.role === "admin";

  // Get security personnel profile (only for security role users)
  let security = null;
  if (!isAdmin) {
    const securityProfile = await db
      .select()
      .from(securityPersonnel)
      .where(eq(securityPersonnel.userId, session!.user!.id))
      .limit(1);
    security = securityProfile[0];
  } else {
    // For admins, check if they have a security personnel record
    const adminSecurityProfile = await db
      .select()
      .from(securityPersonnel)
      .where(eq(securityPersonnel.userId, session!.user!.id))
      .limit(1);
    security = adminSecurityProfile[0];
  }

  // For admin users without security record, create a mock security ID for functionality
  const securityId = security?.id || `admin-${currentUser.id}`;

  // Get today's stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // For admins, get all attendance records, for security personnel get only their records
  const todayAttendance = await db
    .select()
    .from(attendanceRecords)
    .where(
      isAdmin 
        ? gte(attendanceRecords.checkInTime, todayStart)
        : and(
            eq(attendanceRecords.verifiedBy, securityId),
            gte(attendanceRecords.checkInTime, todayStart)
          )
    );

  // For admins, get all incidents, for security personnel get only their reports
  const todayIncidents = await db
    .select()
    .from(securityIncidents)
    .where(
      isAdmin
        ? gte(securityIncidents.createdAt, todayStart)
        : and(
            eq(securityIncidents.reportedBy, securityId),
            gte(securityIncidents.createdAt, todayStart)
          )
    );

  // Get available checkpoints
  const availableCheckpoints = await db
    .select()
    .from(checkpoints)
    .where(eq(checkpoints.isActive, true));

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Admin Notice */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  Administrator Access
                </h3>
                <div className="mt-2 text-blue-800">
                  <p>
                    You are accessing the security dashboard as an administrator. 
                    You can view all security activities and perform verification operations across all checkpoints.
                  </p>
                  {!security && (
                    <p className="text-sm mt-2 text-blue-700">
                      <strong>Note:</strong> You&apos;re using temporary admin access. Consider creating a security personnel record for better tracking.
                    </p>
                  )}
                </div>
              </div>
            </div>
            {!security && (
              <form action={async () => {
                "use server";
                await createAdminSecurityRecord(currentUser.id, currentUser.name);
              }}>
                <Button type="submit" variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Security Record
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="mb-8">
        <SecurityStats 
          totalVerifications={todayAttendance.length}
          incidentsReported={todayIncidents.length}
          isOnDuty={security?.isOnDuty ?? true}
          badgeNumber={security?.badgeNumber || `ADMIN-${currentUser.id.slice(0, 8).toUpperCase()}`}
        />
      </div>

      {/* Checkpoint Selection - Only show for non-admin or if admin has assigned checkpoints */}
      {(!isAdmin || (security?.assignedCheckpoints && security.assignedCheckpoints.length > 0)) && (
        <div className="mb-8">
          <CheckpointSelector 
            checkpoints={availableCheckpoints as Checkpoint[]}
            assignedCheckpoints={security?.assignedCheckpoints || []}
            securityId={securityId}
          />
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* PIN Verification Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Attendee Verification
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Verify attendees using PIN or ticket number
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <PinVerificationForm securityId={securityId} />
          </div>
        </div>

        {/* Incident Reporting Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Incident Reporting
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Report security incidents and issues
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <IncidentReportForm securityId={securityId} />
          </div>
        </div>
      </div>

      {/* Recent Attendance History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isAdmin ? "All Recent Verifications" : "Your Recent Verifications"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Latest attendance verification history
                </p>
              </div>
            </div>
            <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
              <span className="text-sm font-medium text-blue-700">
                {todayAttendance.length} today
              </span>
            </div>
          </div>
        </div>
        <div>
          <AttendanceHistory securityId={securityId} />
        </div>
      </div>
    </div>
  );
} 