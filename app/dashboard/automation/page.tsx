import { AutomationRules } from '@/components/features/automation/AutomationRules';

export default function AutomationPage() {
  // In real app, get teamId from auth/params
  const teamId = 'team-001';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AutomationRules teamId={teamId} />
    </div>
  );
}
