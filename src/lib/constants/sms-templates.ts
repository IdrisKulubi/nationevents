// SMS Templates
export const SMS_TEMPLATES = {
  WELCOME: {
    title: "Welcome to Huawei Career Fair",
    template: (name: string, pin: string, eventName: string) => 
      `🎉 Welcome ${name}! You're registered for ${eventName}. Your PIN: ${pin}. Keep this safe for check-in. Good luck! 🚀`
  },
  PIN_REMINDER: {
    title: "PIN Reminder",
    template: (name: string, pin: string) => 
      `Hi ${name}! 📱 Your Huawei Career Fair PIN is: ${pin}. You'll need this for event check-in. See you there! 🎯`
  },
  EVENT_REMINDER: {
    title: "Event Reminder",
    template: (name: string, eventName: string, date: string, venue: string) => 
      `📅 Reminder: ${eventName} is tomorrow (${date}) at ${venue}. Don't forget your PIN for check-in! 🚀`
  },
  INTERVIEW_SCHEDULED: {
    title: "Interview Scheduled",
    template: (name: string, companyName: string, date: string, time: string, booth: string) => 
      `🎉 Great news ${name}! ${companyName} has scheduled an interview with you on ${date} at ${time} (Booth ${booth}). Best of luck! 💼`
  },
  SHORTLISTED: {
    title: "Shortlisted Notification",
    template: (name: string, companyName: string) => 
      `⭐ Congratulations ${name}! ${companyName} has shortlisted you. They may contact you soon for next steps. Keep up the great work! 🚀`
  },
  STATUS_UPDATE: {
    title: "Application Status Update",
    template: (name: string, status: string, companyName: string) => 
      `📋 Hi ${name}! Your application status with ${companyName} has been updated to: ${status}. Check your dashboard for details. 💼`
  },
  CUSTOM: {
    title: "Custom Message",
    template: (message: string) => message
  }
} as const; 