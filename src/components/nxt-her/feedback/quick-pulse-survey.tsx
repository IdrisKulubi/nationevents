"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface QuickPulseSurveyProps {
  sessionId: string
  sessionTitle: string
  sessionSpeakers?: string[]
  onComplete?: () => void
  onSkip?: () => void
  onDetailedFeedback?: () => void
  className?: string
}

interface QuickRatingProps {
  value: number
  onChange: (value: number) => void
  size?: "sm" | "md"
}

function QuickRating({ value, onChange, size = "sm" }: QuickRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${starSize} transition-colors`}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`${starSize} ${
              star <= (hoverValue || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function QuickPulseSurvey({
  sessionId,
  sessionTitle,
  sessionSpeakers = [],
  onComplete,
  onSkip,
  onDetailedFeedback,
  className,
}: QuickPulseSurveyProps) {
  const [rating, setRating] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [quickComment, setQuickComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuickSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating before submitting")
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/nxt-her/session-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          rating,
          wouldRecommend,
          comments: quickComment || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit feedback")
      }

      toast.success("Thank you for your quick feedback!")
      
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error submitting quick feedback:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDetailedFeedback = () => {
    if (onDetailedFeedback) {
      onDetailedFeedback()
    }
  }

  return (
    <Card className={`${className} border-l-4 border-l-blue-500`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">How was this session?</CardTitle>
            <CardDescription>
              <div className="space-y-1">
                <p className="font-medium text-sm">{sessionTitle}</p>
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
          {onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Overall Rating *</label>
          <div className="flex items-center gap-2">
            <QuickRating value={rating} onChange={setRating} />
            <span className="text-sm text-muted-foreground">
              {rating > 0 ? `${rating}/5` : ""}
            </span>
          </div>
        </div>

        {/* Would Recommend */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Would you recommend this session?</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={wouldRecommend === true ? "default" : "outline"}
              size="sm"
              onClick={() => setWouldRecommend(true)}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="h-3 w-3" />
              Yes
            </Button>
            <Button
              type="button"
              variant={wouldRecommend === false ? "destructive" : "outline"}
              size="sm"
              onClick={() => setWouldRecommend(false)}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="h-3 w-3" />
              No
            </Button>
          </div>
        </div>

        {/* Quick Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick thoughts (optional)</label>
          <Textarea
            placeholder="Any quick thoughts about the session?"
            value={quickComment}
            onChange={(e) => setQuickComment(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground text-right">
            {quickComment.length}/200
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={handleQuickSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1"
            size="sm"
          >
            {isSubmitting ? "Submitting..." : "Submit Quick Feedback"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDetailedFeedback}
            className="flex-1"
            size="sm"
          >
            Detailed Feedback
          </Button>
        </div>

        {onSkip && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}