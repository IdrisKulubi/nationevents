"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Download, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Phone, 
  Calendar,
  RefreshCw,
  Database,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { getAttendeesData, getDataSummaryStats, type AttendeeData, type DataExportFilters } from "@/lib/actions/data-export-actions";

interface SummaryStats {
  totalAttendees: number;
  approvedAttendees: number;
  pendingAttendees: number;
  rejectedAttendees: number;
  huaweiStudents: number;
  conferenceInterested: number;
  withPhoneNumbers: number;
  withAttendance: number;
}

export function DataExportInterface() {
  const [attendeesData, setAttendeesData] = useState<AttendeeData[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [filters, setFilters] = useState<DataExportFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [data, stats] = await Promise.all([
        getAttendeesData(filters),
        getDataSummaryStats()
      ]);
      
      setAttendeesData(data);
      setSummaryStats(stats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load attendees data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DataExportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "" ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const exportToDocx = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch("/api/export-attendees-docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          data: attendeesData,
          filters: filters
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate DOCX");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `attendees-export-${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Data Export Portal
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Nation-Huawei Job Fair 2025 - Attendees Data
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={loadData} 
                variant="outline" 
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button 
                onClick={exportToDocx} 
                disabled={isExporting || attendeesData.length === 0}
                className="flex items-center space-x-2 bg-blue-600"
              >
                <Download className={`h-4 w-4 ${isExporting ? "animate-bounce" : ""}`} />
                <span>{isExporting ? "Generating..." : "Export DOCX"}</span>
              </Button>
            </div>
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Statistics */}
        {summaryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{summaryStats.totalAttendees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summaryStats.approvedAttendees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{summaryStats.pendingAttendees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                  Huawei
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{summaryStats.huaweiStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                  Conference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">{summaryStats.conferenceInterested}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-orange-600" />
                  With Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{summaryStats.withPhoneNumbers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-teal-600" />
                  Attended
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">{summaryStats.withAttendance}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-slate-600" />
                  Filtered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-600">{attendeesData.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
            <CardDescription>
              Filter and search through attendees data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="search"
                    placeholder="Name, email, or phone..."
                    className="pl-8"
                    value={filters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Registration Status</Label>
                <Select
                  value={filters.registrationStatus || "all"}
                  onValueChange={(value) => handleFilterChange("registrationStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="huawei">Huawei Student</Label>
                <Select
                  value={filters.huaweiStudent || "all"}
                  onValueChange={(value) => handleFilterChange("huaweiStudent", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conference">Conference Interest</Label>
                <Select
                  value={filters.conferenceAttendance || "all"}
                  onValueChange={(value) => handleFilterChange("conferenceAttendance", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={clearFilters} 
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Attendees Data ({attendeesData.length} records)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                <span className="text-lg">Loading attendees data...</span>
              </div>
            ) : attendeesData.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No attendees found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Huawei</TableHead>
                      <TableHead>Conference</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendeesData.slice(0, 50).map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">
                          {attendee.name || "N/A"}
                        </TableCell>
                        <TableCell>{attendee.email}</TableCell>
                        <TableCell>{attendee.phoneNumber || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(attendee.registrationStatus)}>
                            {attendee.registrationStatus ? 
                              attendee.registrationStatus.charAt(0).toUpperCase() + attendee.registrationStatus.slice(1) : 
                              "Pending"
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {attendee.isHuaweiStudent ? (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attendee.wantsToAttendConference ? (
                            <Badge variant="outline" className="text-indigo-600 border-indigo-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </TableCell>
                        <TableCell>{attendee.attendanceCount}</TableCell>
                        <TableCell>
                          {new Date(attendee.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {attendeesData.length > 50 && (
                  <div className="mt-4 text-center text-slate-500">
                    Showing first 50 results. Export to DOCX to get all {attendeesData.length} records.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
