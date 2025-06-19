"use server";

import db from "@/db/drizzle";
import { users, jobSeekers, events } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { SMS_TEMPLATES } from "@/lib/constants/sms-templates";
import type { SendSMSOptions, SendSMSResult, SendBulkSMSOptions } from "@/lib/types/sms";

// Twilio REST API configuration
const TWILIO_API_URL = "https://api.twilio.com/2010-04-01";

// Helper function to format phone numbers
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming Kenya +254)
  if (cleaned.length === 9 && cleaned.startsWith('7')) {
    return `+254${cleaned}`;
  } else if (cleaned.length === 10 && cleaned.startsWith('07')) {
    return `+254${cleaned.substring(1)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('+254')) {
    return cleaned;
  }
  
  // Return as is if format is unclear
  return phoneNumber;
}

// Validate environment variables
function validateTwilioConfig(): boolean {
  const requiredEnvVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  ];
  
  return requiredEnvVars.every(envVar => process.env[envVar]);
}

/**
 * Send SMS using Twilio REST API (Edge runtime compatible)
 */
async function sendTwilioSMS(to: string, body: string, statusCallback?: string): Promise<{
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio configuration');
    }

    // Create the message payload
    const payload = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: body,
    });

    if (statusCallback) {
      payload.append('StatusCallback', statusCallback);
    }

    // Create basic auth header
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(`${TWILIO_API_URL}/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twilio API error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      messageId: data.sid,
      status: data.status,
    };

  } catch (error: any) {
    console.error('❌ Twilio SMS API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS via Twilio API',
    };
  }
}

/**
 * Send SMS to a single recipient
 */
export async function sendSMS({
  phoneNumber,
  message,
  templateType,
  metadata
}: SendSMSOptions): Promise<SendSMSResult> {
  try {
    // Validate Twilio configuration
    if (!validateTwilioConfig()) {
      throw new Error('Twilio configuration is incomplete. Check environment variables.');
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Send SMS via Twilio REST API
    const result = await sendTwilioSMS(
      formattedPhone,
      message,
      process.env.TWILIO_WEBHOOK_URL ? `${process.env.TWILIO_WEBHOOK_URL}/api/sms/webhook` : undefined
    );

    if (result.success) {
      console.log(`📱 SMS sent successfully to ${formattedPhone}: ${result.messageId}`);
      return {
        success: true,
        messageId: result.messageId,
        deliveryStatus: result.status
      };
    } else {
      throw new Error(result.error);
    }

  } catch (error: any) {
    console.error('❌ SMS sending failed:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
}

/**
 * Send welcome SMS to job seeker with PIN
 */
export async function sendWelcomeSMS(
  jobSeekerId: string,
  eventId?: string
): Promise<SendSMSResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get job seeker data
    const jobSeekerData = await db
      .select({
        user: users,
        jobSeeker: jobSeekers,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.id, jobSeekerId))
      .limit(1);

    if (jobSeekerData.length === 0) {
      throw new Error("Job seeker not found");
    }

    const { user, jobSeeker } = jobSeekerData[0];

    if (!user || !user.phoneNumber) {
      throw new Error("User or phone number not found for job seeker");
    }

    if (!jobSeeker.pin) {
      throw new Error("PIN not generated for job seeker");
    }

    // Get event data if eventId provided
    let eventName = "Huawei Career Fair";
    if (eventId) {
      const eventData = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);
      
      if (eventData.length > 0) {
        eventName = eventData[0].name;
      }
    }

    // Generate welcome message
    const message = SMS_TEMPLATES.WELCOME.template(
      user.name,
      jobSeeker.pin,
      eventName
    );

    return await sendSMS({
      phoneNumber: user.phoneNumber,
      message,
      templateType: 'WELCOME',
      metadata: {
        jobSeekerId,
        eventId,
        pin: jobSeeker.pin
      }
    });

  } catch (error: any) {
    console.error('❌ Welcome SMS failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to send welcome SMS'
    };
  }
}

/**
 * Send PIN reminder SMS
 */
