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
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Calendar,
  Activity,
  TrendingUp,
  AlertCircle,
  FileText,
  FilterX
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
import { JobSeekerModal } from "@/components/admin/job-seeker-modal";
import { ViewJobSeekerModal } from "@/components/admin/view-job-seeker-modal";
import { openCvInNewTab } from "@/lib/s3-utils";
import { toast } from "sonner";
import Image from "next/image";

interface JobSeekersClientPageProps {
  initialData: {
    jobSeekerStats: any[];
    allJobSeekers: any[];
    recentRegistrations: any[];
    pendingApprovals: any[];
  };
}

export function JobSeekersClientPage({ initialData }: JobSeekersClientPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");

  const { jobSeekerStats, allJobSeekers, recentRegistrations, pendingApprovals } = initialData;

  // Apply filters to the data
  const filteredJobSeekers = useMemo(() => {
    return allJobSeekers.filter(({ user, jobSeeker }) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          user?.name.toLowerCase().includes(query) ||
          user?.email.toLowerCase().includes(query) ||
          jobSeeker?.pin?.toLowerCase().includes(query) ||
          jobSeeker?.skills?.some((skill: string) => skill.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (jobSeeker?.registrationStatus !== statusFilter) return false;
      }

      // Experience filter
      if (experienceFilter !== "all") {
        if (jobSeeker?.experience !== experienceFilter) return false;
      }

      return true;
    });
  }, [allJobSeekers, searchQuery, statusFilter, experienceFilter]);

  // Calculate filtered statistics
  const filteredStats = useMemo(() => {
    const stats = {
      total: filteredJobSeekers.length,
      approved: 0,
      pending: 0,
      rejected: 0
    };

    filteredJobSeekers.forEach(({ jobSeeker }) => {
      switch (jobSeeker?.registrationStatus) {
        case 'approved':
          stats.approved++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
      }
    });

    return stats;
  }, [filteredJobSeekers]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter !== "all" || experienceFilter !== "all";

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setExperienceFilter("all");
  };

  // Calculate totals (original stats for overview cards)
  const totalJobSeekers = jobSeekerStats.reduce((sum, stat) => sum + stat.count, 0);
  const approvedCount = jobSeekerStats.find(s => s.status === "approved")?.count || 0;
  const pendingCount = jobSeekerStats.find(s => s.status === "pending")?.count || 0;

  const statusColors = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800"
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "rejected": return XCircle;
      default: return Clock;
    }
  };

  const handleApprove = async (jobSeekerId: string) => {
    setLoading(jobSeekerId);
    try {
      const response = await fetch('/api/admin/jobseekers/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobSeekerId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        toast.error('Failed to approve job seeker');
        console.error('Failed to approve job seeker');
      }
    } catch (error) {
      toast.error('Error approving job seeker');
      console.error('Error approving job seeker:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (jobSeekerId: string) => {
    setLoading(jobSeekerId);
    try {
      const response = await fetch('/api/admin/jobseekers/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobSeekerId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        toast.error('Failed to reject job seeker');
        console.error('Failed to reject job seeker');
      }
    } catch (error) {
      console.error('Error rejecting job seeker:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleViewCV = (cvUrl: string) => {
    console.log('Raw CV URL from database:', cvUrl);
    openCvInNewTab(cvUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Seekers Management</h1>
          <p className="text-gray-600 mt-2">
            Manage job seeker registrations, approvals, and profiles
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <JobSeekerModal 
            trigger={
              <Button className="bg-green-600 hover:bg-green-700">
                <UserCheck className="h-4 w-4 mr-2" />
                Add Job Seeker
              </Button>
            }
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-green-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Job Seekers</p>
                  <p className="text-3xl font-bold text-gray-900">{totalJobSeekers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      All registered candidates
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

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">{approvedCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {totalJobSeekers > 0 ? Math.round((approvedCount / totalJobSeekers) * 100) : 0}% of total
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-white to-amber-50 group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-amber-500/20 transition-colors duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Pending Approval</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Requires review
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Clock className="h-6 w-6 text-amber-600" />
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
                  <p className="text-sm font-medium text-purple-600 mb-1">Recent (7 days)</p>
                  <p className="text-3xl font-bold text-gray-900">{recentRegistrations.length.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      New registrations
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtered Statistics (shows when filters are active) */}
      {hasActiveFilters && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Filter className="h-5 w-5" />
              Filtered Results ({filteredStats.total} of {totalJobSeekers})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{filteredStats.total}</p>
                <p className="text-sm text-gray-600">Total Filtered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{filteredStats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{filteredStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{filteredStats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Registration Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobSeekerStats.map((stat) => {
              const status = stat.status || 'unknown';
              const Icon = getStatusIcon(status);
              const percentage = totalJobSeekers > 0 ? Math.round((stat.count / totalJobSeekers) * 100) : 0;
              return (
                <div key={status} className="text-center p-6 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icon className="h-10 w-10 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 capitalize mb-2 text-lg">
                    {status}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">{stat.count}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{percentage}% of total</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Pending Approvals ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {pendingApprovals.slice(0, 5).map(({ user, jobSeeker }) => (
                <div key={jobSeeker?.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-amber-600">
                        {user?.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400">
                        Applied {jobSeeker?.createdAt ? new Date(jobSeeker.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => jobSeeker?.id && handleApprove(jobSeeker.id)}
                      disabled={loading === jobSeeker?.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {loading === jobSeeker?.id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => jobSeeker?.id && handleReject(jobSeeker.id)}
                      disabled={loading === jobSeeker?.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {loading === jobSeeker?.id ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ))}
              {pendingApprovals.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" className="text-amber-700">
                    View All {pendingApprovals.length} Pending Applications
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              Filter & Search Job Seekers
            </div>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, skills, or PIN..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Registration Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: &quot;{searchQuery}&quot;
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {experienceFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Experience: {experienceFilter}
                  <button 
                    onClick={() => setExperienceFilter("all")}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Seekers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-gray-600" />
            {hasActiveFilters ? `Filtered Job Seekers (${filteredJobSeekers.length})` : `All Job Seekers (${allJobSeekers.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJobSeekers.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No job seekers found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobSeekers.slice(0, 50).map(({ user, jobSeeker }) => (
                    <TableRow key={jobSeeker?.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {user?.image ? (
                              <Image 
                                src={user.image || "/default-avatar.png"} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full object-cover"
                                width={100}
                                height={100}
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {user?.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user?.name}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            {jobSeeker?.pin && (
                              <p className="text-xs text-blue-600">PIN: {jobSeeker.pin}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[jobSeeker?.registrationStatus as keyof typeof statusColors]}>
                          {jobSeeker?.registrationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {jobSeeker?.skills?.slice(0, 3).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {jobSeeker?.skills && jobSeeker.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{jobSeeker.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 capitalize">
                          {jobSeeker?.experience || 'Not specified'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {jobSeeker?.createdAt ? new Date(jobSeeker.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ViewJobSeekerModal
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                              }
                              jobSeekerData={{ user: user!, jobSeeker }}
                              onApprove={handleApprove}
                              onReject={handleReject}
                            />
                            {jobSeeker?.cvUrl && (
                              <DropdownMenuItem onSelect={() => handleViewCV(jobSeeker.cvUrl!)}>
                                <FileText className="h-4 w-4 mr-2" />
                                View CV
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            {jobSeeker?.registrationStatus === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onSelect={() => jobSeeker?.id && handleApprove(jobSeeker.id)}
                                  disabled={loading === jobSeeker.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {loading === jobSeeker.id ? 'Approving...' : 'Approve'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onSelect={() => jobSeeker?.id && handleReject(jobSeeker.id)}
                                  disabled={loading === jobSeeker.id}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {loading === jobSeeker.id ? 'Rejecting...' : 'Reject'}
                                </DropdownMenuItem>
                              </>
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
          
          {filteredJobSeekers.length > 50 && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                Load More Job Seekers ({filteredJobSeekers.length - 50} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 