"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Settings,
  MapPin,
  Users,
  Clock,
  Save,
  Eye,
  Edit,
  Plus,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { 
  getCurrentEvent, 
  updateEvent, 
  toggleEventStatus 
} from "@/lib/actions/admin-actions";

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  address: string;
  maxAttendees: number;
  registrationDeadline: string;
  isActive: boolean;
  eventType: "job_fair" | "career_expo" | "networking";
  currentAttendees: number;
  checkedInAttendees: number;
}

export function EventManagement() {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [eventSettings, setEventSettings] = useState({
    allowLateRegistration: true,
    enableNotifications: true,
    autoCheckIn: false,
    requirePinVerification: true,
    enableFeedback: true,
    maxInterviewsPerAttendee: 5,
    interviewSlotDuration: 30,
    enableWalkIns: false,
  });

  const loadEventData = async () => {
    try {
      setLoading(true);
      const eventData = await getCurrentEvent();
      
      if (eventData) {
        // Transform dates to the format expected by date inputs and handle nullable fields
        setCurrentEvent({
          id: eventData.id,
          name: eventData.name,
          description: eventData.description || "",
          venue: eventData.venue,
          address: eventData.address || "",
          maxAttendees: eventData.maxAttendees || 0,
          isActive: eventData.isActive ?? true,
          eventType: (eventData.eventType as "job_fair" | "career_expo" | "networking") || "job_fair",
          currentAttendees: eventData.currentAttendees || 0,
          checkedInAttendees: eventData.checkedInAttendees || 0,
          startDate: new Date(eventData.startDate).toISOString().split('T')[0],
          endDate: new Date(eventData.endDate).toISOString().split('T')[0],
          registrationDeadline: eventData.registrationDeadline ? new Date(eventData.registrationDeadline).toISOString().split('T')[0] : "",
        });
      } else {
        toast.info("No active event found. Please create an event first.");
      }
    } catch (error) {
      console.error("Error loading event:", error);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, []);

  const handleSaveEvent = async () => {
    if (!currentEvent) return;

    try {
      setSaveLoading(true);
      await updateEvent(currentEvent.id, {
        name: currentEvent.name,
        description: currentEvent.description,
        startDate: currentEvent.startDate,
        endDate: currentEvent.endDate,
        venue: currentEvent.venue,
        address: currentEvent.address,
        maxAttendees: currentEvent.maxAttendees,
        registrationDeadline: currentEvent.registrationDeadline,
        eventType: currentEvent.eventType,
      });
      
      toast.success("Event details updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // In a real implementation, this would save settings to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Event settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    }
  };

  const handleToggleEventStatus = async () => {
    if (!currentEvent) return;

    try {
      setStatusLoading(true);
      await toggleEventStatus(currentEvent.id);
      
      setCurrentEvent(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      toast.success(`Event ${currentEvent.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Error toggling event status:", error);
      toast.error("Failed to update event status. Please try again.");
    } finally {
      setStatusLoading(false);
    }
  };

  const getEventStatusColor = () => {
    if (!currentEvent || !currentEvent.isActive) return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
    
    const now = new Date();
    const startDate = new Date(currentEvent.startDate);
    const endDate = new Date(currentEvent.endDate);
    
    if (now < startDate) return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
    if (now >= startDate && now <= endDate) return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
  };

  const getEventStatusText = () => {
    if (!currentEvent || !currentEvent.isActive) return "Inactive";
    
    const now = new Date();
    const startDate = new Date(currentEvent.startDate);
    const endDate = new Date(currentEvent.endDate);
    
    if (now < startDate) return "Upcoming";
    if (now >= startDate && now <= endDate) return "Live";
    return "Completed";
  };

  const getDaysUntilEvent = () => {
    if (!currentEvent) return 0;
    const now = new Date();
    const startDate = new Date(currentEvent.startDate);
    return Math.max(0, Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getAttendanceRate = () => {
    if (!currentEvent || currentEvent.currentAttendees === 0) return 0;
    return Math.round((currentEvent.checkedInAttendees / currentEvent.currentAttendees) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
              Event Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Configure event settings, monitor status, and manage event details
            </p>
          </div>
        </div>
        
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No Active Event Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              There is no active event in the system. Please create an event to get started.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Event Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure event settings, monitor status, and manage event details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getEventStatusColor()}>
            {getEventStatusText()}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Event Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Registered Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {currentEvent.currentAttendees.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              of {currentEvent.maxAttendees.toLocaleString()} max
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Checked In Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {currentEvent.checkedInAttendees}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getAttendanceRate()}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Days Until Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {getDaysUntilEvent()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(currentEvent.startDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Event Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${currentEvent.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {currentEvent.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleEventStatus}
              className="mt-2"
              disabled={statusLoading}
            >
              {statusLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {currentEvent.isActive ? 'Deactivating...' : 'Activating...'}
                </>
              ) : (
                currentEvent.isActive ? 'Deactivate' : 'Activate'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Event Details Tab */}
        <TabsContent value="details">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Event Details
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                disabled={saveLoading}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input
                      id="eventName"
                      value={currentEvent.name}
                      onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, name: e.target.value } : null)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select
                      value={currentEvent.eventType}
                      onValueChange={(value: any) => setCurrentEvent(prev => prev ? { ...prev, eventType: value } : null)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job_fair">Job Fair</SelectItem>
                        <SelectItem value="career_expo">Career Expo</SelectItem>
                        <SelectItem value="networking">Networking Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={currentEvent.venue}
                      onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, venue: e.target.value } : null)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={currentEvent.address}
                      onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, address: e.target.value } : null)}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={currentEvent.startDate}
                      onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={currentEvent.endDate}
                      onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={currentEvent.maxAttendees}
                      onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, maxAttendees: parseInt(e.target.value) } : null)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      type="date"
                      value={currentEvent.registrationDeadline}
                      onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, registrationDeadline: e.target.value } : null)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                  disabled={!isEditing}
                  className="mt-1"
                  rows={4}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={saveLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEvent}
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Event Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Registration Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Late Registration</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Allow registrations after deadline
                      </p>
                    </div>
                    <Switch
                      checked={eventSettings.allowLateRegistration}
                      onCheckedChange={(checked) => 
                        setEventSettings(prev => ({ ...prev, allowLateRegistration: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Walk-ins</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Allow on-site registration
                      </p>
                    </div>
                    <Switch
                      checked={eventSettings.enableWalkIns}
                      onCheckedChange={(checked) => 
                        setEventSettings(prev => ({ ...prev, enableWalkIns: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>PIN Verification Required</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Require PIN for check-in
                      </p>
                    </div>
                    <Switch
                      checked={eventSettings.requirePinVerification}
                      onCheckedChange={(checked) => 
                        setEventSettings(prev => ({ ...prev, requirePinVerification: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">System Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Send email and SMS notifications
                      </p>
                    </div>
                    <Switch
                      checked={eventSettings.enableNotifications}
                      onCheckedChange={(checked) => 
                        setEventSettings(prev => ({ ...prev, enableNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Check-in</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Automatic check-in on arrival
                      </p>
                    </div>
                    <Switch
                      checked={eventSettings.autoCheckIn}
                      onCheckedChange={(checked) => 
                        setEventSettings(prev => ({ ...prev, autoCheckIn: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Feedback</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Collect post-event feedback
                      </p>
                    </div>
                    <Switch
                      checked={eventSettings.enableFeedback}
                      onCheckedChange={(checked) => 
                        setEventSettings(prev => ({ ...prev, enableFeedback: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <Label htmlFor="maxInterviews">Max Interviews per Attendee</Label>
                  <Input
                    id="maxInterviews"
                    type="number"
                    value={eventSettings.maxInterviewsPerAttendee}
                    onChange={(e) => 
                      setEventSettings(prev => ({ ...prev, maxInterviewsPerAttendee: parseInt(e.target.value) }))
                    }
                    className="mt-1"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <Label htmlFor="slotDuration">Interview Slot Duration (minutes)</Label>
                  <Select
                    value={eventSettings.interviewSlotDuration.toString()}
                    onValueChange={(value) => 
                      setEventSettings(prev => ({ ...prev, interviewSlotDuration: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Real-time Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Registration System</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                      Online
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Check-in System</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">Email Service</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                      Degraded
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Security System</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                      Secure
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "New registration", user: "System", time: "2 min ago", type: "success" },
                    { action: "Check-in completed", user: "Security", time: "5 min ago", type: "success" },
                    { action: "Email service alert", user: "System", time: "10 min ago", type: "warning" },
                    { action: "Interview scheduled", user: "System", time: "15 min ago", type: "info" },
                    { action: "Employer verified", user: "Admin", time: "20 min ago", type: "success" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "success" ? "bg-green-500" :
                        activity.type === "warning" ? "bg-orange-500" :
                        "bg-blue-500"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Preview
            </DialogTitle>
            <DialogDescription>
              How your event will appear to attendees
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {currentEvent.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {currentEvent.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">
                    {new Date(currentEvent.startDate).toLocaleDateString()} - {new Date(currentEvent.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{currentEvent.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">
                    {currentEvent.currentAttendees} / {currentEvent.maxAttendees} attendees
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">
                    Register by {new Date(currentEvent.registrationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 