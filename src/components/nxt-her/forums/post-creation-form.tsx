"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, X } from "lucide-react";

interface PostCreationFormProps {
  forumId: string;
  forumTitle: string;
  authorAttendeeId: string;
  onCancel?: () => void;
  isReply?: boolean;
  parentPostId?: string;
  placeholder?: string;
}

export function PostCreationForm({
  forumId,
  forumTitle,
  authorAttendeeId,
  onCancel,
  isReply = false,
  parentPostId,
  placeholder = "Share your thoughts..."
}: PostCreationFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (!isReply && !title.trim()) {
      setError("Title is required for new posts");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/nxt-her/forums/${forumId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: isReply ? null : title.trim(),
          content: content.trim(),
          authorAttendeeId,
          parentPostId: isReply ? parentPostId : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const newPost = await response.json();
      
      // Reset form
      setTitle("");
      setContent("");
      
      if (onCancel) {
        onCancel();
      } else {
        // Redirect to the forum or post page
        if (isReply) {
          router.refresh();
        } else {
          router.push(`/nxt-her/forums/${forumId}/posts/${newPost.id}`);
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isReply ? "Reply to Discussion" : "Start New Discussion"}
        </CardTitle>
        <CardDescription>
          {isReply 
            ? "Share your thoughts on this topic"
            : `Create a new post in ${forumTitle}`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isReply && (
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your post"
                disabled={isSubmitting}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200 characters
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="content">
              {isReply ? "Your Reply" : "Content"}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              disabled={isSubmitting}
              rows={isReply ? 4 : 8}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/5000 characters
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isReply ? "Posting Reply..." : "Creating Post..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isReply ? "Post Reply" : "Create Post"}
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}