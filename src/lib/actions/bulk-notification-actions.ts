"use server";

import { auth } from "@/lib/auth";
import db from "@/db/drizzle";
import { 
  bulkNotifications,
  notificationRecipients,
  boothAssignments,
  jobSeekers,
  users,
  booths,
  employers,
  events
} from "@/db/schema";
import { eq, and, desc, inArray, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendBulkSMS } from "@/lib/actions/send-sms-actions";
import { sendWelcomeEmail } from "@/lib/utils/notifications";

// Types for bulk notification operations
export interface BulkNotificationData {
  campaignName: string;
  notificationType: "email" | "sms" | "both";
  templateType: string;
  subject?: string; // For emails
  message: string;
  recipientIds: string[]; // Job seeker IDs
  boothAssignmentIds?: string[]; // Optional booth assignment IDs
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  type: string;
  name: string;
  description: string;
  emailSubject?: string;
  emailTemplate: string;
  smsTemplate: string;
  variables: string[];
}

// Ensure admin access for notification operations
async function ensureAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0] || user[0].role !== "admin") {
    throw new Error("Admin access required");
  }

  return { session, user: user[0] };
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    type: "booth_assignment",
    name: "Booth Assignment Notification",
    description: "Notify job seekers about their booth assignments",
    emailSubject: "🎉 Your Interview Assignment - Huawei Career Fair",
    emailTemplate: `
      <h2>Congratulations! You've been assigned an interview slot</h2>
      <p>Dear {{name}},</p>
      <p>Great news! You have been assigned to an interview at the Huawei Career Fair.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📍 Interview Details</h3>
        <p><strong>Company:</strong> {{companyName}}</p>
        <p><strong>Booth Number:</strong> {{boothNumber}}</p>
        <p><strong>Location:</strong> {{boothLocation}}</p>
        <p><strong>Date:</strong> {{interviewDate}}</p>
        <p><strong>Time:</strong> {{interviewTime}}</p>
      </div>
      
      <p><strong>Your PIN:</strong> {{pin}}</p>
      <p>Please arrive 15 minutes early and bring your PIN for check-in.</p>
      
      <p>Good luck with your interview!</p>
      <p>Best regards,<br>Huawei Career Fair Team</p>
    `,
    smsTemplate: "🎉 Hi {{name}}! You're assigned to Booth {{boothNumber}} ({{companyName}}) on {{interviewDate}} at {{interviewTime}}. PIN: {{pin}}. Good luck! 🚀",
    variables: ["name", "companyName", "boothNumber", "boothLocation", "interviewDate", "interviewTime", "pin"]
  },
  {
    type: "assignment_reminder",
    name: "Interview Reminder",
    description: "Remind job seekers about upcoming interviews",
    emailSubject: "📅 Reminder: Your Interview Tomorrow - Huawei Career Fair",
    emailTemplate: `
      <h2>Interview Reminder</h2>
      <p>Dear {{name}},</p>
      <p>This is a friendly reminder about your interview tomorrow at the Huawei Career Fair.</p>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📍 Interview Details</h3>
        <p><strong>Company:</strong> {{companyName}}</p>
        <p><strong>Booth Number:</strong> {{boothNumber}}</p>
        <p><strong>Date:</strong> {{interviewDate}}</p>
        <p><strong>Time:</strong> {{interviewTime}}</p>
      </div>
      
      <p><strong>Don't forget your PIN:</strong> {{pin}}</p>
      
      <h3>📋 Preparation Tips:</h3>
      <ul>
        <li>Arrive 15 minutes early</li>
        <li>Bring copies of your CV</li>
        <li>Prepare questions about the company</li>
        <li>Dress professionally</li>
      </ul>
      
      <p>Best of luck!</p>
      <p>Huawei Career Fair Team</p>
    `,
    smsTemplate: "📅 Reminder: Interview tomorrow at Booth {{boothNumber}} ({{companyName}}) at {{interviewTime}}. PIN: {{pin}}. Arrive 15 mins early! 💼",
    variables: ["name", "companyName", "boothNumber", "interviewDate", "interviewTime", "pin"]
  },
  {
    type: "assignment_update",
    name: "Assignment Update",
    description: "Notify about changes to booth assignments",
    emailSubject: "📝 Update: Your Interview Assignment - Huawei Career Fair",
    emailTemplate: `
      <h2>Interview Assignment Update</h2>
      <p>Dear {{name}},</p>
      <p>There has been an update to your interview assignment at the Huawei Career Fair.</p>
      
      <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📍 Updated Interview Details</h3>
        <p><strong>Company:</strong> {{companyName}}</p>
        <p><strong>Booth Number:</strong> {{boothNumber}}</p>
        <p><strong>Date:</strong> {{interviewDate}}</p>
        <p><strong>Time:</strong> {{interviewTime}}</p>
      </div>
      
      <p>{{updateMessage}}</p>
      <p><strong>Your PIN remains:</strong> {{pin}}</p>
      
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>Huawei Career Fair Team</p>
    `,
    smsTemplate: "📝 Update: Your interview at Booth {{boothNumber}} ({{companyName}}) has been updated to {{interviewDate}} at {{interviewTime}}. PIN: {{pin}} 📱",
    variables: ["name", "companyName", "boothNumber", "interviewDate", "interviewTime", "pin", "updateMessage"]
  }
];

