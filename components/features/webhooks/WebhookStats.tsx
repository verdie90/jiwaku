'use client';

import { CheckCircle2, AlertCircle, Zap, BarChart3 } from 'lucide-react';

interface WebhookStatsProps {
  activeWebhooks: number;
  totalWebhooks: number;
  totalDeliveries: number;
}

export default function WebhookStats({ activeWebhooks, totalWebhooks, totalDeliveries }: WebhookStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Active Webhooks */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Webhooks</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{activeWebhooks}</p>
            <p className="text-xs text-gray-500 mt-1">of {totalWebhooks} total</p>
          </div>
          <CheckCircle2 size={32} className="text-green-500 opacity-50" />
        </div>
      </div>

      {/* Total Webhooks */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Webhooks</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalWebhooks}</p>
            <p className="text-xs text-gray-500 mt-1">Configured</p>
          </div>
          <Zap size={32} className="text-blue-500 opacity-50" />
        </div>
      </div>

      {/* Total Deliveries */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Deliveries</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{totalDeliveries}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <BarChart3 size={32} className="text-purple-500 opacity-50" />
        </div>
      </div>

      {/* Status */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">System Status</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {totalWebhooks > 0 ? 'Running' : 'Idle'}
            </p>
            <p className="text-xs text-green-600 mt-1">✓ All systems operational</p>
          </div>
          <AlertCircle size={32} className="text-green-500 opacity-50" />
        </div>
      </div>
    </div>
  );
}
