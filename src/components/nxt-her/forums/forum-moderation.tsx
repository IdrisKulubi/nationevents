"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostReporting } from "./post-reporting";
import { AlertTriangle, Eye, EyeOff, Trash2, Flag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ModerationAction {
  id: string;
  type: "hide" | "show" | "delete" | "report";
  label: string;
  icon: React.ReactNode;
  variant: "default" | "destructive" | "secondary";
  confirmMessage?: string;
}

interface ForumModerationProps {
  postId: string;
  postAuthor: string;
  isModerated: boolean;
  canModerate: boolean;
  currentAttendeeId: string;
  onModerationAction: (action: string, postId: string) => Promise<void>;
}

export function ForumModeration({ 
  postId, 
  postAuthor,
  isModerated, 
  canModerate,
  currentAttendeeId,
  onModerationAction 
}: ForumModerationProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!canModerate) {
    return (
      <PostReporting
        postId={postId}
        postAuthor={postAuthor}
        reporterAttendeeId={currentAttendeeId}
      />
    );
  }

  const moderationActions: ModerationAction[] = [
    {
      id: "toggle-visibility",
      type: isModerated ? "show" : "hide",
      label: isModerated ? "Show Post" : "Hide Post",
      icon: isModerated ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />,
      variant: "secondary",
      confirmMessage: isModerated 
        ? "Are you sure you want to make this post visible to all users?"
        : "Are you sure you want to hide this post from other users?"
    },
    {
      id: "delete",
      type: "delete",
      label: "Delete Post",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      confirmMessage: "Are you sure you want to permanently delete this post? This action cannot be undone."
    }
  ];

  const handleModerationAction = async (action: ModerationAction) => {
    setIsLoading(true);
    try {
      await onModerationAction(action.type, postId);
    } catch (error) {
      console.error("Moderation action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isModerated && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Hidden
        </Badge>
      )}
      
      {moderationActions.map((action) => (
        <AlertDialog key={action.id}>
          <AlertDialogTrigger asChild>
            <Button 
              variant={action.variant} 
              size="sm" 
              disabled={isLoading}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Moderation Action</AlertDialogTitle>
              <AlertDialogDescription>
                {action.confirmMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleModerationAction(action)}
                className={action.variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              >
                {action.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  );
}