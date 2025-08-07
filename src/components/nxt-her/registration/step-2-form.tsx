"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/components/nxt-her/registration/multi-select"
import { TOPICS_OF_INTEREST, AREAS_OF_EXPERTISE } from "@/lib/constants/nxt-her-options"

const step2Schema = z.object({
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  aboutYou: z.string().optional(),
  linkedinProfile: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  twitterHandle: z.string().optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  topicsOfInterest: z.array(z.string()).min(1, "Please select at least one topic of interest"),
  areasOfExpertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to continue",
  }),
  infoSharingConsent: z.boolean(),
})

export type Step2FormData = z.infer<typeof step2Schema>

interface Step2FormProps {
  onNext: (data: Step2FormData) => void
  onBack: () => void
  initialData?: Partial<Step2FormData>
  isLoading?: boolean
}

export function Step2Form({ onNext, onBack, initialData, isLoading }: Step2FormProps) {
  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      organization: initialData?.organization || "",
      jobTitle: initialData?.jobTitle || "",
      aboutYou: initialData?.aboutYou || "",
      linkedinProfile: initialData?.linkedinProfile || "",
      twitterHandle: initialData?.twitterHandle || "",
      website: initialData?.website || "",
      topicsOfInterest: initialData?.topicsOfInterest || [],
      areasOfExpertise: initialData?.areasOfExpertise || [],
      termsAccepted: initialData?.termsAccepted || false,
      infoSharingConsent: initialData?.infoSharingConsent || false,
    },
  })

  const onSubmit = (data: Step2FormData) => {
    onNext(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Professional Details</CardTitle>
        <CardDescription>
          Step 2 of 2: Tell us about your professional background and interests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* About You */}
            <FormField
              control={form.control}
              name="aboutYou"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About You</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself, your background, and what you're passionate about..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This information will help other attendees connect with you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Links (Optional)</h3>
              
              <FormField
                control={form.control}
                name="linkedinProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://linkedin.com/in/yourprofile" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="twitterHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter Handle</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="@yourusername" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://yourwebsite.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Topics of Interest */}
            <FormField
              control={form.control}
              name="topicsOfInterest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topics of Interest *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={TOPICS_OF_INTEREST}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select topics you're interested in..."
                    />
                  </FormControl>
                  <FormDescription>
                    Select the topics that interest you most for personalized content recommendations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Areas of Expertise */}
            <FormField
              control={form.control}
              name="areasOfExpertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas of Expertise *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={AREAS_OF_EXPERTISE}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select your areas of expertise..."
                    />
                  </FormControl>
                  <FormDescription>
                    Select your areas of expertise to help others find and connect with you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms and Conditions */}
            <div className="space-y-4 border-t pt-6">
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I accept the{" "}
                        <a 
                          href="/terms" 
                          target="_blank" 
                          className="text-primary underline hover:no-underline"
                        >
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a 
                          href="/privacy" 
                          target="_blank" 
                          className="text-primary underline hover:no-underline"
                        >
                          Privacy Policy
                        </a>{" "}
                        *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="infoSharingConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I consent to sharing my information with other attendees for networking purposes
                      </FormLabel>
                      <FormDescription>
                        This allows other attendees to find and connect with you based on shared interests and expertise
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? "Submitting..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}