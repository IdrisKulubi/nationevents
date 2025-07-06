"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEmployerProfile } from "@/app/api/employer/setup/actions";
import { Building2, Users, Globe, Mail, Phone, MapPin, CheckCircle, AlertTriangle } from "lucide-react";

interface EmployerSetupFormProps {
  userId: string;
  userName: string;
  userEmail?: string;
  isFromCompanyOnboard?: boolean;
}

const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
  "Retail", "Construction", "Transportation", "Media", "Government",
  "Non-profit", "Consulting", "Real Estate", "Energy", "Agriculture",
  "Food & Beverage", "Hospitality", "Legal", "Marketing", "Other"
];

const companySizes = [
  { value: "startup", label: "Startup (1-10 employees)" },
  { value: "small", label: "Small (11-50 employees)" },
  { value: "medium", label: "Medium (51-200 employees)" },
  { value: "large", label: "Large (201-1000 employees)" },
  { value: "enterprise", label: "Enterprise (1000+ employees)" },
];

export function EmployerSetupForm({ userId, userName, userEmail, isFromCompanyOnboard }: EmployerSetupFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    industry: "",
    companySize: "",
    website: "",
    address: "",
    contactPerson: userName,
    contactEmail: userEmail || "",
    contactPhone: "",
  });

  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.companyName || !formData.industry || !formData.companySize || !formData.contactEmail) {
      setResult({
        success: false,
        message: "Please fill in all required fields (Company Name, Industry, Company Size, Contact Email)"
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await createEmployerProfile({
          userId,
          companyName: formData.companyName,
          companyDescription: formData.companyDescription,
          industry: formData.industry,
          companySize: formData.companySize as "small" | "startup" | "medium" | "large" | "enterprise",
          website: formData.website,
          address: formData.address,
          contactPerson: formData.contactPerson,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
        });
        
        setResult(response);
        
        if (response.success) {
          // Redirect will happen automatically via server action
          setTimeout(() => {
            window.location.href = "/employer";
          }, 1500);
        }
      } catch (error) {
        setResult({
          success: false,
          message: "Failed to create employer profile. Please try again."
        });
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="company-name" className="text-sm font-semibold text-gray-700">
              Company Name *
            </Label>
            <Input
              id="company-name"
              type="text"
              placeholder="e.g., Acme Corporation"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:bg-white"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="industry" className="text-sm font-semibold text-gray-700">
              Industry *
            </Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
              <SelectTrigger className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry.toLowerCase()} className="py-3">
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="company-size" className="text-sm font-semibold text-gray-700">
              Company Size *
            </Label>
            <Select value={formData.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
              <SelectTrigger className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size.value} value={size.value} className="py-3">
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="company-description" className="text-sm font-semibold text-gray-700">
            Company Description
          </Label>
          <Textarea
            id="company-description"
            placeholder="Tell job seekers about your company, culture, and what makes you unique..."
            value={formData.companyDescription}
            onChange={(e) => handleInputChange("companyDescription", e.target.value)}
            className="mt-2 min-h-[120px] bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:bg-white resize-none"
            disabled={isSubmitting}
            rows={5}
          />
          <p className="text-xs text-gray-600 mt-1">
            {formData.companyDescription.length}/500 characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="website" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.yourcompany.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:bg-white"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Business Street, City, State"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:bg-white"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="contact-person" className="text-sm font-semibold text-gray-700">
              Contact Person
            </Label>
            <Input
              id="contact-person"
              type="text"
              placeholder="Your full name"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange("contactPerson", e.target.value)}
              className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:bg-white"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="contact-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Email *
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="contact@yourcompany.com"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange("contactEmail", e.target.value)}
              className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:bg-white"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact-phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Phone
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              className="mt-2 h-12 bg-gray-50 border-2 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:bg-white"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.companyName || !formData.industry || !formData.companySize || !formData.contactEmail}
          className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Creating Your Profile...
            </>
          ) : (
            <>
              <Building2 className="h-5 w-5 mr-3" />
              Complete Setup & Access Dashboard
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By completing setup, you agree to our terms of service and can start managing your booth and interviews.
        </p>
      </div>

      {/* Result Message */}
      {result && (
        <Alert 
          className={`border-2 ${
            result.success 
              ? "border-green-300 bg-green-50" 
              : "border-red-300 bg-red-50"
          } shadow-sm`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <AlertDescription 
              className={`text-base font-medium ${
                result.success ? "text-green-900" : "text-red-900"
              }`}
            >
              {result.message}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </form>
  );
} 