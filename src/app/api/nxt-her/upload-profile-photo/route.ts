import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/drizzle"
import { nxtHerAttendees } from "@/db/nxt-her-schema"
import { eq } from "drizzle-orm"
import { uploadToS3 } from "@/lib/s3-utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const attendeeId = formData.get("attendeeId") as string
    
    if (!file || !attendeeId) {
      return NextResponse.json(
        { message: "File and attendeeId are required" },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 }
      )
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      )
    }
    
    // Check if attendee exists
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.id, attendeeId),
    })
    
    if (!attendee) {
      return NextResponse.json(
        { message: "Attendee not found" },
        { status: 404 }
      )
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `nxt-her/profile-photos/${attendeeId}.${fileExtension}`
    
    // Upload to S3
    const uploadResult = await uploadToS3(buffer, fileName, file.type)
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "Failed to upload file")
    }
    
    // Update attendee record with profile photo URL
    await db
      .update(nxtHerAttendees)
      .set({ 
        profilePhotoUrl: uploadResult.url,
        updatedAt: new Date(),
      })
      .where(eq(nxtHerAttendees.id, attendeeId))
    
    return NextResponse.json({
      message: "Profile photo uploaded successfully",
      url: uploadResult.url,
    })
    
  } catch (error) {
    console.error("Profile photo upload error:", error)
    
    return NextResponse.json(
      { message: "Failed to upload profile photo" },
      { status: 500 }
    )
  }
}