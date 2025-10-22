"use client";

import { DashboardLayout } from "./layout.client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground mt-1">
                5 urgent, 8 high priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2m 14s</div>
              <p className="text-xs text-muted-foreground mt-1">
                Better than target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5.0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on 245 surveys
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest conversations and tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">Customer Inquiry #{i}</p>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp · 5 minutes ago
                    </p>
                  </div>
                  <Badge variant="default">Assigned</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Maximize your CRM usage with these quick actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                "Setup WhatsApp Integration",
                "Configure Email Templates",
                "Invite Team Members",
              ].map((item, i) => (
                <button
                  key={i}
                  className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
                >
                  <p className="font-medium text-sm">{item}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get started →
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
