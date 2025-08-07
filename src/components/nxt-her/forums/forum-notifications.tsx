"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, MessageSquare, Reply, User } from "lucide-react";
import Link from "next/link";

interface ForumNotification {
  id: string;
  type: "new_post" | "new_reply" | "mention";
  title: string;
  message: string;
  forumId: string;
  forumTitle: string;
  postId?: string;
  authorName: string;
  createdAt: Date;
  isRead: boolean;
}

interface ForumNotificationsProps {
  attendeeId: string;
  className?: string;
}

export function ForumNotifications({ attendeeId, className }: ForumNotificationsProps) {
  const [notifications, setNotifications] = useState<ForumNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [attendeeId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/nxt-her/forums/notifications?attendeeId=${attendeeId}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      // Transform API response to match our interface
      const transformedNotifications: ForumNotification[] = data.map((item: any) => ({
        id: item.id,
        type: item.type as "new_post" | "new_reply" | "mention",
        title: item.title,
        message: item.message,
        forumId: item.forumId,
        forumTitle: item.forumTitle,
        postId: item.postId,
        authorName: item.authorName,
        createdAt: new Date(item.createdAt),
        isRead: item.isRead,
      }));
      
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to empty array on error
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/nxt-her/forums/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeId,
          notificationIds: [notificationId],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const response = await fetch('/api/nxt-her/forums/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeId,
          notificationIds: unreadIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: ForumNotification["type"]) => {
    switch (type) {
      case "new_post":
        return <MessageSquare className="h-4 w-4" />;
      case "new_reply":
        return <Reply className="h-4 w-4" />;
      case "mention":
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Forum Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Forum Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <BellOff className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>
          Stay updated on forum discussions and replies
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No forum notifications yet
          </p>
        ) : (
          <div className="space-y-3">
            {displayNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? "bg-muted/20 border-muted" 
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${
                    notification.isRead ? "bg-muted" : "bg-primary/10"
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{notification.forumTitle}</span>
                        <span>•</span>
                        <span>{notification.createdAt.toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.postId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Link href={`/nxt-her/forums/${notification.forumId}/posts/${notification.postId}`}>
                              View
                            </Link>
                          </Button>
                        )}
                        
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show all ${notifications.length} notifications`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}