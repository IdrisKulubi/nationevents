"use client";

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  Eye, 
  Heart,
} from "lucide-react";
import { CandidateProfileModal } from "@/components/employer/candidate-profile-modal";
import { ShortlistModal } from "@/components/employer/shortlist-modal";
import { type jobSeekers, type users } from "@/db/schema";
import { type InferSelectModel } from 'drizzle-orm';

type JobSeekerModel = InferSelectModel<typeof jobSeekers>;
type UserModel = InferSelectModel<typeof users>;

export type Candidate = {
  jobSeeker: JobSeekerModel;
  user: UserModel;
  isShortlisted: boolean;
  interactionCount: number;
};

interface ClientSideCandidateListProps {
  candidates: Candidate[];
  employerId: string;
}

export function ClientSideCandidateList({ candidates, employerId }: ClientSideCandidateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const searchMatch = searchTerm.toLowerCase() === '' || 
                          candidate.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          candidate.jobSeeker.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const statusMatch = statusFilter === 'all' ||
                          (statusFilter === 'shortlisted' && candidate.isShortlisted) ||
                          (statusFilter === 'viewed' && candidate.interactionCount > 0 && !candidate.isShortlisted);

      return searchMatch && statusMatch;
    });
  }, [candidates, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search by name or skill..."
              className="pl-10 h-11 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-11 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
          <div className="col-span-4">Candidate</div>
          <div className="col-span-4">Top Skills</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map(candidate => (
            <div key={candidate.jobSeeker.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
              {/* Candidate Info */}
              <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                  {candidate.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{candidate.user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{candidate.user.email}</p>
                </div>
              </div>

              {/* Top Skills */}
              <div className="col-span-12 md:col-span-4">
                <div className="flex flex-wrap gap-2">
                  {candidate.jobSeeker.skills?.slice(0, 3).map(skill => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 max-w-[120px] truncate"
                      title={skill}
                    >
                      {skill}
                    </Badge>
                  ))}
                  {candidate.jobSeeker.skills && candidate.jobSeeker.skills.length > 3 && (
                    <Badge variant="outline" className="border-slate-300 dark:border-slate-600">
                      +{candidate.jobSeeker.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-12 md:col-span-2 text-left md:text-center">
                {candidate.isShortlisted ? (
                  <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/50"><Heart className="h-3 w-3 mr-1" /> Shortlisted</Badge>
                ) : candidate.interactionCount > 0 ? (
                  <Badge variant="outline" className="border-slate-300 dark:border-slate-600"><Eye className="h-3 w-3 mr-1" /> Viewed</Badge>
                ) : (
                  <Badge variant="outline" className="border-slate-300 dark:border-slate-600">New</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 flex justify-start md:justify-end items-center gap-2 text-slate-500 dark:text-slate-400">
                 <CandidateProfileModal
                    candidate={candidate}
                    trigger={ <Button variant="ghost" size="icon" className="hover:bg-slate-200 dark:hover:bg-slate-700"><Eye className="h-5 w-5" /></Button> }
                 />
                 <ShortlistModal
                    candidateId={candidate.jobSeeker.id}
                    candidateName={candidate.user.name || 'Unknown'}
                    trigger={ <Button variant="ghost" size="icon" disabled={candidate.isShortlisted} className="hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"><Heart className="h-5 w-5" /></Button> }
                  />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No candidates found.</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 