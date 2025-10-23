'use client';

import { useState, useEffect } from 'react';
import { useWebhookBuilder, WEBHOOK_EVENTS } from '@/hooks/useWebhooks';
import { WebhookEndpoint } from '@/types';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface WebhookFormProps {
  webhook?: WebhookEndpoint | null;
  onSave: (data: Partial<WebhookEndpoint>) => void;
  onCancel: () => void;
}

export default function WebhookForm({ webhook, onSave, onCancel }: WebhookFormProps) {
  const builder = useWebhookBuilder(webhook || undefined);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    events: true,
    advanced: false,
  });

  useEffect(() => {
    if (webhook) {
      builder.setName(webhook.name);
      builder.setUrl(webhook.url);
      builder.setDescription(webhook.description || '');
      webhook.events.forEach(event => {
        if (!builder.selectedEvents.includes(event)) {
          builder.toggleEvent(event);
        }
      });
      builder.setMaxRetries(webhook.maxRetries);
      builder.setRetryDelaySeconds(webhook.retryDelaySeconds);
      builder.setTimeout(webhook.timeout);
      builder.setRateLimit(webhook.rateLimit);
    }
  }, [webhook]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (builder.validate()) {
      onSave({
        ...builder.getFormData(),
        isActive: webhook?.isActive ?? true,
      });
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const groupedEvents = WEBHOOK_EVENTS.reduce((acc, event) => {
    if (!acc[event.group]) acc[event.group] = [];
    acc[event.group].push(event);
    return acc;
  }, {} as Record<string, typeof WEBHOOK_EVENTS>);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection('basic')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <h3 className="font-medium text-gray-900">Basic Information</h3>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition ${expandedSections.basic ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.basic && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={builder.name}
                onChange={(e) => builder.setName(e.target.value)}
                placeholder="e.g., Customer Support Webhook"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {builder.errors.name && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> {builder.errors.name}
                </p>
              )}
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={builder.url}
                onChange={(e) => builder.setUrl(e.target.value)}
                placeholder="https://api.example.com/webhooks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {builder.errors.url && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> {builder.errors.url}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={builder.description}
                onChange={(e) => builder.setDescription(e.target.value)}
                placeholder="Optional description for this webhook"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection('events')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <h3 className="font-medium text-gray-900">
            Events ({builder.selectedEvents.length} selected)
          </h3>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition ${expandedSections.events ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.events && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
            {Object.entries(groupedEvents).map(([group, events]) => (
              <div key={group}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{group}</h4>
                <div className="space-y-2">
                  {events.map(event => (
                    <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={builder.selectedEvents.includes(event.value)}
                        onChange={() => builder.toggleEvent(event.value)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {builder.errors.events && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} /> {builder.errors.events}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Advanced Section */}
      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection('advanced')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <h3 className="font-medium text-gray-900">Advanced Settings</h3>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition ${expandedSections.advanced ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.advanced && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            {/* Max Retries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Retries
              </label>
              <input
                type="number"
                value={builder.maxRetries}
                onChange={(e) => builder.setMaxRetries(Number(e.target.value))}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {builder.errors.maxRetries && (
                <p className="text-xs text-red-500 mt-1">{builder.errors.maxRetries}</p>
              )}
            </div>

            {/* Retry Delay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retry Delay (seconds)
              </label>
              <input
                type="number"
                value={builder.retryDelaySeconds}
                onChange={(e) => builder.setRetryDelaySeconds(Number(e.target.value))}
                min="1"
                max="3600"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {builder.errors.retryDelaySeconds && (
                <p className="text-xs text-red-500 mt-1">{builder.errors.retryDelaySeconds}</p>
              )}
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (milliseconds)
              </label>
              <input
                type="number"
                value={builder.timeout}
                onChange={(e) => builder.setTimeout(Number(e.target.value))}
                min="1000"
                max="60000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {builder.errors.timeout && (
                <p className="text-xs text-red-500 mt-1">{builder.errors.timeout}</p>
              )}
            </div>

            {/* Rate Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Limit (req/min)
              </label>
              <input
                type="number"
                value={builder.rateLimit}
                onChange={(e) => builder.setRateLimit(Number(e.target.value))}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {builder.errors.rateLimit && (
                <p className="text-xs text-red-500 mt-1">{builder.errors.rateLimit}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={!builder.isValid && builder.selectedEvents.length === 0}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {webhook ? 'Update Webhook' : 'Create Webhook'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
