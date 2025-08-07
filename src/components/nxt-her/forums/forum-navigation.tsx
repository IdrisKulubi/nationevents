"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ForumNavigationProps {
  forumTitle?: string;
  showBackButton?: boolean;
}

export function ForumNavigation({ forumTitle, showBackButton = false }: ForumNavigationProps) {
  const pathname = usePathname();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/nxt-her/forums">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forums
            </Link>
          </Button>
        )}
        
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/nxt-her/dashboard" className="hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link href="/nxt-her/forums" className="hover:text-foreground flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Forums
          </Link>
          {forumTitle && (
            <>
              <span>/</span>
              <span className="text-foreground">{forumTitle}</span>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}