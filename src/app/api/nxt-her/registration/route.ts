import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { nanoid } from "nanoid"
import db from "@/db/drizzle"
import { nxtHerAttendees, nxtHerEvents } from "@/db/nxt-her-schema"
import { eq } from "drizzle-orm"

const registrationSchema = z.object({
  // Step 1 fields
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(2, "City must be at least 2 characters"),
  attendanceType: z.enum(["in_person", "virtual"]),
  
  // Step 2 fields
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  aboutYou: z.string().optional(),
  linkedinProfile: z.string().url().optional().or(z.literal("")),
  twitterHandle: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  topicsOfInterest: z.array(z.string()).min(1, "Please select at least one topic of interest"),
  areasOfExpertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to continue",
  }),
  infoSharingConsent: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = registrationSchema.parse(body)
    
    // Check if email already exists
    const existingAttendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, validatedData.email),
    })
    
    if (existingAttendee) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      )
    }
    
    // Get or create the Nxt Her Summit event
    let event = await db.query.nxtHerEvents.findFirst({
      where: eq(nxtHerEvents.name, "Nxt Her Summit"),
    })
    
    if (!event) {
      // Create the event if it doesn't exist
      const eventId = nanoid()
      await db.insert(nxtHerEvents).values({
        id: eventId,
        name: "Nxt Her Summit",
        description: "An empowering experience of connection, learning, and growth",
        startDate: new Date("2024-06-01"), // Placeholder dates
        endDate: new Date("2024-06-03"),
        venue: "TBD",
        isActive: true,
      })
      
      event = await db.query.nxtHerEvents.findFirst({
        where: eq(nxtHerEvents.id, eventId),
      })
    }
    
    if (!event) {
      throw new Error("Failed to create or retrieve event")
    }
    
    // No password needed since we're using Google OAuth
    
    // Create the attendee record
    const attendeeId = nanoid()
    await db.insert(nxtHerAttendees).values({
      id: attendeeId,
      eventId: event.id,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phoneNumber: validatedData.phoneNumber,
      country: validatedData.country,
      city: validatedData.city,
      attendanceType: validatedData.attendanceType,
      organization: validatedData.organization || null,
      jobTitle: validatedData.jobTitle || null,
      aboutYou: validatedData.aboutYou || null,
      linkedinProfile: validatedData.linkedinProfile || null,
      twitterHandle: validatedData.twitterHandle || null,
      website: validatedData.website || null,
      topicsOfInterest: validatedData.topicsOfInterest,
      areasOfExpertise: validatedData.areasOfExpertise,
      termsAccepted: validatedData.termsAccepted,
      infoSharingConsent: validatedData.infoSharingConsent,
      termsAcceptedAt: new Date(),
      registrationStatus: "approved", // Auto-approve since using Google OAuth
      registrationCompletedAt: new Date(),
    })
    
    // Email confirmation can be added later if needed
    
    return NextResponse.json({
      message: "Registration completed successfully! You can now sign in with Google.",
      attendeeId,
      status: "approved",
    })
    
  } catch (error) {
    console.error("Registration error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Validation failed", 
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}