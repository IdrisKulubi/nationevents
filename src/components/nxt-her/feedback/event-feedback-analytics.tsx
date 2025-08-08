"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Star, 
  Users, 
  MessageSquare, 
  Download,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  BarChart3
} from "lucide-react"
import { toast } from "sonner"

interface EventFeedbackSummary {
  eventId: string
  eventName: string
  totalResponses: number
  averageNpsScore: number
  averageOverallRating: number
  averageContentQuality: number
  averageNetworkingExperience: number
  averagePlatformUsability: number
  wouldAttendAgainRate: number
  wouldRecommendRate: number
  npsCategories: {
    promoters: number
    passives: number
    detractors: number
  }
  feedback: Array<{
    id: string
    attendeeName: string
    npsScore: number
    overallRating: number
    mostValuableAspect?: string
    leastValuableAspect?: string
    suggestions?: string
    createdAt: Date
  }>
}

interface EventFeedbackAnalyticsProps {
  eventId: string
  className?: string
}

export function EventFeedbackAnalytics({
  eventId,
  className,
}: EventFeedbackAnalyticsProps) {
  const [summary, setSummary] = useState<EventFeedbackSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/nxt-her/event-feedback/analytics?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      } else {
        throw new Error("Failed to fetch feedback analytics")
      }
    } catch (error) {
      console.error("Error fetching feedback analytics:", error)
      toast.error("Failed to load feedback analytics")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [eventId])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSummary()
  }

  const handleExportData = () => {
    if (!summary) return

    const csvContent = [
      ["Attendee Name", "NPS Score", "Overall Rating", "Most Valuable Aspect", "Least Valuable Aspect", "Suggestions", "Date"],
      ...summary.feedback.map(f => [
        f.attendeeName,
        f.npsScore.toString(),
        f.overallRating.toString(),
        f.mostValuableAspect || "",
        f.leastValuableAspect || "",
        f.suggestions || "",
        new Date(f.createdAt).toLocaleDateString()
      ])
    ]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${summary.eventName}-feedback-analytics.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("Feedback analytics exported successfully")
  }

  const getNpsColor = (score: number) => {
    if (score >= 50) return "text-green-600"
    if (score >= 0) return "text-yellow-600"
    return "text-red-600"
  }

  const getNpsBadgeVariant = (score: number) => {
    if (score >= 50) return "default"
    if (score >= 0) return "secondary"
    return "destructive"
  }

  const calculateNpsScore = () => {
    if (!summary || summary.totalResponses === 0) return 0
    const { promoters, detractors } = summary.npsCategories
    return Math.round(((promoters - detractors) / summary.totalResponses) * 100)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Event Feedback Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Event Feedback Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No feedback data available</p>
        </CardContent>
      </Card>
    )
  }

  const npsScore = calculateNpsScore()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Feedback Analytics
              </CardTitle>
              <CardDescription>{summary.eventName}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="nps">NPS Analysis</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Responses</span>
                </div>
                <div className="text-2xl font-bold">{summary.totalResponses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">NPS Score</span>
                </div>
                <div className={`text-2xl font-bold ${getNpsColor(npsScore)}`}>
                  {npsScore}
                </div>
                <Badge variant={getNpsBadgeVariant(npsScore)} className="text-xs mt-1">
                  {npsScore >= 50 ? "Excellent" : npsScore >= 0 ? "Good" : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Rating</span>
                </div>
                <div className="text-2xl font-bold">
                  {summary.averageOverallRating.toFixed(1)}/5
                </div>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= Math.round(summary.averageOverallRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Would Recommend</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(summary.wouldRecommendRate)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Would Attend Again</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Yes</span>
                    <span>{Math.round(summary.wouldAttendAgainRate)}%</span>
                  </div>
                  <Progress value={summary.wouldAttendAgainRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Would Recommend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Yes</span>
                    <span>{Math.round(summary.wouldRecommendRate)}%</span>
                  </div>
                  <Progress value={summary.wouldRecommendRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Content Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">
                    {summary.averageContentQuality.toFixed(1)}/5
                  </div>
                  <div className="flex justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(summary.averageContentQuality)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Networking Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">
                    {summary.averageNetworkingExperience.toFixed(1)}/5
                  </div>
                  <div className="flex justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(summary.averageNetworkingExperience)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Platform Usability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold">
                    {summary.averagePlatformUsability.toFixed(1)}/5
                  </div>
                  <div className="flex justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(summary.averagePlatformUsability)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nps" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">NPS Distribution</CardTitle>
                <CardDescription>
                  Net Promoter Score: <span className={`font-bold ${getNpsColor(npsScore)}`}>{npsScore}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm">Promoters (9-10)</span>
                    </div>
                    <span className="text-sm font-medium">{summary.npsCategories.promoters}</span>
                  </div>
                  <Progress 
                    value={summary.totalResponses > 0 ? (summary.npsCategories.promoters / summary.totalResponses) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Passives (7-8)</span>
                    </div>
                    <span className="text-sm font-medium">{summary.npsCategories.passives}</span>
                  </div>
                  <Progress 
                    value={summary.totalResponses > 0 ? (summary.npsCategories.passives / summary.totalResponses) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm">Detractors (0-6)</span>
                    </div>
                    <span className="text-sm font-medium">{summary.npsCategories.detractors}</span>
                  </div>
                  <Progress 
                    value={summary.totalResponses > 0 ? (summary.npsCategories.detractors / summary.totalResponses) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">NPS Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className={`text-4xl font-bold ${getNpsColor(npsScore)} mb-2`}>
                    {npsScore}
                  </div>
                  <Badge variant={getNpsBadgeVariant(npsScore)}>
                    {npsScore >= 50 ? "Excellent" : npsScore >= 0 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Calculation:</strong> (Promoters - Detractors) / Total Responses × 100</p>
                  <p><strong>Score Range:</strong> -100 to +100</p>
                  <p><strong>Benchmark:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• 50+ = Excellent</li>
                    <li>• 0-49 = Good</li>
                    <li>• Below 0 = Needs Improvement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Feedback</CardTitle>
              <CardDescription>
                Latest feedback from attendees ({summary.feedback.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {summary.feedback.slice(0, 10).map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{feedback.attendeeName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">NPS: {feedback.npsScore}</Badge>
                        <Badge variant="secondary">
                          {feedback.overallRating}/5 ⭐
                        </Badge>
                      </div>
                    </div>
                    
                    {feedback.mostValuableAspect && (
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Most Valuable:</p>
                        <p className="text-sm text-muted-foreground">{feedback.mostValuableAspect}</p>
                      </div>
                    )}
                    
                    {feedback.leastValuableAspect && (
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">Least Valuable:</p>
                        <p className="text-sm text-muted-foreground">{feedback.leastValuableAspect}</p>
                      </div>
                    )}
                    
                    {feedback.suggestions && (
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">Suggestions:</p>
                        <p className="text-sm text-muted-foreground">{feedback.suggestions}</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {summary.feedback.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    ... and {summary.feedback.length - 10} more responses
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}