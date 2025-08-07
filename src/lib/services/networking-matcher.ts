import { db } from "@/db/drizzle";
import { 
  nxtHerAttendees, 
  nxtHerNetworkingProfiles, 
  nxtHerConnectionSuggestions,
  nxtHerConnections 
} from "@/db/nxt-her-schema";
import { eq, and, not, notInArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface MatchingCriteria {
  interests: { weight: number; values: string[] };
  sector: { weight: number; value: string };
  region: { weight: number; value: string };
  goals: { weight: number; values: string[] };
  expertise: { weight: number; values: string[] };
  lookingFor: { weight: number; values: string[] };
  availableFor: { weight: number; values: string[] };
}

export interface MatchScore {
  totalScore: number;
  breakdown: {
    interests: number;
    sector: number;
    region: number;
    goals: number;
    expertise: number;
    mutual: number;
  };
  reasons: string[];
}

export interface AttendeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  organization?: string;
  profilePhotoUrl?: string;
  topicsOfInterest?: string[];
  areasOfExpertise?: string[];
  networkingProfile?: {
    networkingGoals?: string[];
    sector?: string;
    region?: string;
    interests?: string[];
    lookingFor?: string[];
    availableFor?: string[];
    preferredConnectionTypes?: string[];
    isVisible: boolean;
  };
}

export interface ConnectionSuggestion {
  id: string;
  attendee: AttendeeProfile;
  matchScore: number;
  matchReasons: string[];
  status: "suggested" | "viewed" | "connected" | "dismissed";
}

// Default weights for matching criteria
const DEFAULT_WEIGHTS = {
  interests: 0.25,
  sector: 0.15,
  region: 0.10,
  goals: 0.20,
  expertise: 0.15,
  mutual: 0.15,
};

export class NetworkingMatcher {
  /**
   * Calculate similarity score between two arrays of strings
   */
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (!arr1?.length || !arr2?.length) return 0;
    
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Calculate string similarity (for sector, region)
   */
  private calculateStringSimilarity(str1?: string, str2?: string): number {
    if (!str1 || !str2) return 0;
    return str1.toLowerCase() === str2.toLowerCase() ? 1 : 0;
  }

  /**
   * Calculate mutual benefit score (looking for vs available for)
   */
  private calculateMutualBenefit(
    profile1LookingFor: string[], 
    profile1AvailableFor: string[],
    profile2LookingFor: string[], 
    profile2AvailableFor: string[]
  ): number {
    if (!profile1LookingFor?.length || !profile1AvailableFor?.length || 
        !profile2LookingFor?.length || !profile2AvailableFor?.length) {
      return 0;
    }

    // How much profile1 is looking for matches what profile2 can offer
    const score1 = this.calculateArraySimilarity(profile1LookingFor, profile2AvailableFor);
    
    // How much profile2 is looking for matches what profile1 can offer
    const score2 = this.calculateArraySimilarity(profile2LookingFor, profile1AvailableFor);
    
    return (score1 + score2) / 2;
  }

  /**
   * Generate match reasons based on similarities
   */
  private generateMatchReasons(
    profile1: AttendeeProfile,
    profile2: AttendeeProfile,
    breakdown: MatchScore["breakdown"]
  ): string[] {
    const reasons: string[] = [];

    // Common interests
    if (breakdown.interests > 0.3) {
      const commonInterests = this.getCommonItems(
        profile1.networkingProfile?.interests || profile1.topicsOfInterest || [],
        profile2.networkingProfile?.interests || profile2.topicsOfInterest || []
      );
      if (commonInterests.length > 0) {
        reasons.push(`Shared interests in ${commonInterests.slice(0, 2).join(" and ")}`);
      }
    }

    // Same sector
    if (breakdown.sector > 0.5) {
      reasons.push(`Both work in ${profile1.networkingProfile?.sector || "the same sector"}`);
    }

    // Same region
    if (breakdown.region > 0.5) {
      reasons.push(`Both based in ${profile1.networkingProfile?.region || "the same region"}`);
    }

    // Common goals
    if (breakdown.goals > 0.3) {
      const commonGoals = this.getCommonItems(
        profile1.networkingProfile?.networkingGoals || [],
        profile2.networkingProfile?.networkingGoals || []
      );
      if (commonGoals.length > 0) {
        reasons.push(`Similar networking goals`);
      }
    }

    // Expertise match
    if (breakdown.expertise > 0.3) {
      const commonExpertise = this.getCommonItems(
        profile1.areasOfExpertise || [],
        profile2.areasOfExpertise || []
      );
      if (commonExpertise.length > 0) {
        reasons.push(`Complementary expertise in ${commonExpertise.slice(0, 2).join(" and ")}`);
      }
    }

    // Mutual benefit
    if (breakdown.mutual > 0.3) {
      reasons.push("Mutual networking opportunities");
    }

    return reasons.length > 0 ? reasons : ["Professional networking opportunity"];
  }