export async function sendPinReminderSMS(jobSeekerId: string): Promise<SendSMSResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get job seeker data
    const jobSeekerData = await db
      .select({
        user: users,
        jobSeeker: jobSeekers,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.id, jobSeekerId))
      .limit(1);

    if (jobSeekerData.length === 0) {
      throw new Error("Job seeker not found");
    }

    const { user, jobSeeker } = jobSeekerData[0];

    if (!user || !user.phoneNumber) {
      throw new Error("User or phone number not found for job seeker");
    }

    if (!jobSeeker.pin) {
      throw new Error("PIN not available for job seeker");
    }

    const message = SMS_TEMPLATES.PIN_REMINDER.template(user.name, jobSeeker.pin);

    return await sendSMS({
      phoneNumber: user.phoneNumber,
      message,
      templateType: 'PIN_REMINDER',
      metadata: {
        jobSeekerId,
        pin: jobSeeker.pin
      }
    });

  } catch (error: any) {
    console.error('❌ PIN reminder SMS failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to send PIN reminder SMS'
    };
  }
}

/**
 * Send interview scheduled SMS
 */
export async function sendInterviewScheduledSMS(
  jobSeekerId: string,
  companyName: string,
  interviewDate: string,
  interviewTime: string,
  boothLocation: string
): Promise<SendSMSResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get job seeker data
    const jobSeekerData = await db
      .select({
        user: users,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.id, jobSeekerId))
      .limit(1);

    if (jobSeekerData.length === 0) {
      throw new Error("Job seeker not found");
    }

    const { user } = jobSeekerData[0];

    if (!user || !user.phoneNumber) {
      throw new Error("User or phone number not found for job seeker");
    }

    const message = SMS_TEMPLATES.INTERVIEW_SCHEDULED.template(
      user.name,
      companyName,
      interviewDate,
      interviewTime,
      boothLocation
    );

    return await sendSMS({
      phoneNumber: user.phoneNumber,
      message,
      templateType: 'INTERVIEW_SCHEDULED',
      metadata: {
        jobSeekerId,
        companyName,
        interviewDate,
        interviewTime,
        boothLocation
      }
    });

  } catch (error: any) {
    console.error('❌ Interview scheduled SMS failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to send interview scheduled SMS'
    };
  }
}

/**
 * Send shortlisted notification SMS
 */
export async function sendShortlistedSMS(
  jobSeekerId: string,
  companyName: string
): Promise<SendSMSResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get job seeker data
    const jobSeekerData = await db
      .select({
        user: users,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.id, jobSeekerId))
      .limit(1);

    if (jobSeekerData.length === 0) {
      throw new Error("Job seeker not found");
    }

    const { user } = jobSeekerData[0];

    if (!user || !user.phoneNumber) {
      throw new Error("User or phone number not found for job seeker");
    }

    const message = SMS_TEMPLATES.SHORTLISTED.template(user.name, companyName);

    return await sendSMS({
      phoneNumber: user.phoneNumber,
      message,
      templateType: 'SHORTLISTED',
      metadata: {
        jobSeekerId,
        companyName
      }
    });

  } catch (error: any) {
    console.error('❌ Shortlisted SMS failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to send shortlisted SMS'
    };
  }
}

/**
 * Send bulk SMS to multiple job seekers
 */
export async function sendBulkSMS({
  recipients,
  templateType,
  templateData,
  customMessage
}: SendBulkSMSOptions): Promise<{
  success: boolean;
  results: SendSMSResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check user role (admin or employer)
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (user.length === 0 || !['admin', 'employer'].includes(user[0].role || '')) {
      throw new Error("Insufficient permissions to send bulk SMS");
    }

    const results: SendSMSResult[] = [];
    
    // Process each recipient
    for (const recipient of recipients) {
      try {
        let message: string;

        if (templateType === 'CUSTOM' && customMessage) {
          message = customMessage;
        } else {
          // Generate message based on template
          const template = SMS_TEMPLATES[templateType];
          if (!template) {
            throw new Error(`Invalid template type: ${templateType}`);
          }

          // For now, we'll use a generic approach
          // You can extend this based on specific template requirements
          switch (templateType) {
            case 'PIN_REMINDER':
              message = `Hi ${recipient.name}! 📱 Your event PIN is: ${templateData?.pin || 'N/A'}. Keep this safe! 🎯`;
              break;
            case 'EVENT_REMINDER':
              message = `📅 Hi ${recipient.name}! Reminder: ${templateData?.eventName || 'Event'} is on ${templateData?.date || 'soon'}. Don't forget your PIN! 🚀`;
              break;
            case 'SHORTLISTED':
              message = `⭐ Congratulations ${recipient.name}! ${templateData?.companyName || 'A company'} has shortlisted you! 🚀`;
              break;
            default:
              message = customMessage || `Hi ${recipient.name}! Update from Huawei Career Fair. 📱`;
          }
        }

        const result = await sendSMS({
          phoneNumber: recipient.phoneNumber,
          message,
          templateType,
          metadata: {
            bulkSend: true,
            recipientData: recipient.customData
          }
        });

        results.push(result);

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        results.push({
          success: false,
          error: error.message || `Failed to send SMS to ${recipient.phoneNumber}`
        });
      }
    }

    const summary = {
      total: recipients.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    console.log(`📊 Bulk SMS Summary: ${summary.successful}/${summary.total} sent successfully`);

    return {
      success: summary.successful > 0,
      results,
      summary
    };

  } catch (error: any) {
    console.error('❌ Bulk SMS failed:', error);
    return {
      success: false,
      results: [],
      summary: {
        total: recipients.length,
        successful: 0,
        failed: recipients.length
      }
    };
  }
}

