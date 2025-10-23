'use client';

import { BarChart3, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface StatisticsCardsProps {
  stats: {
    totalTickets: number;
    openTickets: number;
    avgResolutionTime: string;
    slaCompliance: number;
  };
  isLoading: boolean;
}

export default function StatisticsCards({ stats, isLoading }: StatisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Tickets */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Tickets (30d)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalTickets}</p>
          </div>
          <BarChart3 size={32} className="text-blue-500 opacity-50" />
        </div>
      </div>

      {/* Open Tickets */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Open Tickets</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{stats.openTickets}</p>
          </div>
          <TrendingUp size={32} className="text-orange-500 opacity-50" />
        </div>
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Avg Resolution Time</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.avgResolutionTime}</p>
          </div>
          <Clock size={32} className="text-green-500 opacity-50" />
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">SLA Compliance</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{Math.round(stats.slaCompliance)}%</p>
          </div>
          <CheckCircle2 size={32} className="text-purple-500 opacity-50" />
        </div>
      </div>
    </div>
  );
}
