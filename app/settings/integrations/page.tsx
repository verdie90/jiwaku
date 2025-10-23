'use client';

import { IntegrationManager } from '@/components/features/integrations/IntegrationManager';
import { APIKeyManager } from '@/components/features/integrations/APIKeyManager';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';
import { useState } from 'react';

export default function IntegrationsPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'integrations' | 'api-keys'>('integrations');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Not authenticated</p>
        </div>
      </div>
    );
  }

  const teamId = user.teamId || 'default';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integration Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect with third-party services and manage API access
          </p>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'integrations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Integrations
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'api-keys'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              API Keys
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {activeTab === 'integrations' && <IntegrationManager teamId={teamId} />}
            {activeTab === 'api-keys' && <APIKeyManager teamId={teamId} />}
          </div>
        </div>
      </div>
    </div>
  );
}
