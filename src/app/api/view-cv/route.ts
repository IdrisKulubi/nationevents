import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import dotenv from 'dotenv';

dotenv.config();

// AWS S3 configuration
const S3_REGION = process.env.NEXT_AWS_S3_REGION || 'us-east-1';
const S3_ACCESS_KEY_ID = process.env.NEXT_AWS_S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.NEXT_AWS_S3_BUCKET_NAME;

if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
  throw new Error("Missing AWS S3 configuration environment variables");
}

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get file parameter from URL
    const searchParams = request.nextUrl.searchParams;
    const fileKey = searchParams.get("file");

    if (!fileKey) {
      return new NextResponse("File parameter is required", { status: 400 });
    }

    // Security check: Verify the file belongs to the current user
    if (!fileKey.includes(session.user.id)) {
      return new NextResponse("Unauthorized to access this file", { status: 403 });
    }

    // Get file from S3
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Convert the stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    // Determine content type
    const contentType = response.ContentType || 'application/octet-stream';
    
    // Get original filename from metadata or file key
    const originalName = response.Metadata?.originalName || fileKey.split('/').pop() || 'document';

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${originalName}"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error("Error serving CV file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 