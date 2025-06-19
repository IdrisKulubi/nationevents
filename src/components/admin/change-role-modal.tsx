"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserCog, 
  Shield, 
  Building, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Loader2 
} from "lucide-react";
import { changeUserRole } from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ChangeRoleModalProps {
  trigger: React.ReactNode;
  userId: string;
  currentRole: string;
  userName: string;
}

const roles = [
  { 
    value: "job_seeker", 
    label: "Job Seeker", 
    icon: UserCheck, 
    description: "Candidates looking for employment opportunities",
    color: "bg-green-100 text-green-800"
  },
  { 
    value: "employer", 
    label: "Employer", 
    icon: Building, 
    description: "Company representatives managing booths and jobs",
    color: "bg-blue-100 text-blue-800"
  },
  { 
    value: "security", 
    label: "Security Personnel", 
    icon: Shield, 
    description: "Security staff with access control privileges",
    color: "bg-orange-100 text-orange-800"
  },
  { 
    value: "admin", 
    label: "Administrator", 
    icon: Shield, 
    description: "Full system access with all administrative privileges",
    color: "bg-purple-100 text-purple-800"
  },
];

export function ChangeRoleModal({ trigger, userId, currentRole, userName }: ChangeRoleModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const router = useRouter();

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      toast.error("Please select a different role");
      return;
    }

    setLoading(true);
    try {
      const result = await changeUserRole(userId, selectedRole as any);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to change user role");
      }
    } catch (error) {
      console.error("Error changing user role:", error);
      toast.error("An error occurred while changing the user role");
    } finally {
      setLoading(false);
    }
  };

  const currentRoleInfo = roles.find(role => role.value === currentRole);
  const selectedRoleInfo = roles.find(role => role.value === selectedRole);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Change the role and permissions for {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Role */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Current Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRoleInfo && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <currentRoleInfo.icon className="h-8 w-8 text-gray-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{currentRoleInfo.label}</h4>
                      <Badge className={currentRoleInfo.color}>Current</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{currentRoleInfo.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Role Selection */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Select New Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">New Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
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

              {/* Selected Role Preview */}
              {selectedRoleInfo && selectedRole !== currentRole && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <selectedRoleInfo.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">{selectedRoleInfo.label}</h4>
                      <p className="text-sm text-gray-900">{selectedRoleInfo.description}</p>
                    </div>
                  </div>
                  
                  {/* Role-specific permissions info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedRole === "admin" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Manage Users</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-gray-900">System Settings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-gray-900">View All Reports</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-gray-900">Security Controls</span>
                        </div>
                      </>
                    )}
                    
                    {selectedRole === "security" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Check Attendees</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-gray-900">Generate PINs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-gray-900">Access Control</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Security Reports</span>
                        </div>
                      </>
                    )}
                    
                    {selectedRole === "employer" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Manage Booths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Create Jobs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">View Candidates</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Schedule Interviews</span>
                        </div>
                      </>
                    )}
                    
                    {selectedRole === "job_seeker" && (
                      <>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">View Jobs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Apply to Positions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Book Interviews</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-900" />
                          <span className="text-gray-900">Update Profile</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warning for Admin Role */}
          {selectedRole === "admin" && currentRole !== "admin" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">Administrator Role Warning</h4>
                  <p className="text-amber-700 text-sm">
                    You are about to assign administrator privileges to this user. Administrators have full access to all system 
                    functions including user management, security settings, and sensitive data. Only assign this role to trusted personnel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRoleChange}
              disabled={loading || selectedRole === currentRole}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Changing Role..." : "Change Role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