  /**
   * Get common items between two arrays
   */
  private getCommonItems(arr1: string[], arr2: string[]): string[] {
    if (!arr1?.length || !arr2?.length) return [];
    
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
    return [...set1].filter(x => set2.has(x));
  }

  /**
   * Calculate match score between two attendee profiles
   */
  public calculateMatchScore(profile1: AttendeeProfile, profile2: AttendeeProfile): MatchScore {
    const breakdown = {
      interests: this.calculateArraySimilarity(
        profile1.networkingProfile?.interests || profile1.topicsOfInterest || [],
        profile2.networkingProfile?.interests || profile2.topicsOfInterest || []
      ) * DEFAULT_WEIGHTS.interests,
      
      sector: this.calculateStringSimilarity(
        profile1.networkingProfile?.sector,
        profile2.networkingProfile?.sector
      ) * DEFAULT_WEIGHTS.sector,
      
      region: this.calculateStringSimilarity(
        profile1.networkingProfile?.region,
        profile2.networkingProfile?.region
      ) * DEFAULT_WEIGHTS.region,
      
      goals: this.calculateArraySimilarity(
        profile1.networkingProfile?.networkingGoals || [],
        profile2.networkingProfile?.networkingGoals || []
      ) * DEFAULT_WEIGHTS.goals,
      
      expertise: this.calculateArraySimilarity(
        profile1.areasOfExpertise || [],
        profile2.areasOfExpertise || []
      ) * DEFAULT_WEIGHTS.expertise,
      
      mutual: this.calculateMutualBenefit(
        profile1.networkingProfile?.lookingFor || [],
        profile1.networkingProfile?.availableFor || [],
        profile2.networkingProfile?.lookingFor || [],
        profile2.networkingProfile?.availableFor || []
      ) * DEFAULT_WEIGHTS.mutual,
    };

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const reasons = this.generateMatchReasons(profile1, profile2, breakdown);

    return {
      totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
      breakdown,
      reasons,
    };
  }

  /**
   * Get all visible attendee profiles for matching
   */
  public async getVisibleAttendeeProfiles(excludeAttendeeId?: string): Promise<AttendeeProfile[]> {
    const attendees = await db
      .select({
        id: nxtHerAttendees.id,
        firstName: nxtHerAttendees.firstName,
        lastName: nxtHerAttendees.lastName,
        email: nxtHerAttendees.email,
        jobTitle: nxtHerAttendees.jobTitle,
        organization: nxtHerAttendees.organization,
        profilePhotoUrl: nxtHerAttendees.profilePhotoUrl,
        topicsOfInterest: nxtHerAttendees.topicsOfInterest,
        areasOfExpertise: nxtHerAttendees.areasOfExpertise,
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
      .where(
        and(
          eq(nxtHerAttendees.registrationStatus, "approved"),
          excludeAttendeeId ? not(eq(nxtHerAttendees.id, excludeAttendeeId)) : undefined,
          // Only include attendees who have visible profiles OR no networking profile (default visible)
          sql`(${nxtHerNetworkingProfiles.isVisible} = true OR ${nxtHerNetworkingProfiles.isVisible} IS NULL)`
        )
      );

    return attendees.map(attendee => ({
      id: attendee.id,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      jobTitle: attendee.jobTitle || undefined,
      organization: attendee.organization || undefined,
      profilePhotoUrl: attendee.profilePhotoUrl || undefined,
      topicsOfInterest: attendee.topicsOfInterest || undefined,
      areasOfExpertise: attendee.areasOfExpertise || undefined,
      networkingProfile: attendee.isVisible !== null ? {
        networkingGoals: attendee.networkingGoals || undefined,
        sector: attendee.sector || undefined,
        region: attendee.region || undefined,
        interests: attendee.interests || undefined,
        lookingFor: attendee.lookingFor || undefined,
        availableFor: attendee.availableFor || undefined,
        preferredConnectionTypes: attendee.preferredConnectionTypes || undefined,
        isVisible: attendee.isVisible ?? true,
      } : undefined,
    }));
  }

  /**
   * Generate connection suggestions for a specific attendee
   */
  public async generateConnectionSuggestions(
    attendeeId: string,
    limit: number = 10,
    minScore: number = 0.15
  ): Promise<ConnectionSuggestion[]> {
    // Get the target attendee's profile
    const targetAttendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.id, attendeeId),
      with: {
        networkingProfile: true,
      },
    });

