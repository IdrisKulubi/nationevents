/**
 * Notification utilities for sending emails and SMS
 * 
 * This module handles all external communications including:
 * - Welcome emails and SMS for new registrations
 * - PIN reminders via email and SMS
 * - Event notifications and updates
 * 
 * Uses Resend for emails and Twilio for SMS
 */

import { sendSMS } from '@/lib/actions/send-sms-actions';

interface WelcomeEmailData {
  email: string;
  name: string;
  pin: string;
  ticketNumber: string;
  eventDetails: {
    name: string;
    date: string;
    venue: string;
  };
}

interface WelcomeSMSData {
  phoneNumber: string;
  name: string;
  pin: string;
  ticketNumber: string;
}

/**
 * Send welcome email with PIN code
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  try {
    // TODO: Implement with your preferred email service (Resend, SendGrid, etc.)
    
    const emailContent = `
      Dear ${data.name},

      Welcome to the ${data.eventDetails.name}!

      Your registration has been successfully completed. Here are your important details:

      🎫 Ticket Number: ${data.ticketNumber}
      🔐 PIN Code: ${data.pin}

      📅 Event Details:
      • Date: ${data.eventDetails.date}
      • Venue: ${data.eventDetails.venue}

      Important Instructions:
      • Keep your PIN code secure and do not share it with anyone
      • You will need your ticket number and PIN for check-in
      • Arrive 30 minutes early for registration
      • Bring a printed copy of this email or have it ready on your phone

      What to Expect:
      • Access to 50+ top employers
      • Live interview opportunities
      • Networking sessions
      • Career development workshops

      For any questions or support, contact us at:
      📧 Email: support@huaweicareersummit.com
      📞 Phone: +254 700 000 000

      We look forward to seeing you at the event!

      Best regards,
      Huawei Career Summit Team
      
      ---
      This is an automated message. Please do not reply to this email.
    `;

    // Placeholder implementation - replace with actual email service
    console.log("Sending welcome email to:", data.email);
    console.log("Email content:", emailContent);

    // Example with Resend (uncomment when you have API key):
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'Huawei Career Summit <noreply@huaweicareersummit.com>',
      to: [data.email],
      subject: `Welcome to ${data.eventDetails.name} - Your PIN: ${data.pin}`,
      html: generateWelcomeEmailHTML(data),
    });
    */

    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

/**
 * Send welcome SMS with PIN code
 */
export async function sendWelcomeSMS(data: WelcomeSMSData): Promise<boolean> {
  try {
    const smsContent = `🎉 Welcome ${data.name}! You're registered for Nation-Huawei Leap Job Fair 2025.

🎫 Ticket: ${data.ticketNumber}
🔐 PIN: ${data.pin}

📅 Jun 26-27, 2025 at UON Graduation Square, Nairobi
Keep this PIN safe for check-in!

Support: +254 700 000 000 🚀`;

    const result = await sendSMS({
      phoneNumber: data.phoneNumber,
      message: smsContent,
      templateType: 'WELCOME',
      metadata: {
        ticketNumber: data.ticketNumber,
        pin: data.pin
      }
    });

    if (!result.success) {
      console.error("SMS sending failed:", result.error);
      return false;
    }

    console.log(`📱 Welcome SMS sent successfully to ${data.phoneNumber}: ${result.messageId}`);
    return true;

  } catch (error) {
    console.error("Error sending welcome SMS:", error);
    return false;
  }
}

/**
 * Send PIN reminder email
 */
export async function sendPinReminderEmail(email: string, name: string, pin: string, ticketNumber: string): Promise<boolean> {
  try {
    const emailContent = `
      Dear ${name},

      This is a reminder of your PIN code for the Nation-Huawei Leap Job Fair 2025.

      🎫 Ticket Number: ${ticketNumber}
      🔐 PIN Code: ${pin}

      📅 Jun 26-27, 2025 at UON Graduation Square, Nairobi
      📍 Venue: UON Graduation Square, Nairobi

      Please keep this information secure and bring it with you to the event.

      See you there!

      Best regards,
      Huawei Career Summit Team
    `;

    console.log("Sending PIN reminder email to:", email);
    console.log("Email content:", emailContent);

    return true;
  } catch (error) {
    console.error("Error sending PIN reminder email:", error);
    return false;
  }
}

/**
 * Send PIN reminder SMS
 */
export async function sendPinReminderSMS(phoneNumber: string, name: string, pin: string, ticketNumber: string): Promise<boolean> {
  try {
    const smsContent = `Hi ${name}! 📱 Reminder for Nation-Huawei Leap Job Fair 2025:

🎫 Ticket: ${ticketNumber}
🔐 PIN: ${pin}

📅 Jun 26-27 at UON Graduation Square, Nairobi
Keep this safe for check-in! 🎯`;

    const result = await sendSMS({
      phoneNumber: phoneNumber,
      message: smsContent,
      templateType: 'PIN_REMINDER',
      metadata: {
        ticketNumber,
        pin
      }
    });

    if (!result.success) {
      console.error("PIN reminder SMS sending failed:", result.error);
      return false;
    }

    console.log(`📱 PIN reminder SMS sent successfully to ${phoneNumber}: ${result.messageId}`);
    return true;

  } catch (error) {
    console.error("Error sending PIN reminder SMS:", error);
    return false;
  }
}

/**
 * Generate HTML email template for welcome email
 */
function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${data.eventDetails.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff4757, #e1251b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .pin-box { background: #fff; border: 2px solid #ff4757; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
        .pin { font-size: 32px; font-weight: bold; color: #ff4757; letter-spacing: 4px; }
        .ticket { font-size: 18px; font-weight: bold; color: #333; margin-top: 10px; }
        .details { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${data.eventDetails.name}!</h1>
          <p>Your registration is confirmed</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${data.name}</strong>,</p>
          
          <p>Congratulations! You have successfully registered for the ${data.eventDetails.name}. We're excited to have you join us for this prestigious career event.</p>
          
          <div class="pin-box">
            <div class="ticket">Ticket Number: ${data.ticketNumber}</div>
            <div class="pin">${data.pin}</div>
            <small>Keep this PIN secure - you'll need it for check-in</small>
          </div>
          
          <div class="details">
            <h3>📅 Event Details</h3>
            <p><strong>Date:</strong> ${data.eventDetails.date}</p>
            <p><strong>Venue:</strong> ${data.eventDetails.venue}</p>
            <p><strong>Registration opens:</strong> 8:00 AM each day</p>
          </div>
          
          <h3>🎯 What to Expect</h3>
          <ul>
            <li>Access to 50+ top employers</li>
            <li>Live interview opportunities</li>
            <li>Networking sessions with industry leaders</li>
            <li>Career development workshops</li>
          </ul>
          
          <h3>📋 What to Bring</h3>
          <ul>
            <li>This email (printed or on your phone)</li>
            <li>Valid ID for verification</li>
            <li>Multiple copies of your CV</li>
            <li>Professional attire</li>
          </ul>
          
          <div class="footer">
            <p>Need help? Contact us at:</p>
            <p>📧 support@huaweicareersummit.com | 📞 +254 700 000 000</p>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Validate phone number format (basic validation)
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Basic validation for Kenyan phone numbers
  const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
  return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
}

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\s+/g, '');
  
  if (cleaned.startsWith('+254')) {
    return cleaned;
  } else if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    return `+254${cleaned}`;
  }
  
  return phoneNumber; // Return original if format not recognized
} 