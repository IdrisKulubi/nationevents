"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ForumPost {
  id: string;
  title: string | null;
  content: string;
  authorName: string;
  authorProfilePhoto: string | null;
  createdAt: Date;
  isModerated: boolean;
  replyCount: number;
  lastReplyAt: Date | null;
  lastReplyAuthor: string | null;
}

interface ForumPostListProps {
  posts: ForumPost[];
  forumId: string;
  canModerate?: boolean;
}

export function ForumPostList({ posts, forumId, canModerate = false }: ForumPostListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "replies">("newest");

  // Sort posts based on selected criteria
  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "replies":
        return b.replyCount - a.replyCount;
      default:
        return 0;
    }
  });

  const getAuthorInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button
            variant={sortBy === "newest" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("newest")}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === "oldest" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("oldest")}
          >
            Oldest
          </Button>
          <Button
            variant={sortBy === "replies" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("replies")}
          >
            Most Replies
          </Button>
        </div>
        
        <Button asChild>
          <Link href={`/nxt-her/forums/${forumId}/new-post`}>
            New Post
          </Link>
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.authorProfilePhoto || undefined} />
                    <AvatarFallback>
                      {getAuthorInitials(post.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{post.authorName}</span>
                      <span className="text-sm text-muted-foreground">
                        {post.createdAt.toLocaleDateString()}
                      </span>
                      {post.isModerated && canModerate && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Moderated
                        </Badge>
                      )}
                    </div>
                    
                    {post.title && (
                      <h3 className="font-semibold text-lg mb-2">
                        <Link 
                          href={`/nxt-her/forums/${forumId}/posts/${post.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>
                    )}
                    
                    <p className="text-muted-foreground line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.replyCount} replies</span>
                  </div>
                  {post.lastReplyAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last reply {post.lastReplyAt.toLocaleDateString()}
                        {post.lastReplyAuthor && ` by ${post.lastReplyAuthor}`}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/nxt-her/forums/${forumId}/posts/${post.id}`}>
                    View Discussion
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No posts in this forum yet.</p>
          <Button className="mt-4" asChild>
            <Link href={`/nxt-her/forums/${forumId}/new-post`}>
              Start the conversation
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}