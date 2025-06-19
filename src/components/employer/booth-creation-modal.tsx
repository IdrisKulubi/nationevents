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
import { Plus, MapPin, X, Loader2 } from "lucide-react";
import { createOrUpdateBooth } from "@/app/api/employer/booths/actions";

interface Event {
  id: string;
  name: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  isActive: any;
}

interface BoothCreationModalProps {
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
  "Internet Connection"
];

export function BoothCreationModal({ events, trigger }: BoothCreationModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    eventId: "",
    boothNumber: "",
    location: "",
    size: "" as "small" | "medium" | "large" | "",
    specialRequirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventId || !formData.boothNumber || !formData.location || !formData.size) {
      return;
    }

    setLoading(true);
    try {
      const result = await createOrUpdateBooth({
        ...formData,
        size: formData.size as "small" | "medium" | "large",
        equipment: selectedEquipment,
        specialRequirements: formData.specialRequirements || undefined,
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          eventId: "",
          boothNumber: "",
          location: "",
          size: "",
          specialRequirements: "",
        });
        setSelectedEquipment([]);
        router.refresh();
      } else {
        console.error("Error creating booth:", result.message);
      }
    } catch (error) {
      console.error("Error creating booth:", error);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Setup New Booth
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Setup Your Exhibition Booth
          </DialogTitle>
          <DialogDescription>
            Configure your booth details and requirements for the event
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event">Select Event</Label>
                <Select
                  value={formData.eventId}
                  onValueChange={(value) => setFormData({ ...formData, eventId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex flex-col py-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.name}</span>
                            {event.isActive ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
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
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Booth Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booth Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boothNumber">Booth Number</Label>
                  <Input
                    id="boothNumber"
                    value={formData.boothNumber}
                    onChange={(e) => setFormData({ ...formData, boothNumber: e.target.value })}
                    placeholder="e.g., A1, B2, C3"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Hall A, Ground Floor"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="size">Booth Size</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value as "small" | "medium" | "large" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select booth size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (3x3m)</SelectItem>
                    <SelectItem value="medium">Medium (4x4m)</SelectItem>
                    <SelectItem value="large">Large (6x6m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipment Requirements</CardTitle>
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
                    <Label htmlFor={equipment} className="text-sm">
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
                  Add
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
                          className="h-3 w-3 cursor-pointer"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="specialRequirements">Additional Notes</Label>
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Setup Booth
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 