"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "./layout.client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";

interface DashboardStats {
  totalConversations: number;
  openTickets: number;
  closedTickets: number;
  avgResponseTime: string;
  satisfaction: number;
  activeAgents: number;
  unreadMessages: number;
  channelBreakdown: {
    whatsapp: number;
    email: number;
    telegram: number;
    other: number;
  };
}

interface RecentActivity {
  id: string;
  title: string;
  channel: string;
  status: string;
  timestamp: Date;
  icon?: string;
}

interface TeamMember {
  id: string;
  name: string;
  status: "online" | "away" | "offline" | "busy";
  role: string;
  avatar?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    openTickets: 0,
    closedTickets: 0,
    avgResponseTime: "0m 0s",
    satisfaction: 0,
    activeAgents: 0,
    unreadMessages: 0,
    channelBreakdown: {
      whatsapp: 0,
      email: 0,
      telegram: 0,
      other: 0,
    },
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from Firestore
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.teamId) {
        setIsLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        setIsLoading(true);
        setError(null);

        // Fetch conversations
        const conversationsRef = collection(db, "conversations");
        const conversationsQuery = query(
          conversationsRef,
          where("teamId", "==", user.teamId)
        );
        const conversationsSnap = await getDocs(conversationsQuery);
        const totalConversations = conversationsSnap.size;

        // Fetch tickets - both open and closed
        const ticketsRef = collection(db, "tickets");
        const openTicketsQuery = query(
          ticketsRef,
          where("teamId", "==", user.teamId),
          where("status", "==", "open")
        );
        const openTicketsSnap = await getDocs(openTicketsQuery);
        const openTickets = openTicketsSnap.size;

        const closedTicketsQuery = query(
          ticketsRef,
          where("teamId", "==", user.teamId),
          where("status", "==", "closed")
        );
        const closedTicketsSnap = await getDocs(closedTicketsQuery);
        const closedTickets = closedTicketsSnap.size;

        // Fetch all team members
        const usersRef = collection(db, "users");
        const teamMembersQuery = query(
          usersRef,
          where("teamId", "==", user.teamId)
        );
        const teamMembersSnap = await getDocs(teamMembersQuery);
        const activeAgents = teamMembersSnap.docs.filter(
          (doc) => doc.data().status !== "offline"
        ).length;

        // Build team members list
        const members: TeamMember[] = teamMembersSnap.docs
          .slice(0, 6)
          .map((doc) => ({
            id: doc.id,
            name: doc.data().name || "Unknown",
            status: doc.data().status || "offline",
            role: doc.data().role || "agent",
          }));
        setTeamMembers(members);

        // Calculate average response time and satisfaction
        let totalResponseTime = 0;
        let responseTimeCount = 0;
        let totalSatisfaction = 0;
        let satisfactionCount = 0;
        let channelBreakdown = { whatsapp: 0, email: 0, telegram: 0, other: 0 };

        conversationsSnap.docs.forEach((doc) => {
          const data = doc.data();
          
          // Channel breakdown
          const channel = data.channel?.toLowerCase() || "other";
          if (channel === "whatsapp") channelBreakdown.whatsapp++;
          else if (channel === "email") channelBreakdown.email++;
          else if (channel === "telegram") channelBreakdown.telegram++;
          else channelBreakdown.other++;

          // Response time
          if (data.lastMessageAt && data.createdAt) {
            const responseTime =
              data.lastMessageAt.toMillis?.() -
              data.createdAt.toMillis?.();
            if (responseTime && responseTime > 0) {
              totalResponseTime += responseTime;
              responseTimeCount++;
            }
          }

          // Satisfaction
          if (data.satisfaction) {
            totalSatisfaction += data.satisfaction;
            satisfactionCount++;
          }
        });

        const avgMs =
          responseTimeCount > 0
            ? Math.floor(totalResponseTime / responseTimeCount)
            : 0;
        const avgMinutes = Math.floor(avgMs / 60000);
        const avgSeconds = Math.floor((avgMs % 60000) / 1000);

        const avgSatisfaction =
          satisfactionCount > 0
            ? Math.round((totalSatisfaction / satisfactionCount) * 10) / 10
            : 0;

        // Fetch recent activities
        const recentConversationsQuery = query(conversationsRef);
        const recentSnap = await getDocs(recentConversationsQuery);
        const activities: RecentActivity[] = [];

        recentSnap.docs.slice(0, 6).forEach((doc) => {
          const data = doc.data();
          const channelEmoji =
            data.channel?.toLowerCase() === "whatsapp"
              ? "💬"
              : data.channel?.toLowerCase() === "email"
              ? "📧"
              : data.channel?.toLowerCase() === "telegram"
              ? "📱"
              : "💭";

          activities.push({
            id: doc.id,
            title: data.contactName || `Conversation`,
            channel: data.channel || "Unknown",
            status: data.status || "active",
            timestamp: data.lastMessageAt?.toDate?.() || new Date(),
            icon: channelEmoji,
          });
        });

        setStats({
          totalConversations,
          openTickets,
          closedTickets,
          avgResponseTime: `${avgMinutes}m ${avgSeconds}s`,
          satisfaction: avgSatisfaction,
          activeAgents,
          unreadMessages: conversationsSnap.docs.filter(
            (doc) => doc.data().unreadCount > 0
          ).length,
          channelBreakdown,
        });

        setRecentActivities(activities);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.teamId]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
      case "active":
        return "default";
      case "closed":
      case "resolved":
        return "secondary";
      case "urgent":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusBg = (status: "online" | "away" | "offline" | "busy") => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-orange-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}! 👋
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Loading dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <p className="text-sm font-medium">Error loading dashboard</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Conversations */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>Conversations</span>
                    <span className="text-xl">💬</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalConversations}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.unreadMessages} unread
                  </p>
                  <div className="mt-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>WhatsApp:</span>
                      <span className="font-medium">
                        {stats.channelBreakdown.whatsapp}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">
                        {stats.channelBreakdown.email}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Open Tickets */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>Open Tickets</span>
                    <span className="text-xl">🎫</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.openTickets}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.closedTickets} closed
                  </p>
                  <div className="mt-3 w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${
                          stats.openTickets +stats.closedTickets > 0
                            ? (stats.openTickets /
                                (stats.openTickets + stats.closedTickets)) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>Avg Response</span>
                    <span className="text-xl">⏱️</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.avgResponseTime}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Team average
                  </p>
                  <div className="mt-3 inline-block px-2 py-1 bg-green-500/20 text-green-700 rounded text-xs font-medium">
                    ✓ Good
                  </div>
                </CardContent>
              </Card>

              {/* Satisfaction */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>Satisfaction</span>
                    <span className="text-xl">⭐</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.satisfaction}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    out of 5.0
                  </p>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(stats.satisfaction) ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Status & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest conversations and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No recent activity yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-lg">{activity.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary">
                                {activity.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.channel} · {formatTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Status</CardTitle>
                    <span className="text-xs font-medium px-2 py-1 bg-green-500/20 text-green-700 rounded">
                      {stats.activeAgents} Active
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No team members
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white text-xs font-bold">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusBg(
                                  member.status
                                )} border-2 border-white`}
                              ></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {member.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and setup options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group cursor-pointer">
                    <span className="text-xl">💬</span>
                    <div className="text-left">
                      <p className="font-medium text-sm group-hover:font-semibold">
                        New Message
                      </p>
                      <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70">
                        Send a message
                      </p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group cursor-pointer">
                    <span className="text-xl">🎫</span>
                    <div className="text-left">
                      <p className="font-medium text-sm group-hover:font-semibold">
                        Create Ticket
                      </p>
                      <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70">
                        New support ticket
                      </p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group cursor-pointer">
                    <span className="text-xl">👥</span>
                    <div className="text-left">
                      <p className="font-medium text-sm group-hover:font-semibold">
                        Team Settings
                      </p>
                      <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70">
                        Manage team
                      </p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}