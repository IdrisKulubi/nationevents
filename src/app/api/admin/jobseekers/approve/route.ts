import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users, jobSeekers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser[0] || currentUser[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { jobSeekerId } = await request.json();

    if (!jobSeekerId) {
      return NextResponse.json({ error: "Job seeker ID is required" }, { status: 400 });
    }

    // Update job seeker status to approved
    await db
      .update(jobSeekers)
      .set({ 
        registrationStatus: "approved",
        updatedAt: new Date()
      })
      .where(eq(jobSeekers.id, jobSeekerId));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error approving job seeker:", error);
    return NextResponse.json(
      { error: "Failed to approve job seeker" },
      { status: 500 }
    );
  }
} 