    if (!targetAttendee) {
      throw new Error("Attendee not found");
    }

    // Get all other visible attendees
    const otherAttendees = await this.getVisibleAttendeeProfiles(attendeeId);

    // Get existing connections and suggestions to exclude
    const existingConnections = await db
      .select({ attendeeId: nxtHerConnections.requestedAttendeeId })
      .from(nxtHerConnections)
      .where(
        and(
          eq(nxtHerConnections.requesterAttendeeId, attendeeId),
          notInArray(nxtHerConnections.status, ["declined"])
        )
      );

    const existingSuggestions = await db
      .select({ attendeeId: nxtHerConnectionSuggestions.toAttendeeId })
      .from(nxtHerConnectionSuggestions)
      .where(
        and(
          eq(nxtHerConnectionSuggestions.fromAttendeeId, attendeeId),
          notInArray(nxtHerConnectionSuggestions.status, ["dismissed"])
        )
      );

    const excludeIds = new Set([
      ...existingConnections.map(c => c.attendeeId),
      ...existingSuggestions.map(s => s.attendeeId),
    ]);

    // Convert target attendee to profile format
    const targetProfile: AttendeeProfile = {
      id: targetAttendee.id,
      firstName: targetAttendee.firstName,
      lastName: targetAttendee.lastName,
      email: targetAttendee.email,
      jobTitle: targetAttendee.jobTitle || undefined,
      organization: targetAttendee.organization || undefined,
      profilePhotoUrl: targetAttendee.profilePhotoUrl || undefined,
      topicsOfInterest: targetAttendee.topicsOfInterest || undefined,
      areasOfExpertise: targetAttendee.areasOfExpertise || undefined,
      networkingProfile: targetAttendee.networkingProfile ? {
        networkingGoals: targetAttendee.networkingProfile.networkingGoals || undefined,
        sector: targetAttendee.networkingProfile.sector || undefined,
        region: targetAttendee.networkingProfile.region || undefined,
        interests: targetAttendee.networkingProfile.interests || undefined,
        lookingFor: targetAttendee.networkingProfile.lookingFor || undefined,
        availableFor: targetAttendee.networkingProfile.availableFor || undefined,
        preferredConnectionTypes: targetAttendee.networkingProfile.preferredConnectionTypes || undefined,
        isVisible: targetAttendee.networkingProfile.isVisible,
      } : undefined,
    };

    // Calculate match scores for all eligible attendees
    const suggestions: ConnectionSuggestion[] = [];

    for (const otherAttendee of otherAttendees) {
      if (excludeIds.has(otherAttendee.id)) continue;

      const matchScore = this.calculateMatchScore(targetProfile, otherAttendee);
      
      if (matchScore.totalScore >= minScore) {
        suggestions.push({
          id: nanoid(),
          attendee: otherAttendee,
          matchScore: matchScore.totalScore,
          matchReasons: matchScore.reasons,
          status: "suggested",
        });
      }
    }

    // Sort by match score (descending) and limit results
    return suggestions
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Save connection suggestions to database
   */
  public async saveConnectionSuggestions(
    fromAttendeeId: string,
    suggestions: ConnectionSuggestion[]
  ): Promise<void> {
    if (suggestions.length === 0) return;

    const suggestionRecords = suggestions.map(suggestion => ({
      id: suggestion.id,
      fromAttendeeId,
      toAttendeeId: suggestion.attendee.id,
      matchScore: suggestion.matchScore.toString(),
      matchReasons: suggestion.matchReasons,
      status: suggestion.status as "suggested" | "viewed" | "connected" | "dismissed",
    }));

    await db.insert(nxtHerConnectionSuggestions).values(suggestionRecords);
  }

  /**
   * Generate and save connection suggestions for an attendee
   */
  public async generateAndSaveConnectionSuggestions(
    attendeeId: string,
    limit: number = 10,
    minScore: number = 0.15
  ): Promise<ConnectionSuggestion[]> {
    // Clear existing suggestions
    await db
      .delete(nxtHerConnectionSuggestions)
      .where(eq(nxtHerConnectionSuggestions.fromAttendeeId, attendeeId));

    // Generate new suggestions
    const suggestions = await this.generateConnectionSuggestions(attendeeId, limit, minScore);

    // Save to database
    await this.saveConnectionSuggestions(attendeeId, suggestions);

    return suggestions;
  }
}