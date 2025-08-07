import { z } from "zod"

export const step1ValidationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(2, "City must be at least 2 characters"),
  attendanceType: z.enum(["in_person", "virtual"], {
    required_error: "Please select your attendance type",
  }),
})

export const step2ValidationSchema = z.object({
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  aboutYou: z.string().optional(),
  linkedinProfile: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  twitterHandle: z.string().optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  topicsOfInterest: z.array(z.string()).min(1, "Please select at least one topic of interest"),
  areasOfExpertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to continue",
  }),
  infoSharingConsent: z.boolean(),
})

export const completeRegistrationSchema = step1ValidationSchema.merge(step2ValidationSchema)

export type Step1Data = z.infer<typeof step1ValidationSchema>
export type Step2Data = z.infer<typeof step2ValidationSchema>
export type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>

// Utility function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility function to validate phone number (basic)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Utility function to validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Utility function to sanitize Twitter handle
export function sanitizeTwitterHandle(handle: string): string {
  return handle.replace(/^@/, '').trim()
}

// Utility function to format LinkedIn URL
export function formatLinkedInUrl(url: string): string {
  if (!url) return url
  
  // If it's just a username, format it as a full URL
  if (!url.startsWith('http')) {
    return `https://linkedin.com/in/${url}`
  }
  
  return url
}