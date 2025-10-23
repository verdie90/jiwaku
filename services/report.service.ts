import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import {
  Report,
  ReportExecution,
  ReportFilter,
  ReportScheduleExecution,
  ReportSettings,
  ReportAccessLog,
  Ticket,
} from "@/types";

/**
 * Custom Reports Service
 * Handles report creation, execution, scheduling, and export
 */
export class ReportService {
  private db = getFirestore();

  // =========================================================================
  // REPORT MANAGEMENT
  // =========================================================================

  /**
   * Get a report by ID
   */
  async getReport(teamId: string, reportId: string): Promise<Report | null> {
    try {
      const docRef = doc(this.db, "teams", teamId, "reports", reportId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return this._convertFirestoreDoc(docSnap.data());
    } catch (error) {
      console.error("Error getting report:", error);
      throw error;
    }
  }

  /**
   * Get all reports for a team
   */
  async getReports(teamId: string, category?: string): Promise<Report[]> {
    try {
      const constraints: any[] = [orderBy("updatedAt", "desc")];

      if (category) {
        constraints.unshift(where("category", "==", category));
      }

      const q = query(collection(this.db, "teams", teamId, "reports"), ...constraints);

      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting reports:", error);
      throw error;
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(teamId: string): Promise<Report[]> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "reports"),
        where("isTemplate", "==", true),
        orderBy("updatedAt", "desc")
      );

      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting report templates:", error);
      throw error;
    }
  }

  /**
   * Create a new report
   */
  async createReport(
    teamId: string,
    report: Omit<Report, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const reportRef = doc(collection(this.db, "teams", teamId, "reports"));
      const newReport: Report = {
        id: reportRef.id,
        ...report,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(reportRef, this._convertToFirestore(newReport));

      return reportRef.id;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }

  /**
   * Update a report
   */
  async updateReport(
    teamId: string,
    reportId: string,
    updates: Partial<Report>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "reports", reportId);

      await updateDoc(
        docRef,
        this._convertToFirestore({
          ...updates,
          updatedAt: new Date(),
        })
      );
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(teamId: string, reportId: string): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "reports", reportId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  }

  /**
   * Duplicate a report from template
   */
  async duplicateReport(
    teamId: string,
    reportId: string,
    newName: string
  ): Promise<string> {
    try {
      const original = await this.getReport(teamId, reportId);
      if (!original) throw new Error("Report not found");

      const newReport: Omit<Report, "id" | "createdAt" | "updatedAt"> = {
        ...original,
        name: newName,
        isTemplate: false,
      };

      return this.createReport(teamId, newReport);
    } catch (error) {
      console.error("Error duplicating report:", error);
      throw error;
    }
  }

  // =========================================================================
  // REPORT EXECUTION & GENERATION
  // =========================================================================

  /**
   * Execute/generate a report
   */
  async executeReport(
    teamId: string,
    reportId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      filterOverrides?: ReportFilter[];
    }
  ): Promise<ReportExecution> {
    try {
      const report = await this.getReport(teamId, reportId);
      if (!report) throw new Error("Report not found");

      const executionRef = doc(collection(this.db, "teams", teamId, "reportExecutions"));

      // Build execution
      const startDate = options?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = options?.endDate || new Date();
      const filters = options?.filterOverrides || report.filters;

      // Fetch data based on report configuration
      const data = await this._fetchReportData(teamId, report, startDate, endDate, filters);

      // Generate summary
      const summary = this._generateSummary(report, data);

      const execution: ReportExecution = {
        id: executionRef.id,
        teamId,
        reportId,
        reportName: report.name,
        generatedAt: new Date(),
        generatedBy: "system",
        startDate,
        endDate,
        data,
        summary,
        status: "completed",
        executionTime: 0,
        rowsProcessed: data.metadata.totalRows,
      };

      await setDoc(executionRef, this._convertToFirestore(execution));

      // Log access
      await this.logAccess(teamId, reportId, execution.id, "view", "view");

      return execution;
    } catch (error) {
      console.error("Error executing report:", error);
      throw error;
    }
  }

  /**
   * Get execution history for a report
   */
  async getExecutionHistory(teamId: string, reportId: string, limit_: number = 50): Promise<ReportExecution[]> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "reportExecutions"),
        where("reportId", "==", reportId),
        orderBy("generatedAt", "desc"),
        limit(limit_)
      );

      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting execution history:", error);
      throw error;
    }
  }

  /**
   * Get a specific execution
   */
  async getExecution(teamId: string, executionId: string): Promise<ReportExecution | null> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "reportExecutions"),
        where("id", "==", executionId),
        limit(1)
      );

      const querySnap = await getDocs(q);
      if (querySnap.empty) return null;

      return this._convertFirestoreDoc(querySnap.docs[0].data());
    } catch (error) {
      console.error("Error getting execution:", error);
      throw error;
    }
  }

  // =========================================================================
  // REPORT EXPORT
  // =========================================================================

  /**
   * Export execution to PDF
   */
  async exportToPDF(teamId: string, executionId: string): Promise<string> {
    try {
      const execution = await this.getExecution(teamId, executionId);
      if (!execution) throw new Error("Execution not found");

      // Generate PDF (placeholder - actual implementation would use a PDF library)
      const pdfUrl = `data:application/pdf;base64,${Buffer.from(JSON.stringify(execution)).toString("base64")}`;

      // Log access
      await this.logAccess(teamId, execution.reportId, executionId, "export", "pdf");

      return pdfUrl;
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      throw error;
    }
  }

  /**
   * Export execution to Excel
   */
  async exportToExcel(teamId: string, executionId: string): Promise<string> {
    try {
      const execution = await this.getExecution(teamId, executionId);
      if (!execution) throw new Error("Execution not found");

      // Generate Excel (placeholder - actual implementation would use a library like xlsx)
      const csvData = this._convertToCSV(execution.data.rows, execution.data.columns);
      const excelUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;

      // Log access
      await this.logAccess(teamId, execution.reportId, executionId, "export", "excel");

      return excelUrl;
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      throw error;
    }
  }

  /**
   * Export execution to CSV
   */
  async exportToCSV(teamId: string, executionId: string): Promise<string> {
    try {
      const execution = await this.getExecution(teamId, executionId);
      if (!execution) throw new Error("Execution not found");

      const csvData = this._convertToCSV(execution.data.rows, execution.data.columns);
      const csvUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;

      // Log access
      await this.logAccess(teamId, execution.reportId, executionId, "export", "csv");

      return csvUrl;
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      throw error;
    }
  }

  /**
   * Export execution to JSON
   */
  async exportToJSON(teamId: string, executionId: string): Promise<string> {
    try {
      const execution = await this.getExecution(teamId, executionId);
      if (!execution) throw new Error("Execution not found");

      const jsonData = JSON.stringify(
        {
          report: execution.reportName,
          generatedAt: execution.generatedAt,
          data: execution.data,
          summary: execution.summary,
        },
        null,
        2
      );

      const jsonUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`;

      // Log access
      await this.logAccess(teamId, execution.reportId, executionId, "export", "json");

      return jsonUrl;
    } catch (error) {
      console.error("Error exporting to JSON:", error);
      throw error;
    }
  }

  // =========================================================================
  // REPORT SCHEDULING
  // =========================================================================

  /**
   * Schedule a report
   */
  async scheduleReport(
    teamId: string,
    reportId: string,
    schedule: any
  ): Promise<void> {
    try {
      await this.updateReport(teamId, reportId, { schedule });
    } catch (error) {
      console.error("Error scheduling report:", error);
      throw error;
    }
  }

  /**
   * Get scheduled executions
   */
  async getScheduledExecutions(teamId: string, reportId?: string, limit_: number = 100): Promise<ReportScheduleExecution[]> {
    try {
      const constraints: any[] = [orderBy("executionTime", "desc"), limit(limit_)];

      if (reportId) {
        constraints.unshift(where("reportId", "==", reportId));
      }

      const q = query(collection(this.db, "teams", teamId, "scheduledExecutions"), ...constraints);

      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting scheduled executions:", error);
      throw error;
    }
  }

  /**
   * Log a scheduled execution
   */
  async logScheduledExecution(
    teamId: string,
    execution: Omit<ReportScheduleExecution, "id">
  ): Promise<string> {
    try {
      const execRef = doc(collection(this.db, "teams", teamId, "scheduledExecutions"));
      const logEntry: ReportScheduleExecution = {
        id: execRef.id,
        ...execution,
      };

      await setDoc(execRef, this._convertToFirestore(logEntry));
      return execRef.id;
    } catch (error) {
      console.error("Error logging scheduled execution:", error);
      throw error;
    }
  }

  // =========================================================================
  // REPORT SETTINGS
  // =========================================================================

  /**
   * Get report settings for a team
   */
  async getReportSettings(teamId: string): Promise<ReportSettings | null> {
    try {
      const docRef = doc(this.db, "teams", teamId, "reportSettings", "config");
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return this._convertFirestoreDoc(docSnap.data());
    } catch (error) {
      console.error("Error getting report settings:", error);
      throw error;
    }
  }

  /**
   * Update report settings
   */
  async updateReportSettings(
    teamId: string,
    settings: Partial<ReportSettings>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "reportSettings", "config");

      await setDoc(
        docRef,
        this._convertToFirestore({
          ...settings,
          updatedAt: new Date(),
        }),
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating report settings:", error);
      throw error;
    }
  }

  // =========================================================================
  // ACCESS LOGGING
  // =========================================================================

  /**
   * Log report access
   */
  async logAccess(
    teamId: string,
    reportId: string,
    executionId: string | undefined,
    action: string,
    format?: string
  ): Promise<void> {
    try {
      const logRef = doc(collection(this.db, "teams", teamId, "reportAccessLogs"));
      const log: ReportAccessLog = {
        id: logRef.id,
        teamId,
        reportId,
        executionId,
        accessedBy: "system",
        accessedAt: new Date(),
        action: action as any,
        format,
        success: true,
      };

      await setDoc(logRef, this._convertToFirestore(log));
    } catch (error) {
      console.error("Error logging access:", error);
      // Don't throw - logging should not break main operations
    }
  }

  /**
   * Get access logs
   */
  async getAccessLogs(teamId: string, reportId?: string, limit_: number = 100): Promise<ReportAccessLog[]> {
    try {
      const constraints: any[] = [orderBy("accessedAt", "desc"), limit(limit_)];

      if (reportId) {
        constraints.unshift(where("reportId", "==", reportId));
      }

      const q = query(collection(this.db, "teams", teamId, "reportAccessLogs"), ...constraints);

      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting access logs:", error);
      throw error;
    }
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  /**
   * Fetch data for a report based on configuration
   */
  private async _fetchReportData(
    teamId: string,
    report: Report,
    startDate: Date,
    endDate: Date,
    filters: ReportFilter[]
  ): Promise<any> {
    // This is a simplified version - in production, this would fetch from actual data sources
    const rows: Record<string, any>[] = [];

    // Determine data source and fetch accordingly
    if (report.category === "tickets" || report.category === "sla") {
      // Fetch tickets data
      const q = query(
        collection(this.db, "teams", teamId, "tickets"),
        where("createdAt", ">=", startDate),
        where("createdAt", "<=", endDate)
      );

      const querySnap = await getDocs(q);
      const tickets = querySnap.docs.map((doc) =>
        this._convertFirestoreDoc(doc.data())
      ) as Ticket[];

      // Apply filters
      const filtered = this._applyFilters(tickets, filters);

      // Build rows with selected metrics
      rows.push(
        ...filtered.map((ticket) => {
          const row: Record<string, any> = {};
          report.metrics.forEach((metric) => {
            row[metric.field] = ticket[metric.field as keyof Ticket];
          });
          return row;
        })
      );
    }

    // Return formatted data
    return {
      rows,
      columns: report.metrics.map((m) => ({
        id: m.id,
        name: m.displayName,
        type: m.format || "string",
        sortable: true,
        filterable: true,
      })),
      metadata: {
        totalRows: rows.length,
        filteredRows: rows.length,
      },
    };
  }

  /**
   * Apply filters to data
   */
  private _applyFilters(data: any[], filters: ReportFilter[]): any[] {
    return data.filter((item) => {
      return filters.every((filter) => {
        const value = item[filter.field];

        switch (filter.operator) {
          case "equals":
            return value === filter.value;
          case "not_equals":
            return value !== filter.value;
          case "contains":
            return String(value).includes(String(filter.value));
          case "greater_than":
            return value > filter.value;
          case "less_than":
            return value < filter.value;
          case "between":
            return value >= filter.rangeStart && value <= filter.rangeEnd;
          default:
            return true;
        }
      });
    });
  }

  /**
   * Generate summary statistics
   */
  private _generateSummary(report: Report, data: any): any {
    const summary: any = {
      totalRecords: data.metadata.totalRows,
      filteredRecords: data.metadata.filteredRows,
    };

    // Calculate metrics
    report.metrics.forEach((metric) => {
      if (metric.type === "sum") {
        summary.sumValues = summary.sumValues || {};
        summary.sumValues[metric.field] = data.rows.reduce(
          (sum: number, row: any) => sum + (parseFloat(row[metric.field]) || 0),
          0
        );
      } else if (metric.type === "average") {
        summary.averageValues = summary.averageValues || {};
        if (data.rows.length > 0) {
          summary.averageValues[metric.field] =
            summary.sumValues?.[metric.field] / data.rows.length || 0;
        }
      }
    });

    // Add key insights
    summary.keyInsights = [
      `Generated ${data.metadata.totalRows} records`,
      `Report covers ${report.metrics.length} metrics`,
    ];

    return summary;
  }

  /**
   * Convert data to CSV format
   */
  private _convertToCSV(rows: Record<string, any>[], columns: any[]): string {
    const headers = columns.map((c) => c.name).join(",");
    const csvRows = rows.map((row) => columns.map((c) => row[c.id]).join(","));

    return [headers, ...csvRows].join("\n");
  }

  /**
   * Convert Firestore document to typed object
   */
  private _convertFirestoreDoc(data: any): any {
    const converted = { ...data };

    Object.keys(converted).forEach((key) => {
      if (converted[key]?.toDate) {
        converted[key] = converted[key].toDate();
      }
    });

    return converted;
  }

  /**
   * Convert object to Firestore-compatible format
   */
  private _convertToFirestore(data: any): any {
    const converted = { ...data };

    Object.keys(converted).forEach((key) => {
      if (converted[key] instanceof Date) {
        converted[key] = Timestamp.fromDate(converted[key]);
      }
    });

    return converted;
  }
}

// Export singleton instance
export const reportService = new ReportService();
