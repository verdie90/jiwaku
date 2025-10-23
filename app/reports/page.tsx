'use client';

import { Metadata } from 'next';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReportBuilder from '@/components/features/reports/ReportBuilder';

export const metadata: Metadata = {
  title: 'Custom Reports | Jiwaku CRM',
  description: 'Build, execute, and manage custom reports for your team',
};

/**
 * Reports Page
 * Main interface for custom report management and execution
 */
export default function ReportsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [teamId, setTeamId] = useState<string>('');

  useEffect(() => {
    if (!isLoading) {
      if (user?.teamId) {
        setTeamId(user.teamId);
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !teamId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return <ReportBuilder teamId={teamId} />;
}
