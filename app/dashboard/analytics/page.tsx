import AnalyticsDashboard from '@/components/features/analytics/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics & Reports | Jiwaku CRM',
  description: 'View ticket metrics and performance analytics',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AnalyticsDashboard teamId="team-1" />
      </div>
    </div>
  );
}
