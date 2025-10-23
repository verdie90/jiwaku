/**
 * Analytics Hooks
 * 
 * Custom React hooks for analytics queries and data management using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
  TicketMetrics,
  KPIMetric,
  TrendData,
  AnalyticsDateRange,
} from '@/types';
import { analyticsService } from '@/services/analytics.service';

/**
 * Hook for ticket metrics
 */
export const useTicketMetrics = (
  teamId: string,
  startDate: Date,
  endDate: Date,
  enabled: boolean = true
) => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['ticketMetrics', teamId, startDate, endDate],
    queryFn: () => analyticsService.calculateTicketMetrics(teamId, startDate, endDate),
    enabled: !!teamId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { metrics: metrics || null, isLoading, error: error as Error | null };
};

/**
 * Hook for KPI metrics
 */
export const useKPIMetrics = (teamId: string, metrics: TicketMetrics | null) => {
  const { data: kpis, isLoading, error } = useQuery({
    queryKey: ['kpis', teamId, metrics?.startDate, metrics?.endDate],
    queryFn: () => (metrics ? analyticsService.calculateKPIs(teamId, metrics) : Promise.resolve([])),
    enabled: !!teamId && !!metrics,
    staleTime: 5 * 60 * 1000,
  });

  return { kpis: kpis || [], isLoading, error: error as Error | null };
};

/**
 * Hook for trend data
 */
export const useTrendData = (
  teamId: string,
  metric: 'tickets_created' | 'tickets_resolved' | 'avg_resolution_time' | 'sla_compliance',
  days: number = 30,
  enabled: boolean = true
) => {
  const { data: trendData, isLoading, error } = useQuery({
    queryKey: ['trendData', teamId, metric, days],
    queryFn: () => analyticsService.getTrendData(teamId, metric, days),
    enabled: !!teamId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return { trendData: trendData || [], isLoading, error: error as Error | null };
};

/**
 * Hook for analytics report
 */
export const useAnalyticsReport = (
  teamId: string,
  startDate: Date,
  endDate: Date,
  userId: string,
  enabled: boolean = false
) => {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['analyticsReport', teamId, startDate, endDate],
    queryFn: () => analyticsService.generateReport(teamId, startDate, endDate, userId),
    enabled: !!teamId && enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return { report: report || null, isLoading, error: error as Error | null };
};

/**
 * Hook for summary statistics
 */
export const useSummaryStats = (teamId: string) => {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['summaryStats', teamId],
    queryFn: () => analyticsService.getSummaryStats(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    stats: stats || { totalTickets: 0, openTickets: 0, avgResolutionTime: '0h 0m', slaCompliance: 0 },
    isLoading,
    error: error as Error | null,
    refetch,
  };
};

/**
 * Hook for date range management
 */
export const useDateRange = (initialPeriod: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  const [period, setPeriod] = useState<AnalyticsDateRange['period']>(initialPeriod);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  const dateRange = useMemo(() => {
    let startDate: Date;
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'yesterday':
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'custom':
        if (!customStart || !customEnd) {
          throw new Error('Custom date range requires start and end dates');
        }
        startDate = customStart;
        endDate = customEnd;
        break;

      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
    }

    return {
      period,
      startDate,
      endDate,
      label: getPeriodLabel(period, startDate, endDate),
    };
  }, [period, customStart, customEnd]);

  return {
    dateRange,
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
  };
};

/**
 * Hook for KPI status tracking
 */
export const useKPIStatus = (kpis: KPIMetric[]) => {
  const stats = useMemo(() => {
    const healthy = kpis.filter(k => k.status === 'healthy').length;
    const warning = kpis.filter(k => k.status === 'warning').length;
    const critical = kpis.filter(k => k.status === 'critical').length;

    return {
      healthy,
      warning,
      critical,
      total: kpis.length,
      overallStatus: critical > 0 ? 'critical' : warning > 0 ? 'warning' : 'healthy',
    };
  }, [kpis]);

  return stats;
};

/**
 * Hook for chart data preparation
 */
export const useChartData = (trendData: TrendData[], label: string) => {
  const chartConfig = useMemo(() => {
    if (trendData.length === 0) {
      return {
        type: 'line' as const,
        title: label,
        labels: [],
        datasets: [],
      };
    }

    const labels = trendData.map(d =>
      d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const data = trendData.map(d => d.value);

    return {
      type: 'line' as const,
      title: label,
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [trendData, label]);

  return chartConfig;
};

/**
 * Hook for multi-metric comparison
 */
export const useMetricComparison = (
  teamId: string,
  metric: 'tickets_created' | 'tickets_resolved' | 'avg_resolution_time' | 'sla_compliance',
  days: number = 30
) => {
  const currentData = useTrendData(teamId, metric, days);
  const previousData = useTrendData(teamId, metric, days * 2);

  const comparison = useMemo(() => {
    if (!currentData.trendData || !previousData.trendData) {
      return { change: 0, changePercent: 0, trend: 'stable' as const };
    }

    const currentSum = currentData.trendData.reduce((sum, d) => sum + d.value, 0);
    const previousSum = previousData.trendData.slice(0, days).reduce((sum, d) => sum + d.value, 0);

    const change = currentSum - previousSum;
    const changePercent = previousSum > 0 ? (change / previousSum) * 100 : 0;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    return { change, changePercent, trend };
  }, [currentData.trendData, previousData.trendData, days]);

  return { ...currentData, comparison };
};

/**
 * Helper: Get period label
 */
function getPeriodLabel(
  period: string,
  startDate: Date,
  endDate: Date
): string {
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const labels: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'Last 7 days',
    month: 'Last 30 days',
    quarter: 'Last 90 days',
    year: 'Last 365 days',
  };

  if (labels[period]) {
    return labels[period];
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Predefined date ranges
 */
export const PREDEFINED_RANGES = [
  { label: 'Today', period: 'today' as const },
  { label: 'Yesterday', period: 'yesterday' as const },
  { label: 'Last 7 days', period: 'week' as const },
  { label: 'Last 30 days', period: 'month' as const },
  { label: 'Last 90 days', period: 'quarter' as const },
  { label: 'Last Year', period: 'year' as const },
  { label: 'Custom', period: 'custom' as const },
];
