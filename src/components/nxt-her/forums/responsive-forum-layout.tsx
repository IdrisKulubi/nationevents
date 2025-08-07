"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MessageSquare, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ForumCategory {
  id: string;
  name: string;
  count: number;
}

interface ResponsiveForumLayoutProps {
  children: React.ReactNode;
  categories: ForumCategory[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string | null) => void;
}

export function ResponsiveForumLayout({
  children,
  categories,
  selectedCategory,
  onCategorySelect
}: ResponsiveForumLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Forum Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Forum Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">8 Forums</p>
              <p className="text-sm text-muted-foreground">Active discussions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">247 Members</p>
              <p className="text-sm text-muted-foreground">Participating</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-medium">1,234 Posts</p>
              <p className="text-sm text-muted-foreground">Total discussions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onCategorySelect(null);
                setSidebarOpen(false);
              }}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className="w-full justify-between"
                onClick={() => {
                  onCategorySelect(category.id);
                  setSidebarOpen(false);
                }}
              >
                <span>{category.name}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forum Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Be respectful and professional</p>
          <p>• Stay on topic</p>
          <p>• No spam or self-promotion</p>
          <p>• Use clear, descriptive titles</p>
          <p>• Search before posting</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r bg-muted/10 p-6">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header */}
        <div className="lg:hidden border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Forums</h1>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}