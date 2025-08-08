import { Suspense } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/db/drizzle"
import { nxtHerEvents, nxtHerAttendees } from "@/db/nxt-her-schema"
import { eq, and } from "drizzle-orm"
import { EventFeedbackForm } from "@/components/nxt-her/feedback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Star, TrendingUp } from "lucide-react"

async function getEventAndAttendee() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "nxt_her_attendee") {
    redirect("/nxt-her/login")
  }

  // Find the attendee
  const attendee = await db.query.nxtHerAttendees.findFirst({
    where: eq(nxtHerAttendees.email, session.user.email!),
    with: {
      event: true,
    },
  })

  if (!attendee) {
    redirect("/nxt-her/login")
  }

  return {
    attendee,
    event: attendee.event,
  }
}

function EventFeedbackSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 bg-muted rounded w-64 mx-auto animate-pulse" />
          <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export default async function EventFeedbackPage() {
  return (
    <Suspense fallback={<EventFeedbackSkeleton />}>
      <EventFeedbackContent />
    </Suspense>
  )
}

async function EventFeedbackContent() {
  const { attendee, event } = await getEventAndAttendee()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Event Feedback</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your feedback is invaluable in helping us improve future events. Please take a few minutes to share your experience.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-sm">
              {event.name}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Feedback Importance Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Star className="h-5 w-5" />
              Why Your Feedback Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Improve Future Events</p>
                  <p className="text-muted-foreground">Help us enhance content, networking, and overall experience</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Share Your Voice</p>
                  <p className="text-muted-foreground">Your insights directly influence our event planning decisions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Recognition & Impact</p>
                  <p className="text-muted-foreground">Help us recognize what worked well and what needs improvement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Feedback Form */}
        <EventFeedbackForm
          eventId={event.id}
          eventName={event.name}
          onSubmit={() => {
            // Could add analytics tracking here
            console.log("Event feedback submitted")
          }}
        />

        {/* Additional Information */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Your feedback is anonymous and will be used solely for improving future events.
              </p>
              <p className="text-sm text-muted-foreground">
                Thank you for taking the time to help us create better experiences for our community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}