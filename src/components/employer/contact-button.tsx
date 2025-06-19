"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface ContactButtonProps {
  email?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function ContactButton({ email, size = "sm", className }: ContactButtonProps) {
  const handleContact = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <Button 
      variant="outline" 
      size={size}
      onClick={handleContact}
      disabled={!email}
      className={className}
    >
      <Mail className="h-4 w-4 mr-2" />
      Contact
    </Button>
  );
} 