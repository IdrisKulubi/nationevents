"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const sessionFeedbackSchema = z.object({
  rating: z.number().min(1, "Please provide an overall rating").max(5),
  contentQuality: z.number().min(1).max(5).optional(),
  speakerRating: z.number().min(1).max(5).optional(),
  relevance: z.number().min(1).max(5).optional(),
  comments: z.string().max(1000, "Comments must be less than 1000 characters").optional(),
  wouldRecommend: z.boolean().optional(),
})

export type SessionFeedbackFormData = z.infer<typeof sessionFeedbackSchema>

interface SessionFeedbackFormProps {
  sessionId: string
  sessionTitle: string
  sessionSpeakers?: string[]
  onSubmit?: (data: SessionFeedbackFormData) => void
  onClose?: () => void
  className?: string
}

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  label: string
  size?: "sm" | "md" | "lg"
}

function StarRating({ value, onChange, label, size = "md" }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)
  
  const starSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
  
  return (
    <div className="space-y-2">
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
        <span className="ml-2 text-sm text-muted-foreground">
          {value > 0 ? `${value}/5` : "Not rated"}
        </span>
      </div>
    </div>
  )
}

export function SessionFeedbackForm({
  sessionId,
  sessionTitle,
  sessionSpeakers = [],
  onSubmit,
  onClose,
  className,
}: SessionFeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const form = useForm<SessionFeedbackFormData>({
    resolver: zodResolver(sessionFeedbackSchema),
    defaultValues: {
      rating: 0,
      contentQuality: 0,
      speakerRating: 0,
      relevance: 0,
      comments: "",
      wouldRecommend: undefined,
    },
  })

  // Check if feedback already exists
  useEffect(() => {
    const checkExistingFeedback = async () => {
      try {
        const response = await fetch(`/api/nxt-her/session-feedback?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.hasSubmitted && data.feedback) {
            const feedback = data.feedback
            form.reset({
              rating: feedback.rating,
              contentQuality: feedback.contentQuality || 0,
              speakerRating: feedback.speakerRating || 0,
              relevance: feedback.relevance || 0,
              comments: feedback.comments || "",
              wouldRecommend: feedback.wouldRecommend,
            })
            setHasSubmitted(true)
          }
        }
      } catch (error) {
        console.error("Error checking existing feedback:", error)
      }
    }

    checkExistingFeedback()
  }, [sessionId, form])

  const handleSubmit = async (data: SessionFeedbackFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/nxt-her/session-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          ...data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit feedback")
      }

      const result = await response.json()
      
      toast.success(hasSubmitted ? "Feedback updated successfully!" : "Thank you for your feedback!")
      setHasSubmitted(true)
      
      if (onSubmit) {
        onSubmit(data)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback")
    } finally {
      setIsLoading(false)
    }
  }

  const watchedRating = form.watch("rating")
  const watchedWouldRecommend = form.watch("wouldRecommend")

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Session Feedback
        </CardTitle>
        <CardDescription>
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
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Overall Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Overall Rating *
                  </FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                      label="Overall Rating"
                      size="lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="contentQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Quality</FormLabel>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label="Content Quality"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {sessionSpeakers.length > 0 && (
                <FormField
                  control={form.control}
                  name="speakerRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speaker Performance</FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value || 0}
                          onChange={field.onChange}
                          label="Speaker Performance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="relevance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevance to You</FormLabel>
                    <FormControl>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label="Relevance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Would Recommend */}
            <FormField
              control={form.control}
              name="wouldRecommend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Would you recommend this session to others?</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={field.value === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(true)}
                        className="flex items-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === false ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(false)}
                        className="flex items-center gap-2"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        No
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comments */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts about the session, what you learned, or suggestions for improvement..."
                      className="min-h-[100px] resize-none"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-between items-center pt-4">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="submit"
                  disabled={isLoading || watchedRating === 0}
                  className="min-w-32"
                >
                  {isLoading 
                    ? "Submitting..." 
                    : hasSubmitted 
                    ? "Update Feedback" 
                    : "Submit Feedback"
                  }
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}