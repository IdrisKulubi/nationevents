"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building, X, Loader2, Calendar, MapPin, Users, Settings, CheckCircle } from "lucide-react";
import { createAdminBooth } from "@/lib/actions/admin-booth-actions";

interface Event {
  id: string;
  name: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface AdminBoothModalProps {
  events: Event[];
  trigger?: React.ReactNode;
}

const equipmentOptions = [
  "Projector",
  "Laptop", 
  "TV Screen",
  "Sound System",
  "Microphone",
  "Extension Cords",
  "Wi-Fi Access",
  "Tables",
  "Chairs",
  "Whiteboard",
  "Flip Chart",
  "Brochure Stand",
  "Banner Stand",
  "Lighting",
  "Internet Connection",
  "Power Outlet",
  "Backdrop",
  "Registration Desk"
];

export function AdminBoothModal({ events, trigger }: AdminBoothModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    eventId: "",
    employerEmail: "",
    boothNumber: "",
    location: "",
    size: "" as "small" | "medium" | "large" | "",
    specialRequirements: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventId || !formData.employerEmail || !formData.boothNumber || !formData.location || !formData.size) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await createAdminBooth({
        ...formData,
        size: formData.size as "small" | "medium" | "large",
        equipment: selectedEquipment,
        specialRequirements: formData.specialRequirements || undefined,
      });

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          setOpen(false);
          setFormData({
            eventId: "",
            employerEmail: "",
            boothNumber: "",
            location: "",
            size: "",
            specialRequirements: "",
          });
          setSelectedEquipment([]);
          setError("");
          setSuccess("");
          router.refresh();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error creating booth:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = (equipment: string) => {
    if (!selectedEquipment.includes(equipment)) {
      setSelectedEquipment([...selectedEquipment, equipment]);
    }
  };

  const removeEquipment = (equipment: string) => {
    setSelectedEquipment(selectedEquipment.filter(item => item !== equipment));
  };

  const addCustomEquipment = () => {
    if (customEquipment.trim() && !selectedEquipment.includes(customEquipment.trim())) {
      setSelectedEquipment([...selectedEquipment, customEquipment.trim()]);
      setCustomEquipment("");
    }
  };

  const getEventStatusBadge = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) return <Badge variant="secondary" className="text-xs">Completed</Badge>;
    if (startDate <= now && endDate >= now) return <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>;
    if (startDate > now) return <Badge className="bg-blue-100 text-blue-800 text-xs">Upcoming</Badge>;
    return <Badge variant="outline" className="text-xs">Draft</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Booth
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Setup Exhibition Booth
          </DialogTitle>
          <DialogDescription>
            Configure booth details, assign to an event, and specify equipment requirements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Event Selection */}
          <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Event Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event">Select Event *</Label>
                <Select
                  value={formData.eventId}
                  onValueChange={(value) => setFormData({ ...formData, eventId: value })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an event for this booth" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No events found</p>
                        <p className="text-xs">Create an event first to assign booths</p>
                      </div>
                    ) : (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex flex-col py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.name}</span>
                              {getEventStatusBadge(event)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.venue}
                              </span>
                              <span>
                                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {events.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                    ⚠️ No events available. Please create an event first.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Assignment */}
          <Card className="border-purple-100 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Company Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="employerEmail">Company Email *</Label>
                <Input
                  id="employerEmail"
                  type="email"
                  value={formData.employerEmail}
                  onChange={(e) => setFormData({ ...formData, employerEmail: e.target.value })}
                  placeholder="company@example.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the email of the employer/company that will use this booth
                </p>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Tip:</strong> You can find employer emails in the Admin → User Management → Employers section. 
                    If the company isn&apos;t registered yet, ask them to sign up first at the employer registration page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booth Details */}
          <Card className="border-green-100 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                Booth Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boothNumber">Booth Number *</Label>
                  <Input
                    id="boothNumber"
                    value={formData.boothNumber}
                    onChange={(e) => setFormData({ ...formData, boothNumber: e.target.value })}
                    placeholder="e.g., A1, B2, C3, HW-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location/Area *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Hall A, Ground Floor, Section 2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="size">Booth Size *</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value as "small" | "medium" | "large" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select booth size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">
                      <div className="flex flex-col">
                        <span className="font-medium">Small (3x3m)</span>
                        <span className="text-xs text-gray-500">Basic setup, up to 15 people capacity</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex flex-col">
                        <span className="font-medium">Medium (4x4m)</span>
                        <span className="text-xs text-gray-500">Standard setup, up to 30 people capacity</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="large">
                      <div className="flex flex-col">
                        <span className="font-medium">Large (6x6m)</span>
                        <span className="text-xs text-gray-500">Premium setup, up to 50 people capacity</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Requirements */}
          <Card className="border-orange-100 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                Equipment & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {equipmentOptions.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={selectedEquipment.includes(equipment)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addEquipment(equipment);
                        } else {
                          removeEquipment(equipment);
                        }
                      }}
                    />
                    <Label htmlFor={equipment} className="text-sm cursor-pointer">
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom equipment"
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomEquipment();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomEquipment}
                  disabled={!customEquipment.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {selectedEquipment.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Equipment:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEquipment.map((equipment) => (
                      <Badge key={equipment} variant="secondary" className="flex items-center gap-1">
                        {equipment}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-600"
                          onClick={() => removeEquipment(equipment)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Requirements */}
          <Card className="border-gray-100 bg-gray-50/30">
            <CardHeader>
              <CardTitle className="text-lg">Additional Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="specialRequirements">Special Requirements & Notes</Label>
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  placeholder="Any special requirements, accessibility needs, or additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || events.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Creating..." : "Create Booth"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 