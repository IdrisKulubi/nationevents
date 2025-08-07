import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface RegistrationConfirmationEmailData {
  firstName: string
  lastName: string
  email: string
  attendanceType: "in_person" | "virtual"
  registrationId: string
}

export async function sendRegistrationConfirmationEmail(data: RegistrationConfirmationEmailData) {
  try {
    const { firstName, lastName, email, attendanceType, registrationId } = data
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Nxt Her Summit</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Nxt Her Summit!</h1>
              <p>Your registration has been received</p>
            </div>
            
            <div class="content">
              <h2>Hello ${firstName},</h2>
              
              <p>Thank you for registering for Nxt Her Summit! We're excited to have you join us for this empowering experience of connection, learning, and growth.</p>
              
              <div class="info-box">
                <h3>Registration Details</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Attendance Type:</strong> ${attendanceType === 'in_person' ? 'In Person' : 'Virtual'}</p>
                <p><strong>Registration ID:</strong> ${registrationId}</p>
              </div>
              
              <h3>What's Next?</h3>
              <p>Your registration is currently under review. Here's what you can expect:</p>
              
              <ul>
                <li><strong>Review Process:</strong> Our team will review your registration within 24-48 hours</li>
                <li><strong>Approval Notification:</strong> You'll receive an email once your registration is approved</li>
                <li><strong>Dashboard Access:</strong> After approval, you'll gain access to your personalized dashboard</li>
                <li><strong>Networking Features:</strong> Connect with other attendees based on your interests and expertise</li>
              </ul>
              
              <div class="info-box">
                <h3>Important Information</h3>
                <p>Please save this email for your records. You'll need your registration details to access your account once approved.</p>
              </div>
              
              <h3>Need Help?</h3>
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team:</p>
              <p>Email: <a href="mailto:support@nxthersummit.com">support@nxthersummit.com</a></p>
              
              <p>We look forward to seeing you at Nxt Her Summit!</p>
              
              <p>Best regards,<br>The Nxt Her Summit Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${email} because you registered for Nxt Her Summit.</p>
              <p>© 2024 Nxt Her Summit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const result = await resend.emails.send({
      from: "Nxt Her Summit <noreply@nxthersummit.com>",
      to: [email],
      subject: "Welcome to Nxt Her Summit - Registration Confirmed",
      html: emailHtml,
    })
    
    return { success: true, messageId: result.data?.id }
    
  } catch (error) {
    console.error("Failed to send registration confirmation email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

interface ApprovalNotificationEmailData {
  firstName: string
  lastName: string
  email: string
  loginUrl: string
  tempPassword: string
}

export async function sendApprovalNotificationEmail(data: ApprovalNotificationEmailData) {
  try {
    const { firstName, lastName, email, loginUrl, tempPassword } = data
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Registration Approved - Nxt Her Summit</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
            .credentials-box { background: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Approved!</h1>
              <p>Welcome to Nxt Her Summit</p>
            </div>
            
            <div class="content">
              <h2>Congratulations ${firstName}!</h2>
              
              <p>Your registration for Nxt Her Summit has been approved! You now have full access to all summit features and can start connecting with other attendees.</p>
              
              <div class="credentials-box">
                <h3>🔐 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
                <p><em>Please change your password after your first login for security.</em></p>
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Access Your Dashboard</a>
              </div>
              
              <div class="info-box">
                <h3>What You Can Do Now</h3>
                <ul>
                  <li><strong>Explore Your Dashboard:</strong> View your personalized welcome screen and event information</li>
                  <li><strong>Browse Sessions:</strong> Check out the interactive schedule and bookmark sessions of interest</li>
                  <li><strong>Network:</strong> Connect with other attendees based on shared interests and expertise</li>
                  <li><strong>Join Discussions:</strong> Participate in thematic discussion forums</li>
                  <li><strong>Meet Speakers:</strong> Explore speaker profiles and their sessions</li>
                </ul>
              </div>
              
              <h3>Getting Started Tips</h3>
              <ol>
                <li>Log in using the credentials above</li>
                <li>Complete your networking profile for better connections</li>
                <li>Browse the schedule and bookmark sessions you're interested in</li>
                <li>Start connecting with other attendees</li>
                <li>Join relevant discussion forums</li>
              </ol>
              
              <p>We're excited to have you as part of the Nxt Her Summit community!</p>
              
              <p>Best regards,<br>The Nxt Her Summit Team</p>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at <a href="mailto:support@nxthersummit.com">support@nxthersummit.com</a></p>
              <p>© 2024 Nxt Her Summit. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const result = await resend.emails.send({
      from: "Nxt Her Summit <noreply@nxthersummit.com>",
      to: [email],
      subject: "🎉 Registration Approved - Access Your Nxt Her Summit Dashboard",
      html: emailHtml,
    })
    
    return { success: true, messageId: result.data?.id }
    
  } catch (error) {
    console.error("Failed to send approval notification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}