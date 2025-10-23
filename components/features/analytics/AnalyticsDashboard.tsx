'use client';

import { useState } from 'react';
import { useTicketMetrics, useKPIMetrics, useSummaryStats, useDateRange, PREDEFINED_RANGES } from '@/hooks/useAnalytics';
import { Calendar, AlertCircle } from 'lucide-react';
import StatisticsCards from './StatisticsCards';
import KPIDashboard from './KPIDashboard';
import TrendChart from './TrendChart';
import MetricsTable from './MetricsTable';

interface AnalyticsDashboardProps {
  teamId: string;
}

export default function AnalyticsDashboard({ teamId }: AnalyticsDashboardProps) {
  const { dateRange, period, setPeriod, customStart, setCustomStart, customEnd, setCustomEnd } = useDateRange('month');
  const { stats, isLoading: statsLoading } = useSummaryStats(teamId);
  const { metrics, isLoading: metricsLoading, error: metricsError } = useTicketMetrics(
    teamId,
    dateRange.startDate,
    dateRange.endDate,
    true
  );
  const { kpis, isLoading: kpisLoading } = useKPIMetrics(teamId, metrics);
  const [activeView, setActiveView] = useState<'overview' | 'kpis' | 'trends' | 'details'>('overview');

  const isLoading = statsLoading || metricsLoading || kpisLoading;

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Ticket metrics and performance insights</p>
        </div>
      </div>

      {/* Error Alert */}
      {metricsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Analytics</h3>
            <p className="text-sm text-red-700">{metricsError.message}</p>
          </div>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-gray-600" />
          <span className="font-medium text-gray-900">Period</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {PREDEFINED_RANGES.map(range => (
            <button
              key={range.period}
              onClick={() => setPeriod(range.period)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                period === range.period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStart?.toISOString().split('T')[0] || ''}
                onChange={e => setCustomStart(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEnd?.toISOString().split('T')[0] || ''}
                onChange={e => setCustomEnd(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <StatisticsCards stats={stats} isLoading={statsLoading} />

      {/* View Selector */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['overview', 'kpis', 'trends', 'details'] as const).map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeView === view
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* View Content */}
      <div>
        {activeView === 'overview' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricsOverview metrics={metrics} />
            </div>
          </div>
        )}

        {activeView === 'kpis' && kpis.length > 0 && (
          <KPIDashboard kpis={kpis} />
        )}

        {activeView === 'trends' && (
          <div className="space-y-6">
            <TrendChart teamId={teamId} metric="tickets_created" label="Tickets Created" />
            <TrendChart teamId={teamId} metric="tickets_resolved" label="Tickets Resolved" />
            <TrendChart teamId={teamId} metric="sla_compliance" label="SLA Compliance Rate" />
          </div>
        )}

        {activeView === 'details' && metrics && (
          <MetricsTable metrics={metrics} />
        )}
      </div>
    </div>
  );
}

// Helper Component: Metrics Overview
function MetricsOverview({ metrics }: { metrics: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Total Tickets</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalTickets}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Resolved</p>
        <p className="text-3xl font-bold text-green-600 mt-1">{metrics.resolvedTickets}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Avg Resolution Time</p>
        <p className="text-3xl font-bold text-blue-600 mt-1">
          {Math.round(metrics.avgResolutionTime / 3600000)}h
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">SLA Compliance</p>
        <p className="text-3xl font-bold text-purple-600 mt-1">{Math.round(metrics.slaComplianceRate)}%</p>
      </div>
    </div>
  );
}
