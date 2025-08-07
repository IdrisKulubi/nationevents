"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { COUNTRIES } from "@/lib/constants/countries"

const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(2, "City must be at least 2 characters"),
  attendanceType: z.enum(["in_person", "virtual"], {
    required_error: "Please select your attendance type",
  }),
})

export type Step1FormData = z.infer<typeof step1Schema>

interface Step1FormProps {
  onNext: (data: Step1FormData & { profilePhoto?: File }) => void
  initialData?: Partial<Step1FormData>
  isLoading?: boolean
}

export function Step1Form({ onNext, initialData, isLoading }: Step1FormProps) {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
      country: initialData?.country || "",
      city: initialData?.city || "",
      attendanceType: initialData?.attendanceType || undefined,
    },
  })

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        form.setError("root", { message: "Please select a valid image file" })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        form.setError("root", { message: "Image size must be less than 5MB" })
        return
      }

      setProfilePhoto(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear any previous errors
      form.clearErrors("root")
    }
  }

  const removePhoto = () => {
    setProfilePhoto(null)
    setPhotoPreview(null)
    // Reset the file input
    const fileInput = document.getElementById("profile-photo") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const onSubmit = (data: Step1FormData) => {
    onNext({ ...data, profilePhoto: profilePhoto || undefined })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>
          Step 1 of 2: Please provide your personal information for registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="profile-photo">Profile Photo (Optional)</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <Image
                      src={photoPreview}
                      alt="Profile preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removePhoto}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <Input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("profile-photo")?.click()}
                  >
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email address" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.name}
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Attendance Type */}
            <FormField
              control={form.control}
              name="attendanceType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Attendance Type *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in_person" id="in_person" />
                        <Label htmlFor="in_person">In Person</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="virtual" id="virtual" />
                        <Label htmlFor="virtual">Virtual</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Error */}
            {form.formState.errors.root && (
              <div className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? "Processing..." : "Next Step"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}