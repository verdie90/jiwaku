'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import IntegrationService from '@/services/integration.service';
import {
  APIScope,
  Integration,
  ThirdPartyOAuth,
  RESTAPIEndpoint,
  GraphQLSchema,
  SyncConfiguration,
} from '@/types';

// ============================================================================
// API KEY HOOKS
// ============================================================================

/**
 * Create API key
 */
export function useCreateAPIKey(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      scopes,
      expiresAt,
    }: {
      name: string;
      scopes: APIScope[];
      expiresAt?: Date;
    }) => {
      return IntegrationService.createAPIKey(teamId, name, scopes, expiresAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', teamId] });
    },
  });
}

/**
 * Get all API keys
 */
export function useAPIKeys(teamId: string, enabled = true) {
  return useQuery({
    queryKey: ['apiKeys', teamId],
    queryFn: () => IntegrationService.getAPIKeys(teamId),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Delete API key
 */
export function useDeleteAPIKey(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => IntegrationService.deleteAPIKey(teamId, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', teamId] });
    },
  });
}

/**
 * Validate API key
 */
export function useValidateAPIKey(teamId: string) {
  return useMutation({
    mutationFn: (keyPrefix: string) => IntegrationService.validateAPIKey(teamId, keyPrefix),
  });
}

// ============================================================================
// INTEGRATION HOOKS
// ============================================================================

/**
 * Create integration
 */
export function useCreateIntegration(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) =>
      IntegrationService.createIntegration(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', teamId] });
    },
  });
}

/**
 * Get all integrations
 */
export function useIntegrations(teamId: string, enabled = true) {
  return useQuery({
    queryKey: ['integrations', teamId],
    queryFn: () => IntegrationService.getIntegrations(teamId),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get single integration
 */
export function useIntegration(teamId: string, integrationId: string, enabled = true) {
  return useQuery({
    queryKey: ['integration', teamId, integrationId],
    queryFn: () => IntegrationService.getIntegration(teamId, integrationId),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Update integration
 */
export function useUpdateIntegration(teamId: string, integrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Integration>) =>
      IntegrationService.updateIntegration(teamId, integrationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', teamId] });
      queryClient.invalidateQueries({ queryKey: ['integration', teamId, integrationId] });
    },
  });
}

/**
 * Delete integration
 */
export function useDeleteIntegration(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) => IntegrationService.deleteIntegration(teamId, integrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', teamId] });
    },
  });
}

/**
 * Test integration
 */
export function useTestIntegration(teamId: string, integrationId: string) {
  return useMutation({
    mutationFn: () => IntegrationService.testIntegration(teamId, integrationId),
  });
}

// ============================================================================
// OAUTH HOOKS
// ============================================================================

/**
 * Store OAuth token
 */
export function useStoreOAuthToken(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ThirdPartyOAuth, 'id' | 'createdAt' | 'updatedAt'>) =>
      IntegrationService.storeOAuthToken(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauthTokens', teamId] });
    },
  });
}

/**
 * Get OAuth token
 */
export function useOAuthToken(teamId: string, provider: string, userId: string, enabled = true) {
  return useQuery({
    queryKey: ['oauthToken', teamId, provider, userId],
    queryFn: () => IntegrationService.getOAuthToken(teamId, provider, userId),
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Refresh OAuth token
 */
export function useRefreshOAuthToken(teamId: string, oauthId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, expiresAt }: { token: string; expiresAt: Date }) =>
      IntegrationService.refreshOAuthToken(teamId, oauthId, token, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauthTokens', teamId] });
    },
  });
}

/**
 * Revoke OAuth token
 */
export function useRevokeOAuthToken(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (oauthId: string) => IntegrationService.revokeOAuthToken(teamId, oauthId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauthTokens', teamId] });
    },
  });
}

// ============================================================================
// REQUEST LOGGING HOOKS
// ============================================================================

/**
 * Get integration request logs
 */
export function useIntegrationRequestLogs(
  teamId: string,
  integrationId: string,
  enabled = true,
  limit = 100
) {
  return useQuery({
    queryKey: ['integrationRequestLogs', teamId, integrationId],
    queryFn: () => IntegrationService.getIntegrationRequestLogs(teamId, integrationId, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// ============================================================================
// REST API HOOKS
// ============================================================================

/**
 * Create REST API endpoint
 */
export function useCreateRESTEndpoint(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<RESTAPIEndpoint, 'id' | 'createdAt' | 'updatedAt'>) =>
      IntegrationService.createRESTEndpoint(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restEndpoints', teamId] });
    },
  });
}

/**
 * Get REST API endpoints
 */
export function useRESTEndpoints(teamId: string, enabled = true) {
  return useQuery({
    queryKey: ['restEndpoints', teamId],
    queryFn: () => IntegrationService.getRESTEndpoints(teamId),
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Delete REST endpoint
 */
export function useDeleteRESTEndpoint(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (endpointId: string) =>
      IntegrationService.deleteRESTEndpoint(teamId, endpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restEndpoints', teamId] });
    },
  });
}

// ============================================================================
// GRAPHQL HOOKS
// ============================================================================

/**
 * Set GraphQL schema
 */
export function useSetGraphQLSchema(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<GraphQLSchema, 'id' | 'createdAt' | 'updatedAt'>) =>
      IntegrationService.setGraphQLSchema(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graphqlSchema', teamId] });
    },
  });
}

/**
 * Get GraphQL schema
 */
export function useGraphQLSchema(teamId: string, enabled = true) {
  return useQuery({
    queryKey: ['graphqlSchema', teamId],
    queryFn: () => IntegrationService.getGraphQLSchema(teamId),
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
  });
}

// ============================================================================
// SYNC CONFIGURATION HOOKS
// ============================================================================

/**
 * Create sync configuration
 */
export function useCreateSyncConfig(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SyncConfiguration, 'id' | 'createdAt' | 'updatedAt'>) =>
      IntegrationService.createSyncConfig(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncConfigs', teamId] });
    },
  });
}

/**
 * Get sync configurations
 */
export function useSyncConfigurations(
  teamId: string,
  integrationId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['syncConfigs', teamId, integrationId],
    queryFn: () => IntegrationService.getSyncConfigurations(teamId, integrationId),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Update sync configuration
 */
export function useUpdateSyncConfig(teamId: string, configId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<SyncConfiguration>) =>
      IntegrationService.updateSyncConfig(teamId, configId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncConfigs', teamId] });
    },
  });
}

/**
 * Log sync attempt
 */
export function useLogSyncAttempt(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ configId, success }: { configId: string; success: boolean }) =>
      IntegrationService.logSyncAttempt(teamId, configId, success),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncConfigs', teamId] });
    },
  });
}

// ============================================================================
// MARKETPLACE HOOKS
// ============================================================================

/**
 * Get marketplace integrations
 */
export function useMarketplaceIntegrations(enabled = true) {
  return useQuery({
    queryKey: ['marketplaceIntegrations'],
    queryFn: () => IntegrationService.getMarketplaceIntegrations(),
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
