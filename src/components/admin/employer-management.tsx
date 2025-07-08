"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Building,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Star,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { 
  getAllEmployers, 
  promoteUserToAdmin, 
  verifyEmployer, 
  rejectEmployer 
} from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { verifyAllPendingEmployers } from "@/lib/actions/admin-bulk-actions";

interface Employer {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string | null;
  userEmail: string;
  contactPhone: string | null;
  industry: string;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  website: string;
  isVerified: boolean;
  userRole: "employer" | "admin";
  createdAt: Date;
  logoUrl?: string;
  jobsPosted: number;
  interviewsScheduled: number;
  status: "active" | "inactive" | "pending";
}

export function EmployerManagement() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVerification, setFilterVerification] = useState<string>("all");
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const router = useRouter();

  const loadEmployers = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        verification: filterVerification !== "all" ? filterVerification : undefined,
        search: searchTerm || undefined,
      };
      
      const data = await getAllEmployers(filters);
      setEmployers(data as unknown as Employer[]);
    } catch (error) {
      console.error("Error loading employers:", error);
      toast.error("Failed to load employers");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterVerification, searchTerm]);

  useEffect(() => {
    loadEmployers();
  }, [loadEmployers]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadEmployers();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [loadEmployers]);

  const handlePromoteToAdmin = async (employer: Employer) => {
    try {
      setActionLoading('promote');
      await promoteUserToAdmin(employer.userId);
      
      setEmployers(prev => prev.map(emp => 
        emp.id === employer.id 
          ? { ...emp, userRole: "admin" }
          : emp
      ));
      
      toast.success(`${employer.companyName} has been promoted to admin role`);
      setShowPromoteDialog(false);
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyEmployer = async (employerId: string) => {
    try {
      setActionLoading('verify');
      await verifyEmployer(employerId);
      
      setEmployers(prev => prev.map(emp => 
        emp.id === employerId 
          ? { ...emp, isVerified: true, status: "active" }
          : emp
      ));
      
      toast.success("Employer verified successfully");
    } catch (error) {
      console.error("Error verifying employer:", error);
      toast.error("Failed to verify employer. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEmployer = async (employerId: string) => {
    try {
      setActionLoading('reject');
      await rejectEmployer(employerId);
      
      setEmployers(prev => prev.map(emp => 
        emp.id === employerId 
          ? { ...emp, status: "inactive" }
          : emp
      ));
      
      toast.success("Employer application rejected");
    } catch (error) {
      console.error("Error rejecting employer:", error);
      toast.error("Failed to reject employer. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
      case "pending": return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
      case "inactive": return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  const getCompanySizeDisplay = (size: string) => {
    const sizes = {
      startup: "Startup (1-10)",
      small: "Small (11-50)",
      medium: "Medium (51-200)",
      large: "Large (201-1000)",
      enterprise: "Enterprise (1000+)",
    };
    return sizes[size as keyof typeof sizes] || size;
  };

  const unverifiedCount = employers.filter(e => !e.isVerified).length;

  const handleBulkVerify = async () => {
    setBulkLoading(true);
    const promise = verifyAllPendingEmployers();
    
    toast.promise(promise, {
      loading: 'Verifying all pending employers...',
      success: (data) => {
        router.refresh();
        return data.message;
      },
      error: (err) => (err as Error).message || 'An unexpected error occurred.',
      finally: () => setBulkLoading(false),
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Employer Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage employer accounts, verification, and role assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <Building className="w-4 h-4 mr-1" />
            {employers.length} Total Employers
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Employers</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by company name, contact person, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:w-48">
              <Label htmlFor="verification-filter">Verification</Label>
              <Select value={filterVerification} onValueChange={setFilterVerification}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employers Table */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Employers ({employers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {employers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No employers found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employers.map((employer) => (
                    <TableRow key={employer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {employer.companyName}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {employer.industry} • {getCompanySizeDisplay(employer.companySize)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {employer.contactPerson}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {employer.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employer.status)}>
                          {employer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {employer.isVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {employer.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employer.userRole === "admin" ? "default" : "secondary"}>
                          {employer.userRole === "admin" ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            "Employer"
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{employer.jobsPosted} jobs posted</div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {employer.interviewsScheduled} interviews
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEmployer(employer);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {!employer.isVerified && employer.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleVerifyEmployer(employer.id)}
                                  disabled={actionLoading === 'verify'}
                                >
                                  {actionLoading === 'verify' ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Verify Employer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectEmployer(employer.id)}
                                  className="text-red-600 dark:text-red-400"
                                  disabled={actionLoading === 'reject'}
                                >
                                  {actionLoading === 'reject' ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Reject Application
                                </DropdownMenuItem>
                              </>
                            )}
                            {employer.userRole !== "admin" && employer.isVerified && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEmployer(employer);
                                  setShowPromoteDialog(true);
                                }}
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Promote to Admin
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
          )}
        </CardContent>
      </Card>

      {/* Promote to Admin Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Promote to Administrator
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to promote {selectedEmployer?.companyName} to administrator role? 
              This will give them full access to the admin panel.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployer && (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Company:</span>
                <span>{selectedEmployer.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Contact:</span>
                <span>{selectedEmployer.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{selectedEmployer.userEmail}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPromoteDialog(false)}
              disabled={actionLoading === 'promote'}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedEmployer && handlePromoteToAdmin(selectedEmployer)}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading === 'promote'}
            >
              {actionLoading === 'promote' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Promoting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Promote to Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Employer Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployer && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Company Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Company Name</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEmployer.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Industry</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEmployer.industry}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Company Size</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{getCompanySizeDisplay(selectedEmployer.companySize)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Website</Label>
                      <a 
                        href={selectedEmployer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {selectedEmployer.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Contact Person</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEmployer.contactPerson}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEmployer.userEmail}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEmployer.contactPhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Joined Date</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(selectedEmployer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Activity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {selectedEmployer.jobsPosted}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Jobs Posted</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {selectedEmployer.interviewsScheduled}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Interviews Scheduled</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className={`text-2xl font-bold ${selectedEmployer.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedEmployer.isVerified ? '✓' : '⏳'}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedEmployer.isVerified ? 'Verified' : 'Pending Verification'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employer Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and verify registered employers.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          {unverifiedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  disabled={bulkLoading}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {bulkLoading ? 'Verifying...' : `Verify All Unverified (${unverifiedCount})`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will verify all {unverifiedCount} pending employers. They will be granted full access. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkVerify} className="bg-blue-500 hover:bg-blue-600">
                    Yes, Verify All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
} 