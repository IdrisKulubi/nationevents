import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db/drizzle";
import { nxtHerAttendees, nxtHerNetworkingProfiles } from "@/db/nxt-her-schema";
import { eq, and, or, ilike, sql, not } from "drizzle-orm";

// GET - Fetch attendee directory with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";
    const region = searchParams.get("region") || "";
    const interests = searchParams.get("interests")?.split(",").filter(Boolean) || [];
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Find the current attendee to exclude from results
    const currentAttendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, session.user.email),
    });

    if (!currentAttendee) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Build the where conditions
    let whereConditions = [
      eq(nxtHerAttendees.registrationStatus, "approved"),
      not(eq(nxtHerAttendees.id, currentAttendee.id)), // Exclude current user
      // Only include attendees who have visible profiles OR no networking profile (default visible)
      sql`(${nxtHerNetworkingProfiles.isVisible} = true OR ${nxtHerNetworkingProfiles.isVisible} IS NULL)`
    ];

    // Add search filter
    if (search) {
      whereConditions.push(
        or(
          ilike(nxtHerAttendees.firstName, `%${search}%`),
          ilike(nxtHerAttendees.lastName, `%${search}%`),
          ilike(nxtHerAttendees.organization, `%${search}%`),
          ilike(nxtHerAttendees.jobTitle, `%${search}%`)
        )
      );
    }

    // Add sector filter
    if (sector) {
      whereConditions.push(eq(nxtHerNetworkingProfiles.sector, sector));
    }

    // Add region filter
    if (region) {
      whereConditions.push(eq(nxtHerNetworkingProfiles.region, region));
    }

    // Add interests filter (if any of the interests match)
    if (interests.length > 0) {
      const interestConditions = interests.map(interest =>
        or(
          sql`${nxtHerNetworkingProfiles.interests} @> ${JSON.stringify([interest])}`,
          sql`${nxtHerAttendees.topicsOfInterest} @> ${JSON.stringify([interest])}`
        )
      );
      whereConditions.push(or(...interestConditions));
    }

    // Fetch attendees with their networking profiles
    const attendees = await db
      .select({
        id: nxtHerAttendees.id,
        firstName: nxtHerAttendees.firstName,
        lastName: nxtHerAttendees.lastName,
        email: nxtHerAttendees.email,
        jobTitle: nxtHerAttendees.jobTitle,
        organization: nxtHerAttendees.organization,
        profilePhotoUrl: nxtHerAttendees.profilePhotoUrl,
        country: nxtHerAttendees.country,
        city: nxtHerAttendees.city,
        attendanceType: nxtHerAttendees.attendanceType,
        topicsOfInterest: nxtHerAttendees.topicsOfInterest,
        areasOfExpertise: nxtHerAttendees.areasOfExpertise,
        aboutYou: nxtHerAttendees.aboutYou,
        linkedinProfile: nxtHerAttendees.linkedinProfile,
        twitterHandle: nxtHerAttendees.twitterHandle,
        website: nxtHerAttendees.website,
        // Networking profile fields
        networkingGoals: nxtHerNetworkingProfiles.networkingGoals,
        sector: nxtHerNetworkingProfiles.sector,
        region: nxtHerNetworkingProfiles.region,
        interests: nxtHerNetworkingProfiles.interests,
        lookingFor: nxtHerNetworkingProfiles.lookingFor,
        availableFor: nxtHerNetworkingProfiles.availableFor,
        preferredConnectionTypes: nxtHerNetworkingProfiles.preferredConnectionTypes,
        isVisible: nxtHerNetworkingProfiles.isVisible,
      })
      .from(nxtHerAttendees)
      .leftJoin(
        nxtHerNetworkingProfiles,
        eq(nxtHerAttendees.id, nxtHerNetworkingProfiles.attendeeId)
      )
      .where(and(...whereConditions))
      .limit(limit)
      .offset(offset)
      .orderBy(nxtHerAttendees.firstName, nxtHerAttendees.lastName);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(nxtHerAttendees)
      .leftJoin(
        nxtHerNetworkingProfiles,
        eq(nxtHerAttendees.id, nxtHerNetworkingProfiles.attendeeId)
      )
      .where(and(...whereConditions));

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Format the response
    const formattedAttendees = attendees.map(attendee => ({
      id: attendee.id,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      jobTitle: attendee.jobTitle,
      organization: attendee.organization,
      profilePhotoUrl: attendee.profilePhotoUrl,
      country: attendee.country,
      city: attendee.city,
      attendanceType: attendee.attendanceType,
      topicsOfInterest: attendee.topicsOfInterest || [],
      areasOfExpertise: attendee.areasOfExpertise || [],
      aboutYou: attendee.aboutYou,
      socialLinks: {
        linkedin: attendee.linkedinProfile,
        twitter: attendee.twitterHandle,
        website: attendee.website,
      },
      networkingProfile: attendee.isVisible !== null ? {
        networkingGoals: attendee.networkingGoals || [],
        sector: attendee.sector,
        region: attendee.region,
        interests: attendee.interests || [],
        lookingFor: attendee.lookingFor || [],
        availableFor: attendee.availableFor || [],
        preferredConnectionTypes: attendee.preferredConnectionTypes || [],
      } : null,
    }));

    // Get filter options for the frontend
    const filterOptions = await getFilterOptions();

    return NextResponse.json({
      attendees: formattedAttendees,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: filterOptions,
    });
  } catch (error) {
    console.error("Error fetching attendee directory:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendee directory" },
      { status: 500 }
    );
  }
}

// Helper function to get available filter options
async function getFilterOptions() {
  try {
    // Get unique sectors
    const sectorsResult = await db
      .selectDistinct({ sector: nxtHerNetworkingProfiles.sector })
      .from(nxtHerNetworkingProfiles)
      .where(sql`${nxtHerNetworkingProfiles.sector} IS NOT NULL`);

    // Get unique regions
    const regionsResult = await db
      .selectDistinct({ region: nxtHerNetworkingProfiles.region })
      .from(nxtHerNetworkingProfiles)
      .where(sql`${nxtHerNetworkingProfiles.region} IS NOT NULL`);

    // Get all interests (this is more complex as it's a JSON array)
    const interestsResult = await db
      .select({ 
        interests: nxtHerNetworkingProfiles.interests,
        topicsOfInterest: nxtHerAttendees.topicsOfInterest 
      })
      .from(nxtHerAttendees)
      .leftJoin(
        nxtHerNetworkingProfiles,
        eq(nxtHerAttendees.id, nxtHerNetworkingProfiles.attendeeId)
      )
      .where(
        or(
          sql`${nxtHerNetworkingProfiles.interests} IS NOT NULL`,
          sql`${nxtHerAttendees.topicsOfInterest} IS NOT NULL`
        )
      );

    // Extract unique interests
    const allInterests = new Set<string>();
    interestsResult.forEach(row => {
      if (row.interests) {
        row.interests.forEach((interest: string) => allInterests.add(interest));
      }
      if (row.topicsOfInterest) {
        row.topicsOfInterest.forEach((interest: string) => allInterests.add(interest));
      }
    });

    return {
      sectors: sectorsResult.map(r => r.sector).filter(Boolean).sort(),
      regions: regionsResult.map(r => r.region).filter(Boolean).sort(),
      interests: Array.from(allInterests).sort(),
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      sectors: [],
      regions: [],
      interests: [],
    };
  }
}