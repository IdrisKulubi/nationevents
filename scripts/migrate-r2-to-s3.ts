/**
 * Migration script to transfer files from Cloudflare R2 to AWS S3
 * Run this script after setting up your S3 bucket and updating environment variables
 * 
 * Usage: npx tsx scripts/migrate-r2-to-s3.ts
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { GetObjectCommand as R2GetObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import { promises as fs } from "fs";

dotenv.config();

// R2 Configuration (old)
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

// S3 Configuration (new)
const S3_REGION = process.env.AWS_S3_REGION || 'us-east-1';
const S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Validate configurations
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error("❌ Missing Cloudflare R2 configuration. Please check your .env file.");
  process.exit(1);
}

if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
  console.error("❌ Missing AWS S3 configuration. Please check your .env file.");
  process.exit(1);
}

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

interface MigrationResult {
  key: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

async function migrateFile(key: string): Promise<MigrationResult> {
  try {
    // Get object from R2
    console.log(`📥 Fetching ${key} from R2...`);
    const getCommand = new R2GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    
    const r2Response = await r2Client.send(getCommand);
    
    if (!r2Response.Body) {
      return { key, status: 'failed', error: 'No body in R2 response' };
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = r2Response.Body.transformToWebStream().getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const buffer = Buffer.concat(chunks);

    // Upload to S3
    console.log(`📤 Uploading ${key} to S3...`);
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: r2Response.ContentType || 'application/octet-stream',
      Metadata: r2Response.Metadata || {},
    });
    
    await s3Client.send(putCommand);
    
    console.log(`✅ Successfully migrated ${key}`);
    return { key, status: 'success' };
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${key}:`, error);
    return { 
      key, 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function listR2Objects(): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  
  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      ContinuationToken: continuationToken,
    });
    
    const response = await r2Client.send(listCommand);
    
    if (response.Contents) {
      keys.push(...response.Contents.map(obj => obj.Key!).filter(Boolean));
    }
    
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  
  return keys;
}

async function main() {
  console.log("🚀 Starting R2 to S3 migration...\n");
  console.log(`📁 Source: ${R2_BUCKET_NAME} (Cloudflare R2)`);
  console.log(`📁 Destination: ${S3_BUCKET_NAME} (AWS S3)\n`);
  
  try {
    // List all objects in R2
    console.log("📋 Listing objects in R2...");
    const keys = await listR2Objects();
    console.log(`📊 Found ${keys.length} objects to migrate\n`);
    
    // Migrate files in batches
    const batchSize = 5; // Process 5 files at a time
    const results: MigrationResult[] = [];
    
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(migrateFile));
      results.push(...batchResults);
      
      console.log(`\n📊 Progress: ${Math.min(i + batchSize, keys.length)}/${keys.length} files processed\n`);
    }
    
    // Generate report
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    
    console.log("\n📊 Migration Summary:");
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📁 Total: ${results.length}`);
    
    // Save failed migrations to a file for review
    if (failed > 0) {
      const failedResults = results.filter(r => r.status === 'failed');
      await fs.writeFile(
        'migration-failures.json',
        JSON.stringify(failedResults, null, 2)
      );
      console.log("\n💾 Failed migrations saved to migration-failures.json");
    }
    
    console.log("\n🎉 Migration complete!");
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
main().catch(console.error); 