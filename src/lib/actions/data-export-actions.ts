"use server";

import { users, jobSeekers, attendanceRecords, events } from "@/db/schema";
import { eq, desc, like, and, isNotNull, or, sql } from "drizzle-orm";
import db from "@/db/drizzle";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun } from "docx";

// Types for better type safety
export interface AttendeeData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  registrationStatus: "pending" | "approved" | "rejected" | null;
  createdAt: Date;
  isHuaweiStudent: boolean | null;
  pin: string | null;
  ticketNumber: string | null;
  bio: string | null;
  skills: string[] | null;
  experience: string | null;
  education: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  wantsToAttendConference: boolean | null;
  conferenceAttendanceStatus: "registered" | "confirmed" | "attended" | "no_show" | "cancelled" | null;
  attendanceCount: number;
  lastAttendance: Date | null;
  huaweiCertificationLevel: "HCIA" | "HCIP" | "HCIE" | "other" | null;
}

export interface DataExportFilters {
  search?: string;
  registrationStatus?: string;
  huaweiStudent?: string;
  conferenceAttendance?: string;
  hasAttendance?: string;
}

// Fetch all attendees data with comprehensive information
export async function getAttendeesData(filters: DataExportFilters = {}): Promise<AttendeeData[]> {
  try {
    // Apply filters
    const baseConditions = [
      eq(users.isActive, true),
      isNotNull(users.email)
    ];

    const conditions: any[] = [...baseConditions];

    if (filters.search) {
      conditions.push(
        or(
          like(users.name, `%${filters.search}%`),
          like(users.email, `%${filters.search}%`),
          like(users.phoneNumber, `%${filters.search}%`)
        )
      );
    }

    if (filters.registrationStatus && filters.registrationStatus !== "all") {
      conditions.push(eq(jobSeekers.registrationStatus, filters.registrationStatus as any));
    }

    if (filters.huaweiStudent && filters.huaweiStudent !== "all") {
      conditions.push(eq(jobSeekers.isHuaweiStudent, filters.huaweiStudent === "true"));
    }

    if (filters.conferenceAttendance && filters.conferenceAttendance !== "all") {
      conditions.push(eq(jobSeekers.conferenceAttendanceStatus, filters.conferenceAttendance as any));
    }

    const results = await db
      .select({
        id: jobSeekers.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        registrationStatus: jobSeekers.registrationStatus,
        createdAt: users.createdAt,
        isHuaweiStudent: jobSeekers.isHuaweiStudent,
        pin: jobSeekers.pin,
        ticketNumber: jobSeekers.ticketNumber,
        bio: jobSeekers.bio,
        skills: jobSeekers.skills,
        experience: jobSeekers.experience,
        education: jobSeekers.education,
        linkedinUrl: jobSeekers.linkedinUrl,
        portfolioUrl: jobSeekers.portfolioUrl,
        wantsToAttendConference: jobSeekers.wantsToAttendConference,
        conferenceAttendanceStatus: jobSeekers.conferenceAttendanceStatus,
        huaweiCertificationLevel: jobSeekers.huaweiCertificationLevel,
        // Attendance count and last attendance (calculated via subqueries)
        attendanceCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${attendanceRecords} 
          WHERE ${attendanceRecords.jobSeekerId} = ${jobSeekers.id}
        )`.as("attendanceCount"),
        lastAttendance: sql<Date | null>`(
          SELECT MAX(${attendanceRecords.checkInTime})
          FROM ${attendanceRecords} 
          WHERE ${attendanceRecords.jobSeekerId} = ${jobSeekers.id}
        )`.as("lastAttendance"),
      })
      .from(jobSeekers)
      .innerJoin(users, eq(jobSeekers.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(10000); // Safety limit

    return results.map(row => ({
      ...row,
      attendanceCount: Number(row.attendanceCount) || 0,
    }));

  } catch (error) {
    console.error("Error fetching attendees data:", error);
    throw new Error("Failed to fetch attendees data");
  }
}

// Generate DOCX document with attendee data
export async function generateAttendeesDocx(data: AttendeeData[]): Promise<Buffer> {
  try {
    // Create table rows for attendees
    const tableRows = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Name", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 2500, type: WidthType.DXA }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Email", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 3500, type: WidthType.DXA }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Phone Number", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 2000, type: WidthType.DXA }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Registration Status", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 1500, type: WidthType.DXA }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Huawei Student", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 1200, type: WidthType.DXA }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Conference", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 1200, type: WidthType.DXA }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Attendance Count", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 1100, type: WidthType.DXA }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "Registration Date", bold: true })],
              alignment: AlignmentType.CENTER
            })],
            width: { size: 1500, type: WidthType.DXA }
          }),
        ],
      }),
      // Data rows
      ...data.map(attendee => new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: attendee.name || "N/A" })],
          }),
          new TableCell({
            children: [new Paragraph({ text: attendee.email || "N/A" })],
          }),
          new TableCell({
            children: [new Paragraph({ text: attendee.phoneNumber || "N/A" })],
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: attendee.registrationStatus ? 
                attendee.registrationStatus.charAt(0).toUpperCase() + attendee.registrationStatus.slice(1) : 
                "Pending" 
            })],
          }),
          new TableCell({
            children: [new Paragraph({ text: attendee.isHuaweiStudent ? "Yes" : "No" })],
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: attendee.wantsToAttendConference ? "Yes" : "No"
            })],
          }),
          new TableCell({
            children: [new Paragraph({ text: attendee.attendanceCount.toString() })],
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: new Date(attendee.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            })],
          }),
        ],
      })),
    ];

    // Create the document
    const doc = new Document({
      sections: [
        {
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: "Nation-Huawei Job Fair 2025 - Attendees Report",
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            // Summary
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on: ${new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Total Attendees: ${data.length}`,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),
            // Statistics
            new Paragraph({
              children: [
                new TextRun({
                  text: "Quick Statistics:",
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Approved: ${data.filter(a => a.registrationStatus === "approved").length}`,
                  size: 18,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Pending: ${data.filter(a => a.registrationStatus === "pending").length}`,
                  size: 18,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Huawei Students: ${data.filter(a => a.isHuaweiStudent).length}`,
                  size: 18,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• Conference Interested: ${data.filter(a => a.wantsToAttendConference).length}`,
                  size: 18,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `• With Phone Numbers: ${data.filter(a => a.phoneNumber).length}`,
                  size: 18,
                }),
              ],
              spacing: { after: 400 },
            }),
            // Table
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: tableRows,
            }),
          ],
        },
      ],
    });

    // Generate buffer
    return await Packer.toBuffer(doc);

  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error("Failed to generate DOCX document");
  }
}

