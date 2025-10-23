/**
 * Analytics Service
 * 
 * Calculates ticket metrics, KPIs, and generates analytics reports.
 * Handles metric aggregation, trend analysis, and performance tracking.
 */

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {
  TicketMetrics,
  KPIMetric,
  AnalyticsReport,
  TrendData,
  AgentMetric,
} from '@/types';

export class AnalyticsService {
  /**
   * Calculate ticket metrics for a period
   */
  async calculateTicketMetrics(
    teamId: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<TicketMetrics> {
    const db = getFirestore();

    // Query tickets in date range
    const ticketsRef = collection(db, 'teams', teamId, 'tickets');
    const ticketsSnapshot = await getDocs(
      query(
        ticketsRef,
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      )
    );

    const tickets = ticketsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Calculate metrics
    const metrics: TicketMetrics = {
      teamId,
      period,
      startDate,
      endDate,
      totalTickets: tickets.length,
      createdTickets: tickets.length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      closedTickets: tickets.filter(t => t.status === 'closed').length,
      reopenedTickets: 0, // Would need to track reopens
      statusDistribution: this.calculateDistribution(tickets, 'status'),
      priorityDistribution: this.calculateDistribution(tickets, 'priority'),
      avgResolutionTime: this.calculateAvgResolutionTime(tickets),
      avgResponseTime: this.calculateAvgResponseTime(tickets),
      medianResolutionTime: this.calculateMedianResolutionTime(tickets),
      medianResponseTime: this.calculateMedianResponseTime(tickets),
      slaComplianceRate: this.calculateSLACompliance(tickets),
      slaBreachCount: tickets.filter(t => t.sla?.status === 'breached').length,
      topCategories: this.getTopItems(tickets, 'categories', 5) as Array<{ category: string; count: number }>,
      topTags: this.getTopItems(tickets, 'tags', 5) as Array<{ tag: string; count: number }>,
      agentPerformance: await this.calculateAgentMetrics(teamId, tickets),
    };

    return metrics;
  }

  /**
   * Calculate KPI metrics
   */
  async calculateKPIs(teamId: string, metrics: TicketMetrics): Promise<KPIMetric[]> {
    const kpis: KPIMetric[] = [];

    // KPI 1: Average Resolution Time
    kpis.push({
      id: 'kpi-resolution-time',
      teamId,
      name: 'Average Resolution Time',
      description: 'Average time to resolve tickets',
      type: 'time',
      category: 'performance',
      currentValue: metrics.avgResolutionTime,
      previousValue: metrics.avgResolutionTime * 1.1, // Mock previous value
      change: -metrics.avgResolutionTime * 0.1,
      changePercent: -10,
      trend: 'down',
      targetValue: 48 * 3600 * 1000, // 48 hours in ms
      status: metrics.avgResolutionTime <= 48 * 3600 * 1000 ? 'healthy' : 'warning',
      lastCalculatedAt: new Date(),
    });

    // KPI 2: SLA Compliance Rate
    kpis.push({
      id: 'kpi-sla-compliance',
      teamId,
      name: 'SLA Compliance Rate',
      description: 'Percentage of tickets meeting SLA',
      type: 'percentage',
      category: 'sla',
      currentValue: metrics.slaComplianceRate,
      previousValue: metrics.slaComplianceRate - 2,
      change: 2,
      changePercent: (2 / (metrics.slaComplianceRate - 2)) * 100,
      trend: 'up',
      targetValue: 95,
      warningThreshold: 90,
      criticalThreshold: 85,
      status: metrics.slaComplianceRate >= 95 ? 'healthy' : metrics.slaComplianceRate >= 90 ? 'warning' : 'critical',
      lastCalculatedAt: new Date(),
    });

    // KPI 3: Resolution Rate
    const resolutionRate = metrics.totalTickets > 0 
      ? (metrics.resolvedTickets / metrics.totalTickets) * 100 
      : 0;
    
    kpis.push({
      id: 'kpi-resolution-rate',
      teamId,
      name: 'Resolution Rate',
      description: 'Percentage of resolved tickets',
      type: 'percentage',
      category: 'volume',
      currentValue: resolutionRate,
      previousValue: resolutionRate - 5,
      change: 5,
      changePercent: (5 / (resolutionRate - 5)) * 100,
      trend: 'up',
      targetValue: 80,
      status: resolutionRate >= 80 ? 'healthy' : 'warning',
      lastCalculatedAt: new Date(),
    });

    // KPI 4: Average Response Time
    kpis.push({
      id: 'kpi-response-time',
      teamId,
      name: 'Average Response Time',
      description: 'Average time to first response',
      type: 'time',
      category: 'performance',
      currentValue: metrics.avgResponseTime,
      previousValue: metrics.avgResponseTime * 1.05,
      change: -metrics.avgResponseTime * 0.05,
      changePercent: -5,
      trend: 'down',
      targetValue: 2 * 3600 * 1000, // 2 hours in ms
      status: metrics.avgResponseTime <= 2 * 3600 * 1000 ? 'healthy' : 'warning',
      lastCalculatedAt: new Date(),
    });

    // KPI 5: Ticket Volume
    kpis.push({
      id: 'kpi-ticket-volume',
      teamId,
      name: 'Ticket Volume',
      description: 'Total tickets created',
      type: 'count',
      category: 'volume',
      currentValue: metrics.totalTickets,
      previousValue: Math.max(1, metrics.totalTickets - 10),
      change: 10,
      changePercent: (10 / Math.max(1, metrics.totalTickets - 10)) * 100,
      trend: 'up',
      status: 'healthy',
      lastCalculatedAt: new Date(),
    });

    return kpis;
  }

  /**
   * Get trend data for a metric
   */
  async getTrendData(
    teamId: string,
    metric: 'tickets_created' | 'tickets_resolved' | 'avg_resolution_time' | 'sla_compliance',
    days: number = 30
  ): Promise<TrendData[]> {
    const db = getFirestore();
    const trendData: TrendData[] = [];
    let cumulativeTickets = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const ticketsRef = collection(db, 'teams', teamId, 'tickets');
      const snapshot = await getDocs(
        query(
          ticketsRef,
          where('createdAt', '>=', Timestamp.fromDate(date)),
          where('createdAt', '<', Timestamp.fromDate(nextDate))
        )
      );

      const dayTickets = snapshot.docs.length;
      cumulativeTickets += dayTickets;

      let value = dayTickets;
      if (metric === 'tickets_created') {
        value = dayTickets;
      } else if (metric === 'tickets_resolved') {
        value = snapshot.docs.filter((doc: any) => doc.data().status === 'resolved').length;
      }

      trendData.push({
        date,
        value,
        cumulative: cumulativeTickets,
      });
    }

    return trendData;
  }

