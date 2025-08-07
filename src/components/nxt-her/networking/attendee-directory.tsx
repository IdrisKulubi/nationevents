"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Users, 
  Filter, 
  MapPin, 
  Building, 
  Globe, 
  Linkedin, 
  Twitter,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { ConnectionRequestDialog } from "./connection-request-dialog";
// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  organization?: string;
  profilePhotoUrl?: string;
  country: string;
  city: string;
  attendanceType: "in_person" | "virtual";
  topicsOfInterest: string[];
  areasOfExpertise: string[];
  aboutYou?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  networkingProfile?: {
    networkingGoals: string[];
    sector?: string;
    region?: string;
    interests: string[];
    lookingFor: string[];
    availableFor: string[];
    preferredConnectionTypes: string[];
  };
}

interface FilterOptions {
  sectors: string[];
  regions: string[];
  interests: string[];
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function AttendeeDirectory() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sectors: [],
    regions: [],
    interests: [],
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Debounced search function
  const debouncedFetchAttendees = useCallback(
    debounce((search: string, sector: string, region: string, interests: string[], page: number) => {
      fetchAttendees(search, sector, region, interests, page);
    }, 300),
    []
  );

  useEffect(() => {
    fetchAttendees();
  }, []);

  useEffect(() => {
    debouncedFetchAttendees(searchQuery, selectedSector, selectedRegion, selectedInterests, 1);
  }, [searchQuery, selectedSector, selectedRegion, selectedInterests, debouncedFetchAttendees]);

