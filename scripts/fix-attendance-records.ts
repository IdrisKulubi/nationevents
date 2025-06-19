#!/usr/bin/env tsx

/**
 * Fix Attendance Records Script
 * 
 * This script fixes attendance records that have invalid verifiedBy references
 * (like admin-generated IDs that don't exist in security_personnel table)
 * by setting them to null, which allows the records to remain valid.
 */

import db from "@/db/drizzle";
import { attendanceRecords, securityPersonnel } from "@/db/schema";
import { eq, and, isNotNull, notInArray } from "drizzle-orm";

interface FixResult {
  total: number;
  fixed: number;
  errors: string[];
}

async function analyzeAttendanceRecords(): Promise<{
  invalidRecords: any[];
  validSecurityIds: string[];
}> {
  console.log("🔍 Analyzing attendance records...");

  // Get all valid security personnel IDs
  const validSecurity = await db
    .select({ id: securityPersonnel.id })
    .from(securityPersonnel);
  
  const validSecurityIds = validSecurity.map(s => s.id);
  console.log(`Found ${validSecurityIds.length} valid security personnel records`);

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

  console.log(`Found ${allRecords.length} attendance records with verifiedBy set`);

  // Find records with invalid verifiedBy references
  const invalidRecords = allRecords.filter(record => 
    record.verifiedBy && !validSecurityIds.includes(record.verifiedBy)
  );

  console.log(`Found ${invalidRecords.length} records with invalid verifiedBy references`);

  // Group by verifiedBy value for analysis
  const invalidByVerifier = invalidRecords.reduce((acc, record) => {
    const verifier = record.verifiedBy!;
    if (!acc[verifier]) {
      acc[verifier] = [];
    }
    acc[verifier].push(record);
    return acc;
  }, {} as Record<string, any[]>);

  console.log("\n📊 Invalid verifiedBy values:");
  Object.entries(invalidByVerifier).forEach(([verifier, records]) => {
    console.log(`  - ${verifier}: ${records.length} records`);
    if (verifier.startsWith('admin-')) {
      console.log(`    ↳ Admin verification (will be set to null)`);
    } else {
      console.log(`    ↳ Unknown security ID (will be set to null)`);
    }
  });

  return {
    invalidRecords,
    validSecurityIds
  };
}

async function fixAttendanceRecords(dryRun: boolean = true): Promise<FixResult> {
  const result: FixResult = {
    total: 0,
    fixed: 0,
    errors: []
  };

  try {
    const { invalidRecords } = await analyzeAttendanceRecords();
    result.total = invalidRecords.length;

    if (invalidRecords.length === 0) {
      console.log("✅ No invalid attendance records found. Nothing to fix.");
      return result;
    }

    if (dryRun) {
      console.log("\n🔍 DRY RUN - No changes will be made");
      console.log(`Would fix ${invalidRecords.length} attendance records`);
      return result;
    }

    console.log(`\n🔧 Fixing ${invalidRecords.length} attendance records...`);

    // Fix each invalid record by setting verifiedBy to null
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
        console.log(`  ✓ Fixed record ${record.id} (was: ${record.verifiedBy})`);
      } catch (error) {
        const errorMsg = `Failed to fix record ${record.id}: ${error}`;
        console.error(`  ✗ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    console.log(`\n✅ Fixed ${result.fixed} out of ${result.total} records`);
    if (result.errors.length > 0) {
      console.log(`❌ ${result.errors.length} errors occurred`);
    }

  } catch (error) {
    console.error("💥 Error during attendance records fix:", error);
    result.errors.push(`General error: ${error}`);
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');
  const isDryRun = !shouldApply;

  console.log("🚀 Starting Attendance Records Fix Script");
  console.log("==========================================");

  if (isDryRun) {
    console.log("📋 Running in DRY RUN mode");
    console.log("   Use --apply flag to actually fix the records");
  } else {
    console.log("⚠️  APPLYING CHANGES to the database");
  }

  try {
    const result = await fixAttendanceRecords(isDryRun);
    
    console.log("\n📈 Summary:");
    console.log(`   Total invalid records: ${result.total}`);
    console.log(`   Records fixed: ${result.fixed}`);
    console.log(`   Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      result.errors.forEach(error => console.log(`   - ${error}`));
      process.exit(1);
    }

    if (isDryRun && result.total > 0) {
      console.log("\n🔧 To apply these fixes, run:");
      console.log("   npm run fix:attendance-records -- --apply");
    }

    console.log("\n✅ Script completed successfully");
    process.exit(0);

  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("💥 Unhandled error:", error);
  process.exit(1);
}); 