# 📊 Analytics System - Quick Start Guide

## Quick Navigation

### Access the Dashboard
Navigate to: **`/dashboard/analytics`**

### Key Screens

| Screen | Path | Purpose |
|--------|------|---------|
| Overview | `/dashboard/analytics` | Metrics & KPIs at a glance |
| Detailed View | Trends tab | 30-day trend charts |
| Agent Performance | Details tab | Individual agent metrics |

---

## 🔧 Common Tasks

### Get Ticket Metrics

```typescript
import { useTicketMetrics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { metrics, isLoading, error } = useTicketMetrics(
    'team-123',
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Total: {metrics?.totalTickets}</p>
      <p>Resolved: {metrics?.resolvedTickets}</p>
      <p>Avg Time: {metrics?.avgResolutionTime} ms</p>
    </div>
  );
}
```

### Get KPI Status

```typescript
import { useKPIMetrics, useKPIStatus } from '@/hooks/useAnalytics';

function KPIView() {
  const { metrics } = useTicketMetrics(teamId, start, end);
  const { kpis } = useKPIMetrics(teamId, metrics);
  const { overall, healthy, warning, critical } = useKPIStatus(kpis);

  return (
    <div>
      <p>Overall Status: {overall}</p> {/* 'healthy' | 'warning' | 'critical' */}
      <p>Healthy: {healthy} | Warning: {warning} | Critical: {critical}</p>
    </div>
  );
}
```

### Generate Report

```typescript
import { analyticsService } from '@/services/analytics.service';

async function generateMonthlyReport() {
  const report = await analyticsService.generateReport(
    'team-123',
    new Date(2025, 9, 1),
    new Date(2025, 9, 30),
    'user-456'
  );

  console.log('Metrics:', report.metrics);
  console.log('KPIs:', report.kpis);
}
```

### Get Trend Data

```typescript
import { useTrendData } from '@/hooks/useAnalytics';

function TrendView() {
  const { trendData, isLoading } = useTrendData(
    'team-123',
    'tickets_created', // or: 'tickets_resolved', 'sla_compliance', 'avg_resolution_time'
    30 // days
  );

  // Format: [{ date: '2025-01-01', value: 5, cumulative: 5 }, ...]
  return <LineChart data={trendData} />;
}
```

### Get Summary Stats

```typescript
import { useSummaryStats } from '@/hooks/useAnalytics';

function Summary() {
  const { stats, refetch } = useSummaryStats('team-123');

  return (
    <div>
      <p>Last 30 days: {stats?.totalTickets} tickets</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

---

## 📊 Key Metrics Reference

### Time Metrics (in milliseconds)
```typescript
avgResolutionTime    // Average time to resolve (ms)
avgResponseTime      // Average first response time (ms)
medianResolutionTime // Median resolution time (ms)
medianResponseTime   // Median response time (ms)

