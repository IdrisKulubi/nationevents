export interface Attendee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  organization?: string
  title?: string
  country: string
  city?: string
  bio: string
  linkedinUrl?: string
  twitterUrl?: string
  websiteUrl?: string
  expertise: string[]
  interests: string[]
  lookingFor: string[]
  photo?: string
  attendanceType: "in-person" | "virtual"
  registeredAt: string
} 