  /**
   * Generate analytics report
   */
  async generateReport(
    teamId: string,
    startDate: Date,
    endDate: Date,
    userId: string
  ): Promise<AnalyticsReport> {
    const metrics = await this.calculateTicketMetrics(teamId, startDate, endDate, 'month');
    const kpis = await this.calculateKPIs(teamId, metrics);

    const report: AnalyticsReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      name: `Analytics Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      type: 'summary',
      metrics,
      kpis,
      generatedBy: userId,
      generatedAt: new Date(),
      period: {
        startDate,
        endDate,
        label: this.getPeriodLabel(startDate, endDate),
      },
      isPublic: false,
    };

    return report;
  }

  /**
   * Helper: Calculate distribution of values
   */
  private calculateDistribution(
    tickets: any[],
    field: string
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    tickets.forEach(ticket => {
      const value = ticket[field];
      if (value) {
        distribution[value] = (distribution[value] || 0) + 1;
      }
    });

    return distribution;
  }

  /**
   * Helper: Calculate average resolution time
   */
  private calculateAvgResolutionTime(tickets: any[]): number {
    const resolvedTickets = tickets.filter(t => t.resolvedAt && t.createdAt);
    if (resolvedTickets.length === 0) return 0;

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const created = ticket.createdAt instanceof Date ? ticket.createdAt : new Date(ticket.createdAt);
      const resolved = ticket.resolvedAt instanceof Date ? ticket.resolvedAt : new Date(ticket.resolvedAt);
      return sum + (resolved.getTime() - created.getTime());
    }, 0);

    return totalTime / resolvedTickets.length;
  }

  /**
   * Helper: Calculate average response time
   */
  private calculateAvgResponseTime(tickets: any[]): number {
    const respondedTickets = tickets.filter(
      t => t.sla?.respondedAt && t.createdAt
    );
    if (respondedTickets.length === 0) return 0;

    const totalTime = respondedTickets.reduce((sum, ticket) => {
      const created = ticket.createdAt instanceof Date ? ticket.createdAt : new Date(ticket.createdAt);
      const responded = ticket.sla.respondedAt instanceof Date 
        ? ticket.sla.respondedAt 
        : new Date(ticket.sla.respondedAt);
      return sum + (responded.getTime() - created.getTime());
    }, 0);

    return totalTime / respondedTickets.length;
  }

  /**
   * Helper: Calculate median resolution time
   */
  private calculateMedianResolutionTime(tickets: any[]): number {
    const times = tickets
      .filter(t => t.resolvedAt && t.createdAt)
      .map(ticket => {
        const created = ticket.createdAt instanceof Date ? ticket.createdAt : new Date(ticket.createdAt);
        const resolved = ticket.resolvedAt instanceof Date ? ticket.resolvedAt : new Date(ticket.resolvedAt);
        return resolved.getTime() - created.getTime();
      })
      .sort((a, b) => a - b);

    if (times.length === 0) return 0;
    const mid = Math.floor(times.length / 2);
    return times.length % 2 !== 0 ? times[mid] : (times[mid - 1] + times[mid]) / 2;
  }

  /**
   * Helper: Calculate median response time
   */
  private calculateMedianResponseTime(tickets: any[]): number {
    const times = tickets
      .filter(t => t.sla?.respondedAt && t.createdAt)
      .map(ticket => {
        const created = ticket.createdAt instanceof Date ? ticket.createdAt : new Date(ticket.createdAt);
        const responded = ticket.sla.respondedAt instanceof Date 
          ? ticket.sla.respondedAt 
          : new Date(ticket.sla.respondedAt);
        return responded.getTime() - created.getTime();
      })
      .sort((a, b) => a - b);

    if (times.length === 0) return 0;
    const mid = Math.floor(times.length / 2);
    return times.length % 2 !== 0 ? times[mid] : (times[mid - 1] + times[mid]) / 2;
  }

  /**
   * Helper: Calculate SLA compliance rate
   */
  private calculateSLACompliance(tickets: any[]): number {
    if (tickets.length === 0) return 100;
    const compliantTickets = tickets.filter(t => t.sla?.status === 'within').length;
    return (compliantTickets / tickets.length) * 100;
  }

  /**
   * Helper: Get top items
   */
  private getTopItems(
    tickets: any[],
    field: string,
    limit: number = 5
  ): Array<{ [key: string]: string | number }> {
    const itemCounts: Record<string, number> = {};

    tickets.forEach(ticket => {
      const items = ticket[field];
      if (Array.isArray(items)) {
        items.forEach(item => {
          itemCounts[item] = (itemCounts[item] || 0) + 1;
        });
      }
    });

    return Object.entries(itemCounts)
      .map(([item, count]) => ({ [field.slice(0, -1)]: item, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, limit);
  }

  /**
   * Helper: Calculate agent metrics
   */
  private async calculateAgentMetrics(_teamId: string, tickets: any[]): Promise<AgentMetric[]> {
    const agentMetrics: Record<string, AgentMetric> = {};

    tickets.forEach(ticket => {
      if (ticket.assignedAgentId) {
        if (!agentMetrics[ticket.assignedAgentId]) {
          agentMetrics[ticket.assignedAgentId] = {
            agentId: ticket.assignedAgentId,
            agentName: `Agent ${ticket.assignedAgentId}`,
            ticketsAssigned: 0,
            ticketsResolved: 0,
            ticketsClosed: 0,
            avgResolutionTime: 0,
            slaComplianceRate: 0,
          };
        }

        agentMetrics[ticket.assignedAgentId].ticketsAssigned++;

        if (ticket.status === 'resolved') {
          agentMetrics[ticket.assignedAgentId].ticketsResolved++;
        }
        if (ticket.status === 'closed') {
          agentMetrics[ticket.assignedAgentId].ticketsClosed++;
        }
      }
    });

    return Object.values(agentMetrics);
  }

  /**
   * Helper: Get period label
   */
  private getPeriodLabel(startDate: Date, endDate: Date): string {
    const formatDate = (date: Date) => date.toLocaleDateString();
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  /**
   * Get summary statistics
   */
  async getSummaryStats(teamId: string): Promise<{
    totalTickets: number;
    openTickets: number;
    avgResolutionTime: string;
    slaCompliance: number;
  }> {
    const db = getFirestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ticketsRef = collection(db, 'teams', teamId, 'tickets');
    const snapshot = await getDocs(
      query(ticketsRef, where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)))
    );

    const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    const openTickets = tickets.filter(
      t => t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting'
    ).length;

    const avgResolutionMs = this.calculateAvgResolutionTime(tickets);
    const hours = Math.floor(avgResolutionMs / 3600000);
    const minutes = Math.floor((avgResolutionMs % 3600000) / 60000);

    return {
      totalTickets: tickets.length,
      openTickets,
      avgResolutionTime: `${hours}h ${minutes}m`,
      slaCompliance: this.calculateSLACompliance(tickets),
    };
  }
}

export const analyticsService = new AnalyticsService();
