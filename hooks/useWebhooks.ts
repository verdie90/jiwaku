/**
 * Webhook Hooks
 * 
 * Custom React hooks for managing webhooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  WebhookEndpoint,
  WebhookEventType,
} from '@/types';
import { webhookService } from '@/services/webhook.service';

/**
 * Main hook for webhook management (CRUD)
 */
export const useWebhooks = (teamId: string) => {
  const queryClient = useQueryClient();

  // Query all webhooks
  const { data: webhooks = [], isLoading, error } = useQuery({
    queryKey: ['webhooks', teamId],
    queryFn: () => webhookService.getTeamWebhooks(teamId),
    enabled: !!teamId,
    staleTime: 30000, // 30 seconds
  });

  // Create webhook
  const createMutation = useMutation({
    mutationFn: (data: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt'>) =>
      webhookService.createWebhook(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', teamId] });
    },
  });

  // Update webhook
  const updateMutation = useMutation({
    mutationFn: ({ webhookId, updates }: { webhookId: string; updates: Partial<WebhookEndpoint> }) =>
      webhookService.updateWebhook(teamId, webhookId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', teamId] });
      queryClient.invalidateQueries({ queryKey: ['webhook'] });
    },
  });

  // Delete webhook
  const deleteMutation = useMutation({
    mutationFn: (webhookId: string) => webhookService.deleteWebhook(teamId, webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', teamId] });
    },
  });

  // Toggle webhook
  const toggleMutation = useMutation({
    mutationFn: (webhookId: string) => webhookService.toggleWebhook(teamId, webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', teamId] });
    },
  });

  return {
    webhooks,
    isLoading,
    error: error as Error | null,
    createWebhook: createMutation.mutate,
    updateWebhook: updateMutation.mutate,
    deleteWebhook: deleteMutation.mutate,
    toggleWebhook: toggleMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
};

/**
 * Hook for single webhook query
 */
export const useWebhook = (teamId: string, webhookId: string | null) => {
  const { data: webhook, isLoading, error } = useQuery({
    queryKey: ['webhook', teamId, webhookId],
    queryFn: () => webhookId ? webhookService.getWebhookById(teamId, webhookId) : null,
    enabled: !!teamId && !!webhookId,
    staleTime: 30000,
  });

  return { webhook: webhook || null, isLoading, error: error as Error | null };
};

/**
 * Hook for webhook delivery history
 */
export const useWebhookDeliveryHistory = (
  teamId: string,
  webhookId: string,
  limit: number = 50,
  autoRefresh: boolean = false
) => {
  const { data: deliveries = [], isLoading, error } = useQuery({
    queryKey: ['webhookDeliveries', teamId, webhookId],
    queryFn: () => webhookService.getDeliveryHistory(teamId, webhookId, limit),
    enabled: !!teamId && !!webhookId,
    staleTime: autoRefresh ? 0 : 30000,
    refetchInterval: autoRefresh ? 5000 : undefined, // Auto-refresh every 5s if enabled
  });

  return { deliveries, isLoading, error: error as Error | null };
};

/**
 * Hook for webhook statistics
 */
export const useWebhookStats = (teamId: string, webhookId: string) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['webhookStats', teamId, webhookId],
    queryFn: () => webhookService.getWebhookStats(teamId, webhookId),
    enabled: !!teamId && !!webhookId,
    staleTime: 60000, // 1 minute
  });

  return {
    stats: stats || {
      totalDeliveries: 0,
      successCount: 0,
      failedCount: 0,
      retryingCount: 0,
      successRate: 0,
      lastDelivery: null,
    },
    isLoading,
    error: error as Error | null,
  };
};

/**
 * Hook for webhook testing
 */
