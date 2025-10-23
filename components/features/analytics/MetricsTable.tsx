'use client';

import { TicketMetrics, AgentMetric } from '@/types';

interface MetricsTableProps {
  metrics: TicketMetrics;
}

export default function MetricsTable({ metrics }: MetricsTableProps) {
  return (
    <div className="space-y-6">
      {/* Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Summary Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              <TableRow label="Total Tickets" value={metrics.totalTickets} />
              <TableRow label="Resolved" value={metrics.resolvedTickets} />
              <TableRow label="Closed" value={metrics.closedTickets} />
              <TableRow 
                label="Avg Resolution Time" 
                value={`${Math.round(metrics.avgResolutionTime / 3600000)}h ${Math.round((metrics.avgResolutionTime % 3600000) / 60000)}m`}
              />
              <TableRow 
                label="Avg Response Time" 
                value={`${Math.round(metrics.avgResponseTime / 3600000)}h`}
              />
              <TableRow label="SLA Compliance" value={`${Math.round(metrics.slaComplianceRate)}%`} />
              <TableRow label="SLA Breaches" value={metrics.slaBreachCount} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Categories */}
      {metrics.topCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Count</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topCategories.map((cat: any, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{cat.category}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-gray-900">{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agent Performance */}
      {metrics.agentPerformance.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Agent Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Agent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Assigned</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Resolved</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">SLA %</th>
                </tr>
              </thead>
              <tbody>
                {metrics.agentPerformance.map((agent: AgentMetric, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{agent.agentName}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-gray-900">{agent.ticketsAssigned}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-green-600">{agent.ticketsResolved}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-blue-600">{Math.round(agent.slaComplianceRate)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {Object.entries(metrics.statusDistribution).map(([status, count]: [string, any]) => (
                <tr key={status} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900 capitalize">{status}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TableRow({ label, value }: { label: string; value: any }) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-3 text-sm font-medium text-gray-700">{label}</td>
      <td className="px-6 py-3 text-sm text-right font-semibold text-gray-900">{value}</td>
    </tr>
  );
}
