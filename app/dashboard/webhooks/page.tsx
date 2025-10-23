import WebhookSettings from '@/components/features/webhooks/WebhookSettings';

export const metadata = {
  title: 'Webhooks | Jiwaku CRM',
  description: 'Manage webhooks and event subscriptions',
};

export default function WebhooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <WebhookSettings teamId="team-1" />
      </div>
    </div>
  );
}
