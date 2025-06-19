import db from "@/db/drizzle";
import { attendanceRecords, jobSeekers, users, securityPersonnel } from "@/db/schema";
import { eq, desc, and, gte, or, isNull } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, User, MapPin, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

interface AttendanceHistoryProps {
  securityId: string;
  limit?: number;
}

export async function AttendanceHistory({ securityId, limit = 10 }: AttendanceHistoryProps) {
  // Check if this is an admin user (mock security ID)
  const isAdmin = securityId.startsWith('admin-');

  // Get recent attendance records verified by this security personnel or admin
  const recentRecords = await db
    .select({
      id: attendanceRecords.id,
      checkInTime: attendanceRecords.checkInTime,
      verificationMethod: attendanceRecords.verificationMethod,
      verificationData: attendanceRecords.verificationData,
      status: attendanceRecords.status,
      checkpointId: attendanceRecords.checkpointId,
      notes: attendanceRecords.notes,
      verifiedBy: attendanceRecords.verifiedBy,
      // Job seeker info
      jobSeekerName: users.name,
      jobSeekerEmail: users.email,
      pin: jobSeekers.pin,
      ticketNumber: jobSeekers.ticketNumber,
      // Security personnel info (for non-admin verifications)
      securityBadge: securityPersonnel.badgeNumber,
      securityDepartment: securityPersonnel.department,
    })
    .from(attendanceRecords)
    .leftJoin(jobSeekers, eq(attendanceRecords.jobSeekerId, jobSeekers.id))
    .leftJoin(users, eq(jobSeekers.userId, users.id))
    .leftJoin(securityPersonnel, eq(attendanceRecords.verifiedBy, securityPersonnel.id))
    .where(
      isAdmin 
        ? gte(attendanceRecords.checkInTime, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Show last 24 hours for admin
        : or(
            eq(attendanceRecords.verifiedBy, securityId),
            // Also show null verifiedBy records if this is an admin context
            isAdmin ? isNull(attendanceRecords.verifiedBy) : undefined
          )
    )
    .orderBy(desc(attendanceRecords.checkInTime))
    .limit(limit);

  if (recentRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <CheckCircle className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No verifications yet</p>
        <p className="text-sm">Verified attendees will appear here</p>
      </div>
    );
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "pin":
        return "bg-blue-100 text-blue-800";
      case "ticket_number":
        return "bg-green-100 text-green-800";
      case "manual":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked_in":
        return "bg-green-100 text-green-800";
      case "checked_out":
        return "bg-blue-100 text-blue-800";
      case "flagged":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attendee</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Verification Data</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Verified By</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{record.jobSeekerName}</span>
                    </div>
                    <p className="text-xs text-gray-500">{record.jobSeekerEmail}</p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getMethodColor(record.verificationMethod)}
                  >
                    {record.verificationMethod.replace('_', ' ')}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {record.verificationMethod === 'pin' && (
                      <span className="font-mono">PIN: {record.pin}</span>
                    )}
                    {record.verificationMethod === 'ticket_number' && (
                      <span className="font-mono">{record.ticketNumber}</span>
                    )}
                    {record.verificationMethod === 'manual' && (
                      <span className="text-gray-600">Manual verification</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {record.checkInTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                    <p className="text-xs text-gray-500">
                      {record.checkInTime.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(record.status ?? '')}
                    >
                      {record.status?.replace('_', ' ') ?? ''}
                    </Badge>
                    {record.notes && (
                      <p className="text-xs text-gray-500 max-w-32 truncate" title={record.notes}>
                        {record.notes}
                      </p>
                    )}
                  </div>
                </TableCell>

                {isAdmin && (
                  <TableCell>
                    <div className="space-y-1">
                      {record.verifiedBy ? (
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-gray-600">
                            {record.securityBadge || 'Security'}
                          </span>
                          {record.securityDepartment && (
                            <span className="text-xs text-gray-400">
                              ({record.securityDepartment})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-600">
                            Admin Verification
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {recentRecords.length === limit && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Showing {limit} most recent verifications
          </p>
        </div>
      )}
    </div>
  );
} 