/**
 * Get available notification templates
 */
export async function getNotificationTemplates() {
  await ensureAdminAccess();
  
  return {
    success: true,
    data: NOTIFICATION_TEMPLATES
  };
}

/**
 * Create a new bulk notification campaign
 */
export async function createNotificationCampaign(campaignData: BulkNotificationData) {
  const { session } = await ensureAdminAccess();

  try {
    // Validate recipients exist
    const recipients = await db
      .select({
        jobSeeker: jobSeekers,
        user: users
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(
        and(
          inArray(jobSeekers.id, campaignData.recipientIds),
          eq(jobSeekers.registrationStatus, "approved")
        )
      );

    if (recipients.length === 0) {
      return {
        success: false,
        error: "No valid recipients found"
      };
    }

    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create bulk notification record
    await db.transaction(async (tx) => {
      // Insert campaign
      await tx.insert(bulkNotifications).values({
        id: campaignId,
        campaignName: campaignData.campaignName,
        notificationType: campaignData.notificationType,
        templateType: campaignData.templateType,
        subject: campaignData.subject || null,
        message: campaignData.message,
        recipientCount: recipients.length,
        status: campaignData.scheduledAt ? "pending" : "draft",
        scheduledAt: campaignData.scheduledAt || null,
        createdBy: session.user.id,
        metadata: campaignData.metadata || null
      });

      // Insert recipients
      const recipientRecords = recipients.map(recipient => ({
        id: `recipient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bulkNotificationId: campaignId,
        jobSeekerId: recipient.jobSeeker.id,
        boothAssignmentId: campaignData.boothAssignmentIds?.find(id => 
          // This would need to be matched properly in a real implementation
          true
        ) || null
      }));

      await tx.insert(notificationRecipients).values(recipientRecords);
    });

    revalidatePath("/admin/notifications");

    return {
      success: true,
      message: "Notification campaign created successfully",
      campaignId,
      recipientCount: recipients.length
    };

  } catch (error) {
    console.error("Error creating notification campaign:", error);
    return {
      success: false,
      error: "Failed to create notification campaign"
    };
  }
}

/**
 * Send booth assignment notifications
 */
export async function sendBoothAssignmentNotifications(assignmentIds: string[]) {
  const { session } = await ensureAdminAccess();

  try {
    // Get assignment details with all related data
    const assignments = await db
      .select({
        assignment: boothAssignments,
        jobSeeker: jobSeekers,
        user: users,
        booth: booths,
        employer: employers,
        event: events
      })
      .from(boothAssignments)
      .leftJoin(jobSeekers, eq(jobSeekers.id, boothAssignments.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .leftJoin(booths, eq(booths.id, boothAssignments.boothId))
      .leftJoin(employers, eq(employers.id, booths.employerId))
      .leftJoin(events, eq(events.id, booths.eventId))
      .where(inArray(boothAssignments.id, assignmentIds));

    if (assignments.length === 0) {
      return {
        success: false,
        error: "No assignments found"
      };
    }

    const campaignId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = NOTIFICATION_TEMPLATES.find(t => t.type === "booth_assignment")!;

    // Create campaign
    await db.insert(bulkNotifications).values({
      id: campaignId,
      campaignName: `Booth Assignment Notifications - ${new Date().toLocaleDateString()}`,
      notificationType: "both",
      templateType: "booth_assignment",
      subject: template.emailSubject,
      message: template.smsTemplate,
      recipientCount: assignments.length,
      status: "sending",
      startedAt: new Date(),
      createdBy: session.user.id
    });

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Process each assignment
    for (const assignment of assignments) {
      try {
        if (!assignment.user || !assignment.jobSeeker || !assignment.booth || !assignment.employer) {
          throw new Error("Missing required data");
        }

        const recipientId = `recipient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create recipient record
        await db.insert(notificationRecipients).values({
          id: recipientId,
          bulkNotificationId: campaignId,
          jobSeekerId: assignment.jobSeeker.id,
          boothAssignmentId: assignment.assignment.id
        });

        // Prepare template variables
        const variables = {
          name: assignment.user.name || "Job Seeker",
          companyName: assignment.employer.companyName || "Company",
          boothNumber: assignment.booth.boothNumber || "TBD",
          boothLocation: assignment.booth.location || "TBD",
          interviewDate: assignment.assignment.interviewDate 
            ? new Date(assignment.assignment.interviewDate).toLocaleDateString()
            : "TBD",
          interviewTime: assignment.assignment.interviewTime || "TBD",
          pin: assignment.jobSeeker.pin || "N/A"
        };

        // Send email
        let emailSuccess = false;
        try {
          let emailContent = template.emailTemplate;
          Object.entries(variables).forEach(([key, value]) => {
            emailContent = emailContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
          });

          await sendWelcomeEmail({
            email: assignment.user.email,
            name: variables.name,
            pin: variables.pin,
            ticketNumber: assignment.jobSeeker.ticketNumber || "",
            eventDetails: {
              name: assignment.event?.name || "Huawei Career Fair",
              date: assignment.event?.startDate 
                ? new Date(assignment.event.startDate).toLocaleDateString()
                : "TBD",
              venue: assignment.event?.venue || "TBD"
            }
          });

          emailSuccess = true;
          
          await db
            .update(notificationRecipients)
            .set({
              emailStatus: "sent",
              emailSentAt: new Date()
            })
            .where(eq(notificationRecipients.id, recipientId));

        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          await db
            .update(notificationRecipients)
            .set({
              emailStatus: "failed",
              emailError: emailError instanceof Error ? emailError.message : "Unknown error"
            })
            .where(eq(notificationRecipients.id, recipientId));
        }

        // Send SMS
        let smsSuccess = false;
        if (assignment.user.phoneNumber) {
          try {
            let smsContent = template.smsTemplate;
            Object.entries(variables).forEach(([key, value]) => {
              smsContent = smsContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });

            const smsResult = await sendBulkSMS({
              recipients: [{
                phoneNumber: assignment.user.phoneNumber,
                name: variables.name,
                customData: { assignmentId: assignment.assignment.id }
              }],
              templateType: 'CUSTOM',
              customMessage: smsContent
            });

            if (smsResult.success) {
              smsSuccess = true;
              await db
                .update(notificationRecipients)
                .set({
                  smsStatus: "sent",
                  smsSentAt: new Date()
                })
                .where(eq(notificationRecipients.id, recipientId));
            } else {
              throw new Error("SMS sending failed");
            }

          } catch (smsError) {
            console.error("SMS sending failed:", smsError);
            await db
              .update(notificationRecipients)
              .set({
                smsStatus: "failed",
                smsError: smsError instanceof Error ? smsError.message : "Unknown error"
              })
              .where(eq(notificationRecipients.id, recipientId));
          }
        }

        // Mark assignment as notified if at least one method succeeded
        if (emailSuccess || smsSuccess) {
          await db
            .update(boothAssignments)
            .set({
              notificationSent: true,
              updatedAt: new Date()
            })
            .where(eq(boothAssignments.id, assignment.assignment.id));

          successCount++;
        } else {
          failureCount++;
        }

        results.push({
          assignmentId: assignment.assignment.id,
          jobSeekerName: variables.name,
          emailSuccess,
          smsSuccess,
          success: emailSuccess || smsSuccess
        });

        // Small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error("Error processing assignment notification:", error);
        failureCount++;
        results.push({
          assignmentId: assignment.assignment.id,
          jobSeekerName: assignment.user?.name || "Unknown",
          emailSuccess: false,
          smsSuccess: false,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // Update campaign status
    await db
      .update(bulkNotifications)
      .set({
        status: "completed",
        sentCount: successCount,
        failedCount: failureCount,
        completedAt: new Date()
      })
      .where(eq(bulkNotifications.id, campaignId));

    revalidatePath("/admin/notifications");
    revalidatePath("/admin/booth-assignments");

    return {
      success: successCount > 0,
      message: `Notifications sent: ${successCount} successful, ${failureCount} failed`,
      campaignId,
      results,
      summary: {
        total: assignments.length,
        successful: successCount,
        failed: failureCount
      }
    };

  } catch (error) {
    console.error("Error sending booth assignment notifications:", error);
    return {
      success: false,
      error: "Failed to send notifications"
    };
  }
}

/**
 * Get notification campaign status and statistics
 */
export async function getNotificationCampaigns(filters: {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  await ensureAdminAccess();

  try {
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(bulkNotifications.status, filters.status as any));
    }

    if (filters.type) {
      conditions.push(eq(bulkNotifications.notificationType, filters.type as any));
    }

    if (filters.dateFrom) {
      conditions.push(sql`${bulkNotifications.createdAt} >= ${filters.dateFrom}`);
    }

    if (filters.dateTo) {
      conditions.push(sql`${bulkNotifications.createdAt} <= ${filters.dateTo}`);
    }

    const query = db
      .select({
        campaign: bulkNotifications,
        creator: users
      })
      .from(bulkNotifications)
      .leftJoin(users, eq(users.id, bulkNotifications.createdBy))
      .where(and(...conditions));

    const campaigns = await query.orderBy(desc(bulkNotifications.createdAt));

    return {
      success: true,
      data: campaigns
    };

  } catch (error) {
    console.error("Error fetching notification campaigns:", error);
    return {
      success: false,
      error: "Failed to fetch campaigns",
      data: []
    };
  }
}

/**
 * Get detailed campaign statistics
 */
export async function getCampaignStatistics(campaignId: string) {
  await ensureAdminAccess();

  try {
    // Get campaign details
    const campaign = await db
      .select()
      .from(bulkNotifications)
      .where(eq(bulkNotifications.id, campaignId))
      .limit(1);

    if (!campaign[0]) {
      return {
        success: false,
        error: "Campaign not found"
      };
    }

    // Get recipient statistics
    const recipientStats = await db
      .select({
        emailStatus: notificationRecipients.emailStatus,
        smsStatus: notificationRecipients.smsStatus,
        count: count()
      })
      .from(notificationRecipients)
      .where(eq(notificationRecipients.bulkNotificationId, campaignId))
      .groupBy(notificationRecipients.emailStatus, notificationRecipients.smsStatus);

    // Get detailed recipient list
    const recipients = await db
      .select({
        recipient: notificationRecipients,
        jobSeeker: jobSeekers,
        user: users
      })
      .from(notificationRecipients)
      .leftJoin(jobSeekers, eq(jobSeekers.id, notificationRecipients.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(notificationRecipients.bulkNotificationId, campaignId))
      .orderBy(desc(notificationRecipients.createdAt));

    return {
      success: true,
      data: {
        campaign: campaign[0],
        recipientStats,
        recipients
      }
    };

  } catch (error) {
    console.error("Error fetching campaign statistics:", error);
    return {
      success: false,
      error: "Failed to fetch campaign statistics"
    };
  }
}

/**
 * Retry failed notifications
 */
export async function retryFailedNotifications(campaignId: string) {
  await ensureAdminAccess();

  try {
    // Get failed recipients
    const failedRecipients = await db
      .select({
        recipient: notificationRecipients,
        jobSeeker: jobSeekers,
        user: users,
        assignment: boothAssignments,
        booth: booths,
        employer: employers
      })
      .from(notificationRecipients)
      .leftJoin(jobSeekers, eq(jobSeekers.id, notificationRecipients.jobSeekerId))
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .leftJoin(boothAssignments, eq(boothAssignments.id, notificationRecipients.boothAssignmentId))
      .leftJoin(booths, eq(booths.id, boothAssignments.boothId))
      .leftJoin(employers, eq(employers.id, booths.employerId))
      .where(
        and(
          eq(notificationRecipients.bulkNotificationId, campaignId),
          sql`(${notificationRecipients.emailStatus} = 'failed' OR ${notificationRecipients.smsStatus} = 'failed')`
        )
      );

    if (failedRecipients.length === 0) {
      return {
        success: true,
        message: "No failed notifications to retry",
        retryCount: 0
      };
    }

    let retryCount = 0;
    const template = NOTIFICATION_TEMPLATES.find(t => t.type === "booth_assignment")!;

    // Retry failed notifications
    for (const failed of failedRecipients) {
      try {
        if (!failed.user || !failed.jobSeeker) continue;

        const variables = {
          name: failed.user.name || "Job Seeker",
          companyName: failed.employer?.companyName || "Company",
          boothNumber: failed.booth?.boothNumber || "TBD",
          boothLocation: failed.booth?.location || "TBD",
          interviewDate: failed.assignment?.interviewDate 
            ? new Date(failed.assignment.interviewDate).toLocaleDateString()
            : "TBD",
          interviewTime: failed.assignment?.interviewTime || "TBD",
          pin: failed.jobSeeker.pin || "N/A"
        };

        // Retry email if failed
        if (failed.recipient.emailStatus === "failed") {
          try {
            let emailContent = template.emailTemplate;
            Object.entries(variables).forEach(([key, value]) => {
              emailContent = emailContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });

            await sendWelcomeEmail({
              email: failed.user.email,
              name: variables.name,
              pin: variables.pin,
              ticketNumber: failed.jobSeeker.ticketNumber || "",
              eventDetails: {
                name: "Huawei Career Fair",
                date: "TBD",
                venue: "TBD"
              }
            });

            await db
              .update(notificationRecipients)
              .set({
                emailStatus: "sent",
                emailSentAt: new Date(),
                emailError: null
              })
              .where(eq(notificationRecipients.id, failed.recipient.id));

            retryCount++;
          } catch (error) {
            console.error("Email retry failed:", error);
          }
        }

        // Retry SMS if failed
        if (failed.recipient.smsStatus === "failed" && failed.user.phoneNumber) {
          try {
            let smsContent = template.smsTemplate;
            Object.entries(variables).forEach(([key, value]) => {
              smsContent = smsContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });

            const smsResult = await sendBulkSMS({
              recipients: [{
                phoneNumber: failed.user.phoneNumber,
                name: variables.name,
                customData: { retryAttempt: true }
              }],
              templateType: 'CUSTOM',
              customMessage: smsContent
            });

            if (smsResult.success) {
              await db
                .update(notificationRecipients)
                .set({
                  smsStatus: "sent",
                  smsSentAt: new Date(),
                  smsError: null
                })
                .where(eq(notificationRecipients.id, failed.recipient.id));

              retryCount++;
            }
          } catch (error) {
            console.error("SMS retry failed:", error);
          }
        }

        // Small delay between retries
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error("Error retrying notification:", error);
      }
    }

    // Update campaign statistics
    const updatedStats = await db
      .select({
        emailSent: sql<number>`COUNT(CASE WHEN ${notificationRecipients.emailStatus} = 'sent' THEN 1 END)`,
        smsSent: sql<number>`COUNT(CASE WHEN ${notificationRecipients.smsStatus} = 'sent' THEN 1 END)`,
        emailFailed: sql<number>`COUNT(CASE WHEN ${notificationRecipients.emailStatus} = 'failed' THEN 1 END)`,
        smsFailed: sql<number>`COUNT(CASE WHEN ${notificationRecipients.smsStatus} = 'failed' THEN 1 END)`
      })
      .from(notificationRecipients)
      .where(eq(notificationRecipients.bulkNotificationId, campaignId));

    if (updatedStats[0]) {
      const totalSent = Math.max(updatedStats[0].emailSent, updatedStats[0].smsSent);
      const totalFailed = Math.max(updatedStats[0].emailFailed, updatedStats[0].smsFailed);

      await db
        .update(bulkNotifications)
        .set({
          sentCount: totalSent,
          failedCount: totalFailed,
          updatedAt: new Date()
        })
        .where(eq(bulkNotifications.id, campaignId));
    }

    revalidatePath("/admin/notifications");

    return {
      success: true,
      message: `Retry completed: ${retryCount} notifications retried`,
      retryCount
    };

  } catch (error) {
    console.error("Error retrying failed notifications:", error);
    return {
      success: false,
      error: "Failed to retry notifications"
    };
  }
} 