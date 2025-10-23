'use client';

import { KPIMetric } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPIDashboardProps {
  kpis: KPIMetric[];
}

export default function KPIDashboard({ kpis }: KPIDashboardProps) {
  const groupedKPIs = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.category]) acc[kpi.category] = [];
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<string, KPIMetric[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {category} Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryKPIs.map(kpi => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPIMetric }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = () => {
    if (kpi.trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (kpi.trend === 'down') return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-600" />;
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'percentage') return `${value.toFixed(1)}%`;
    if (type === 'time') return `${Math.round(value / 3600000)}h`;
    if (type === 'average') return value.toFixed(2);
    return Math.round(value).toString();
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(kpi.status)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{kpi.name}</h4>
          {kpi.description && (
            <p className="text-xs text-gray-600 mt-1">{kpi.description}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(kpi.status)}`}>
          {kpi.status}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{formatValue(kpi.currentValue, kpi.type)}</p>
          <p className="text-xs text-gray-600 mt-1">
            Target: {kpi.targetValue ? formatValue(kpi.targetValue, kpi.type) : 'N/A'}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1 mb-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {Math.abs(kpi.changePercent).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-600">vs. previous</p>
        </div>
      </div>
    </div>
  );
}
