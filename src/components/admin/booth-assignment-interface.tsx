"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users, 
  Building, 
  Search, 
  Filter, 
  UserPlus,
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Download,
  RefreshCw,
  ArrowRight,
  UserCheck,
  Phone
} from "lucide-react";
import { toast } from "sonner";

// Types
interface JobSeeker {
  jobSeeker: {
    id: string;
    bio: string;
    skills: string[];
    experience: string;
    education: string;
    assignmentStatus: string;
    priorityLevel: string;
    createdAt: Date;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  assignmentCount: number;
}

interface Booth {
  booth: {
    id: string;
    boothNumber: string;
    location: string;
    isActive: boolean;
  };
  employer: {
    id: string;
    companyName: string;
    industry?: string;
  };
  event: {
    id: string;
    name: string;
    venue: string;
  };
  assignmentCount: number;
  slotCount: number;
}

interface Assignment {
  jobSeekerId: string;
  boothId: string;
  interviewDate?: Date;
  interviewTime?: string;
  notes?: string;
  priority?: "high" | "medium" | "low";
}

interface BoothAssignmentInterfaceProps {
  initialJobSeekers: JobSeeker[];
  initialBooths: Booth[];
}

export function BoothAssignmentInterface({ 
  initialJobSeekers, 
  initialBooths 
}: BoothAssignmentInterfaceProps) {
  const router = useRouter();
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>(initialJobSeekers);
  const [booths, setBooths] = useState<Booth[]>(initialBooths);
  const [selectedJobSeekers, setSelectedJobSeekers] = useState<string[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [bulkAssignmentData, setBulkAssignmentData] = useState<Assignment[]>([]);

  // Filters
  const filteredJobSeekers = jobSeekers.filter(item => {
    const matchesSearch = !searchTerm || 
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobSeeker.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill = skillFilter === "all" || 
      item.jobSeeker.skills?.some(skill => 
        skill.toLowerCase().includes(skillFilter.toLowerCase())
      );

    const matchesExperience = experienceFilter === "all" || 
      item.jobSeeker.experience === experienceFilter;

    return matchesSearch && matchesSkill && matchesExperience;
  });

  // Get unique skills and experience levels for filters
  const allSkills = Array.from(new Set(
    jobSeekers.flatMap(item => item.jobSeeker.skills || [])
  )).sort();

  const allExperienceLevels = Array.from(new Set(
    jobSeekers.map(item => item.jobSeeker.experience).filter(Boolean)
  )).sort();

  const handleJobSeekerSelect = (jobSeekerId: string) => {
    setSelectedJobSeekers(prev => 
      prev.includes(jobSeekerId)
        ? prev.filter(id => id !== jobSeekerId)
        : [...prev, jobSeekerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobSeekers.length === filteredJobSeekers.length) {
      setSelectedJobSeekers([]);
    } else {
      setSelectedJobSeekers(filteredJobSeekers.map(item => item.jobSeeker.id));
    }
  };

  const handleSingleAssignment = async (jobSeekerId: string, boothId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/booth-assignments/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobSeekerId,
          boothId,
          priority: 'medium'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Job seeker assigned successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Assignment failed");
      }
    } catch (error) {
      toast.error("Failed to assign job seeker");
      console.error("Assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssignment = async () => {
    if (selectedJobSeekers.length === 0 || !selectedBooth) {
      toast.error("Please select job seekers and a booth");
      return;
    }

    setLoading(true);
    try {
      const assignments = selectedJobSeekers.map(jobSeekerId => ({
        jobSeekerId,
        boothId: selectedBooth,
        priority: 'medium' as const
      }));

      const response = await fetch('/api/admin/booth-assignments/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Bulk assignment completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
        setSelectedJobSeekers([]);
        setSelectedBooth("");
        router.refresh();
      } else {
        toast.error(result.error || "Bulk assignment failed");
      }
    } catch (error) {
      toast.error("Failed to perform bulk assignment");
      console.error("Bulk assignment error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotifications = async () => {
    if (selectedJobSeekers.length === 0) {
      toast.error("Please select job seekers to notify");
      return;
    }

    setLoading(true);
    try {
      // Get assignment IDs for selected job seekers
      const response = await fetch('/api/admin/notifications/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobSeekerIds: selectedJobSeekers,
          templateType: 'booth_assignment'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Notifications sent: ${result.summary.successful} successful, ${result.summary.failed} failed`);
      } else {
        toast.error(result.error || "Failed to send notifications");
      }
    } catch (error) {
      toast.error("Failed to send notifications");
      console.error("Notification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-blue-100 text-blue-800 border-blue-300";
      case "confirmed": return "bg-green-100 text-green-800 border-green-300";
      case "completed": return "bg-purple-100 text-purple-800 border-purple-300";
      case "unassigned": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Booth Assignment Interface
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Manually assign job seekers to interview booths based on skills and requirements
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.refresh()}
              disabled={loading}
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setAssignmentModalOpen(true)}
              disabled={selectedJobSeekers.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Bulk Assign ({selectedJobSeekers.length})
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Job Seekers</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{jobSeekers.length}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Active candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Assigned</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {jobSeekers.filter(js => js.jobSeeker.assignmentStatus !== 'unassigned').length}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Successfully matched</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/20 dark:to-amber-900/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Unassigned</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {jobSeekers.filter(js => js.jobSeeker.assignmentStatus === 'unassigned').length}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Awaiting assignment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available Booths</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{booths.length}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Ready for assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-white" />
              </div>
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Search Job Seekers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or bio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter by Skill</Label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All skills</SelectItem>
                    {allSkills.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter by Experience</Label>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All experience levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All experience levels</SelectItem>
                    {allExperienceLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSkillFilter("all");
                      setExperienceFilter("all");
                    }}
                    className="flex-1 h-12 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex-1 h-12 border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                  >
                    {selectedJobSeekers.length === filteredJobSeekers.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Seekers Table */}
        <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Job Seekers ({filteredJobSeekers.length})
              </CardTitle>
              {selectedJobSeekers.length > 0 && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendNotifications}
                    disabled={loading}
                    className="border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Notifications
                  </Button>
                  <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-950/20 dark:to-purple-950/20 dark:text-blue-300">
                    {selectedJobSeekers.length} selected
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Processing assignments...</span>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedJobSeekers.length === filteredJobSeekers.length && filteredJobSeekers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Job Seeker</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Skills</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Experience</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Priority</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobSeekers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              No Job Seekers Found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                              Try adjusting your search criteria or filters
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobSeekers.map((item) => (
                      <TableRow key={item.jobSeeker.id} className="border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-300 group">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedJobSeekers.includes(item.jobSeeker.id)}
                            onChange={() => handleJobSeekerSelect(item.jobSeeker.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transform group-hover:scale-110 transition-transform duration-200"
                          />
                        </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                            {item.user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.user.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.user.email}</p>
                            {item.user.phoneNumber && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {item.user.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.jobSeeker.skills?.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
                              {skill}
                            </Badge>
                          ))}
                          {item.jobSeeker.skills && item.jobSeeker.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600">
                              +{item.jobSeeker.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.jobSeeker.experience}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(item.jobSeeker.assignmentStatus)} font-medium`}>
                          {item.jobSeeker.assignmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(item.jobSeeker.priorityLevel)} font-medium`}>
                          {item.jobSeeker.priorityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {booths.slice(0, 5).map((booth) => (
                              <DropdownMenuItem
                                key={booth.booth.id}
                                onClick={() => handleSingleAssignment(item.jobSeeker.id, booth.booth.id)}
                                disabled={loading}
                                className="cursor-pointer"
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Assign to Booth {booth.booth.boothNumber}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Assignment Modal */}
        <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
          <DialogContent className="max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bulk Booth Assignment
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Assign {selectedJobSeekers.length} selected job seekers to a booth
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Booth</Label>
                <Select value={selectedBooth} onValueChange={setSelectedBooth}>
                  <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Choose a booth for assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {booths.map((booth) => (
                      <SelectItem key={booth.booth.id} value={booth.booth.id}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">Booth {booth.booth.boothNumber}</span>
                          </div>
                          <div className="text-sm text-slate-500">
                            {booth.employer.companyName} • {booth.assignmentCount}/{booth.slotCount} assigned
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Selected Job Seekers:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  {selectedJobSeekers.map(id => {
                    const jobSeeker = jobSeekers.find(js => js.jobSeeker.id === id);
                    return jobSeeker ? (
                      <div key={id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{jobSeeker.user.name}</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
                          {jobSeeker.jobSeeker.experience}
                        </Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBulkAssignment}
                  disabled={!selectedBooth || loading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    "Assign to Booth"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="h-12 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button */}
        {selectedJobSeekers.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse">
              <Button
                onClick={() => setAssignmentModalOpen(true)}
                className="bg-transparent hover:bg-transparent p-0 h-auto text-white"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  <span className="font-semibold">{selectedJobSeekers.length}</span>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 opacity-5">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
      </div>
    </div>
  );
} 