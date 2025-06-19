/**
 * Script to fix CV URLs in the database
 * Run this script to convert incorrectly stored CV URLs to the proper format
 */

import db from "@/db/drizzle";
import { jobSeekers } from "@/db/schema";
import { extractCvPath, isValidCvPath } from "@/lib/s3-utils";
import { eq, isNotNull } from "drizzle-orm";

interface CvUrlFix {
  id: string;
  oldUrl: string;
  newUrl: string;
  needsUpdate: boolean;
}

export async function fixCvUrls() {
  console.log('🔍 Starting CV URL fix process...');
  
  try {
    // Get all job seekers with CV URLs
    const allJobSeekers = await db
      .select({
        id: jobSeekers.id,
        userId: jobSeekers.userId,
        cvUrl: jobSeekers.cvUrl,
      })
      .from(jobSeekers)
      .where(isNotNull(jobSeekers.cvUrl));

    console.log(`📊 Found ${allJobSeekers.length} job seekers with CV URLs`);

    const fixes: CvUrlFix[] = [];

    // Analyze each CV URL
    for (const jobSeeker of allJobSeekers) {
      if (!jobSeeker.cvUrl) continue;

      const currentUrl = jobSeeker.cvUrl;
      const extractedPath = extractCvPath(currentUrl);
      const needsUpdate = currentUrl !== extractedPath || !isValidCvPath(extractedPath);

      fixes.push({
        id: jobSeeker.id,
        oldUrl: currentUrl,
        newUrl: extractedPath,
        needsUpdate,
      });

      // Log problematic URLs for manual review
      if (needsUpdate) {
        console.log(`❌ NEEDS FIX - ID: ${jobSeeker.id}`);
        console.log(`   Old: ${currentUrl}`);
        console.log(`   New: ${extractedPath}`);
        console.log(`   Valid: ${isValidCvPath(extractedPath)}`);
        console.log('');
      }
    }

    const needsUpdateCount = fixes.filter(fix => fix.needsUpdate).length;
    console.log(`🔧 ${needsUpdateCount} URLs need to be updated`);

    // Show what would be updated (dry run)
    console.log('\n📋 DRY RUN - URLs that would be updated:');
    fixes
      .filter(fix => fix.needsUpdate)
      .forEach((fix, index) => {
        console.log(`${index + 1}. ID: ${fix.id}`);
        console.log(`   FROM: ${fix.oldUrl}`);
        console.log(`   TO:   ${fix.newUrl}`);
        console.log('');
      });

    return fixes;

  } catch (error) {
    console.error('❌ Error analyzing CV URLs:', error);
    throw error;
  }
}

export async function applyCvUrlFixes(fixes: CvUrlFix[], confirm: boolean = false) {
  if (!confirm) {
    console.log('⚠️  This is a dry run. Set confirm=true to actually update the database.');
    return;
  }

  console.log('🚀 Applying CV URL fixes to database...');
  
  const urlsToFix = fixes.filter(fix => fix.needsUpdate);
  let successCount = 0;
  let errorCount = 0;

  for (const fix of urlsToFix) {
    try {
      await db
        .update(jobSeekers)
        .set({ 
          cvUrl: fix.newUrl,
          updatedAt: new Date()
        })
        .where(eq(jobSeekers.id, fix.id));

      successCount++;
      console.log(`✅ Updated ID: ${fix.id}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to update ID: ${fix.id}`, error);
    }
  }

  console.log(`\n📊 Fix Results:`);
  console.log(`   ✅ Successfully updated: ${successCount}`);
  console.log(`   ❌ Failed to update: ${errorCount}`);
  console.log(`   📊 Total processed: ${urlsToFix.length}`);
}

// Example usage function
export async function runCvUrlFix(applyChanges: boolean = false) {
  try {
    console.log('🎯 CV URL Fix Utility');
    console.log('===================\n');

    // Step 1: Analyze current URLs
    const fixes = await fixCvUrls();

    // Step 2: Apply fixes if requested
    if (applyChanges) {
      console.log('\n⚠️  APPLYING CHANGES TO DATABASE...');
      await applyCvUrlFixes(fixes, true);
    } else {
      console.log('\n💡 To apply these changes, run: runCvUrlFix(true)');
    }

    return fixes;
  } catch (error) {
    console.error('💥 CV URL fix failed:', error);
    throw error;
  }
}

// Manual inspection helpers
export async function inspectCvUrl(jobSeekerId: string) {
  const jobSeeker = await db
    .select()
    .from(jobSeekers)
    .where(eq(jobSeekers.id, jobSeekerId))
    .limit(1);

  if (!jobSeeker[0]) {
    console.log('❌ Job seeker not found');
    return;
  }

  const cvUrl = jobSeeker[0].cvUrl;
  console.log(`🔍 Inspecting CV URL for Job Seeker: ${jobSeekerId}`);
  console.log(`📄 Current URL: ${cvUrl}`);
  console.log(`🔗 Extracted Path: ${extractCvPath(cvUrl || '')}`);
  console.log(`✅ Is Valid: ${isValidCvPath(cvUrl || '')}`);
} 