# 📚 Jiwaku CRM - Custom Reports Quick Reference Guide

## 🚀 Getting Started

### Access the Reports Page
```
Navigate to: /reports
Authentication required: Yes
```

---

## 💡 Common Tasks

### 1️⃣ Create a New Report

```typescript
// Method 1: Using the UI
- Click "New Report" button
- Fill in report name and description
- Select category
- Add metrics
- Configure filters
- Save

// Method 2: Programmatically
const { mutate: createReport } = useCreateReport(teamId);

createReport({
  name: "Monthly Sales Report",
  description: "Sales metrics for the current month",
  category: "revenue",
  metrics: [
    {
      id: "total-sales",
      name: "Total Sales",
      type: "sum",
      dataSource: "transactions",
      field: "amount"
    },
    {
      id: "transaction-count",
      name: "Transaction Count",
      type: "count",
      dataSource: "transactions",
      field: "id"
    }
  ],
  filters: [
    {
      field: "status",
      operator: "equals",
      value: "completed"
    }
  ],
  chartType: "bar"
});
```

### 2️⃣ Run a Report

```typescript
const { mutate: executeReport, data: result } = useExecuteReport(teamId);

executeReport({
  reportId: "report-abc123",
  options: {
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-31")
  }
});

// Access results
if (result?.data) {
  console.log("Data rows:", result.data.rows);
  console.log("Summary:", result.summary);
}
```

### 3️⃣ Export a Report

```typescript
// Export to PDF
const { mutate: exportPDF } = useExportToPDF(teamId);
exportPDF(executionId);

// Export to Excel
const { mutate: exportExcel } = useExportToExcel(teamId);
exportExcel(executionId);

// Export to CSV
const { mutate: exportCSV } = useExportToCSV(teamId);
exportCSV(executionId);

// Export to JSON
const { mutate: exportJSON } = useExportToJSON(teamId);
exportJSON(executionId);
```

### 4️⃣ Schedule a Report

```typescript
const { mutate: scheduleReport } = useScheduleReport(teamId, reportId);

scheduleReport({
  enabled: true,
  frequency: "weekly",        // daily, weekly, monthly, quarterly, yearly
  dayOfWeek: 1,               // 0-6 (0 = Sunday, 1 = Monday, etc)
  time: "09:00",              // 24-hour format
  timezone: "America/New_York",
  recipients: [
    "manager@company.com",
    "team@company.com"
  ],
  attachmentFormat: "pdf",    // pdf, excel, csv, json
  messageTemplate: "Please find attached your weekly sales report"
});
```

### 5️⃣ View Execution History

```typescript
const { data: history } = useExecutionHistory(teamId, reportId, {
  enabled: true
});

// History auto-refetches every 30 seconds
history?.forEach((execution) => {
  console.log(`Executed: ${execution.executedAt}`);
  console.log(`Status: ${execution.status}`);     // completed, failed, pending
  console.log(`Rows: ${execution.rowsProcessed}`);
});
```

### 6️⃣ View Audit Trail

```typescript
const { data: logs } = useAccessLogs(teamId, reportId, { enabled: true });

logs?.forEach((log) => {
  console.log(`User: ${log.userId}`);
  console.log(`Action: ${log.action}`);           // view, download, export
  console.log(`Format: ${log.format}`);
  console.log(`IP: ${log.ipAddress}`);
  console.log(`Success: ${log.success}`);
});
```

### 7️⃣ Use Report Templates

```typescript
// Get available templates
const { data: templates } = useReportTemplates(teamId);

// Duplicate a template to create new report
const { mutate: duplicateReport } = useDuplicateReport(teamId);

duplicateReport({
  reportId: templateId,
  newName: "My Custom Monthly Report"
});
```

---

## 🎨 Chart Types

| Chart Type | Best For | Example |
|-----------|----------|---------|
| **Line** | Trends over time | Sales growth over months |
| **Bar** | Category comparisons | Support by department |
| **Pie** | Part-to-whole | Market share breakdown |
| **Doughnut** | Alternative pie display | Customer segments |
| **Area** | Cumulative trends | Ticket volume over time |
| **Scatter** | Correlation analysis | Response time vs priority |
| **Table** | Detailed data | Complete transaction list |
| **Heatmap** | Multi-dimensional | Performance matrix |

---

## 🔍 Filter Operators

| Operator | Syntax | Example |
|----------|--------|---------|
| **equals** | `field = value` | status = "open" |
| **contains** | `field ~ value` | title ~ "urgent" |
| **between** | `field [v1, v2]` | created_date [2025-10-01, 2025-10-31] |
| **greater_than** | `field > value` | priority > 2 |
| **less_than** | `field < value` | response_time < 60 |
| **in** | `field in [v1, v2]` | status in ["open", "pending"] |
| **not_equals** | `field ≠ value` | status ≠ "closed" |
| **not_contains** | `field ∼ value` | title ∼ "spam" |

