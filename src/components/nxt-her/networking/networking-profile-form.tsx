"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Users, Target, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const networkingProfileSchema = z.object({
  networkingGoals: z.array(z.string()).min(1, "Please select at least one networking goal"),
  sector: z.string().min(1, "Please select your sector"),
  region: z.string().min(1, "Please select your region"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  lookingFor: z.array(z.string()).min(1, "Please select what you're looking for"),
  availableFor: z.array(z.string()).min(1, "Please select what you're available for"),
  preferredConnectionTypes: z.array(z.string()).min(1, "Please select preferred connection types"),
  isVisible: z.boolean(),
});

type NetworkingProfileFormData = z.infer<typeof networkingProfileSchema>;

interface NetworkingProfileFormProps {
  initialData?: Partial<NetworkingProfileFormData>;
  onSubmit: (data: NetworkingProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

const NETWORKING_GOALS = [
  "Find mentorship opportunities",
  "Offer mentorship to others",
  "Build strategic partnerships",
  "Expand professional network",
  "Learn from industry experts",
  "Share knowledge and expertise",
  "Explore collaboration opportunities",
  "Connect with like-minded professionals",
];

const SECTORS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Non-profit",
  "Government",
  "Consulting",
  "Media & Communications",
  "Retail & E-commerce",
  "Manufacturing",
  "Energy & Sustainability",
  "Arts & Creative Industries",
  "Other",
];

const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia-Pacific",
  "Middle East",
  "Global/Remote",
];

const INTERESTS = [
  "Leadership Development",
  "Entrepreneurship",
  "Innovation & Technology",
  "Sustainability",
  "Diversity & Inclusion",
  "Financial Empowerment",
  "Social Impact",
  "Digital Transformation",
  "Work-Life Balance",
  "Career Advancement",
  "Public Speaking",
  "Storytelling",
];

const LOOKING_FOR = [
  "Mentorship",
  "Business partnerships",
  "Investment opportunities",
  "Career opportunities",
  "Collaboration projects",
  "Speaking opportunities",
  "Board positions",
  "Advisory roles",
  "Knowledge sharing",
  "Peer support",
];

const AVAILABLE_FOR = [
  "Mentoring others",
  "Speaking engagements",
  "Advisory roles",
  "Board positions",
  "Collaboration projects",
  "Knowledge sharing",
  "Peer support",
  "Investment discussions",
  "Partnership opportunities",
  "Career guidance",
];

const CONNECTION_TYPES = [
  "One-on-one meetings",
  "Group discussions",
  "Virtual coffee chats",
  "In-person meetups",
  "Email exchanges",
  "LinkedIn connections",
  "Follow-up after event",
  "Long-term relationships",
];

