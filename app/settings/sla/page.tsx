"use client";

import { useAuth } from "@/hooks/useAuth";
import SLAManagement from "@/components/features/sla/SLAManagement";

/**
 * SLA Configuration Page
 * Route: /settings/sla
 */
export default function SLAPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading SLA configuration...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect happens in middleware
  }

  return (
    <main className="flex-1">
      <SLAManagement teamId={user.teamId} />
    </main>
  );
}
