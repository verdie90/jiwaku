'use client';

import { useState } from 'react';
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react';
import { APIScope } from '@/types';
import {
  useCreateAPIKey,
  useAPIKeys,
  useDeleteAPIKey,
} from '@/hooks/useIntegration';

interface APIKeyManagerProps {
  teamId: string;
}

const AVAILABLE_SCOPES: { value: APIScope; label: string; description: string }[] = [
  { value: 'reports:read', label: 'Reports', description: 'Read access to reports' },
  { value: 'reports:write', label: 'Reports Write', description: 'Create and modify reports' },
  { value: 'reports:execute', label: 'Reports Execute', description: 'Execute reports' },
  { value: 'reports:export', label: 'Reports Export', description: 'Export reports' },
  { value: 'reports:schedule', label: 'Reports Schedule', description: 'Schedule reports' },
  { value: 'contacts:read', label: 'Contacts', description: 'Read access to contacts' },
  { value: 'contacts:write', label: 'Contacts Write', description: 'Create and modify contacts' },
  { value: 'tickets:read', label: 'Tickets', description: 'Read access to tickets' },
  { value: 'tickets:write', label: 'Tickets Write', description: 'Create and modify tickets' },
  { value: 'tickets:comment', label: 'Tickets Comment', description: 'Comment on tickets' },
  { value: 'tickets:resolve', label: 'Tickets Resolve', description: 'Resolve tickets' },
  { value: 'agents:read', label: 'Agents', description: 'Read access to agents' },
  { value: 'agents:write', label: 'Agents Write', description: 'Create and modify agents' },
  { value: 'webhooks:manage', label: 'Webhooks', description: 'Manage webhooks' },
  { value: 'integrations:read', label: 'Integrations', description: 'Read access to integrations' },
  { value: 'integrations:write', label: 'Integrations Write', description: 'Create and modify integrations' },
  { value: 'admin:full', label: 'Admin', description: 'Full admin access' },
];

export function APIKeyManager({ teamId }: APIKeyManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<APIScope[]>([]);
  const [keyName, setKeyName] = useState('');
  const [expiresIn, setExpiresIn] = useState<string>('30'); // days
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: keys = [], isLoading } = useAPIKeys(teamId);
  const createKey = useCreateAPIKey(teamId);
  const deleteKey = useDeleteAPIKey(teamId);

  const handleCreateKey = async () => {
    if (!keyName || selectedScopes.length === 0) {
      alert('Please enter a name and select at least one scope');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));

    try {
      await createKey.mutateAsync({
        name: keyName,
        scopes: selectedScopes,
        expiresAt,
      });
      setShowForm(false);
      setKeyName('');
      setSelectedScopes([]);
      setExpiresIn('30');
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteKey.mutateAsync(keyId);
    } catch (error) {
      console.error('Failed to delete API key:', error);
      alert('Failed to delete API key');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  const isKeyExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const days = Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Create Key
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create API Key</h3>

            <div className="space-y-4">
              {/* Name Input */}
              <label>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Name
                </span>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production API, Zapier Integration"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </label>

              {/* Expiration */}
              <label>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expires in (days)
                </span>
                <input
                  type="number"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </label>

              {/* Scopes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scopes
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <label key={scope.value} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScopes([...selectedScopes, scope.value]);
                          } else {
                            setSelectedScopes(selectedScopes.filter((s) => s !== scope.value));
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{scope.label}</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setKeyName('');
                  setSelectedScopes([]);
                  setExpiresIn('30');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={createKey.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      {keys.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No API keys yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first API key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => {
            const isExpired = isKeyExpired(key.expiresAt || new Date());
            const daysUntilExpiry = getDaysUntilExpiry(key.expiresAt || new Date());
            const isVisible = visibleKeys.has(key.id);

            return (
              <div
                key={key.id}
                className={`border rounded-lg p-4 ${
                  isExpired
                    ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                } transition`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{key.name}</h3>
                      {isExpired && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                          Expired
                        </span>
                      )}
                      {!isExpired && daysUntilExpiry <= 7 && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded">
                          Expires soon ({daysUntilExpiry}d)
                        </span>
                      )}
                    </div>

                    {/* Key Display */}
                    <div className="mt-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {isVisible && key.key ? key.key : maskKey(key.key || '')}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                          title={isVisible ? 'Hide' : 'Show'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key || '', key.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                          title="Copy"
                        >
                          {copiedKey === key.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Scopes */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {key.scopes?.map((scope) => (
                        <span
                          key={scope}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      Created {new Date(key.createdAt).toLocaleDateString()} •
                      Expires {new Date(key.expiresAt || new Date()).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    disabled={deleteKey.isPending}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition disabled:opacity-50 ml-2"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
