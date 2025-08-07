"use client";

import { useState, useEffect } from "react";
import { NetworkingProfileForm } from "./networking-profile-form";
import { toast } from "sonner";

interface NetworkingProfileData {
  networkingGoals: string[];
  sector: string;
  region: string;
  interests: string[];
  lookingFor: string[];
  availableFor: string[];
  preferredConnectionTypes: string[];
  isVisible: boolean;
  isNew?: boolean;
}

export function NetworkingProfileClient() {
  const [profileData, setProfileData] = useState<NetworkingProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNetworkingProfile();
  }, []);

  const fetchNetworkingProfile = async () => {
    try {
      const response = await fetch("/api/nxt-her/networking-profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch networking profile");
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching networking profile:", error);
      toast.error("Failed to load networking profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<NetworkingProfileData, "isNew">) => {
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/nxt-her/networking-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save networking profile");
      }

      const result = await response.json();
      
      // Update local state
      setProfileData({ ...data, isNew: false });
      
      toast.success(result.message || "Networking profile saved successfully!");
    } catch (error) {
      console.error("Error saving networking profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save networking profile");
      throw error; // Re-throw to let the form handle it
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // This will be replaced by the Suspense fallback
  }

  return (
    <NetworkingProfileForm
      initialData={profileData || undefined}
      onSubmit={handleSubmit}
      isLoading={isSaving}
    />
  );
}