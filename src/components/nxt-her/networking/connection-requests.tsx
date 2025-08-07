"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Send, 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageCircle,
  UserPlus,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Connection {
  id: string;
  status: "pending" | "accepted" | "declined";
  message?: string;
  connectedAt?: string;
  createdAt: string;
  isRequester: boolean;
  otherAttendee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    organization?: string;
    profilePhotoUrl?: string;
  };
}

interface ConnectionCounts {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
}

interface ConnectionRequestsProps {
  onSendRequest?: (attendeeId: string, message?: string) => void;
}

export function ConnectionRequests({ onSendRequest }: ConnectionRequestsProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [counts, setCounts] = useState<ConnectionCounts>({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async (type = "all") => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/nxt-her/connections?type=${type}`);

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();
      setConnections(data.connections);
      setCounts(data.counts);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };

  const respondToConnection = async (connectionId: string, action: "accept" | "decline") => {
    try {
      const response = await fetch("/api/nxt-her/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionId, action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} connection request`);
      }

      const data = await response.json();
      
      // Update local state
      setConnections(prev =>
        prev.map(conn =>
          conn.id === connectionId
            ? { ...conn, status: action === "accept" ? "accepted" : "declined" }
            : conn
        )
      );

      // Update counts
      setCounts(prev => ({
        ...prev,
        pending: prev.pending - 1,
        [action === "accept" ? "accepted" : "declined"]: prev[action === "accept" ? "accepted" : "declined"] + 1,
      }));

      toast.success(`Connection request ${action}ed successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing connection:`, error);
      toast.error(`Failed to ${action} connection request`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "accepted":
        return "bg-green-50 text-green-700 border-green-200";
      case "declined":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filterConnections = (type: string) => {
    switch (type) {
      case "received":
        return connections.filter(conn => !conn.isRequester && conn.status === "pending");
      case "sent":
        return connections.filter(conn => conn.isRequester);
      case "accepted":
        return connections.filter(conn => conn.status === "accepted");
      default:
        return connections;
    }
  };

  if (isLoading) {
    return <ConnectionRequestsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Connection Requests
        </CardTitle>
        <CardDescription>
          Manage your networking connections and requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Received
              {counts.pending > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {counts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Connected
              {counts.accepted > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {counts.accepted}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-6">
            <div className="space-y-4">
              {filterConnections("received").length === 0 ? (
                <div className="text-center py-8">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">
                    You don't have any pending connection requests at the moment.
                  </p>
                </div>
              ) : (
                filterConnections("received").map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={connection.otherAttendee.profilePhotoUrl}
                        alt={`${connection.otherAttendee.firstName} ${connection.otherAttendee.lastName}`}
                      />
                      <AvatarFallback>
                        {connection.otherAttendee.firstName[0]}
                        {connection.otherAttendee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {connection.otherAttendee.firstName} {connection.otherAttendee.lastName}
                          </h4>
                          {(connection.otherAttendee.jobTitle || connection.otherAttendee.organization) && (
                            <p className="text-sm text-muted-foreground">
                              {connection.otherAttendee.jobTitle}
                              {connection.otherAttendee.jobTitle && connection.otherAttendee.organization && " at "}
                              {connection.otherAttendee.organization}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(connection.status)}>
                          {getStatusIcon(connection.status)}
                          <span className="ml-1 capitalize">{connection.status}</span>
                        </Badge>
                      </div>

                      {connection.message && (
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{connection.message}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(connection.createdAt), { addSuffix: true })}
                        </p>
                        
                        {connection.status === "pending" && !connection.isRequester && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => respondToConnection(connection.id, "accept")}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondToConnection(connection.id, "decline")}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {filterConnections("sent").length === 0 ? (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sent requests</h3>
                  <p className="text-muted-foreground">
                    You haven't sent any connection requests yet.
                  </p>
                </div>
              ) : (
                filterConnections("sent").map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={connection.otherAttendee.profilePhotoUrl}
                        alt={`${connection.otherAttendee.firstName} ${connection.otherAttendee.lastName}`}
                      />
                      <AvatarFallback>
                        {connection.otherAttendee.firstName[0]}
                        {connection.otherAttendee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {connection.otherAttendee.firstName} {connection.otherAttendee.lastName}
                          </h4>
                          {(connection.otherAttendee.jobTitle || connection.otherAttendee.organization) && (
                            <p className="text-sm text-muted-foreground">
                              {connection.otherAttendee.jobTitle}
                              {connection.otherAttendee.jobTitle && connection.otherAttendee.organization && " at "}
                              {connection.otherAttendee.organization}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(connection.status)}>
                          {getStatusIcon(connection.status)}
                          <span className="ml-1 capitalize">{connection.status}</span>
                        </Badge>
                      </div>

                      {connection.message && (
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm italic">Your message: "{connection.message}"</p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Sent {formatDistanceToNow(new Date(connection.createdAt), { addSuffix: true })}
                        {connection.connectedAt && (
                          <span className="text-green-600">
                            {" • Connected "}
                            {formatDistanceToNow(new Date(connection.connectedAt), { addSuffix: true })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="accepted" className="mt-6">
            <div className="space-y-4">
              {filterConnections("accepted").length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                  <p className="text-muted-foreground">
                    Your accepted connections will appear here.
                  </p>
                </div>
              ) : (
                filterConnections("accepted").map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-start gap-4 p-4 border rounded-lg bg-green-50/50"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={connection.otherAttendee.profilePhotoUrl}
                        alt={`${connection.otherAttendee.firstName} ${connection.otherAttendee.lastName}`}
                      />
                      <AvatarFallback>
                        {connection.otherAttendee.firstName[0]}
                        {connection.otherAttendee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {connection.otherAttendee.firstName} {connection.otherAttendee.lastName}
                          </h4>
                          {(connection.otherAttendee.jobTitle || connection.otherAttendee.organization) && (
                            <p className="text-sm text-muted-foreground">
                              {connection.otherAttendee.jobTitle}
                              {connection.otherAttendee.jobTitle && connection.otherAttendee.organization && " at "}
                              {connection.otherAttendee.organization}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Connected {formatDistanceToNow(new Date(connection.connectedAt!), { addSuffix: true })}
                        </p>
                        
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ConnectionRequestsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <div className="flex space-x-1 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full mb-3 rounded-lg" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}