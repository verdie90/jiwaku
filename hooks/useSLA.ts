import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slaService } from "@/services/sla.service";
import {
  SLAPolicy,
  SLAEmailTemplate,
  SLAMetrics,
  SLAConfiguration,
  EscalationRule,
  Ticket,
} from "@/types";

// ============================================================================
// SLA POLICY HOOKS
// ============================================================================

export function useSLAPolicies(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-policies", teamId],
    queryFn: () => slaService.getSLAPolicies(teamId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSLAPolicy(teamId: string, policyId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-policy", teamId, policyId],
    queryFn: () => slaService.getSLAPolicy(teamId, policyId),
    enabled: enabled && !!policyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSLAPolicy(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policy: Omit<SLAPolicy, "id" | "createdAt" | "updatedAt">) =>
      slaService.createSLAPolicy(teamId, policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-policies", teamId] });
    },
  });
}

export function useUpdateSLAPolicy(teamId: string, policyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<SLAPolicy>) =>
      slaService.updateSLAPolicy(teamId, policyId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-policies", teamId] });
      queryClient.invalidateQueries({ queryKey: ["sla-policy", teamId, policyId] });
    },
  });
}

export function useDeleteSLAPolicy(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, deletedBy }: { policyId: string; deletedBy: string }) =>
      slaService.deleteSLAPolicy(teamId, policyId, deletedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-policies", teamId] });
    },
  });
}

export function useToggleSLAPolicyStatus(teamId: string, policyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enabled, updatedBy }: { enabled: boolean; updatedBy: string }) =>
      slaService.toggleSLAPolicyStatus(teamId, policyId, enabled, updatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-policies", teamId] });
      queryClient.invalidateQueries({ queryKey: ["sla-policy", teamId, policyId] });
    },
  });
}

// ============================================================================
// ESCALATION RULES HOOKS
// ============================================================================

export function useEscalationRules(teamId: string, policyId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["escalation-rules", teamId, policyId],
    queryFn: () => slaService.getEscalationRules(teamId, policyId),
    enabled: enabled && !!policyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddEscalationRule(teamId: string, policyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: Omit<EscalationRule, "id" | "createdAt">) =>
      slaService.addEscalationRule(teamId, policyId, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules", teamId, policyId] });
      queryClient.invalidateQueries({ queryKey: ["sla-policies", teamId] });
    },
  });
}

export function useUpdateEscalationRule(teamId: string, policyId: string, ruleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<EscalationRule>) =>
      slaService.updateEscalationRule(teamId, policyId, ruleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules", teamId, policyId] });
    },
  });
}

export function useDeleteEscalationRule(teamId: string, policyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) =>
      slaService.deleteEscalationRule(teamId, policyId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules", teamId, policyId] });
    },
  });
}

// ============================================================================
// EMAIL TEMPLATE HOOKS
// ============================================================================

export function useSLAEmailTemplates(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-email-templates", teamId],
    queryFn: () => slaService.getEmailTemplates(teamId),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSLAEmailTemplate(teamId: string, templateId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-email-template", teamId, templateId],
    queryFn: () => slaService.getEmailTemplate(teamId, templateId),
    enabled: enabled && !!templateId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useEmailTemplatesByTrigger(teamId: string, triggerType: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-email-templates-trigger", teamId, triggerType],
    queryFn: () => slaService.getTemplatesByTrigger(teamId, triggerType),
    enabled: enabled && !!triggerType,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateSLAEmailTemplate(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Omit<SLAEmailTemplate, "id" | "createdAt" | "updatedAt">) =>
      slaService.createEmailTemplate(teamId, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-email-templates", teamId] });
    },
  });
}

export function useUpdateSLAEmailTemplate(teamId: string, templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<SLAEmailTemplate>) =>
      slaService.updateEmailTemplate(teamId, templateId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-email-templates", teamId] });
      queryClient.invalidateQueries({ queryKey: ["sla-email-template", teamId, templateId] });
    },
  });
}

export function useDeleteSLAEmailTemplate(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      slaService.deleteEmailTemplate(teamId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-email-templates", teamId] });
    },
  });
}

// ============================================================================
// SLA METRICS HOOKS
// ============================================================================

export function useSLAMetricsForTicket(teamId: string, ticketId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-metrics", teamId, ticketId],
    queryFn: () => slaService.getSLAMetricsForTicket(teamId, ticketId),
    enabled: enabled && !!ticketId,
    staleTime: 2 * 60 * 1000, // 2 minutes - update frequently
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useCreateSLAMetrics(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticket, policy }: { ticket: Ticket; policy: SLAPolicy }) =>
      slaService.createSLAMetrics(teamId, ticket, policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-metrics", teamId] });
    },
  });
}

export function useUpdateSLAMetrics(teamId: string, metricsId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<SLAMetrics>) =>
      slaService.updateSLAMetrics(teamId, metricsId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-metrics", teamId] });
    },
  });
}

export function useCheckAndUpdateSLAStatus(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) =>
      slaService.checkAndUpdateSLAStatus(teamId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-metrics", teamId] });
    },
  });
}

// ============================================================================
// ESCALATION HANDLING HOOKS
// ============================================================================

export function useTriggerEscalations(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, policyId }: { ticketId: string; policyId: string }) =>
      slaService.triggerEscalations(teamId, ticketId, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-metrics", teamId] });
    },
  });
}

// ============================================================================
// SLA CONFIGURATION HOOKS
// ============================================================================

export function useSLAConfiguration(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-configuration", teamId],
    queryFn: () => slaService.getSLAConfiguration(teamId),
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - relatively static
  });
}

export function useUpdateSLAConfiguration(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ config, updatedBy }: { config: Partial<SLAConfiguration>; updatedBy: string }) =>
      slaService.updateSLAConfiguration(teamId, config, updatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-configuration", teamId] });
    },
  });
}

// ============================================================================
// SLA DASHBOARD & REPORTING HOOKS
// ============================================================================

export function useSLADashboardStats(
  teamId: string,
  startDate?: Date,
  endDate?: Date,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["sla-dashboard-stats", teamId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => slaService.getSLADashboardStats(teamId, startDate, endDate),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
}

// ============================================================================
// AUDIT LOGGING HOOKS
// ============================================================================

export function useAuditLogs(teamId: string, limit_: number = 100, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sla-audit-logs", teamId, limit_],
    queryFn: () => slaService.getAuditLogs(teamId, limit_),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
