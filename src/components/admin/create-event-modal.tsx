"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Globe, 
  Mail, 
  Phone, 
  Tag, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Plus
} from "lucide-react";
import { createEvent } from "@/lib/actions/admin-event-actions";
import { toast } from "sonner";

interface CreateEventModalProps {
  trigger: React.ReactNode;
  defaultType?: "job_fair" | "career_expo" | "networking";
}

export function CreateEventModal({ trigger, defaultType }: CreateEventModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    venue: "",
    address: "",
    maxAttendees: "",
    eventType: defaultType || "job_fair",
    registrationDeadline: "",
    isActive: false,
    organizerEmail: "",
    organizerPhone: "",
    websiteUrl: "",
    logoUrl: "",
    requirements: "",
    ticketPrice: "",
    currency: "KES"
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name && formData.description && formData.eventType;
      case 2:
        return formData.startDate && formData.endDate && formData.registrationDeadline && 
               formData.venue && formData.address;
      case 3:
        return formData.maxAttendees && parseInt(formData.maxAttendees) > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const result = await createEvent({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        venue: formData.venue,
        address: formData.address,
        maxAttendees: parseInt(formData.maxAttendees),
        eventType: formData.eventType as "job_fair" | "career_expo" | "networking",
        registrationDeadline: formData.registrationDeadline,
        isActive: formData.isActive,
      });

      if (result.success) {
        toast.success(result.message || "Event created successfully!");
        setOpen(false);
        setStep(1);
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          venue: "",
          address: "",
          maxAttendees: "",
          eventType: defaultType || "job_fair",
          registrationDeadline: "",
          isActive: false,
          organizerEmail: "",
          organizerPhone: "",
          websiteUrl: "",
          logoUrl: "",
          requirements: "",
          ticketPrice: "",
          currency: "KES"
        });
        setTags([]);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create event");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  const eventTypeOptions = [
    { value: "job_fair", label: "Job Fair", description: "Career fair with employer booths and interviews" },
    { value: "career_expo", label: "Career Expo", description: "Professional career exposition and networking" },
    { value: "networking", label: "Networking", description: "Professional networking and social events" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-blue-600" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                stepNumber <= step 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-600"
              }`}>
                {stepNumber < step ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 4 && (
                <div className={`w-16 h-1 mx-2 transition-colors ${
                  stepNumber < step ? "bg-blue-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Event Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Huawei Nation Job Fair 2025"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event, its purpose, and what attendees can expect..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Event Type *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {eventTypeOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.eventType === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleInputChange("eventType", option.value)}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Date & Location */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Date & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Start Date *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date *
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="registrationDeadline" className="text-sm font-medium">
                      Registration Deadline *
                    </Label>
                    <Input
                      id="registrationDeadline"
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="venue" className="text-sm font-medium">
                    Venue Name *
                  </Label>
                  <Input
                    id="venue"
                    placeholder="e.g., University of Nairobi Grounds"
                    value={formData.venue}
                    onChange={(e) => handleInputChange("venue", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Full Address *
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Complete address including city, state, and any special instructions..."
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Capacity & Pricing */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacity & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxAttendees" className="text-sm font-medium">
                    Maximum Attendees *
                  </Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.maxAttendees}
                    onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used to calculate checkpoint capacities and crowd management
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticketPrice" className="text-sm font-medium">
                      Ticket Price (Optional)
                    </Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency" className="text-sm font-medium">
                      Currency
                    </Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizerEmail" className="text-sm font-medium">
                      Organizer Email
                    </Label>
                    <Input
                      id="organizerEmail"
                      type="email"
                      placeholder="organizer@company.com"
                      value={formData.organizerEmail}
                      onChange={(e) => handleInputChange("organizerEmail", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="organizerPhone" className="text-sm font-medium">
                      Organizer Phone
                    </Label>
                    <Input
                      id="organizerPhone"
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={formData.organizerPhone}
                      onChange={(e) => handleInputChange("organizerPhone", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="websiteUrl" className="text-sm font-medium">
                    Event Website
                  </Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://event-website.com"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-sm font-medium">
                    Requirements & Instructions
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any special requirements, dress code, items to bring, etc..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Activate Event Immediately</div>
                    <div className="text-sm text-blue-700">
                      Make this event active and visible to users right away
                    </div>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-500">
            Step {step} of 4
          </div>
          
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(prev => prev - 1)}>
                Previous
              </Button>
            )}
            
            {step < 4 ? (
              <Button onClick={handleNext} disabled={!validateStep(step)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 