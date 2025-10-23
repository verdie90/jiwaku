'use client';

import { useTrendData } from '@/hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  teamId: string;
  metric: 'tickets_created' | 'tickets_resolved' | 'avg_resolution_time' | 'sla_compliance';
  label: string;
}

export default function TrendChart({ teamId, metric, label }: TrendChartProps) {
  const { trendData, isLoading } = useTrendData(teamId, metric, 30);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 h-96 flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const chartData = trendData.map(d => ({
    date: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.value,
    cumulative: d.cumulative,
  }));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return metric === 'sla_compliance' ? `${value.toFixed(1)}%` : Math.round(value).toString();
              }
              return value;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name={label}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
