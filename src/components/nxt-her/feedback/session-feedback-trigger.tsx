"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Clock, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MobileFeedbackModal } from "./mobile-feedback-modal"
import { toast } from "sonner"

interface SessionFeedbackTriggerProps {
  sessionId: string
  sessionTitle: string
  sessionSpeakers?: string[]
  sessionEndTime: Date
  autoTriggerDelay?: number // minutes after session end to auto-trigger
  className?: string
}

export function SessionFeedbackTrigger({
  sessionId,
  sessionTitle,
  sessionSpeakers = [],
  sessionEndTime,
  autoTriggerDelay = 5,
  className,
}: SessionFeedbackTriggerProps) {
  const [showModal, setShowModal] = useState(false)
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false)
  const [isSessionEnded, setIsSessionEnded] = useState(false)
  const [timeUntilEnd, setTimeUntilEnd] = useState<string>("")

  // Check if session has ended and calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const endTime = new Date(sessionEndTime)
      const timeDiff = endTime.getTime() - now.getTime()

      if (timeDiff <= 0) {
        setIsSessionEnded(true)
        setTimeUntilEnd("")
      } else {
        setIsSessionEnded(false)
        const minutes = Math.floor(timeDiff / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
        
        if (minutes > 0) {
          setTimeUntilEnd(`${minutes}m ${seconds}s remaining`)
        } else {
          setTimeUntilEnd(`${seconds}s remaining`)
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [sessionEndTime])

  // Auto-trigger feedback modal after session ends
  useEffect(() => {
    if (isSessionEnded && !hasSubmittedFeedback) {
      const timer = setTimeout(() => {
        setShowModal(true)
        toast.info("How was the session? We'd love your feedback!")
      }, autoTriggerDelay * 60 * 1000)

      return () => clearTimeout(timer)
    }
  }, [isSessionEnded, hasSubmittedFeedback, autoTriggerDelay])

  // Check if feedback already exists
  useEffect(() => {
    const checkExistingFeedback = async () => {
      try {
        const response = await fetch(`/api/nxt-her/session-feedback?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setHasSubmittedFeedback(data.hasSubmitted)
        }
      } catch (error) {
        console.error("Error checking existing feedback:", error)
      }
    }

    checkExistingFeedback()
  }, [sessionId])

  const handleOpenFeedback = () => {
    setShowModal(true)
  }

  const handleCloseFeedback = () => {
    setShowModal(false)
  }

  const handleFeedbackComplete = () => {
    setHasSubmittedFeedback(true)
    setShowModal(false)
  }

  return (
    <>
      <Card className={`${className} ${isSessionEnded ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Session Feedback
              </CardTitle>
              <CardDescription className="text-sm">
                <div className="space-y-1">
                  <p className="font-medium">{sessionTitle}</p>
                  {sessionSpeakers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sessionSpeakers.map((speaker, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {speaker}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardDescription>
            </div>
            {!isSessionEnded && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeUntilEnd}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {hasSubmittedFeedback ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Star className="h-4 w-4 fill-current" />
                <span>Thank you for your feedback!</span>
              </div>
            ) : (
              <div className="space-y-2">
                {isSessionEnded ? (
                  <p className="text-sm text-muted-foreground">
                    Session ended. Share your thoughts to help improve future sessions.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Feedback will be available when the session ends.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={handleOpenFeedback}
                size="sm"
                disabled={!isSessionEnded && !hasSubmittedFeedback}
                className="flex-1"
              >
                {hasSubmittedFeedback ? "Update Feedback" : "Give Feedback"}
              </Button>
              {isSessionEnded && !hasSubmittedFeedback && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFeedback}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  Quick Survey
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <MobileFeedbackModal
        isOpen={showModal}
        onClose={handleCloseFeedback}
        sessionId={sessionId}
        sessionTitle={sessionTitle}
        sessionSpeakers={sessionSpeakers}
        mode="quick"
      />
    </>
  )
}