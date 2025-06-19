"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Star, X, Loader2, Heart } from "lucide-react";
import { addToShortlist } from "@/app/api/employer/shortlists/actions";

interface ShortlistModalProps {
  candidateId?: string;
  candidateName?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const predefinedTags = [
  "High Priority",
  "Technical Skills",
  "Leadership",
  "Communication",
  "Experience",
  "Cultural Fit",
  "Available Immediately",
  "Remote Work",
  "Flexible Hours",
  "Entry Level",
  "Senior Level",
  "Team Player",
  "Problem Solver",
  "Creative",
  "Analytical"
];

export function ShortlistModal({ 
  candidateId, 
  candidateName, 
  trigger, 
  onSuccess 
}: ShortlistModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    listName: "",
    priority: "medium" as "high" | "medium" | "low",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !formData.listName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await addToShortlist({
        jobSeekerId: candidateId,
        listName: formData.listName.trim(),
        priority: formData.priority,
        notes: formData.notes || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          listName: "",
          priority: "medium",
          notes: "",
        });
        setSelectedTags([]);
        onSuccess?.();
        router.refresh();
      } else {
        console.error("Error adding to shortlist:", result.message);
      }
    } catch (error) {
      console.error("Error adding to shortlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const isFormValid = candidateId && formData.listName.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-2" />
            Add to Shortlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Add to Shortlist
          </DialogTitle>
          <DialogDescription>
            {candidateName ? 
              `Add ${candidateName} to your shortlist` : 
              "Add this candidate to your shortlist"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* List Name */}
          <div className="space-y-2">
            <Label htmlFor="listName">List Name *</Label>
            <Input
              id="listName"
              value={formData.listName}
              onChange={(e) => setFormData({ ...formData, listName: e.target.value })}
              placeholder="e.g., Frontend Developers, Marketing Team, High Priority"
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as "high" | "medium" | "low" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags (Optional)</Label>
            
            {/* Predefined Tags */}
            <div className="grid grid-cols-2 gap-2">
              {predefinedTags.slice(0, 8).map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 justify-start"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      removeTag(tag);
                    } else {
                      addTag(tag);
                    }
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomTag}
                disabled={!customTag.trim()}
              >
                Add
              </Button>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Selected Tags:</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this candidate..."
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Preview Card */}
          {candidateName && formData.listName && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 text-sm">Preview</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p><strong>{candidateName}</strong> will be added to:</p>
                  <p className="font-medium">{formData.listName}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Priority: {formData.priority} | Tags: {selectedTags.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
            <Button 
              type="submit" 
              disabled={loading || !isFormValid}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Star className="h-4 w-4 mr-2" />
              Add to Shortlist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 