// Convert to hours: ms / (1000 * 60 * 60)
```

### Percentages
```typescript
slaComplianceRate // SLA met percentage (0-100)
```

### Distributions
```typescript
statusDistribution // { open: 5, in_progress: 3, waiting: 2, ... }
priorityDistribution // { low: 2, medium: 8, high: 4, urgent: 1 }
```

### Top Items
```typescript
topCategories // [{ category: 'Bug', count: 15 }, ...]
topTags // [{ tag: 'urgent', count: 8 }, ...]
```

### Agent Performance
```typescript
agentPerformance // [
//   {
//     agentId: 'user-123',
//     agentName: 'John Doe',
//     ticketsAssigned: 10,
//     ticketsResolved: 8,
//     avgResolutionTime: 123456789,
//     slaComplianceRate: 95
//   },
//   ...
// ]
```

---

## 🎯 KPI Reference

### Available KPIs (5 Total)

| KPI | Type | Target | Category |
|-----|------|--------|----------|
| Avg Resolution Time | Time | 48h | Performance |
| SLA Compliance | % | 95% | SLA |
| Resolution Rate | % | 80% | Volume |
| Avg Response Time | Time | 2h | Performance |
| Ticket Volume | Count | - | Volume |

### KPI Status

```typescript
// Status is calculated based on thresholds:
'healthy'  // Within target
'warning'  // Approaching threshold
'critical' // Below threshold
```

### KPI Properties

```typescript
{
  id: 'kpi-1',
  name: 'SLA Compliance Rate',
  currentValue: 92.5,
  previousValue: 90,
  change: 2.5,
  changePercent: 2.78,
  trend: 'up', // 'up' | 'down' | 'stable'
  status: 'healthy', // 'healthy' | 'warning' | 'critical'
  targetValue: 95
}
```

---

## 📈 Trend Data

### Metric Types

```typescript
'tickets_created'    // Daily ticket creation count
'tickets_resolved'   // Daily tickets resolved
'sla_compliance'     // Daily SLA compliance %
'avg_resolution_time' // Daily avg resolution time
```

### Trend Data Format

```typescript
[
  {
    date: '2025-01-01',
    value: 5,
    cumulative: 5
  },
  {
    date: '2025-01-02',
    value: 8,
    cumulative: 13
  },
  // ... 30 days total
]
```

---

## 🗓️ Date Range

### Predefined Ranges

```typescript
useDateRange('today')      // Current day
useDateRange('yesterday')  // Previous day
useDateRange('last_7')     // Last 7 days
useDateRange('last_30')    // Last 30 days (default)
useDateRange('last_90')    // Last 90 days
useDateRange('last_year')  // Last 12 months
useDateRange('custom')     // User-defined range
```

### Custom Range

```typescript
const { dateRange, setCustomRange } = useDateRange('last_30');

// Update range:
setCustomRange(
  new Date(2025, 0, 1),  // Start
  new Date(2025, 0, 31)   // End
);
```

---

## 🔌 Service Methods (Advanced)

### Direct Service Usage

```typescript
import { analyticsService } from '@/services/analytics.service';

// Calculate metrics
const metrics = await analyticsService.calculateTicketMetrics(
  teamId,
  startDate,
  endDate,
  'month'
);

// Calculate KPIs
const kpis = await analyticsService.calculateKPIs(teamId, metrics);

// Get trends
const trends = await analyticsService.getTrendData(
  teamId,
  'tickets_created',
  30
);

// Generate report
const report = await analyticsService.generateReport(
  teamId,
  startDate,
  endDate,
  userId
);

// Get summary
const summary = await analyticsService.getSummaryStats(teamId);
```

---

## 🎨 Component Reference

### AnalyticsDashboard
Main container with:
- Date range selector
- View mode tabs
- Statistics display
- KPI grid
- Trend charts
- Details tables

```tsx
<AnalyticsDashboard />
```

### StatisticsCards
Quick stats display:
```tsx
<StatisticsCards metrics={metrics} isLoading={isLoading} />
```

### KPIDashboard
KPI visualization:
```tsx
<KPIDashboard kpis={kpis} isLoading={isLoading} />
```

### TrendChart
Line chart component:
```tsx
<TrendChart 
  data={trendData} 
  metric="tickets_created"
  isLoading={isLoading}
/>
```

### MetricsTable
Detailed tables:
```tsx
<MetricsTable metrics={metrics} isLoading={isLoading} />
```

---

## 🐛 Troubleshooting

### "No data available"
- ✅ Check team ID is correct
- ✅ Verify date range contains data
- ✅ Ensure tickets exist in Firestore

### "Query timeout"
- ✅ Use shorter date ranges
- ✅ Check Firestore indexing
- ✅ Try with fewer metrics

### "NaN or undefined values"
- ✅ Verify metrics calculation
- ✅ Check for empty ticket list
- ✅ Validate date formats

---

## 📞 Support

For issues:
1. Check TypeScript errors: `npm run type-check`
2. Verify Firestore connection
3. Review console for React Query errors
4. Check analytics service logs

---

**Last Updated**: Oct 22, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
