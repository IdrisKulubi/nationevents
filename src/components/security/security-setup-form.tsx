"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { setupSecurityProfile } from "@/app/api/security/setup/actions";
import { Shield, User, IdCard } from "lucide-react";

interface SecuritySetupFormProps {
  userId: string;
  userName: string;
}

const clearanceLevels = [
  { value: "basic", label: "Basic Access" },
  { value: "intermediate", label: "Intermediate Access" },
  { value: "advanced", label: "Advanced Access" },
];

const departments = [
  { value: "entry_control", label: "Entry Control" },
  { value: "patrol", label: "Patrol & Monitoring" },
  { value: "incident_response", label: "Incident Response" },
  { value: "general_security", label: "General Security" },
];

export function SecuritySetupForm({ userId, userName }: SecuritySetupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    badgeNumber: "",
    department: "",
    clearanceLevel: "basic",
  });
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.badgeNumber || !formData.department) {
      setResult({
        success: false,
        message: "Please fill in all required fields"
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await setupSecurityProfile({
          userId,
          badgeNumber: formData.badgeNumber,
          department: formData.department,
          clearanceLevel: formData.clearanceLevel,
        });
        
        setResult(response);
        if (response.success) {
          // Redirect to security dashboard after successful setup
          setTimeout(() => {
            router.push("/security");
          }, 1500);
        }
      } catch (error) {
        setResult({
          success: false,
          message: "Setup failed. Please try again."
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Welcome, {userName}
        </h3>
        <p className="text-sm text-gray-600">
          Set up your security personnel profile to get started
        </p>
      </div>

      {/* Badge Number */}
      <div className="space-y-2">
        <Label htmlFor="badge-number" className="flex items-center gap-2">
          <IdCard className="h-4 w-4" />
          Badge Number *
        </Label>
        <Input
          id="badge-number"
          type="text"
          placeholder="e.g., SEC-001, GUARD-123"
          value={formData.badgeNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, badgeNumber: e.target.value.toUpperCase() }))}
          disabled={isSubmitting}
          className="font-mono"
        />
        <p className="text-xs text-gray-500">
          Enter your assigned security badge number
        </p>
      </div>

      {/* Department */}
      <div className="space-y-2">
        <Label htmlFor="department">Department *</Label>
        <Select 
          value={formData.department} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clearance Level */}
      <div className="space-y-2">
        <Label htmlFor="clearance">Clearance Level</Label>
        <Select 
          value={formData.clearanceLevel} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, clearanceLevel: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {clearanceLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Your clearance level determines access to different areas and functions
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !formData.badgeNumber || !formData.department}
        className="w-full"
      >
        <User className="h-4 w-4 mr-2" />
        {isSubmitting ? "Setting up profile..." : "Complete Setup"}
      </Button>

      {/* Result Message */}
      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
            {result.message}
            {result.success && (
              <span className="block mt-1 text-xs">
                Redirecting to security dashboard...
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
} 