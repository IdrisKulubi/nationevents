"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, CheckCircle } from "lucide-react";

interface Checkpoint {
  id: string;
  name: string;
  location: string;
  checkpointType: string;
  isActive: boolean;
  maxCapacity: number | null;
  currentOccupancy: number;
}

interface CheckpointSelectorProps {
  checkpoints: Checkpoint[];
  assignedCheckpoints: string[];
  securityId: string;
}

export function CheckpointSelector({
  checkpoints,
  assignedCheckpoints,
  securityId,
}: CheckpointSelectorProps) {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null);

  // Filter checkpoints to show only assigned ones or all if none assigned
  const availableCheckpoints = assignedCheckpoints.length > 0 
    ? checkpoints.filter(cp => assignedCheckpoints.includes(cp.id))
    : checkpoints;

  const getCheckpointTypeColor = (type: string) => {
    switch (type) {
      case "entry":
        return "bg-green-100 text-green-800";
      case "exit":
        return "bg-red-100 text-red-800";
      case "booth_area":
        return "bg-blue-100 text-blue-800";
      case "main_hall":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOccupancyStatus = (current: number, max: number | null) => {
    if (!max) return null;
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Checkpoint Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availableCheckpoints.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No checkpoints assigned. Contact administrator for checkpoint assignment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCheckpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCheckpoint === checkpoint.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${!checkpoint.isActive ? "opacity-50" : ""}`}
                onClick={() => setSelectedCheckpoint(
                  selectedCheckpoint === checkpoint.id ? null : checkpoint.id
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{checkpoint.name}</h3>
                    {selectedCheckpoint === checkpoint.id && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Badge 
                      variant="outline" 
                      className={getCheckpointTypeColor(checkpoint.checkpointType)}
                    >
                      {checkpoint.checkpointType.replace('_', ' ')}
                    </Badge>
                    
                    <p className="text-xs text-gray-600">
                      📍 {checkpoint.location}
                    </p>
                    
                    {checkpoint.maxCapacity && (
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        <span className={getOccupancyStatus(checkpoint.currentOccupancy, checkpoint.maxCapacity) ?? ''}>
                          {checkpoint.currentOccupancy}/{checkpoint.maxCapacity}
                        </span>
                      </div>
                    )}
                    
                    <Badge variant={checkpoint.isActive ? "default" : "secondary"}>
                      {checkpoint.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedCheckpoint && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Active Checkpoint:</strong> {
                availableCheckpoints.find(cp => cp.id === selectedCheckpoint)?.name
              }
            </p>
            <p className="text-xs text-blue-600 mt-1">
              All verifications will be logged to this checkpoint.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 