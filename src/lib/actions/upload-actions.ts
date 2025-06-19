"use server";

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";

import { loadEnvConfig } from '@next/env'
import { cwd } from "node:process";

loadEnvConfig(cwd())

// AWS S3 configuration
const S3_REGION = process.env.NEXT_AWS_S3_REGION || 'us-east-1';
const S3_ACCESS_KEY_ID = process.env.NEXT_AWS_S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.NEXT_AWS_S3_BUCKET_NAME;
const S3_PUBLIC_URL = process.env.NEXT_AWS_S3_PUBLIC_URL;

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

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const allowedAdditionalDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const maxFileSize = 5 * 1024 * 1024; // 5MB
const maxAdditionalDocumentSize = 10 * 1024 * 1024; // 10MB for additional documents

export async function uploadCVToR2(file: File) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate file
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a PDF or Word document.",
      };
    }

    if (file.size > maxFileSize) {
      return {
        success: false,
        error: "File size too large. Maximum size is 5MB.",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const fileName = `cvs/${session.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        userId: session.user.id,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(uploadCommand);

    // We'll generate signed URLs on-demand for viewing
    return {
      success: true,
      url: fileName, // Store the file key, not the full URL
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    };

  } catch (error) {
    console.error("Error uploading CV to S3:", error);
    return {
      success: false,
      error: "Failed to upload CV. Please try again.",
    };
  }
}

export async function uploadAdditionalDocumentToR2(file: File) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate file
    if (!allowedAdditionalDocumentTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a supported document type (PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX).",
      };
    }

    if (file.size > maxAdditionalDocumentSize) {
      return {
        success: false,
        error: "File size too large. Maximum size is 10MB.",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const fileName = `additional-docs/${session.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        userId: session.user.id,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        documentType: 'additional',
      },
    });

    await s3Client.send(uploadCommand);

    return {
      success: true,
      url: fileName, // Store the file key, not the full URL
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    };

  } catch (error) {
    console.error("Error uploading additional document to S3:", error);
    return {
      success: false,
      error: "Failed to upload document. Please try again.",
    };
  }
}

export async function deleteCVFromR2(fileName: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify the file belongs to the current user (security check)
    if (!fileName.includes(session.user.id)) {
      throw new Error("Unauthorized to delete this file");
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(deleteCommand);

    return {
      success: true,
      message: "CV deleted successfully",
    };

  } catch (error) {
    console.error("Error deleting CV from S3:", error);
    return {
      success: false,
      error: "Failed to delete CV. Please try again.",
    };
  }
}

export async function getSignedUploadUrl(fileType: string, fileSize: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Validate file type and size
    if (!allowedMimeTypes.includes(fileType)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a PDF or Word document.",
      };
    }

    if (fileSize > maxFileSize) {
      return {
        success: false,
        error: "File size too large. Maximum size is 5MB.",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2);
    const extension = getExtensionFromMimeType(fileType);
    const fileName = `cvs/${session.user.id}/${timestamp}-${randomSuffix}.${extension}`;

    // For direct uploads, you would typically create a presigned URL here
    // But since we're doing server-side uploads, we'll return the filename
    return {
      success: true,
      fileName: fileName,
      uploadUrl: `/api/upload/cv`, // API endpoint for upload
    };

  } catch (error) {
    console.error("Error generating signed upload URL:", error);
    return {
      success: false,
      error: "Failed to prepare upload. Please try again.",
    };
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'application/msword':
      return 'doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    default:
      return 'pdf';
  }
}

export async function validateCVUpload(file: File): Promise<{ valid: boolean; error?: string }> {
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload a PDF or Word document (DOC, DOCX).",
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: "File size too large. Maximum size is 5MB.",
    };
  }

  // Additional validation: check file signature/magic numbers for security
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Check PDF signature
    if (file.type === 'application/pdf') {
      const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
      const fileSignature = Array.from(uint8Array.slice(0, 4));
      if (!arraysEqual(fileSignature, pdfSignature)) {
        return {
          valid: false,
          error: "Invalid PDF file. File may be corrupted.",
        };
      }
    }

    // Check DOC signature
    if (file.type === 'application/msword') {
      const docSignature = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
      const fileSignature = Array.from(uint8Array.slice(0, 8));
      if (!arraysEqual(fileSignature, docSignature)) {
        return {
          valid: false,
          error: "Invalid DOC file. File may be corrupted.",
        };
      }
    }

    // Check DOCX signature (ZIP-based)
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const zipSignature = [0x50, 0x4B]; // PK (ZIP signature)
      const fileSignature = Array.from(uint8Array.slice(0, 2));
      if (!arraysEqual(fileSignature, zipSignature)) {
        return {
          valid: false,
          error: "Invalid DOCX file. File may be corrupted.",
        };
      }
    }

    return { valid: true };
    
  } catch (error) {
    console.error("Error validating file:", error);
    return {
      valid: false,
      error: "Unable to validate file. Please try again.",
    };
  }
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Get file information for viewing
 * Returns file key that can be used with API route for secure viewing
 */
export async function getFileViewInfo(fileKey: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Security check: Verify the file belongs to the current user
    if (!fileKey.includes(session.user.id)) {
      throw new Error("Unauthorized to access this file");
    }

    return {
      success: true,
      fileKey: fileKey,
      viewUrl: `/api/view-cv?file=${encodeURIComponent(fileKey)}`,
    };

  } catch (error) {
    console.error("Error getting file view info:", error);
    return {
      success: false,
      error: "Failed to get file access information.",
    };
  }
} 