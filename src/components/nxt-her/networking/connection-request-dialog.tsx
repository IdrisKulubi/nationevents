"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  organization?: string;
  profilePhotoUrl?: string;
}

interface ConnectionRequestDialogProps {
  attendee: Attendee;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ConnectionRequestDialog({ 
  attendee, 
  trigger, 
  onSuccess 
}: ConnectionRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast.error("Please add a message to your connection request");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/nxt-her/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestedAttendeeId: attendee.id,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send connection request");
      }

      const data = await response.json();
      
      toast.success("Connection request sent successfully!");
      setIsOpen(false);
      setMessage("");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send connection request");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="flex items-center gap-1">
      <MessageCircle className="h-3 w-3" />
      Connect
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" />
            Send Connection Request
          </DialogTitle>
          <DialogDescription>
            Send a personalized message to connect with this attendee.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
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
            <h3 className="font-semibold text-lg">
              {attendee.firstName} {attendee.lastName}
            </h3>
            {(attendee.jobTitle || attendee.organization) && (
              <p className="text-sm text-muted-foreground">
                {attendee.jobTitle}
                {attendee.jobTitle && attendee.organization && " at "}
                {attendee.organization}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Your Message</Label>
          <Textarea
            id="message"
            placeholder="Hi! I'd love to connect with you at the Nxt Her Summit. I'm interested in..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/500 characters
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendRequest}
            disabled={isLoading || !message.trim() || message.length > 500}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}