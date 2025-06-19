"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, Loader2, MapPin, User, FileText, Zap, CheckCircle } from "lucide-react";
import { createInterviewSlot } from "@/app/api/employer/booths/actions";
import { toast } from "sonner";

interface Booth {
  id: string;
  boothNumber: string;
  location: string;
  event?: {
    name: string;
    venue: string;
  };
}

interface InterviewSlotModalProps {
  booths: Booth[];
  trigger?: React.ReactNode;
}

export function InterviewSlotModal({ booths, trigger }: InterviewSlotModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    boothId: "",
    date: "",
    startTime: "",
    duration: 30,
    interviewerName: "",
    notes: "",
  });

  // Generate time slots (9 AM to 5 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.boothId || !formData.date || !formData.startTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const startDateTime = `${formData.date}T${formData.startTime}:00`;
      
      const result = await createInterviewSlot({
        boothId: formData.boothId,
        startTime: startDateTime,
        duration: formData.duration,
        interviewerName: formData.interviewerName || undefined,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        toast.success("Interview slot created successfully! 🎉");
        setOpen(false);
        setFormData({
          boothId: "",
          date: "",
          startTime: "",
          duration: 30,
          interviewerName: "",
          notes: "",
        });
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create interview slot");
      }
    } catch (error) {
      console.error("Error creating interview slot:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = () => {
    if (!formData.startTime) return "";
    try {
      const startDate = new Date(`2024-01-01T${formData.startTime}:00`);
      const endDate = new Date(startDate.getTime() + formData.duration * 60000);
      return endDate.toTimeString().slice(0, 5);
    } catch {
      return "";
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Create Interview Slot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            Create Interview Slot
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            Schedule a new interview slot for candidates to book appointments
          </DialogDescription>
        </DialogHeader>

        {booths.length === 0 ? (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-yellow-900 mb-3">
                🏢 No Booth Available
              </h3>
              <p className="text-yellow-800 mb-6 text-lg">
                You need to set up a booth before creating interview slots
              </p>
              <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                🚀 Setup Booth First
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Booth Selection */}
            <div className="space-y-3">
              <Label htmlFor="booth" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Select Booth
              </Label>
              <Select
                value={formData.boothId}
                onValueChange={(value) => setFormData({ ...formData, boothId: value })}
                required
              >
                <SelectTrigger className="h-14 text-base border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="🏢 Choose your booth" />
                </SelectTrigger>
                <SelectContent>
                  {booths.map((booth) => (
                    <SelectItem key={booth.id} value={booth.id}>
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            📍 Booth {booth.boothNumber} - {booth.location}
                          </span>
                          {booth.event && (
                            <span className="text-sm text-gray-600">
                              🎪 {booth.event.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="date" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  min={today}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-14 text-base border-2 border-gray-300 hover:border-green-400 focus:border-green-500 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="startTime" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Start Time
                </Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  required
                >
                  <SelectTrigger className="h-14 text-base border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 rounded-xl">
                    <SelectValue placeholder="🕐 Select time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time} className="py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">{time}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Duration
              </Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
              >
                <SelectTrigger className="h-14 text-base border-2 border-gray-300 hover:border-orange-400 focus:border-orange-500 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15" className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">⚡</span>
                      <span className="font-medium">15 minutes - Quick Chat</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="30" className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🎯</span>
                      <span className="font-medium">30 minutes - Standard Interview</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="45" className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">💼</span>
                      <span className="font-medium">45 minutes - Detailed Discussion</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="60" className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🔥</span>
                      <span className="font-medium">1 hour - Comprehensive Interview</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="90" className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🚀</span>
                      <span className="font-medium">1.5 hours - Extended Session</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="120" className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🎪</span>
                      <span className="font-medium">2 hours - Deep Dive</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interviewer Name */}
            <div className="space-y-3">
              <Label htmlFor="interviewerName" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Interviewer Name <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="interviewerName"
                value={formData.interviewerName}
                onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                placeholder="e.g., John Smith, HR Manager"
                className="h-14 text-base border-2 border-gray-300 hover:border-indigo-400 focus:border-indigo-500 rounded-xl"
              />
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Notes <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions, requirements, or preparation notes for candidates..."
                rows={4}
                className="text-base border-2 border-gray-300 hover:border-teal-400 focus:border-teal-500 rounded-xl resize-none"
              />
            </div>

            {/* Preview Card */}
            {formData.date && formData.startTime && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-blue-900">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    📅 Interview Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-600 mb-1">📅 Date</p>
                      <p className="text-lg font-bold text-blue-900">
                        {new Date(formData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-600 mb-1">⏰ Time Slot</p>
                      <p className="text-lg font-bold text-blue-900">
                        {formData.startTime} - {calculateEndTime()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-600 mb-1">⚡ Duration</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formData.duration} minutes
                      {formData.duration >= 60 && (
                        <span className="text-sm font-normal text-blue-700">
                          {" "}({Math.floor(formData.duration / 60)}h {formData.duration % 60}m)
                        </span>
                      )}
                    </p>
                  </div>
                  {formData.interviewerName && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-600 mb-1">👤 Interviewer</p>
                      <p className="text-lg font-bold text-blue-900">{formData.interviewerName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl h-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.boothId || !formData.date || !formData.startTime}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 h-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Slot...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Create Interview Slot
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 