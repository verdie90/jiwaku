'use client';

import React, { useEffect, useState } from 'react';
import PortalDashboard from '@/components/features/portal/PortalDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [portalUserId, setPortalUserId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const redirectRef = React.useRef(false);

  useEffect(() => {
    if (!isLoading) {
      // For demo purposes, use user ID as portal user ID
      if (user?.id) {
        setPortalUserId(user.id);
        setTeamId(user.teamId || 'default-team');
      } else if (!redirectRef.current) {
        redirectRef.current = true;
        // Redirect to login if not authenticated
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !portalUserId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <PortalDashboard
      teamId={teamId}
      portalUserId={portalUserId}
      portalUserName={user?.name || 'Customer'}
      onLogout={() => {
        localStorage.removeItem('auth_token');
        router.push('/login');
      }}
    />
  );
}
