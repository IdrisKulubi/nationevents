"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCheck } from "lucide-react";

interface JobSeekerModalProps {
  trigger: React.ReactNode;
}

export function JobSeekerModal({ trigger }: JobSeekerModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Add Job Seeker
          </DialogTitle>
          <DialogDescription>
            Create a new job seeker profile (Feature coming soon)
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center">
          <p className="text-gray-500">This feature will be implemented in a future update.</p>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 