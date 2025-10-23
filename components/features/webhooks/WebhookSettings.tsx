'use client';

import { useState } from 'react';
import { useWebhooks } from '@/hooks/useWebhooks';
import { AlertCircle, Plus } from 'lucide-react';
import WebhookForm from './WebhookForm';
import WebhooksList from './WebhooksList';
import WebhookStats from './WebhookStats';

interface WebhookSettingsProps {
  teamId: string;
}

export default function WebhookSettings({ teamId }: WebhookSettingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const { webhooks, isLoading, error, createWebhook, updateWebhook, deleteWebhook, toggleWebhook } = useWebhooks(teamId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading webhooks...</p>
        </div>
      </div>
    );
  }

  const activeWebhooks = webhooks.filter(w => w.isActive).length;
  const totalDeliveries = webhooks.reduce((sum, w) => sum + (w.metadata?.deliveryCount || 0), 0);
  const selectedWebhook = selectedWebhookId ? webhooks.find(w => w.id === selectedWebhookId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Management</h1>
          <p className="text-gray-600 mt-1">Configure webhooks to receive real-time events</p>
        </div>
        <button
          onClick={() => {
            setSelectedWebhookId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          New Webhook
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <WebhookStats activeWebhooks={activeWebhooks} totalWebhooks={webhooks.length} totalDeliveries={totalDeliveries} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        {showForm && (
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">
                {selectedWebhook ? 'Edit Webhook' : 'Create New Webhook'}
              </h2>
              <WebhookForm
                webhook={selectedWebhook}
                onSave={(data: any) => {
                  if (selectedWebhook) {
                    updateWebhook({ webhookId: selectedWebhook.id, updates: data });
                  } else {
                    createWebhook(data as any);
                  }
                  setShowForm(false);
                  setSelectedWebhookId(null);
                }}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedWebhookId(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Webhooks List Section */}
        <div className={showForm ? 'lg:col-span-1' : 'lg:col-span-3'}>
          <WebhooksList
            webhooks={webhooks}
            onEdit={(webhook: any) => {
              setSelectedWebhookId(webhook.id);
              setShowForm(true);
            }}
            onDelete={deleteWebhook}
            onToggle={toggleWebhook}
            onView={setSelectedWebhookId}
          />
        </div>
      </div>

      {/* Empty State */}
      {webhooks.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks yet</h3>
          <p className="text-gray-600 mb-4">Create your first webhook to start receiving events</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Create Webhook
          </button>
        </div>
      )}
    </div>
  );
}
