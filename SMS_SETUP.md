# SMS Setup Guide - Twilio Integration

This guide covers the complete setup and usage of SMS functionality in the Huawei Event Management application using Twilio.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Twilio Account Setup](#twilio-account-setup)
3. [Environment Configuration](#environment-configuration)
4. [Installation & Dependencies](#installation--dependencies)
5. [SMS Features Overview](#sms-features-overview)
6. [Usage Examples](#usage-examples)
7. [SMS Templates](#sms-templates)
8. [Webhook Configuration](#webhook-configuration)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

## 📋 Prerequisites

- Node.js 18+ installed
- Next.js 15 application setup
- Database configured (PostgreSQL with Drizzle ORM)
- Twilio account (free tier available)

## 🔧 Twilio Account Setup

### 1. Create Twilio Account
1. Visit [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your email and phone number

### 2. Get API Credentials
1. Navigate to **Console Dashboard**
2. Find your **Account SID** and **Auth Token**
3. Copy these credentials (you'll need them for environment variables)

### 3. Get a Phone Number
1. Go to **Phone Numbers** > **Manage** > **Buy a number**
2. Choose a number from your country (or international)
3. Purchase the number (free trial includes credits)
4. Note down the phone number in E.164 format (e.g., +1234567890)

### 4. Configure Messaging Service (Optional but Recommended)
1. Go to **Messaging** > **Services**
2. Create a new Messaging Service
3. Add your purchased phone number to the service
4. Configure compliance settings if required

## ⚙️ Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Webhook URL for delivery status
TWILIO_WEBHOOK_URL=https://yourdomain.com

# Optional: Messaging Service SID (if using messaging service)
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid
```

### Environment Variables Explanation:

- **TWILIO_ACCOUNT_SID**: Your unique Twilio account identifier
- **TWILIO_AUTH_TOKEN**: Your authentication token (keep this secret!)
- **TWILIO_PHONE_NUMBER**: The phone number you purchased from Twilio
- **TWILIO_WEBHOOK_URL**: Your domain URL for receiving delivery status updates
- **TWILIO_MESSAGING_SERVICE_SID**: If using a messaging service instead of direct phone number

## 📦 Installation & Dependencies

Install the Twilio SDK:

```bash
npm install twilio
```

The SMS functionality is already implemented in:
- `src/lib/actions/send-sms-actions.ts` - Core SMS functions
- `src/app/api/sms/webhook/route.ts` - Webhook handler
- `src/components/admin/send-sms-modal.tsx` - Admin SMS interface

## 🚀 SMS Features Overview

### Automatic SMS Notifications

1. **Welcome SMS**: Sent when job seekers register
   - Includes PIN code and event details
   - Sent via `sendWelcomeSMS()`

2. **Shortlist Notifications**: Sent when employers shortlist candidates
   - Congratulatory message with company name
   - Sent via `sendShortlistedSMS()`

3. **Interview Scheduling**: Sent when interviews are scheduled
   - Date, time, and booth information
   - Sent via `sendInterviewScheduledSMS()`

### Manual SMS Capabilities

1. **Custom Messages**: Admins can send custom SMS to selected job seekers
2. **Event Reminders**: Send bulk reminders to all approved job seekers
3. **PIN Reminders**: Individual PIN reminder messages

### SMS Templates

The system includes predefined templates for common scenarios:

```typescript
// Welcome message
"🎉 Welcome [Name]! You're registered for [Event]. Your PIN: [PIN]. Keep this safe for check-in. Good luck! 🚀"

// Shortlisted notification
"⭐ Congratulations [Name]! [Company] has shortlisted you. They may contact you soon for next steps. Keep up the great work! 🚀"

// Interview scheduled
"🎉 Great news [Name]! [Company] has scheduled an interview with you on [Date] at [Time] (Booth [Location]). Best of luck! 💼"

// Event reminder
"📅 Reminder: [Event] is tomorrow ([Date]) at [Venue]. Don't forget your PIN for check-in! 🚀"

// PIN reminder
"Hi [Name]! 📱 Your Huawei Career Fair PIN is: [PIN]. You'll need this for event check-in. See you there! 🎯"
```

## 💻 Usage Examples

### 1. Send Welcome SMS (Automatic)

```typescript
import { sendWelcomeSMS } from '@/lib/actions/send-sms-actions';

// Called automatically during job seeker registration
const result = await sendWelcomeSMS(jobSeekerId, eventId);

if (result.success) {
  console.log('Welcome SMS sent:', result.messageId);
} else {
  console.error('SMS failed:', result.error);
}
```

### 2. Send Shortlist Notification (Automatic)

```typescript
import { sendShortlistedSMS } from '@/lib/actions/send-sms-actions';

// Called automatically when employer shortlists a candidate
const result = await sendShortlistedSMS(jobSeekerId, companyName);
```

### 3. Send Custom Message (Admin)

```typescript
import { sendCustomSMS } from '@/lib/actions/send-sms-actions';

// Send custom message to specific job seekers
const result = await sendCustomSMS(
  ['jobSeeker1', 'jobSeeker2'], 
  'Important update about tomorrow\'s event...'
);

console.log(`Sent to ${result.summary.successful}/${result.summary.total} recipients`);
```

### 4. Send Event Reminder (Admin)

```typescript
import { sendEventReminderSMS } from '@/lib/actions/send-sms-actions';

// Send reminder to all approved job seekers for an event
const result = await sendEventReminderSMS(eventId);
```

### 5. Using the Admin SMS Modal

```tsx
import { SendSMSModal } from '@/components/admin/send-sms-modal';

// In your admin component
<SendSMSModal
  trigger={
    <Button>
      📱 Send SMS
    </Button>
  }
  eventId="event123"
  preSelectedJobSeekers={['jobSeeker1', 'jobSeeker2']}
/>
```

## 🌐 Webhook Configuration

### 1. Set Up Webhook Endpoint

The webhook is already implemented at `/api/sms/webhook`. To receive delivery status:

1. Add your domain to `TWILIO_WEBHOOK_URL` environment variable
2. Configure webhook in Twilio Console:
   - Go to **Phone Numbers** > Select your number
   - In "Messaging" section, set webhook URL to: `https://yourdomain.com/api/sms/webhook`
   - Set HTTP method to `POST`

### 2. Webhook Security (Recommended)

For production, validate webhook requests:

```typescript
import { validateRequest } from 'twilio';

// In your webhook handler
const isValid = validateRequest(
  process.env.TWILIO_AUTH_TOKEN!,
  signature,
  url,
  params
);
```

## 🛠️ Error Handling

### Common Error Scenarios

1. **Invalid Phone Numbers**
   - Numbers are automatically formatted to international format
   - Invalid numbers will be logged but won't stop the process

2. **SMS Delivery Failures**
   - Network issues, invalid numbers, or blocked numbers
   - Failed SMS won't prevent core operations (registration, shortlisting)

3. **Rate Limiting**
   - Bulk SMS includes 100ms delays between messages
   - Twilio free tier has daily limits

4. **Configuration Errors**
   - Missing environment variables will be caught and logged
   - Functions will return error status without crashing

### Error Response Format

```typescript
interface SendSMSResult {
  success: boolean;
  messageId?: string;    // Twilio message ID if successful
  error?: string;        // Error message if failed
  deliveryStatus?: string; // Initial delivery status
}
```

## 🧪 Testing

### 1. Test Environment Setup

```bash
# Use Twilio test credentials for development
TWILIO_ACCOUNT_SID=ACtest...
TWILIO_AUTH_TOKEN=test_token
TWILIO_PHONE_NUMBER=+15005550006  # Twilio test number
```

### 2. Test Phone Numbers

Twilio provides test phone numbers for development:
- `+15005550006` - Valid test number
- `+15005550001` - Invalid number (will fail)
- `+15005550007` - Number that can't receive SMS

### 3. Manual Testing

```typescript
// Test individual SMS
const result = await sendSMS({
  phoneNumber: '+1234567890',
  message: 'Test message from Huawei Event App',
  templateType: 'CUSTOM'
});

console.log('Test result:', result);
```

### 4. Webhook Testing

Use ngrok for local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local port
ngrok http 3000

# Use the ngrok URL for TWILIO_WEBHOOK_URL
```

## 🔧 Troubleshooting

### Problem: SMS Not Sending

**Check:**
1. Environment variables are correctly set
2. Twilio credentials are valid
3. Phone number has SMS capabilities
4. Account has sufficient credit/is not suspended

**Debug:**
```typescript
// Add debug logging
console.log('Twilio Config:', {
  accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...',
  hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
});
```

### Problem: Invalid Phone Number Format

**Solution:**
The `formatPhoneNumber()` function handles Kenyan numbers automatically:
- `0712345678` → `+254712345678`
- `712345678` → `+254712345678`
- `254712345678` → `+254712345678`

**Custom Format:**
```typescript
// Add custom number formatting for other countries
function formatPhoneNumber(phoneNumber: string, countryCode: string = '+254'): string {
  // Your custom formatting logic
}
```

### Problem: High SMS Costs

**Solutions:**
1. Use Twilio Messaging Services for better rates
2. Implement user preferences for SMS notifications
3. Use email as primary, SMS as backup
4. Set up SMS quotas per user/day

### Problem: Webhook Not Receiving Updates

**Check:**
1. Webhook URL is publicly accessible
2. HTTPS is used (required for production)
3. Webhook URL in Twilio Console matches your endpoint
4. Check webhook logs in Twilio Console

## 📊 Monitoring & Analytics

### SMS Logs

Monitor SMS activity:
```typescript
// In your webhook handler
console.log(`SMS Status Update: ${messageId} - ${status}`);

// Store in database for analytics
await db.insert(smsLogs).values({
  messageId,
  status,
  recipient: phoneNumber,
  timestamp: new Date()
});
```

### Delivery Reports

Track delivery success rates:
```typescript
// Calculate delivery stats
const deliveryStats = await db
  .select({
    total: count(),
    delivered: count().filter(eq(smsLogs.status, 'delivered')),
    failed: count().filter(eq(smsLogs.status, 'failed'))
  })
  .from(smsLogs)
  .where(gte(smsLogs.timestamp, yesterday));
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit credentials to version control
2. **Webhook Validation**: Validate all incoming webhook requests
3. **Rate Limiting**: Implement rate limiting for SMS sending
4. **User Consent**: Ensure users opt-in to SMS notifications
5. **Data Privacy**: Handle phone numbers according to GDPR/local laws

## 📞 Support

- **Twilio Documentation**: https://www.twilio.com/docs/sms
- **Twilio Support**: https://support.twilio.com/
- **Error Codes**: https://www.twilio.com/docs/api/errors

## 🎯 Next Steps

1. Set up monitoring and alerting for SMS failures
2. Implement user preferences for notification types
3. Add SMS templates for additional use cases
4. Set up automated SMS campaigns for events
5. Integrate with other notification channels (email, push notifications)

---
