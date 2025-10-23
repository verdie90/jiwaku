'use client';

import { WebhookEndpoint } from '@/types';
import { MoreVertical, Eye, Trash2, Power, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface WebhooksListProps {
  webhooks: WebhookEndpoint[];
  onEdit: (webhook: WebhookEndpoint) => void;
  onDelete: (webhookId: string) => void;
  onToggle: (webhookId: string) => void;
  onView: (webhookId: string) => void;
}

export default function WebhooksList({ webhooks, onEdit, onDelete, onToggle, onView }: WebhooksListProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleDelete = (webhookId: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      onDelete(webhookId);
      setOpenMenu(null);
    }
  };

  if (webhooks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhooks</h2>
      {webhooks.map(webhook => (
        <div
          key={webhook.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 cursor-pointer" onClick={() => onView(webhook.id)}>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{webhook.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    webhook.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 break-all">{webhook.url}</p>
              {webhook.description && (
                <p className="text-sm text-gray-500 mt-1">{webhook.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {webhook.events.slice(0, 3).map(event => (
                  <span key={event} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {event}
                  </span>
                ))}
                {webhook.events.length > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                    +{webhook.events.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative ml-4">
              <button
                onClick={() => setOpenMenu(openMenu === webhook.id ? null : webhook.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>

              {openMenu === webhook.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      onView(webhook.id);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Eye size={16} /> View Details
                  </button>
                  <button
                    onClick={() => {
                      onEdit(webhook);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      onToggle(webhook.id);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Power size={16} /> {webhook.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {webhook.lastTriggeredAt && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
