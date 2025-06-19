"use server";

import db from "@/db/drizzle";
import { securityIncidents, events } from "@/db/schema";
import { eq } from "drizzle-orm";

interface IncidentData {
  incidentType: string;
  severity: string;
  location: string;
  description: string;
  involvedPersons: string[];
  actionTaken: string;
  securityId: string;
}

export async function reportIncident(data: IncidentData) {
  try {
    // Get current active event
    const activeEvent = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .limit(1);

    if (!activeEvent[0]) {
      return {
        success: false,
        message: "No active event found. Cannot submit incident report."
      };
    }

    // Create incident record
    const incidentId = crypto.randomUUID();
    await db.insert(securityIncidents).values({
      id: incidentId,
      eventId: activeEvent[0].id,
      reportedBy: data.securityId,
      incidentType: data.incidentType as any,
      severity: data.severity as any,
      location: data.location,
      description: data.description,
      involvedPersons: data.involvedPersons.length > 0 ? data.involvedPersons : null,
      actionTaken: data.actionTaken || null,
      status: "open",
    });

    return {
      success: true,
      message: `Incident report #${incidentId.slice(0, 8)} submitted successfully.`,
      incidentId
    };

  } catch (error) {
    console.error("Incident reporting error:", error);
    return {
      success: false,
      message: "Failed to submit incident report. Please try again."
    };
  }
} 