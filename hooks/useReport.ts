import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportService } from "@/services/report.service";
import {
  Report,
  ReportFilter,
  ReportSettings,
} from "@/types";

// ============================================================================
// REPORT MANAGEMENT HOOKS
// ============================================================================

export function useReports(teamId: string, category?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["reports", teamId, category],
    queryFn: () => reportService.getReports(teamId, category),
    enabled: enabled && !!teamId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useReport(teamId: string, reportId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["report", teamId, reportId],
    queryFn: () => reportService.getReport(teamId, reportId),
    enabled: enabled && !!reportId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useReportTemplates(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["report-templates", teamId],
    queryFn: () => reportService.getReportTemplates(teamId),
    enabled: enabled && !!teamId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCreateReport(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (report: Omit<Report, "id" | "createdAt" | "updatedAt">) =>
      reportService.createReport(teamId, report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", teamId] });
    },
  });
}

export function useUpdateReport(teamId: string, reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Report>) =>
      reportService.updateReport(teamId, reportId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", teamId] });
      queryClient.invalidateQueries({ queryKey: ["report", teamId, reportId] });
    },
  });
}

export function useDeleteReport(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) =>
      reportService.deleteReport(teamId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", teamId] });
    },
  });
}

export function useDuplicateReport(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, newName }: { reportId: string; newName: string }) =>
      reportService.duplicateReport(teamId, reportId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", teamId] });
    },
  });
}

// ============================================================================
// REPORT EXECUTION HOOKS
// ============================================================================

export function useExecuteReport(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      options,
    }: {
      reportId: string;
      options?: {
        startDate?: Date;
        endDate?: Date;
        filterOverrides?: ReportFilter[];
      };
    }) => reportService.executeReport(teamId, reportId, options),
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: ["report-executions", teamId] });
      queryClient.setQueryData(
        ["report-execution", teamId, execution.id],
        execution
      );
    },
  });
}

export function useExecutionHistory(
  teamId: string,
  reportId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["report-execution-history", teamId, reportId],
    queryFn: () => reportService.getExecutionHistory(teamId, reportId),
    enabled: enabled && !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useExecution(
  teamId: string,
  executionId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["report-execution", teamId, executionId],
    queryFn: () => reportService.getExecution(teamId, executionId),
    enabled: enabled && !!executionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// REPORT EXPORT HOOKS
// ============================================================================

export function useExportToPDF(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (executionId: string) =>
      reportService.exportToPDF(teamId, executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-access-logs", teamId] });
    },
  });
}

export function useExportToExcel(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (executionId: string) =>
      reportService.exportToExcel(teamId, executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-access-logs", teamId] });
    },
  });
}

export function useExportToCSV(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (executionId: string) =>
      reportService.exportToCSV(teamId, executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-access-logs", teamId] });
    },
  });
}

export function useExportToJSON(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (executionId: string) =>
      reportService.exportToJSON(teamId, executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-access-logs", teamId] });
    },
  });
}

// ============================================================================
// REPORT SCHEDULING HOOKS
// ============================================================================

export function useScheduleReport(teamId: string, reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: any) =>
      reportService.scheduleReport(teamId, reportId, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", teamId, reportId] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-executions", teamId] });
    },
  });
}

export function useScheduledExecutions(
  teamId: string,
  reportId?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["scheduled-executions", teamId, reportId],
    queryFn: () => reportService.getScheduledExecutions(teamId, reportId),
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// REPORT SETTINGS HOOKS
// ============================================================================

export function useReportSettings(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["report-settings", teamId],
    queryFn: () => reportService.getReportSettings(teamId),
    enabled: enabled && !!teamId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useUpdateReportSettings(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<ReportSettings>) =>
      reportService.updateReportSettings(teamId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-settings", teamId] });
    },
  });
}

// ============================================================================
// ACCESS LOGGING HOOKS
// ============================================================================

export function useAccessLogs(
  teamId: string,
  reportId?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["report-access-logs", teamId, reportId],
    queryFn: () => reportService.getAccessLogs(teamId, reportId),
    enabled: enabled && !!teamId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
