"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Power, 
  PowerOff, 
  Eye,
  BarChart3,
  Settings,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { 
  toggleEventStatus, 
  deleteEvent, 
  duplicateEvent 
} from "@/lib/actions/admin-event-actions";
import { toast } from "sonner";

interface EventActionsMenuProps {
  event: any;
}

export function EventActionsMenu({ event }: EventActionsMenuProps) {
  const router = useRouter();
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [duplicateName, setDuplicateName] = useState(`${event.name} (Copy)`);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleStatus = async () => {
    setLoading("toggle");
    try {
      const result = await toggleEventStatus(event.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update event status");
    } finally {
      setLoading(null);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateName.trim()) {
      toast.error("Please enter a name for the duplicate event");
      return;
    }

    setLoading("duplicate");
    try {
      const result = await duplicateEvent(event.id, duplicateName.trim());
      if (result.success) {
        toast.success(result.message);
        setShowDuplicateDialog(false);
        setDuplicateName(`${event.name} (Copy)`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to duplicate event");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    setLoading("delete");
    try {
      const result = await deleteEvent(event.id);
      if (result.success) {
        toast.success(result.message);
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setLoading(null);
    }
  };

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) return "completed";
    if (startDate <= now && endDate >= now) return "live";
    if (startDate > now) return "upcoming";
    return "draft";
  };

  const eventStatus = getEventStatus();
  const canDelete = eventStatus === "draft" || eventStatus === "upcoming";
  const canToggle = eventStatus !== "completed";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Event
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-2"
            onClick={() => setShowDuplicateDialog(true)}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Booths
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Checkpoints
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canToggle && (
            <DropdownMenuItem 
              className="flex items-center gap-2"
              onClick={handleToggleStatus}
              disabled={loading === "toggle"}
            >
              {loading === "toggle" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : event.isActive ? (
                <PowerOff className="h-4 w-4" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              {event.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem 
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duplicate Event Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-blue-600" />
              Duplicate Event
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{event.eventType.replace('_', ' ').toUpperCase()}</Badge>
                <Badge variant="secondary">{new Date(event.startDate).getFullYear()}</Badge>
              </div>
              <div className="font-medium text-blue-900">{event.name}</div>
              <div className="text-sm text-blue-700">{event.venue}</div>
            </div>

            <div>
              <Label htmlFor="duplicateName" className="text-sm font-medium">
                New Event Name
              </Label>
              <Input
                id="duplicateName"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="Enter name for the duplicate event"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dates will be automatically adjusted (1 week later)
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium">What will be copied:</div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>All event details and settings</li>
                    <li>Checkpoints configuration</li>
                    <li>Event will be created as inactive</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDuplicateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDuplicate} 
                disabled={loading === "duplicate"}
                className="flex-1"
              >
                {loading === "duplicate" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  "Duplicate Event"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Event
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{event.eventType.replace('_', ' ').toUpperCase()}</Badge>
                <Badge variant="secondary">{new Date(event.startDate).getFullYear()}</Badge>
              </div>
              <div className="font-medium text-red-900">{event.name}</div>
              <div className="text-sm text-red-700">{event.venue}</div>
              <div className="text-sm text-red-700">
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <div className="font-medium">This action cannot be undone</div>
                  <div className="mt-1">
                    Make sure the event has no associated checkpoints or booths before deleting.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete} 
                disabled={loading === "delete"}
                className="flex-1"
              >
                {loading === "delete" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Event"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 