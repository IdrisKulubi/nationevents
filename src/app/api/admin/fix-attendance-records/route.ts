import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { attendanceRecords, securityPersonnel, users } from "@/db/schema";
import { eq, isNotNull } from "drizzle-orm";

interface FixResult {
  total: number;
  fixed: number;
  errors: string[];
}

async function validateAdminAccess() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: No active session");
  }

  const user = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

async function analyzeInvalidRecords() {
  // Get all valid security personnel IDs
  const validSecurity = await db
    .select({ id: securityPersonnel.id })
    .from(securityPersonnel);
  
  const validSecurityIds = validSecurity.map(s => s.id);

  // Get all attendance records with non-null verifiedBy
  const allRecords = await db
    .select({
      id: attendanceRecords.id,
      verifiedBy: attendanceRecords.verifiedBy,
      verificationMethod: attendanceRecords.verificationMethod,
      checkInTime: attendanceRecords.checkInTime,
      notes: attendanceRecords.notes
    })
    .from(attendanceRecords)
    .where(isNotNull(attendanceRecords.verifiedBy));

  // Find records with invalid verifiedBy references
  const invalidRecords = allRecords.filter(record => 
    record.verifiedBy && !validSecurityIds.includes(record.verifiedBy)
  );

  // Group by verifiedBy value for analysis
  const invalidByVerifier = invalidRecords.reduce((acc, record) => {
    const verifier = record.verifiedBy!;
    if (!acc[verifier]) {
      acc[verifier] = [];
    }
    acc[verifier].push(record);
    return acc;
  }, {} as Record<string, any[]>);

  return {
    invalidRecords,
    validSecurityIds,
    invalidByVerifier,
    summary: {
      totalAttendanceRecords: allRecords.length,
      validSecurityPersonnel: validSecurityIds.length,
      invalidRecords: invalidRecords.length,
      invalidVerifiers: Object.keys(invalidByVerifier)
    }
  };
}

async function fixInvalidRecords(invalidRecords: any[]): Promise<FixResult> {
  const result: FixResult = {
    total: invalidRecords.length,
    fixed: 0,
    errors: []
  };

  for (const record of invalidRecords) {
    try {
      await db
        .update(attendanceRecords)
        .set({ 
          verifiedBy: null,
          notes: record.notes 
            ? `${record.notes} [verifiedBy fixed from ${record.verifiedBy}]`
            : `[verifiedBy fixed from ${record.verifiedBy}]`
        })
        .where(eq(attendanceRecords.id, record.id));

      result.fixed++;
    } catch (error) {
      const errorMsg = `Failed to fix record ${record.id}: ${error}`;
      result.errors.push(errorMsg);
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    await validateAdminAccess();

    const analysis = await analyzeInvalidRecords();

    return NextResponse.json({
      success: true,
      data: {
        summary: analysis.summary,
        invalidByVerifier: analysis.invalidByVerifier,
        message: analysis.invalidRecords.length === 0 
          ? "No invalid attendance records found"
          : `Found ${analysis.invalidRecords.length} attendance records with invalid verifiedBy references`
      }
    });

  } catch (error) {
    console.error("Error analyzing attendance records:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to analyze attendance records",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await validateAdminAccess();

    const body = await request.json();
    const { apply = false } = body;

    const analysis = await analyzeInvalidRecords();

    if (analysis.invalidRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: analysis.summary,
          message: "No invalid attendance records found. Nothing to fix."
        }
      });
    }

    if (!apply) {
      // Dry run - just return analysis
      return NextResponse.json({
        success: true,
        data: {
          summary: analysis.summary,
          invalidByVerifier: analysis.invalidByVerifier,
          message: `DRY RUN: Would fix ${analysis.invalidRecords.length} attendance records`,
          dryRun: true
        }
      });
    }

    // Actually fix the records
    const fixResult = await fixInvalidRecords(analysis.invalidRecords);

    return NextResponse.json({
      success: true,
      data: {
        summary: analysis.summary,
        fixResult,
        message: `Fixed ${fixResult.fixed} out of ${fixResult.total} invalid attendance records`,
        applied: true
      }
    });

  } catch (error) {
    console.error("Error fixing attendance records:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fix attendance records",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 