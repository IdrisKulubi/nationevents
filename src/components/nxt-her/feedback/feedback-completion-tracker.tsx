"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  Download,
  Mail,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface FeedbackCompletionStats {
  totalAttendees: number
  completedFeedback: number
  completionRate: number
  pendingAttendees: Array<{
    id: string
    name: string
    email: string
  }>
}

interface FeedbackCompletionTrackerProps {
  eventId: string
  eventName: string
  className?: string
}

export function FeedbackCompletionTracker({
  eventId,
  eventName,
  className,
}: FeedbackCompletionTrackerProps) {
  const [stats, setStats] = useState<FeedbackCompletionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/nxt-her/event-feedback/completion?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error("Failed to fetch completion stats")
      }
    } catch (error) {
      console.error("Error fetching completion stats:", error)
      toast.error("Failed to load completion statistics")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [eventId])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchStats()
  }

  const handleExportPendingList = () => {
    if (!stats || stats.pendingAttendees.length === 0) return

    const csvContent = [
      ["Name", "Email"],
      ...stats.pendingAttendees.map(attendee => [attendee.name, attendee.email])
    ]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${eventName}-pending-feedback.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("Pending attendees list exported successfully")
  }

  const handleSendReminders = async () => {
    try {
      const response = await fetch(`/api/nxt-her/event-feedback/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      })

      if (response.ok) {
        toast.success("Feedback reminders sent successfully")
      } else {
        throw new Error("Failed to send reminders")
      }
    } catch (error) {
      console.error("Error sending reminders:", error)
      toast.error("Failed to send feedback reminders")
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Feedback Completion Tracking
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

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Feedback Completion Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load completion statistics</p>
        </CardContent>
      </Card>
    )
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600"
    if (rate >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getCompletionBadgeVariant = (rate: number) => {
    if (rate >= 80) return "default"
    if (rate >= 60) return "secondary"
    return "destructive"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Feedback Completion Tracking
            </CardTitle>
            <CardDescription>{eventName}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Total Attendees</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalAttendees}</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.completedFeedback}</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalAttendees - stats.completedFeedback}
            </div>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completion Rate</span>
            <Badge variant={getCompletionBadgeVariant(stats.completionRate)}>
              {Math.round(stats.completionRate)}%
            </Badge>
          </div>
          <Progress value={stats.completionRate} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className={getCompletionColor(stats.completionRate)}>
              {stats.completedFeedback} of {stats.totalAttendees} completed
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Action Buttons */}
        {stats.pendingAttendees.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleExportPendingList}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Pending List
            </Button>
            <Button
              onClick={handleSendReminders}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Reminders ({stats.pendingAttendees.length})
            </Button>
          </div>
        )}

        {/* Pending Attendees Preview */}
        {stats.pendingAttendees.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Feedback ({stats.pendingAttendees.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {stats.pendingAttendees.slice(0, 10).map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                >
                  <span className="font-medium">{attendee.name}</span>
                  <span className="text-muted-foreground">{attendee.email}</span>
                </div>
              ))}
              {stats.pendingAttendees.length > 10 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... and {stats.pendingAttendees.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {stats.completionRate === 100 && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">
              🎉 All attendees have completed their feedback!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}