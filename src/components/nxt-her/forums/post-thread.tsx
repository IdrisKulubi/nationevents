"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostCreationForm } from "./post-creation-form";
import { ForumModeration } from "./forum-moderation";
import { MessageSquare, Reply, Clock, AlertTriangle } from "lucide-react";

interface PostReply {
  id: string;
  content: string;
  authorName: string;
  authorProfilePhoto: string | null;
  createdAt: Date;
  isModerated: boolean;
}

interface PostThreadProps {
  post: {
    id: string;
    title: string | null;
    content: string;
    authorName: string;
    authorProfilePhoto: string | null;
    createdAt: Date;
    isModerated: boolean;
  };
  replies: PostReply[];
  forumId: string;
  forumTitle: string;
  currentAttendeeId: string;
  canModerate?: boolean;
  onModerationAction: (action: string, postId: string) => Promise<void>;
}

export function PostThread({
  post,
  replies,
  forumId,
  forumTitle,
  currentAttendeeId,
  canModerate = false,
  onModerationAction
}: PostThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("oldest");

  const getAuthorInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Sort replies based on selected criteria
  const sortedReplies = [...replies].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Original Post */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.authorProfilePhoto || undefined} />
                <AvatarFallback>
                  {getAuthorInitials(post.authorName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{post.authorName}</span>
                  <span className="text-sm text-muted-foreground">
                    {post.createdAt.toLocaleDateString()} at{" "}
                    {post.createdAt.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {post.isModerated && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Moderated
                    </Badge>
                  )}
                </div>
                
                {post.title && (
                  <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                )}
                
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            </div>
            
            <ForumModeration
              postId={post.id}
              postAuthor={post.authorName}
              isModerated={post.isModerated}
              canModerate={canModerate}
              currentAttendeeId={currentAttendeeId}
              onModerationAction={onModerationAction}
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{replies.length} replies</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {showReplyForm && (
        <PostCreationForm
          forumId={forumId}
          forumTitle={forumTitle}
          authorAttendeeId={currentAttendeeId}
          isReply={true}
          parentPostId={post.id}
          placeholder="Write your reply..."
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {/* Replies Section */}
      {replies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
            </h2>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortBy === "oldest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("oldest")}
              >
                Oldest First
              </Button>
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("newest")}
              >
                Newest First
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {sortedReplies.map((reply, index) => (
              <Card key={reply.id} className="ml-8">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={reply.authorProfilePhoto || undefined} />
                        <AvatarFallback>
                          {getAuthorInitials(reply.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{reply.authorName}</span>
                          <span className="text-sm text-muted-foreground">
                            {reply.createdAt.toLocaleDateString()} at{" "}
                            {reply.createdAt.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {reply.isModerated && canModerate && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Moderated
                            </Badge>
                          )}
                        </div>
                        
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                    
                    <ForumModeration
                      postId={reply.id}
                      postAuthor={reply.authorName}
                      isModerated={reply.isModerated}
                      canModerate={canModerate}
                      currentAttendeeId={currentAttendeeId}
                      onModerationAction={onModerationAction}
                    />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}