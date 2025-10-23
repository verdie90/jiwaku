'use client';

import React, { useState } from 'react';
import {
  Plus,
  Settings,
  Trash2,
  TestTube,
  CheckCircle,
  AlertCircle,
  Zap,
  Link2,
  Code,
  Database,
} from 'lucide-react';
import { Integration } from '@/types';
import {
  useIntegrations,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useTestIntegration,
} from '@/hooks/useIntegration';

interface IntegrationManagerProps {
  teamId: string;
}

interface IntegrationTypeInfo {
  id: Integration['type'];
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const INTEGRATION_TYPES: IntegrationTypeInfo[] = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 7000+ apps through Zapier',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and updates to Slack',
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'rest',
    name: 'REST API',
    description: 'Custom REST API integration',
    icon: <Link2 className="w-6 h-6" />,
    color: 'from-green-400 to-green-600',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    description: 'GraphQL API integration',
    icon: <Code className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Receive events via webhooks',
    icon: <Database className="w-6 h-6" />,
    color: 'from-indigo-400 to-indigo-600',
  },
];

export function IntegrationManager({ teamId }: IntegrationManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Integration>>({});

  const { data: integrations = [], isLoading } = useIntegrations(teamId);
  const createIntegration = useCreateIntegration(teamId);
  const updateIntegration = useUpdateIntegration(teamId, editingId || '');
  const deleteIntegration = useDeleteIntegration(teamId);
  const testIntegration = useTestIntegration(teamId, editingId || '');

  const handleCreate = async () => {
    if (!formData.name || !formData.type) return;

    try {
      await createIntegration.mutateAsync({
        teamId,
        name: formData.name,
        type: formData.type,
        config: formData.config || {},
        enabled: true,
      });
      setShowForm(false);
      setFormData({});
    } catch (error) {
      console.error('Failed to create integration:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await updateIntegration.mutateAsync(formData);
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to update integration:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      await deleteIntegration.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const handleTest = async () => {
    if (!editingId) return;

    try {
      const result = await testIntegration.mutateAsync();
      if (result.success) {
        alert('Integration test successful!');
      } else {
        alert('Integration test failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Test failed: ' + String(error));
    }
  };

  const startEdit = (integration: Integration) => {
    setEditingId(integration.id);
    setFormData(integration);
  };

  const getIntegrationTypeInfo = (type: Integration['type']) => {
    return INTEGRATION_TYPES.find((t) => t.id === type);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage third-party integrations and API connections</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Add Integration
        </button>
      </div>

      {/* Form Modal */}
      {(showForm || editingId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Integration' : 'Create Integration'}
            </h3>

            {!editingId ? (
              <div className="space-y-4">
                <label>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </span>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Integration name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </label>

                <label>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </span>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Integration['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select type</option>
                    {INTEGRATION_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Configuration
                  </label>
                  <textarea
                    value={JSON.stringify(formData.config, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, config: JSON.parse(e.target.value) });
                      } catch {
                        // Invalid JSON, keep as is
                      }
                    }}
                    placeholder="Configuration JSON"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                    rows={6}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled ?? false}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
                </label>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({});
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={createIntegration.isPending || updateIntegration.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations List */}
      {integrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No integrations yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first integration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {integrations.map((integration) => {
            const typeInfo = getIntegrationTypeInfo(integration.type);
            return (
              <div
                key={integration.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {typeInfo && (
                      <div className={`p-3 bg-gradient-to-br ${typeInfo.color} rounded-lg text-white`}>
                        {typeInfo.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                        {integration.enabled ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{typeInfo?.name}</p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Created {new Date(integration.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(integration.id);
                        handleTest();
                      }}
                      disabled={testIntegration.isPending}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded-lg transition disabled:opacity-50"
                      title="Test connection"
                    >
                      <TestTube className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => startEdit(integration)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition"
                      title="Edit"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(integration.id)}
                      disabled={deleteIntegration.isPending}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