  const fetchAttendees = async (
    search = searchQuery,
    sector = selectedSector,
    region = selectedRegion,
    interests = selectedInterests,
    page = pagination.page
  ) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);
      if (sector) params.append("sector", sector);
      if (region) params.append("region", region);
      if (interests.length > 0) params.append("interests", interests.join(","));

      const response = await fetch(`/api/nxt-her/attendee-directory?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch attendee directory");
      }

      const data = await response.json();
      setAttendees(data.attendees);
      setPagination(data.pagination);
      setFilterOptions(data.filters);
    } catch (error) {
      console.error("Error fetching attendee directory:", error);
      toast.error("Failed to load attendee directory");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchAttendees(searchQuery, selectedSector, selectedRegion, selectedInterests, newPage);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSector("");
    setSelectedRegion("");
    setSelectedInterests([]);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  if (isLoading && attendees.length === 0) {
    return <AttendeeDirectorySkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Who's Here
          </CardTitle>
          <CardDescription>
            Discover and connect with other summit attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, organization, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sectors</SelectItem>
                  {filterOptions.sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All regions</SelectItem>
                  {filterOptions.regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || selectedSector || selectedRegion || selectedInterests.length > 0) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            {/* Interest Tags */}
            {filterOptions.interests.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Filter by interests:</span>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.interests.slice(0, 12).map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                  {filterOptions.interests.length > 12 && (
                    <Badge variant="outline" className="cursor-pointer">
                      +{filterOptions.interests.length - 12} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {pagination.totalCount} attendee{pagination.totalCount !== 1 ? "s" : ""} found
            </p>
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
          </div>

          {/* Attendee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {attendees.map((attendee) => (
              <Card key={attendee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={attendee.profilePhotoUrl}
                        alt={`${attendee.firstName} ${attendee.lastName}`}
                      />
                      <AvatarFallback>
                        {attendee.firstName[0]}
                        {attendee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight">
                        {attendee.firstName} {attendee.lastName}
                      </h3>
                      {(attendee.jobTitle || attendee.organization) && (
                        <p className="text-sm text-muted-foreground">
                          {attendee.jobTitle}
                          {attendee.jobTitle && attendee.organization && " at "}
                          {attendee.organization}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {attendee.city}, {attendee.country}
                        </span>
                        <Badge
                          variant={attendee.attendanceType === "in_person" ? "default" : "secondary"}
                          className="ml-2 text-xs"
                        >
                          {attendee.attendanceType === "in_person" ? "In Person" : "Virtual"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Interests/Topics */}
                  {(attendee.topicsOfInterest.length > 0 || attendee.networkingProfile?.interests.length) && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {(attendee.networkingProfile?.interests || attendee.topicsOfInterest)
                          .slice(0, 3)
                          .map((interest, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        {(attendee.networkingProfile?.interests || attendee.topicsOfInterest).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(attendee.networkingProfile?.interests || attendee.topicsOfInterest).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex items-center gap-2 mb-3">
                    {attendee.socialLinks.linkedin && (
                      <a
                        href={attendee.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {attendee.socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${attendee.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {attendee.socialLinks.website && (
                      <a
                        href={attendee.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedAttendee(attendee)}
                        >
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <AttendeeProfileModal attendee={selectedAttendee} />
                      </DialogContent>
                    </Dialog>
                    
                    <ConnectionRequestDialog
                      attendee={{
                        id: attendee.id,
                        firstName: attendee.firstName,
                        lastName: attendee.lastName,
                        jobTitle: attendee.jobTitle,
                        organization: attendee.organization,
                        profilePhotoUrl: attendee.profilePhotoUrl,
                      }}
                      trigger={
                        <Button size="sm" className="flex-1">
                          Connect
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AttendeeProfileModal({ attendee }: { attendee: Attendee | null }) {
  if (!attendee) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={attendee.profilePhotoUrl}
              alt={`${attendee.firstName} ${attendee.lastName}`}
            />
            <AvatarFallback className="text-lg">
              {attendee.firstName[0]}
              {attendee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">
              {attendee.firstName} {attendee.lastName}
            </h2>
            {(attendee.jobTitle || attendee.organization) && (
              <p className="text-muted-foreground">
                {attendee.jobTitle}
                {attendee.jobTitle && attendee.organization && " at "}
                {attendee.organization}
              </p>
            )}
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Location and Attendance */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {attendee.city}, {attendee.country}
            </span>
          </div>
          <Badge
            variant={attendee.attendanceType === "in_person" ? "default" : "secondary"}
          >
            {attendee.attendanceType === "in_person" ? "In Person" : "Virtual"}
          </Badge>
        </div>

        {/* About */}
        {attendee.aboutYou && (
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{attendee.aboutYou}</p>
          </div>
        )}

        {/* Topics of Interest */}
        {attendee.topicsOfInterest.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Topics of Interest</h3>
            <div className="flex flex-wrap gap-2">
              {attendee.topicsOfInterest.map((topic, index) => (
                <Badge key={index} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Areas of Expertise */}
        {attendee.areasOfExpertise.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {attendee.areasOfExpertise.map((area, index) => (
                <Badge key={index} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Networking Profile */}
        {attendee.networkingProfile && (
          <div className="space-y-4">
            <h3 className="font-semibold">Networking Profile</h3>
            
            {attendee.networkingProfile.sector && (
              <div>
                <h4 className="text-sm font-medium mb-1">Sector</h4>
                <Badge variant="outline">{attendee.networkingProfile.sector}</Badge>
              </div>
            )}

            {attendee.networkingProfile.lookingFor.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Looking For</h4>
                <div className="flex flex-wrap gap-1">
                  {attendee.networkingProfile.lookingFor.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {attendee.networkingProfile.availableFor.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Available For</h4>
                <div className="flex flex-wrap gap-1">
                  {attendee.networkingProfile.availableFor.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Social Links */}
        <div>
          <h3 className="font-semibold mb-2">Connect</h3>
          <div className="flex gap-3">
            {attendee.socialLinks.linkedin && (
              <a
                href={attendee.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {attendee.socialLinks.twitter && (
              <a
                href={`https://twitter.com/${attendee.socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
                Twitter
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {attendee.socialLinks.website && (
              <a
                href={attendee.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Globe className="h-4 w-4" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Connection Button */}
        <div className="pt-4 border-t">
          <ConnectionRequestDialog
            attendee={{
              id: attendee.id,
              firstName: attendee.firstName,
              lastName: attendee.lastName,
              jobTitle: attendee.jobTitle,
              organization: attendee.organization,
              profilePhotoUrl: attendee.profilePhotoUrl,
            }}
            trigger={
              <Button className="w-full">
                Send Connection Request
              </Button>
            }
          />
        </div>
      </div>
    </>
  );
}

function AttendeeDirectorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}