export function NetworkingProfileForm({ initialData, onSubmit, isLoading }: NetworkingProfileFormProps) {
  const [customGoal, setCustomGoal] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [customLookingFor, setCustomLookingFor] = useState("");
  const [customAvailableFor, setCustomAvailableFor] = useState("");
  const [customConnectionType, setCustomConnectionType] = useState("");

  const form = useForm<NetworkingProfileFormData>({
    resolver: zodResolver(networkingProfileSchema),
    defaultValues: {
      networkingGoals: initialData?.networkingGoals || [],
      sector: initialData?.sector || "",
      region: initialData?.region || "",
      interests: initialData?.interests || [],
      lookingFor: initialData?.lookingFor || [],
      availableFor: initialData?.availableFor || [],
      preferredConnectionTypes: initialData?.preferredConnectionTypes || [],
      isVisible: initialData?.isVisible ?? true,
    },
  });

  const addCustomItem = (field: keyof NetworkingProfileFormData, value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return;
    
    const currentValues = form.getValues(field) as string[];
    if (!currentValues.includes(value.trim())) {
      form.setValue(field, [...currentValues, value.trim()] as any);
      setValue("");
    }
  };

  const removeItem = (field: keyof NetworkingProfileFormData, item: string) => {
    const currentValues = form.getValues(field) as string[];
    form.setValue(field, currentValues.filter(v => v !== item) as any);
  };

  const toggleItem = (field: keyof NetworkingProfileFormData, item: string) => {
    const currentValues = form.getValues(field) as string[];
    if (currentValues.includes(item)) {
      removeItem(field, item);
    } else {
      form.setValue(field, [...currentValues, item] as any);
    }
  };

  const handleSubmit = async (data: NetworkingProfileFormData) => {
    try {
      await onSubmit(data);
      toast.success("Networking profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update networking profile. Please try again.");
    }
  };

  const renderMultiSelectField = (
    field: keyof NetworkingProfileFormData,
    label: string,
    description: string,
    options: string[],
    customValue: string,
    setCustomValue: (value: string) => void,
    icon: React.ReactNode
  ) => {
    const currentValues = form.watch(field) as string[];
    
    return (
      <FormField
        control={form.control}
        name={field}
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {icon}
              {label}
            </FormLabel>
            <FormDescription>{description}</FormDescription>
            
            {/* Selected items */}
            <div className="flex flex-wrap gap-2 mb-3">
              {currentValues.map((item) => (
                <Badge key={item} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeItem(field, item)}
                  />
                </Badge>
              ))}
            </div>

            {/* Available options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {options.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={currentValues.includes(option) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleItem(field, option)}
                  className="justify-start text-left h-auto py-2 px-3"
                >
                  {option}
                </Button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex gap-2">
              <Input
                placeholder={`Add custom ${label.toLowerCase()}...`}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomItem(field, customValue, setCustomValue);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addCustomItem(field, customValue, setCustomValue)}
                disabled={!customValue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const completionPercentage = () => {
    const fields = [
      form.watch("networkingGoals"),
      form.watch("sector"),
      form.watch("region"),
      form.watch("interests"),
      form.watch("lookingFor"),
      form.watch("availableFor"),
      form.watch("preferredConnectionTypes"),
    ];
    
    const completedFields = fields.filter(field => 
      Array.isArray(field) ? field.length > 0 : Boolean(field)
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription>
            Complete your networking profile to get better connection suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage()}%` }}
              />
            </div>
            <span className="text-sm font-medium">{completionPercentage()}%</span>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your networking profile and connect with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        {field.value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        Make my profile visible to other attendees
                      </FormLabel>
                      <FormDescription>
                        When enabled, other attendees can discover and connect with you
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Help others understand your professional background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Sector</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Networking Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Networking Preferences</CardTitle>
              <CardDescription>
                Define your networking objectives and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderMultiSelectField(
                "networkingGoals",
                "Networking Goals",
                "What do you hope to achieve through networking at this event?",
                NETWORKING_GOALS,
                customGoal,
                setCustomGoal,
                <Target className="h-4 w-4" />
              )}

              {renderMultiSelectField(
                "interests",
                "Areas of Interest",
                "Topics and areas you're passionate about or want to learn more about",
                INTERESTS,
                customInterest,
                setCustomInterest,
                <Users className="h-4 w-4" />
              )}

              {renderMultiSelectField(
                "lookingFor",
                "What I'm Looking For",
                "Types of connections and opportunities you're seeking",
                LOOKING_FOR,
                customLookingFor,
                setCustomLookingFor,
                <Target className="h-4 w-4" />
              )}

              {renderMultiSelectField(
                "availableFor",
                "What I Can Offer",
                "Ways you can help and support others",
                AVAILABLE_FOR,
                customAvailableFor,
                setCustomAvailableFor,
                <Users className="h-4 w-4" />
              )}

              {renderMultiSelectField(
                "preferredConnectionTypes",
                "Preferred Connection Types",
                "How you prefer to connect and interact with others",
                CONNECTION_TYPES,
                customConnectionType,
                setCustomConnectionType,
                <Users className="h-4 w-4" />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="min-w-32">
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}