export const useWebhookTest = (teamId: string, webhookId: string | null) => {
  const queryClient = useQueryClient();

  const testMutation = useMutation({
    mutationFn: async () => {
      if (!webhookId) throw new Error('Webhook ID is required');
      return webhookService.verifyWebhook(teamId, webhookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhookDeliveries', teamId, webhookId] });
      queryClient.invalidateQueries({ queryKey: ['webhookStats', teamId, webhookId] });
    },
  });

  return {
    testWebhook: testMutation.mutate,
    isTesting: testMutation.isPending,
    result: testMutation.data || null,
    error: testMutation.error as Error | null,
  };
};

/**
 * Hook for webhook builder (form state management)
 */
export const useWebhookBuilder = (initialWebhook?: WebhookEndpoint | null) => {
  const [name, setName] = useState(initialWebhook?.name || '');
  const [url, setUrl] = useState(initialWebhook?.url || '');
  const [description, setDescription] = useState(initialWebhook?.description || '');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>(initialWebhook?.events || []);
  const [maxRetries, setMaxRetries] = useState(initialWebhook?.maxRetries || 3);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState(initialWebhook?.retryDelaySeconds || 5);
  const [timeout, setTimeout] = useState(initialWebhook?.timeout || 30000);
  const [rateLimit, setRateLimit] = useState(initialWebhook?.rateLimit || 60);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!url.trim()) newErrors.url = 'URL is required';
    else if (!isValidUrl(url)) newErrors.url = 'Invalid URL format';
    if (selectedEvents.length === 0) newErrors.events = 'Select at least one event';
    if (maxRetries < 0 || maxRetries > 10) newErrors.maxRetries = 'Retries must be between 0 and 10';
    if (retryDelaySeconds < 1 || retryDelaySeconds > 3600) newErrors.retryDelaySeconds = 'Delay must be between 1 and 3600 seconds';
    if (timeout < 1000 || timeout > 60000) newErrors.timeout = 'Timeout must be between 1000 and 60000 ms';
    if (rateLimit < 1 || rateLimit > 1000) newErrors.rateLimit = 'Rate limit must be between 1 and 1000';

    setErrors(newErrors);
    const isFormValid = Object.keys(newErrors).length === 0;
    setIsValid(isFormValid);
    return isFormValid;
  }, [name, url, selectedEvents, maxRetries, retryDelaySeconds, timeout, rateLimit]);

  // Toggle event selection
  const toggleEvent = useCallback((event: WebhookEventType) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setName('');
    setUrl('');
    setDescription('');
    setSelectedEvents([]);
    setMaxRetries(3);
    setRetryDelaySeconds(5);
    setTimeout(30000);
    setRateLimit(60);
    setErrors({});
    setIsValid(false);
  }, []);

  return {
    name,
    setName,
    url,
    setUrl,
    description,
    setDescription,
    selectedEvents,
    toggleEvent,
    maxRetries,
    setMaxRetries,
    retryDelaySeconds,
    setRetryDelaySeconds,
    timeout,
    setTimeout,
    rateLimit,
    setRateLimit,
    isValid,
    errors,
    validate,
    reset,
    getFormData: () => ({
      name,
      url,
      description,
      events: selectedEvents,
      maxRetries,
      retryDelaySeconds,
      timeout,
      rateLimit,
    }),
  };
};

/**
 * Helper: Validate URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Get all available webhook events
 */
export const WEBHOOK_EVENTS: Array<{ value: WebhookEventType; label: string; group: string }> = [
  // Ticket events
  { value: 'ticket.created', label: 'Ticket Created', group: 'Tickets' },
  { value: 'ticket.updated', label: 'Ticket Updated', group: 'Tickets' },
  { value: 'ticket.status_changed', label: 'Status Changed', group: 'Tickets' },
  { value: 'ticket.priority_changed', label: 'Priority Changed', group: 'Tickets' },
  { value: 'ticket.assigned', label: 'Assigned', group: 'Tickets' },
  { value: 'ticket.commented', label: 'Commented', group: 'Tickets' },
  { value: 'ticket.resolved', label: 'Resolved', group: 'Tickets' },
  { value: 'ticket.closed', label: 'Closed', group: 'Tickets' },
  // Contact events
  { value: 'contact.created', label: 'Contact Created', group: 'Contacts' },
  { value: 'contact.updated', label: 'Contact Updated', group: 'Contacts' },
  { value: 'contact.deleted', label: 'Contact Deleted', group: 'Contacts' },
  // Conversation events
  { value: 'conversation.started', label: 'Conversation Started', group: 'Conversations' },
  { value: 'conversation.ended', label: 'Conversation Ended', group: 'Conversations' },
  // Automation events
  { value: 'automation_rule.executed', label: 'Rule Executed', group: 'Automation' },
  { value: 'automation_rule.failed', label: 'Rule Failed', group: 'Automation' },
  // Message events
  { value: 'message.received', label: 'Message Received', group: 'Messages' },
  { value: 'message.sent', label: 'Message Sent', group: 'Messages' },
  // SLA events
  { value: 'sla.breached', label: 'SLA Breached', group: 'SLA' },
];
