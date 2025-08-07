"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Clock } from "lucide-react";
import Link from "next/link";

interface Forum {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  postCount: number;
  lastPostAt: Date | null;
  lastPostAuthor: string | null;
}

interface ForumListProps {
  forums: Forum[];
}

export function ForumList({ forums }: ForumListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(forums.map(f => f.category).filter(Boolean)));

  // Filter forums by selected category
  const filteredForums = selectedCategory 
    ? forums.filter(f => f.category === selectedCategory)
    : forums;

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Forum List */}
      <div className="grid gap-4">
        {filteredForums.map((forum) => (
          <Card key={forum.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/nxt-her/forums/${forum.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {forum.title}
                    </Link>
                  </CardTitle>
                  {forum.description && (
                    <CardDescription>{forum.description}</CardDescription>
                  )}
                  {forum.category && (
                    <Badge variant="secondary">{forum.category}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{forum.postCount}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            {forum.lastPostAt && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last post {forum.lastPostAt.toLocaleDateString()} 
                    {forum.lastPostAuthor && ` by ${forum.lastPostAuthor}`}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredForums.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No forums found in this category.</p>
        </div>
      )}
    </div>
  );
}