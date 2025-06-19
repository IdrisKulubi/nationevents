// Shared types for the security module

export interface Checkpoint {
  id: string;
  name: string;
  location: string;
  checkpointType: string;
  isActive: boolean;
  maxCapacity: number | null;
  currentOccupancy: number;
}

export interface SecurityPersonnel {
  id: string;
  userId: string;
  badgeNumber: string | null;
  department: string | null;
  clearanceLevel: "basic" | "intermediate" | "advanced";
  assignedCheckpoints: string[] | null;
  isOnDuty: boolean | null;
  shiftStart: Date | null;
  shiftEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  jobSeekerId: string;
  eventId: string;
  checkpointId: string | null;
  verifiedBy: string | null;
  checkInTime: Date;
  checkOutTime: Date | null;
  verificationMethod: "pin" | "ticket_number" | "manual";
  verificationData: string | null;
  status: "checked_in" | "checked_out" | "flagged";
  notes: string | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  createdAt: Date;
}

export interface SecurityIncident {
  id: string;
  eventId: string;
  reportedBy: string;
  incidentType: "unauthorized_access" | "suspicious_activity" | "emergency" | "technical_issue" | "other";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  description: string;
  involvedPersons: string[] | null;
  actionTaken: string | null;
  status: "open" | "investigating" | "resolved" | "closed";
  resolvedBy: string | null;
  resolvedAt: Date | null;
  attachments: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSeeker {
  id: string;
  userId: string;
  pin: string | null;
  ticketNumber: string | null;
  registrationStatus: "pending" | "approved" | "rejected";
  pinGeneratedAt: Date | null;
  pinExpiresAt: Date | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "job_seeker" | "employer" | "admin" | "security";
  isActive: boolean | null;
}

// API Response types
export interface VerificationResponse {
  success: boolean;
  message: string;
  attendee?: {
    id: string;
    name: string;
    email: string;
    pin: string;
    ticketNumber: string;
    registrationStatus: string;
    checkInTime?: string;
    alreadyCheckedIn?: boolean;
  };
}

export interface IncidentResponse {
  success: boolean;
  message: string;
  incidentId?: string;
}

export interface SetupResponse {
  success: boolean;
  message: string;
}

// Dashboard types
export interface SecurityDashboardStats {
  totalCheckIns: number;
  activeCheckpoints: number;
  onDutyPersonnel: number;
  pendingIncidents: number;
  recentActivity: AttendanceRecord[];
  checkpointOccupancy: {
    checkpointId: string;
    name: string;
    currentOccupancy: number;
    maxCapacity: number | null;
  }[];
}

export interface VerificationRequest {
  qrCode?: string;
  ticketNumber?: string;
  checkpointId: string;
  verificationMethod: "qr_code" | "ticket_number" | "manual";
  notes?: string;
}

export interface VerificationResult {
  success: boolean;
  jobSeeker?: {
    id: string;
    name: string;
    email: string;
    ticketNumber: string;
    qrCode: string;
    registrationStatus: string;
  };
  attendanceRecord?: AttendanceRecord;
  error?: string;
  message: string;
}

export interface IncidentReport {
  incidentType: SecurityIncident["incidentType"];
  severity: SecurityIncident["severity"];
  location: string;
  description: string;
  involvedPersons?: string[];
  attachments?: File[];
} 