"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Users, 
  UserCog, 
  Building, 
  UserCheck,
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Activity,
  AlertTriangle,
  Settings,
  Lock,
  Unlock,
  Crown,
  CheckCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleManagementModal } from "@/components/admin/role-management-modal";
import { UserDetailsModal } from "@/components/admin/user-details-modal";
import { ChangeRoleModal } from "@/components/admin/change-role-modal";
import { Switch } from "@/components/ui/switch";
import { toggleUserStatus } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import Image from "next/image";

// Define role permissions
const rolePermissions = {
  admin: {
    name: "Administrator",
    description: "Full system access with all privileges",
    permissions: [
      "Manage Users", "Manage Events", "Manage Booths", "View Reports", 
      "System Settings", "Security Controls", "Data Export", "User Roles"
    ],
    color: "bg-purple-100 text-purple-800",
    icon: Crown,
    level: 4
  },
  security: {
    name: "Security Personnel",
    description: "Access to security features and crowd control",
    permissions: [
      "Check Attendees", "Generate PINs", "Access Control", "Security Reports", 
      "Crowd Monitoring", "Incident Management"
    ],
    color: "bg-orange-100 text-orange-800",
    icon: Shield,
    level: 3
  },
  employer: {
    name: "Employer",
    description: "Company representatives managing booths and jobs",
    permissions: [
      "Manage Company Profile", "Create Job Postings", "Manage Booths", 
      "Schedule Interviews", "View Candidates", "Company Reports"
    ],
    color: "bg-blue-100 text-blue-800",
    icon: Building,
    level: 2
  },
  job_seeker: {
    name: "Job Seeker",
    description: "Candidates looking for employment opportunities",
    permissions: [
      "View Jobs", "Apply to Positions", "Book Interviews", "Update Profile", 
      "View Event Schedule", "Access Career Resources"
    ],
    color: "bg-green-100 text-green-800",
    icon: UserCheck,
    level: 1
  }
};

interface RolesClientPageProps {
  initialData: {
    roleStats: any[];
    allUsers: any[];
    recentRoleChanges: any[];
  };
}

export function RolesClientPage({ initialData }: RolesClientPageProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { roleStats, allUsers, recentRoleChanges } = initialData;

  const handleToggleStatus = async (userId: string, userName: string) => {
    setLoading(true);
    try {
      const result = await toggleUserStatus(userId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("An error occurred while updating user status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user roles, permissions, and access controls across the platform
          </p>
        </div>
        <RoleManagementModal 
          trigger={
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserCog className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          }
        />
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(rolePermissions).map(([roleKey, roleInfo]) => {
          const stat = roleStats.find(s => s.role === roleKey);
          const count = stat?.count || 0;
          const active = stat?.active || 0;
          const Icon = roleInfo.icon;
          
          return (
            <Card key={roleKey} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gray-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-gray-500/20 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <Badge className={roleInfo.color}>
                      Level {roleInfo.level}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{roleInfo.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{count}</p>
                  <p className="text-xs text-gray-900 mb-3">{roleInfo.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">{active} active</span>
                    <span className="text-gray-400">{count - active} inactive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table with Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            User Role Management ({allUsers.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.slice(0, 50).map((user) => {
                  const roleInfo = rolePermissions[user.role as keyof typeof rolePermissions];
                  const Icon = roleInfo?.icon || Users;
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {user.image ? (
                              <Image 
                                src={user.image} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full object-cover"
                                width={100}
                                height={100}
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <Badge className={roleInfo?.color}>
                            {roleInfo?.name || user.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={user.isActive || false}
                            onCheckedChange={() => handleToggleStatus(user.id, user.name)}
                            disabled={loading}
                          />
                          <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(user.lastActive).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 text-gray-900">
                          {roleInfo?.permissions.slice(0, 2).map((permission, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs text-gray-900">
                              {permission}
                            </Badge>
                          ))}
                          {roleInfo && roleInfo.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs text-gray-900">
                              +{roleInfo.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={loading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <UserDetailsModal
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              }
                              userId={user.id}
                            />
                            <ChangeRoleModal
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Change Role
                                </DropdownMenuItem>
                              }
                              userId={user.id}
                              currentRole={user.role || 'job_seeker'}
                              userName={user.name || 'Unknown User'}
                            />
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(user.id, user.name || 'Unknown User')}
                              disabled={loading}
                            >
                              {user.isActive ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 