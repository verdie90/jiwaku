'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AutomationRule,
  RuleTrigger,
  RuleCondition,
  RuleAction,
} from '@/types';
import { automationService } from '@/services/automation.service';

/**
 * Main hook for automation rules management
 */
export function useAutomation(teamId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch all rules
  const {
    data: rules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['automationRules', teamId],
    queryFn: () => {
      if (!teamId) return Promise.resolve([]);
      return automationService.getAll(teamId);
    },
    enabled: !!teamId,
  });

  // Fetch active rules
  const { data: activeRules = [] } = useQuery({
    queryKey: ['automationRulesActive', teamId],
    queryFn: () => {
      if (!teamId) return Promise.resolve([]);
      return automationService.getActive(teamId);
    },
    enabled: !!teamId,
  });

  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: ({
      name,
      description,
      triggers,
      conditions,
      actions,
      priority,
    }: {
      name: string;
      description: string;
      triggers: RuleTrigger[];
      conditions: RuleCondition[];
      actions: RuleAction[];
      priority?: number;
    }) => {
      if (!teamId) throw new Error('Team ID required');
      return automationService.create(
        teamId,
        name,
        description,
        triggers,
        conditions,
        actions,
        'current-user-id', // Would come from auth context
        priority
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules', teamId] });
    },
  });

  // Update rule mutation
  const updateMutation = useMutation({
    mutationFn: ({ ruleId, updates }: { ruleId: string; updates: Partial<AutomationRule> }) =>
      automationService.update(ruleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules', teamId] });
    },
  });

  // Delete rule mutation
  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) => automationService.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules', teamId] });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (ruleId: string) => automationService.toggleActive(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules', teamId] });
      queryClient.invalidateQueries({ queryKey: ['automationRulesActive', teamId] });
    },
  });

  // Batch update mutation
  const batchUpdateMutation = useMutation({
    mutationFn: ({ ruleIds, isActive }: { ruleIds: string[]; isActive: boolean }) =>
      automationService.batchUpdateStatus(ruleIds, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules', teamId] });
      queryClient.invalidateQueries({ queryKey: ['automationRulesActive', teamId] });
    },
  });

  return {
    rules,
    activeRules,
    isLoading,
    error,
    createRule: createMutation.mutate,
    updateRule: updateMutation.mutate,
    deleteRule: deleteMutation.mutate,
    toggleRuleActive: toggleActiveMutation.mutate,
    batchUpdateRules: batchUpdateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for getting a single rule
 */
export function useAutomationRule(ruleId: string | undefined) {
  const { data: rule, isLoading, error } = useQuery({
    queryKey: ['automationRule', ruleId],
    queryFn: () => {
      if (!ruleId) return Promise.resolve(null);
      return automationService.getById(ruleId);
    },
    enabled: !!ruleId,
  });

  return { rule, isLoading, error };
}

/**
 * Hook for rule execution logs
 */
export function useRuleExecutionLogs(ruleId: string | undefined, limit: number = 50) {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['ruleExecutionLogs', ruleId, limit],
    queryFn: () => {
      if (!ruleId) return Promise.resolve([]);
      return automationService.getExecutionLogs(ruleId, limit);
    },
    enabled: !!ruleId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return { logs, isLoading, error };
}

/**
 * Hook for rule statistics
 */
export function useRuleStatistics(ruleId: string | undefined) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['ruleStatistics', ruleId],
    queryFn: () => {
      if (!ruleId) return Promise.resolve(null);
      return automationService.getStatistics(ruleId);
    },
    enabled: !!ruleId,
  });

  return { stats, isLoading, error };
}

/**
 * Hook for rule builder state management
 */
export function useRuleBuilder() {
  const [triggers, setTriggers] = useState<RuleTrigger[]>([]);
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  const [actions, setActions] = useState<RuleAction[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(5);

  const addTrigger = useCallback((trigger: RuleTrigger) => {
    setTriggers(prev => [...prev, trigger]);
  }, []);

  const removeTrigger = useCallback((index: number) => {
    setTriggers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addCondition = useCallback((condition: RuleCondition) => {
    setConditions(prev => [...prev, condition]);
  }, []);

  const removeCondition = useCallback((index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateCondition = useCallback(
    (index: number, condition: Partial<RuleCondition>) => {
      setConditions(prev =>
        prev.map((cond, i) =>
          i === index ? { ...cond, ...condition } : cond
        )
      );
    },
    []
  );

  const addAction = useCallback((action: RuleAction) => {
    setActions(prev => [...prev, action]);
  }, []);

  const removeAction = useCallback((index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateAction = useCallback(
    (index: number, action: Partial<RuleAction>) => {
      setActions(prev =>
        prev.map((act, i) =>
          i === index ? { ...act, ...action } : act
        )
      );
    },
    []
  );

  const reset = useCallback(() => {
    setTriggers([]);
    setConditions([]);
    setActions([]);
    setName('');
    setDescription('');
    setPriority(5);
  }, []);

  // Validation
  const isValid = useMemo(() => {
    return name.length > 0 && triggers.length > 0 && actions.length > 0;
  }, [name, triggers.length, actions.length]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!name) errs.push('Rule name is required');
    if (triggers.length === 0) errs.push('At least one trigger is required');
    if (actions.length === 0) errs.push('At least one action is required');
    return errs;
  }, [name, triggers.length, actions.length]);

  return {
    triggers,
    conditions,
    actions,
    name,
    description,
    priority,
    setName,
    setDescription,
    setPriority,
    addTrigger,
    removeTrigger,
    addCondition,
    removeCondition,
    updateCondition,
    addAction,
    removeAction,
    updateAction,
    reset,
    isValid,
    errors,
  };
}

/**
 * Hook for rule templates/presets
 */
export function useRuleTemplates() {
  const templates = useMemo(() => ({
    autoAssignHighPriority: {
      name: 'Auto-assign High Priority',
      description: 'Automatically assign high priority tickets to specific agents',
      triggers: [{ type: 'ticket_created' as const }],
      conditions: [
        {
          id: 'priority-condition',
          field: 'priority',
          operator: 'equals' as const,
          value: 'high',
        },
      ],
      actions: [
        {
          type: 'assign' as const,
          targetValue: 'agent-id',
        },
      ],
    },
    autoTagUrgent: {
      name: 'Auto-tag Urgent Tickets',
      description: 'Automatically tag urgent tickets for visibility',
      triggers: [{ type: 'ticket_created' as const }],
      conditions: [
        {
          id: 'sla-condition',
          field: 'sla.status',
          operator: 'equals' as const,
          value: 'at-risk',
        },
      ],
      actions: [
        {
          type: 'add_tag' as const,
          targetValue: 'urgent',
        },
      ],
    },
    slaWarningNotification: {
      name: 'SLA Warning Notification',
      description: 'Send notification when SLA is at risk',
      triggers: [{ type: 'sla_warning' as const }],
      conditions: [],
      actions: [
        {
          type: 'send_notification' as const,
          notificationTemplate: 'sla-warning',
        },
      ],
    },
    autoResolveSpam: {
      name: 'Auto-resolve Spam',
      description: 'Automatically close spam tickets',
      triggers: [{ type: 'tag_added' as const }],
      conditions: [
        {
          id: 'spam-condition',
          field: 'tags',
          operator: 'contains' as const,
          value: 'spam',
        },
      ],
      actions: [
        {
          type: 'set_status' as const,
          targetValue: 'closed',
        },
      ],
    },
  }), []);

  return templates;
}
