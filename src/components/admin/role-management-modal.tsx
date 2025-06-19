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
import { UserCog } from "lucide-react";

interface RoleManagementModalProps {
  trigger: React.ReactNode;
}

export function RoleManagementModal({ trigger }: RoleManagementModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-purple-600" />
            Assign Role
          </DialogTitle>
          <DialogDescription>
            Assign or change user roles (Feature coming soon)
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