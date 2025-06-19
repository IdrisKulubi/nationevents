"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, User, Mail, Phone, Shield, Building, UserCheck, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface UserManagementModalProps {
  trigger: React.ReactNode;
  user?: any; // For editing existing users
}

const roles = [
  { value: "job_seeker", label: "Job Seeker", icon: UserCheck, description: "Candidates looking for employment" },
  { value: "employer", label: "Employer", icon: Building, description: "Company representatives" },
  { value: "security", label: "Security Personnel", icon: Shield, description: "Security and access control" },
  { value: "admin", label: "Administrator", icon: Shield, description: "Full system access" },
];

export function UserManagementModal({ trigger, user }: UserManagementModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || "job_seeker",
    isActive: user?.isActive ?? true,
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Here you would implement the actual user creation/update logic
      // const result = await createOrUpdateUser(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(user ? "User updated successfully!" : "User created successfully!");
      
      setTimeout(() => {
        setOpen(false);
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          role: "job_seeker",
          isActive: true,
        });
        setError("");
        setSuccess("");
        router.refresh();
      }, 2000);
      
    } catch (error) {
      console.error("Error managing user:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(role => role.value === formData.role);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user ? "Update user information and permissions" : "Create a new user account with appropriate role and permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
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

          {/* Basic Information */}
          <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+254 700 000 000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Role Assignment */}
          <Card className="border-purple-100 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Role Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">User Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-3 py-1">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{role.label}</p>
                              <p className="text-xs text-gray-500">{role.description}</p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Role Info */}
              {selectedRole && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <selectedRole.icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedRole.label}</h4>
                      <p className="text-sm text-gray-500">{selectedRole.description}</p>
                    </div>
                  </div>
                  
                  {/* Role-specific permissions info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {formData.role === "admin" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Manage Users</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>System Settings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>View All Reports</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Security Controls</span>
                        </div>
                      </>
                    )}
                    {formData.role === "security" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Check Attendees</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Generate PINs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Access Control</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Security Reports</span>
                        </div>
                      </>
                    )}
                    {formData.role === "employer" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Manage Booths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Create Jobs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>View Candidates</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Schedule Interviews</span>
                        </div>
                      </>
                    )}
                    {formData.role === "job_seeker" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>View Jobs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Apply to Positions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Book Interviews</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Update Profile</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="border-green-100 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div>
                  <Label htmlFor="isActive" className="font-medium">Account Active</Label>
                  <p className="text-sm text-gray-500">
                    {formData.isActive 
                      ? "User can access the system and perform their role functions" 
                      : "User account is disabled and cannot access the system"
                    }
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Warning for Admin Role */}
          {formData.role === "admin" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">Administrator Role Warning</h4>
                  <p className="text-amber-700 text-sm">
                    You are assigning administrator privileges to this user. Administrators have full access to all system 
                    functions including user management, security settings, and sensitive data. Only assign this role to trusted personnel.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading 
                ? (user ? "Updating..." : "Creating...") 
                : (user ? "Update User" : "Create User")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 