// Get summary statistics for the data page
export async function getDataSummaryStats() {
  try {
    const stats = await db
      .select({
        totalAttendees: sql<number>`COUNT(*)`,
        approvedAttendees: sql<number>`COUNT(*) FILTER (WHERE ${jobSeekers.registrationStatus} = 'approved')`,
        pendingAttendees: sql<number>`COUNT(*) FILTER (WHERE ${jobSeekers.registrationStatus} = 'pending')`,
        rejectedAttendees: sql<number>`COUNT(*) FILTER (WHERE ${jobSeekers.registrationStatus} = 'rejected')`,
        huaweiStudents: sql<number>`COUNT(*) FILTER (WHERE ${jobSeekers.isHuaweiStudent} = true)`,
        conferenceInterested: sql<number>`COUNT(*) FILTER (WHERE ${jobSeekers.wantsToAttendConference} = true)`,
        withPhoneNumbers: sql<number>`COUNT(*) FILTER (WHERE ${users.phoneNumber} IS NOT NULL AND ${users.phoneNumber} != '')`,
        withAttendance: sql<number>`COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM ${attendanceRecords} WHERE ${attendanceRecords.jobSeekerId} = ${jobSeekers.id}))`,
      })
      .from(jobSeekers)
      .innerJoin(users, eq(jobSeekers.userId, users.id))
      .where(eq(users.isActive, true));

    return stats[0];
  } catch (error) {
    console.error("Error fetching summary stats:", error);
    throw new Error("Failed to fetch summary statistics");
  }
}
