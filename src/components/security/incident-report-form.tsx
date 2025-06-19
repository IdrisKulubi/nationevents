"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { reportIncident } from "@/app/api/security/incidents/actions";
import { AlertTriangle, CheckCircle, FileText, MapPin, Users, Shield } from "lucide-react";
import { toast } from "sonner";

interface IncidentReportFormProps {
  securityId: string;
}

const incidentTypes = [
  { value: "unauthorized_access", label: "Unauthorized Access", icon: "🚫" },
  { value: "suspicious_activity", label: "Suspicious Activity", icon: "👁️" },
  { value: "emergency", label: "Emergency", icon: "🚨" },
  { value: "technical_issue", label: "Technical Issue", icon: "⚙️" },
  { value: "other", label: "Other", icon: "📝" },
];

const severityLevels = [
  { value: "low", label: "Low", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-300" },
  { value: "medium", label: "Medium", color: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-300" },
  { value: "high", label: "High", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-300" },
  { value: "critical", label: "Critical", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-300" },
];

export function IncidentReportForm({ securityId }: IncidentReportFormProps) {
  const [formData, setFormData] = useState({
    incidentType: "",
    severity: "",
    location: "",
    description: "",
    involvedPersons: "",
    actionTaken: "",
  });
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.incidentType || !formData.severity || !formData.location || !formData.description) {
      toast.error("Please fill in all required fields (Type, Severity, Location, Description)");
      setResult({
        success: false,
        message: "Please fill in all required fields (Type, Severity, Location, Description)"
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await reportIncident({
          ...formData,
          securityId,
          involvedPersons: formData.involvedPersons ? formData.involvedPersons.split(',').map(p => p.trim()) : [],
        });
        
        if (response.success) {
          toast.success(response.message);
          setFormData({
            incidentType: "",
            severity: "",
            location: "",
            description: "",
            involvedPersons: "",
            actionTaken: "",
          });
        } else {
          toast.error(response.message);
        }
        setResult(response);
      } catch (error) {
        toast.error("Failed to submit incident report. Please try again.");
        setResult({
          success: false,
          message: "Failed to submit incident report. Please try again."
        });
      }
    });
  };

  const selectedSeverity = severityLevels.find(level => level.value === formData.severity);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Type */}
          <div className="space-y-3">
            <Label htmlFor="incident-type" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Incident Type *
            </Label>
            <Select 
              value={formData.incidentType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, incidentType: value }))}
            >
              <SelectTrigger className="h-12 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900">
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                {incidentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <Label htmlFor="severity" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Severity Level *
            </Label>
            <Select 
              value={formData.severity} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger className={`h-12 border-2 hover:border-gray-400 focus:ring-2 focus:ring-red-200 text-gray-900 ${
                selectedSeverity 
                  ? `${selectedSeverity.bgColor} ${selectedSeverity.borderColor} focus:border-red-500` 
                  : "bg-white border-gray-300 focus:border-red-500"
              }`}>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value} className="py-3 hover:bg-gray-50">
                    <div className={`flex items-center gap-2 ${level.color} font-semibold`}>
                      <div className={`w-3 h-3 rounded-full ${level.bgColor} border-2 ${level.borderColor}`}></div>
                      {level.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label htmlFor="location" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location *
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="e.g., Main Entrance, Booth Area A, Registration Desk"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="h-12 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900 placeholder:text-gray-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
            Incident Description *
          </Label>
          <Textarea
            id="description"
            placeholder="Provide a detailed description of the incident, including what happened, when it occurred, and any relevant circumstances..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[120px] bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900 placeholder:text-gray-500 resize-none"
            disabled={isSubmitting}
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-gray-600">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Involved Persons */}
        <div className="space-y-3">
          <Label htmlFor="involved-persons" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Involved Persons (Optional)
          </Label>
          <Input
            id="involved-persons"
            type="text"
            placeholder="John Doe, Jane Smith, Badge #12345"
            value={formData.involvedPersons}
            onChange={(e) => setFormData(prev => ({ ...prev, involvedPersons: e.target.value }))}
            className="h-12 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900 placeholder:text-gray-500"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-600">
            Enter names, badge numbers, or IDs of people involved, separated by commas
          </p>
        </div>

        {/* Action Taken */}
        <div className="space-y-3">
          <Label htmlFor="action-taken" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Immediate Action Taken (Optional)
          </Label>
          <Textarea
            id="action-taken"
            placeholder="Describe any immediate actions taken to address the incident..."
            value={formData.actionTaken}
            onChange={(e) => setFormData(prev => ({ ...prev, actionTaken: e.target.value }))}
            className="bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900 placeholder:text-gray-500 resize-none min-h-[80px]"
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.incidentType || !formData.severity || !formData.location || !formData.description}
          className="w-full h-14 text-base font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Submitting Report...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-3" />
              Submit Incident Report
            </>
          )}
        </Button>

        {/* Result Message */}
        {result && (
          <Alert 
            className={`border-2 shadow-sm ${
              result.success 
                ? "border-green-300 bg-green-50" 
                : "border-red-300 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
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
    </div>
  );
} 