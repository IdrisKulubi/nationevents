"use client";

import { useState, useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  Briefcase, 
  MapPin, 
  Clock, 
  Users,
  Star,
  Eye,
  Calendar
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface FilterState {
  search: string;
  experience: string;
  skills: string;
  location: string;
  status: string;
}

interface CandidateFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export function CandidateFilters({ onFiltersChange, initialFilters = {} }: CandidateFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<FilterState>({
    search: initialFilters.search || searchParams.get('search') || '',
    experience: initialFilters.experience || searchParams.get('experience') || 'all',
    skills: initialFilters.skills || searchParams.get('skills') || 'all',
    location: initialFilters.location || searchParams.get('location') || 'all',
    status: initialFilters.status || searchParams.get('status') || 'all',
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update active filters for display
    const active: string[] = [];
    if (updatedFilters.experience !== 'all') active.push(`Experience: ${updatedFilters.experience}`);
    if (updatedFilters.skills !== 'all') active.push(`Skills: ${updatedFilters.skills}`);
    if (updatedFilters.location !== 'all') active.push(`Location: ${updatedFilters.location}`);
    if (updatedFilters.status !== 'all') active.push(`Status: ${updatedFilters.status}`);
    setActiveFilters(active);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });

    // Notify parent component
    onFiltersChange?.(updatedFilters);
  }, [filters, onFiltersChange, router]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: FilterState = {
      search: '',
      experience: 'all',
      skills: 'all',
      location: 'all',
      status: 'all',
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    
    startTransition(() => {
      router.push(window.location.pathname, { scroll: false });
    });

    onFiltersChange?.(clearedFilters);
    toast.success("🧹 All filters cleared!");
  }, [onFiltersChange, router]);

  const removeFilter = useCallback((filterToRemove: string) => {
    const [filterType] = filterToRemove.split(': ');
    const filterKey = filterType.toLowerCase() as keyof FilterState;
    updateFilters({ [filterKey]: 'all' });
    toast.success(`✅ ${filterType} filter removed`);
  }, [updateFilters]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="🔍 Search candidates by name, skills, experience, or location..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-12 h-12 text-base border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-xl bg-white shadow-sm"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">🎯 Advanced Filters</h3>
            </div>
            {activeFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="border-2 border-red-300 text-red-700 hover:bg-red-50 font-semibold rounded-lg"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Experience Level
              </label>
              <Select 
                value={filters.experience} 
                onValueChange={(value) => updateFilters({ experience: value })}
              >
                <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience Levels</SelectItem>
                  <SelectItem value="entry">🌱 Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">🚀 Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">⭐ Senior Level (6-10 years)</SelectItem>
                  <SelectItem value="lead">👑 Lead/Expert (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills & Tech */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                Skills & Tech
              </label>
              <Select 
                value={filters.skills} 
                onValueChange={(value) => updateFilters({ skills: value })}
              >
                <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="Any skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="javascript">💛 JavaScript</SelectItem>
                  <SelectItem value="python">🐍 Python</SelectItem>
                  <SelectItem value="react">⚛️ React</SelectItem>
                  <SelectItem value="nodejs">💚 Node.js</SelectItem>
                  <SelectItem value="database">🗄️ Database</SelectItem>
                  <SelectItem value="ai">🤖 AI/ML</SelectItem>
                  <SelectItem value="cloud">☁️ Cloud Computing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                Location Type
              </label>
              <Select 
                value={filters.location} 
                onValueChange={(value) => updateFilters({ location: value })}
              >
                <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">🏠 Remote</SelectItem>
                  <SelectItem value="onsite">🏢 On-site</SelectItem>
                  <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                  <SelectItem value="relocate">✈️ Open to Relocate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Candidate Status
              </label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => updateFilters({ status: value })}
              >
                <SelectTrigger className="h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="All candidates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="shortlisted">⭐ Shortlisted</SelectItem>
                  <SelectItem value="contacted">📞 Contacted</SelectItem>
                  <SelectItem value="viewed">👁️ Recently Viewed</SelectItem>
                  <SelectItem value="new">🆕 New This Week</SelectItem>
                  <SelectItem value="available">✅ Available Now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Active Filters:</span>
              </div>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 bg-white border-2 border-blue-300 text-blue-800 font-semibold hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={() => removeFilter(filter)}
                >
                  {filter}
                  <X className="h-3 w-3 ml-2" />
                </Badge>
              ))}
              <span className="text-xs text-blue-600 font-medium">
                ({activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Loading State */}
      {isPending && (
        <Card className="border-2 border-gray-200 bg-gray-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-700">🔄 Applying filters...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 