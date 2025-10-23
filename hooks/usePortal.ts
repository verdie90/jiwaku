'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PortalUser,
  PortalTicket,
  PortalFeedback,
  PortalUserPreferences,
  PortalTicketComment,
} from '@/types';
import { portalService } from '@/services/portal.service';

// ======================== PORTAL USER HOOKS ========================

/**
 * Get portal user profile
 */
export function usePortalUser(teamId: string, portalUserId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['portalUser', teamId, portalUserId],
    queryFn: () => portalService.getPortalUser(teamId, portalUserId),
    enabled: enabled && !!teamId && !!portalUserId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get portal user by email
 */
export function usePortalUserByEmail(teamId: string, email: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['portalUserByEmail', teamId, email],
    queryFn: () => portalService.getPortalUserByEmail(teamId, email),
    enabled: enabled && !!teamId && !!email,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create portal user mutation
 */
export function useCreatePortalUser(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: Omit<PortalUser, 'createdAt' | 'updatedAt'>) =>
      portalService.createPortalUser(teamId, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalUsers', teamId] });
    },
  });
}

/**
 * Update portal user mutation
 */
export function useUpdatePortalUser(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portalUserId, updates }: { portalUserId: string; updates: Partial<PortalUser> }) =>
      portalService.updatePortalUser(teamId, portalUserId, updates),
    onSuccess: (_, { portalUserId }) => {
      queryClient.invalidateQueries({ queryKey: ['portalUser', teamId, portalUserId] });
    },
  });
}

/**
 * Update user preferences mutation
 */
export function useUpdateUserPreferences(teamId: string, portalUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: PortalUserPreferences) =>
      portalService.updateUserPreferences(teamId, portalUserId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalUser', teamId, portalUserId] });
    },
  });
}

// ======================== PORTAL TICKETS HOOKS ========================

/**
 * Get portal tickets for customer
 */
export function usePortalTickets(
  teamId: string,
  portalUserId: string,
  status?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['portalTickets', teamId, portalUserId, status],
    queryFn: () => portalService.getCustomerTickets(teamId, portalUserId, status),
    enabled: enabled && !!teamId && !!portalUserId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get single portal ticket
 */
export function usePortalTicket(teamId: string, ticketId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['portalTicket', teamId, ticketId],
    queryFn: () => portalService.getPortalTicket(teamId, ticketId),
    enabled: enabled && !!teamId && !!ticketId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Create portal ticket mutation
 */
export function useCreatePortalTicket(teamId: string, portalUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticket: Omit<PortalTicket, 'createdAt' | 'updatedAt'>) =>
      portalService.createPortalTicket(teamId, ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalTickets', teamId, portalUserId] });
    },
  });
}

/**
 * Get customer dashboard stats
 */
export function useCustomerDashboardStats(
  teamId: string,
  portalUserId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['customerDashboardStats', teamId, portalUserId],
    queryFn: () => portalService.getCustomerDashboardStats(teamId, portalUserId),
    enabled: enabled && !!teamId && !!portalUserId,
    staleTime: 5 * 60 * 1000,
  });
}

// ======================== PORTAL COMMENTS HOOKS ========================

/**
 * Get ticket comments
 */
export function useTicketComments(
  teamId: string,
  ticketId: string,
  portalUserId?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['ticketComments', teamId, ticketId, portalUserId],
    queryFn: () => portalService.getTicketComments(teamId, ticketId, portalUserId),
    enabled: enabled && !!teamId && !!ticketId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Add ticket comment mutation
 */
export function useAddTicketComment(teamId: string, ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: Omit<PortalTicketComment, 'createdAt' | 'updatedAt'>) =>
      portalService.addTicketComment(teamId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketComments', teamId, ticketId] });
    },
  });
}

// ======================== PORTAL FEEDBACK HOOKS ========================

/**
 * Submit feedback mutation
 */
export function useSubmitFeedback(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedback: Omit<PortalFeedback, 'createdAt' | 'updatedAt'>) =>
      portalService.submitFeedback(teamId, feedback),
    onSuccess: (_, feedback) => {
      queryClient.invalidateQueries({
        queryKey: ['ticketFeedback', teamId, feedback.ticketId],
      });
    },
  });
}

/**
 * Get ticket feedback
 */
export function useTicketFeedback(teamId: string, ticketId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['ticketFeedback', teamId, ticketId],
    queryFn: () => portalService.getTicketFeedback(teamId, ticketId),
    enabled: enabled && !!teamId && !!ticketId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get feedback statistics
 */
export function useFeedbackStats(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['feedbackStats', teamId],
    queryFn: () => portalService.getFeedbackStats(teamId),
    enabled: enabled && !!teamId,
    staleTime: 15 * 60 * 1000,
  });
}

// ======================== PORTAL NOTIFICATIONS HOOKS ========================

/**
 * Get portal notifications
 */
export function usePortalNotifications(
  teamId: string,
  portalUserId: string,
  unreadOnly: boolean = false,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['portalNotifications', teamId, portalUserId, unreadOnly],
    queryFn: () => portalService.getPortalNotifications(teamId, portalUserId, unreadOnly),
    enabled: enabled && !!teamId && !!portalUserId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

/**
 * Mark notification as read mutation
 */
export function useMarkNotificationAsRead(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      portalService.markNotificationAsRead(teamId, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalNotifications'] });
    },
  });
}

// ======================== KNOWLEDGE BASE HOOKS ========================

/**
 * Get knowledge base articles
 */
export function useKnowledgeBase(
  teamId: string,
  category?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['knowledgeBase', teamId, category],
    queryFn: () => portalService.getKnowledgeBase(teamId, category),
    enabled: enabled && !!teamId,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
}

/**
 * Search knowledge base
 */
export function useSearchKnowledgeBase(teamId: string, searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['searchKnowledgeBase', teamId, searchTerm],
    queryFn: () => portalService.searchKnowledgeBase(teamId, searchTerm),
    enabled: enabled && !!teamId && !!searchTerm,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Increment KB article views
 */
export function useIncrementKBViews(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => portalService.incrementKBViews(teamId, articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase', teamId] });
    },
  });
}

// ======================== HELPER HOOKS ========================

/**
 * Verify portal access to a ticket
 */
export function useVerifyPortalAccess(
  teamId: string,
  portalUserId: string,
  ticketId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['verifyPortalAccess', teamId, portalUserId, ticketId],
    queryFn: () => portalService.verifyPortalAccess(teamId, portalUserId, ticketId),
    enabled: enabled && !!teamId && !!portalUserId && !!ticketId,
    staleTime: 5 * 60 * 1000,
  });
}