/**
 * Send event reminder SMS to all job seekers
 */
export async function sendEventReminderSMS(eventId: string): Promise<{
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check admin permission
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      throw new Error("Admin access required");
    }

    // Get event details
    const eventData = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventData.length === 0) {
      throw new Error("Event not found");
    }

    const event = eventData[0];

    // Get all job seekers with phone numbers
    const jobSeekersData = await db
      .select({
        user: users,
        jobSeeker: jobSeekers,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(and(
        eq(jobSeekers.registrationStatus, 'approved'),
        eq(users.isActive, true)
      ));

    // Filter job seekers with phone numbers
    const recipients = jobSeekersData
      .filter(data => data.user && data.user.phoneNumber)
      .map(data => ({
        phoneNumber: data.user!.phoneNumber!,
        name: data.user!.name,
        customData: {
          jobSeekerId: data.jobSeeker.id,
          pin: data.jobSeeker.pin
        }
      }));

    if (recipients.length === 0) {
      throw new Error("No job seekers with phone numbers found");
    }

    // Send bulk SMS
    const result = await sendBulkSMS({
      recipients,
      templateType: 'EVENT_REMINDER',
      templateData: {
        eventName: event.name,
        date: new Date(event.startDate).toLocaleDateString(),
        venue: event.venue
      }
    });

    return {
      success: result.success,
      summary: result.summary
    };

  } catch (error: any) {
    console.error('❌ Event reminder SMS failed:', error);
    return {
      success: false,
      summary: {
        total: 0,
        successful: 0,
        failed: 0
      }
    };
  }
}

/**
 * Send custom SMS to specific job seekers
 */
export async function sendCustomSMS(
  jobSeekerIds: string[],
  message: string
): Promise<{
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get job seekers data
    const jobSeekersData = await db
      .select({
        user: users,
        jobSeeker: jobSeekers,
      })
      .from(jobSeekers)
      .leftJoin(users, eq(users.id, jobSeekers.userId))
      .where(inArray(jobSeekers.id, jobSeekerIds));

    // Filter job seekers with phone numbers
    const recipients = jobSeekersData
      .filter(data => data.user && data.user.phoneNumber)
      .map(data => ({
        phoneNumber: data.user!.phoneNumber!,
        name: data.user!.name,
        customData: {
          jobSeekerId: data.jobSeeker.id
        }
      }));

    if (recipients.length === 0) {
      throw new Error("No job seekers with phone numbers found");
    }

    // Send bulk SMS
    const result = await sendBulkSMS({
      recipients,
      templateType: 'CUSTOM',
      customMessage: message
    });

    return {
      success: result.success,
      summary: result.summary
    };

  } catch (error: any) {
    console.error('❌ Custom SMS failed:', error);
    return {
      success: false,
      summary: {
        total: 0,
        successful: 0,
        failed: 0
      }
    };
  }
}

/**
 * Get SMS delivery status (webhook handler)
 */
export async function handleSMSWebhook(
  messageId: string,
  status: string,
  errorCode?: string
): Promise<void> {
  try {
    console.log(`📱 SMS Webhook: Message ${messageId} status: ${status}`);
    
    if (errorCode) {
      console.error(`❌ SMS Error: ${messageId} - ${errorCode}`);
    }

    // You can store delivery status in database if needed
    // await db.insert(smsLogs).values({
    //   messageId,
    //   status,
    //   errorCode,
    //   updatedAt: new Date()
    // });

  } catch (error: any) {
    console.error('❌ SMS webhook handling failed:', error);
  }
}
