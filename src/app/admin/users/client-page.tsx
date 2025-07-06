"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserCheck, 
  Building, 
  Shield, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Trash2,
  UserPlus,
  Activity,
  TrendingUp,
  AlertTriangle,
  UserCog,
  Lock,
  Unlock
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserManagementModal } from "@/components/admin/user-management-modal";
import { UserDetailsModal } from "@/components/admin/user-details-modal";
import { ChangeRoleModal } from "@/components/admin/change-role-modal";
import { toggleUserStatus, deleteUser } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import Image from "next/image";

interface UsersClientPageProps {
  initialData: {
    userStats: any[];
    allUsers: any[];
  };
}

export function UsersClientPage({ initialData }: UsersClientPageProps) {
  const [loading, setLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [displayCount, setDisplayCount] = useState(50);
  const router = useRouter();

  const { userStats, allUsers } = initialData;

  // Calculate accurate totals from actual users data
  const actualStats = useMemo(() => {
    const total = allUsers.length;
    const active = allUsers.filter(({ user }) => user.isActive).length;
    const inactive = total - active;
    const adminCount = allUsers.filter(({ user }) => user.role === 'admin').length;
    
    return { total, active, inactive, adminCount };
  }, [allUsers]);

  // Calculate role distribution from actual users
  const roleDistribution = useMemo(() => {
    const distribution: { [key: string]: { total: number; active: number; inactive: number } } = {};
    
    allUsers.forEach(({ user }) => {
      const role = user.role || 'job_seeker';
      if (!distribution[role]) {
        distribution[role] = { total: 0, active: 0, inactive: 0 };
      }
      distribution[role].total += 1;
      if (user.isActive) {
        distribution[role].active += 1;
      } else {
        distribution[role].inactive += 1;
      }
    });
    
    return distribution;
  }, [allUsers]);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(({ user, jobSeeker, employer }) => {
      // Search filter
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        employer?.companyName?.toLowerCase().includes(searchTerm);

      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchQuery, roleFilter, statusFilter]);

  // Users to display (with pagination)
  const displayedUsers = useMemo(() => {
    return filteredUsers.slice(0, displayCount);
  }, [filteredUsers, displayCount]);

  const roleColors = {
    admin: "bg-purple-100 text-purple-800",
    employer: "bg-blue-100 text-blue-800", 
    job_seeker: "bg-green-100 text-green-800",
    security: "bg-orange-100 text-orange-800"
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Shield;
      case "employer": return Building;
      case "job_seeker": return UserCheck;
      case "security": return Shield;
      default: return Users;
    }
  };

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
      // Use a more specific error logging approach
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error toggling user status:", errorMessage);
      }
      toast.error("An error occurred while updating user status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success(result.message);
        setDeleteUserId(null);
        router.refresh();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      // Use a more specific error logging approach
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting user:", errorMessage);
      }
      toast.error("An error occurred while deleting the user");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 50);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setDisplayCount(50); // Reset display count when searching
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setDisplayCount(50); // Reset display count when filtering
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setDisplayCount(50); // Reset display count when filtering
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users, roles, and permissions across the platform
          </p>
        </div>
        <UserManagementModal 
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          }
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{actualStats.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      All registered users
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-green-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{actualStats.active.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {actualStats.total > 0 ? Math.round((actualStats.active / actualStats.total) * 100) : 0}% of total
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 via-white to-orange-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-orange-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Inactive Users</p>
                  <p className="text-3xl font-bold text-gray-900">{actualStats.inactive.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Need attention
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Admins</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {actualStats.adminCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      System administrators
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            User Distribution by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(roleDistribution).map(([role, stats]) => {
              const Icon = getRoleIcon(role);
              return (
                <div key={role} className="text-center p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 capitalize mb-1">
                    {role.replace('_', ' ')}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</p>
                  <div className="flex justify-center gap-2 text-xs">
                    <span className="text-green-600">{stats.active} active</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-orange-600">{stats.inactive} inactive</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            Filter & Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or company..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="job_seeker">Job Seeker</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>Showing {filteredUsers.length} of {allUsers.length} users</span>
              {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                    setDisplayCount(50);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map(({ user, jobSeeker, employer }) => (
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
                              {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {employer && (
                            <p className="text-xs text-blue-600">{employer.companyName}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                        {user.role?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(user.id, user.name || 'Unknown User')}
                            disabled={loading}
                          >
                            {user.isActive ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Deactivate User
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                          {user.role !== 'admin' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteUserId(user.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length > displayedUsers.length && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More Users ({filteredUsers.length - displayedUsers.length} remaining)
              </Button>
            </div>
          )}
          
          {filteredUsers.length === 0 && (
            <div className="mt-4 text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No users found matching your criteria.</p>
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will permanently 
              remove the user and all their associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
