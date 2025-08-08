import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  SessionFeedbackForm, 
  QuickPulseSurvey, 
  SessionFeedbackTrigger 
} from "@/components/nxt-her/feedback"

// Mock session data for testing
const mockSession = {
  id: "test-session-1",
  title: "Building Feminist Economies: A Panel Discussion",
  speakers: ["Dr. Sarah Johnson", "Maria Rodriguez", "Aisha Patel"],
  endTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
}

export default function FeedbackTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Session Feedback Components Test</h1>
        <p className="text-muted-foreground">
          This page demonstrates the session-level feedback components for the Nxt Her Summit.
        </p>
      </div>

      <Separator />

      {/* Session Feedback Trigger */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Session Feedback Trigger</h2>
        <p className="text-muted-foreground">
          This component shows feedback prompts and automatically triggers after session end.
        </p>
        <div className="max-w-md">
          <SessionFeedbackTrigger
            sessionId={mockSession.id}
            sessionTitle={mockSession.title}
            sessionSpeakers={mockSession.speakers}
            sessionEndTime={mockSession.endTime}
            autoTriggerDelay={1} // 1 minute for testing
          />
        </div>
      </div>

      <Separator />

      {/* Quick Pulse Survey */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Pulse Survey</h2>
        <p className="text-muted-foreground">
          A quick feedback form that appears at session end for immediate feedback collection.
        </p>
        <div className="max-w-lg">
          <QuickPulseSurvey
            sessionId={mockSession.id}
            sessionTitle={mockSession.title}
            sessionSpeakers={mockSession.speakers}
            onComplete={() => console.log("Quick survey completed")}
            onSkip={() => console.log("Quick survey skipped")}
            onDetailedFeedback={() => console.log("Switched to detailed feedback")}
          />
        </div>
      </div>

      <Separator />

      {/* Detailed Session Feedback Form */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Detailed Session Feedback Form</h2>
        <p className="text-muted-foreground">
          A comprehensive feedback form with multiple rating dimensions and comment fields.
        </p>
        <div className="max-w-2xl">
          <SessionFeedbackForm
            sessionId={mockSession.id}
            sessionTitle={mockSession.title}
            sessionSpeakers={mockSession.speakers}
            onSubmit={(data) => console.log("Detailed feedback submitted:", data)}
          />
        </div>
      </div>

      <Separator />

      {/* Mobile Optimization Note */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Mobile Optimization</CardTitle>
          <CardDescription>
            All feedback components are optimized for mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            • Quick pulse survey uses mobile-friendly touch interactions
          </p>
          <p className="text-sm">
            • Feedback forms adapt to screen size with responsive layouts
          </p>
          <p className="text-sm">
            • Modal components use drawers on mobile for better UX
          </p>
          <p className="text-sm">
            • Star ratings are touch-optimized with appropriate sizing
          </p>
        </CardContent>
      </Card>
    </div>
  )
}