---

## 📊 Metric Types

| Type | Calculation | Use Case |
|------|------------|----------|
| **count** | Row count | Number of tickets |
| **sum** | Total of field | Total revenue |
| **average** | Mean value | Average response time |
| **percentage** | Value/Total % | Market share % |
| **duration** | Time difference | Ticket resolution time |
| **rate** | Change over period | Growth rate |
| **custom** | User-defined formula | Business logic |

---

## ⏱️ Scheduling Frequencies

| Frequency | Description | Example Time |
|-----------|-------------|---------------|
| **daily** | Every day | 09:00 AM |
| **weekly** | Specific day each week | Every Monday at 09:00 AM |
| **monthly** | Same day each month | 1st of month at 09:00 AM |
| **quarterly** | Every 3 months | Start of quarter at 09:00 AM |
| **yearly** | Annual report | Anniversary date at 09:00 AM |

---

## 🔧 Advanced Configuration

### Custom Report Settings

```typescript
const { mutate: updateSettings } = useUpdateReportSettings(teamId);

updateSettings({
  teamId: teamId,
  enabled: true,
  maxReports: 100,
  allowedExportFormats: ["pdf", "excel", "csv", "json"],
  maxScheduledReports: 50,
  retentionDays: 90  // Keep report data for 90 days
});
```

### Chart Configuration

```typescript
chartConfig: {
  title: "Monthly Sales Trends",
  subtitle: "October 2025 Performance",
  xAxisLabel: "Month",
  yAxisLabel: "Sales ($)",
  showLegend: true,
  showGridlines: true,
  colors: ["#3b82f6", "#ef4444", "#10b981"],
  stacking: false,
  animation: true
}
```

### Report Filters

```typescript
filters: [
  {
    field: "status",
    operator: "equals",
    value: "open",
    logicalOperator: "AND"
  },
  {
    field: "priority",
    operator: "greater_than",
    value: 1,
    logicalOperator: "AND"
  },
  {
    field: "created_date",
    operator: "between",
    value: ["2025-10-01", "2025-10-31"]
  }
]
```

---

## 📋 Report Categories

| Category | Description | Typical Metrics |
|----------|-------------|-----------------|
| **tickets** | Support ticket metrics | Count, response time, satisfaction |
| **agents** | Agent performance | Workload, resolution rate, efficiency |
| **customers** | Customer analytics | Satisfaction, churn, LTV |
| **sla** | SLA compliance | Adherence %, violations, trends |
| **revenue** | Financial metrics | Total sales, average deal, pipeline |
| **custom** | User-defined | Any business metric |

---

## 🐛 Troubleshooting

### Report Won't Execute
```
Problem: Report execution times out or fails
Solution:
1. Check date range (too wide may cause slowness)
2. Reduce number of filters
3. Check Firestore quota
4. Verify data exists for filters
```

### Export Not Working
```
Problem: Export button inactive or fails
Solution:
1. Report must be executed first
2. Check available disk space
3. Verify export format is enabled
4. Try different format
```

### Scheduling Not Triggering
```
Problem: Scheduled reports not executing
Solution:
1. Verify schedule is enabled (enabled: true)
2. Check timezone setting
3. Confirm recipients email format
4. Review execution history for errors
```

### Performance Issues
```
Problem: Report execution is slow
Solution:
1. Reduce data range
2. Limit number of rows returned
3. Reduce filters
4. Check Firestore performance
5. Contact support for optimization
```

---

## 🔐 Privacy & Security

- **Data Isolation**: Reports scoped to team ID
- **Audit Logging**: All access logged with IP
- **User Verification**: Authentication required
- **Export Tracking**: Format and user logged
- **Retention**: Data kept per policy (default 90 days)

---

## 📞 Support

### Getting Help
1. Check documentation: `/docs/reports`
2. Review examples: GitHub/examples
3. Contact support: support@jiwaku.com
4. Open issue: GitHub issues

### Common Questions

**Q: Can I schedule a report to multiple recipients?**
A: Yes, use the `recipients` array with multiple email addresses.

**Q: How often can I execute a report?**
A: As often as needed. API rate limiting applies.

**Q: Can I export a report without viewing it first?**
A: No, reports must be executed first to generate data.

**Q: What's the maximum report size?**
A: Depends on export format. PDF: 50MB, Excel: 100MB, CSV: 200MB.

**Q: Can I create reports from templates?**
A: Yes, use `useDuplicateReport()` to clone templates.

---

**Last Updated**: October 23, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
