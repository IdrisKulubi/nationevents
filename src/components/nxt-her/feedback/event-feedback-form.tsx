"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star, MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, Users, Monitor, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

const eventFeedbackSchema = z.object({
  npsScore: z.number().min(0, "Please provide an NPS score").max(10),
  overallRating: z.number().min(1, "Please provide an overall rating").max(5),
  contentQuality: z.number().min(1).max(5).optional(),
  networkingExperience: z.number().min(1).max(5).optional(),
  platformUsability: z.number().min(1).max(5).optional(),
  mostValuableAspect: z.string().max(500, "Most valuable aspect must be less than 500 characters").optional(),
  leastValuableAspect: z.string().max(500, "Least valuable aspect must be less than 500 characters").optional(),
  suggestions: z.string().max(1000, "Suggestions must be less than 1000 characters").optional(),
  wouldAttendAgain: z.boolean().optional(),
  wouldRecommend: z.boolean().optional(),
})

export type EventFeedbackFormData = z.infer<typeof eventFeedbackSchema>

interface EventFeedbackFormProps {
  eventId: string
  eventName: string
  onSubmit?: (data: EventFeedbackFormData) => void
  onClose?: () => void
  className?: string
}

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  label: string
  size?: "sm" | "md" | "lg"
}

interface NPSRatingProps {
  value: number
  onChange: (value: number) => void
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

function NPSRating({ value, onChange }: NPSRatingProps) {
  const [hoverValue, setHoverValue] = useState(-1)
  
  const getScoreColor = (score: number) => {
    if (score <= 6) return "bg-red-500 hover:bg-red-600"
    if (score <= 8) return "bg-yellow-500 hover:bg-yellow-600"
    return "bg-green-500 hover:bg-green-600"
  }
  
  const getScoreLabel = (score: number) => {
    if (score <= 6) return "Detractor"
    if (score <= 8) return "Passive"
    return "Promoter"
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-11 gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            type="button"
            className={`
              h-10 w-full rounded text-sm font-medium transition-colors
              ${score === value 
                ? `${getScoreColor(score)} text-white` 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }
            `}
            onMouseEnter={() => setHoverValue(score)}
            onMouseLeave={() => setHoverValue(-1)}
            onClick={() => onChange(score)}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
      {(value >= 0 || hoverValue >= 0) && (
        <div className="text-center">
          <Badge 
            variant={
              (hoverValue >= 0 ? hoverValue : value) <= 6 
                ? "destructive" 
                : (hoverValue >= 0 ? hoverValue : value) <= 8 
                ? "secondary" 
                : "default"
            }
          >
            {getScoreLabel(hoverValue >= 0 ? hoverValue : value)}
          </Badge>
        </div>
      )}
    </div>
  )
}

export function EventFeedbackForm({
  eventId,
  eventName,
  onSubmit,
  onClose,
  className,
}: EventFeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [completionProgress, setCompletionProgress] = useState(0)

  const form = useForm<EventFeedbackFormData>({
    resolver: zodResolver(eventFeedbackSchema),
    defaultValues: {
      npsScore: -1,
      overallRating: 0,
      contentQuality: 0,
      networkingExperience: 0,
      platformUsability: 0,
      mostValuableAspect: "",
      leastValuableAspect: "",
      suggestions: "",
      wouldAttendAgain: undefined,
      wouldRecommend: undefined,
    },
  })

  // Calculate completion progress
  useEffect(() => {
    const values = form.getValues()
    const requiredFields = ['npsScore', 'overallRating']
    const optionalFields = ['contentQuality', 'networkingExperience', 'platformUsability', 'mostValuableAspect', 'leastValuableAspect', 'suggestions', 'wouldAttendAgain', 'wouldRecommend']
    
    let completed = 0
    const total = requiredFields.length + optionalFields.length
    
    // Check required fields
    requiredFields.forEach(field => {
      if (field === 'npsScore' && values[field] >= 0) completed++
      else if (field === 'overallRating' && values[field] > 0) completed++
    })
    
    // Check optional fields
    optionalFields.forEach(field => {
      const value = values[field as keyof EventFeedbackFormData]
      if (field === 'contentQuality' || field === 'networkingExperience' || field === 'platformUsability') {
        if (value && value > 0) completed++
      } else if (field === 'wouldAttendAgain' || field === 'wouldRecommend') {
        if (value !== undefined) completed++
      } else if (typeof value === 'string' && value.trim().length > 0) {
        completed++
      }
    })
    
    setCompletionProgress((completed / total) * 100)
  }, [form.watch()])

  // Check if feedback already exists
  useEffect(() => {
    const checkExistingFeedback = async () => {
      try {
        const response = await fetch(`/api/nxt-her/event-feedback?eventId=${eventId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.hasSubmitted && data.feedback) {
            const feedback = data.feedback
            form.reset({
              npsScore: feedback.npsScore,
              overallRating: feedback.overallRating,
              contentQuality: feedback.contentQuality || 0,
              networkingExperience: feedback.networkingExperience || 0,
              platformUsability: feedback.platformUsability || 0,
              mostValuableAspect: feedback.mostValuableAspect || "",
              leastValuableAspect: feedback.leastValuableAspect || "",
              suggestions: feedback.suggestions || "",
              wouldAttendAgain: feedback.wouldAttendAgain,
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
  }, [eventId, form])

  const handleSubmit = async (data: EventFeedbackFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/nxt-her/event-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
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

  const watchedNpsScore = form.watch("npsScore")
  const watchedOverallRating = form.watch("overallRating")

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Event Feedback
        </CardTitle>
        <CardDescription>
          <div className="space-y-2">
            <p className="font-medium">{eventName}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs">Completion:</span>
              <Progress value={completionProgress} className="flex-1 h-2" />
              <span className="text-xs">{Math.round(completionProgress)}%</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* NPS Score */}
            <FormField
              control={form.control}
              name="npsScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Net Promoter Score *
                  </FormLabel>
                  <FormDescription>
                    How likely are you to recommend this event to a friend or colleague?
                  </FormDescription>
                  <FormControl>
                    <NPSRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Overall Rating */}
            <FormField
              control={form.control}
              name="overallRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Overall Event Rating *
                  </FormLabel>
                  <FormDescription>
                    How would you rate your overall experience at this event?
                  </FormDescription>
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

            {/* Multi-dimensional Ratings */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Detailed Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="contentQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Content Quality
                      </FormLabel>
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

                <FormField
                  control={form.control}
                  name="networkingExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Networking Experience
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value || 0}
                          onChange={field.onChange}
                          label="Networking Experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platformUsability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Platform Usability
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value || 0}
                          onChange={field.onChange}
                          label="Platform Usability"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Would Attend Again / Recommend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="wouldAttendAgain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Would you attend this event again?
                    </FormLabel>
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

              <FormField
                control={form.control}
                name="wouldRecommend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Would you recommend this event?
                    </FormLabel>
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
            </div>

            <Separator />

            {/* Open-ended Feedback */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Additional Feedback</h3>
              
              <FormField
                control={form.control}
                name="mostValuableAspect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What was the most valuable aspect of this event?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us what you found most valuable about the event..."
                        className="min-h-[80px] resize-none"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leastValuableAspect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What was the least valuable aspect of this event?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us what could be improved..."
                        className="min-h-[80px] resize-none"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suggestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggestions for Future Events</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your suggestions for improving future events..."
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
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between items-center pt-6">
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
                  disabled={isLoading || watchedNpsScore < 0 || watchedOverallRating === 0}
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