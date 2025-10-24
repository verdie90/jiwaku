'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomFieldsService } from '@/services/customFields.service';
import { CustomField } from '@/types/customFields';

/**
 * Custom Fields React Query Hooks
 * All hooks with proper v5 API patterns
 */

// ============================================================================
// CREATE HOOKS
// ============================================================================

/**
 * Create a new custom field
 */
export function useCreateCustomField(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      field,
      userId,
    }: {
      field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>;
      userId: string;
    }) => {
      return CustomFieldsService.createCustomField(teamId, field, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields', teamId] });
    },
  });
}

/**
 * Batch create custom fields
 */
export function useBatchCreateCustomFields(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fields,
      userId,
    }: {
      fields: Array<Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>>;
      userId: string;
    }) => {
      return CustomFieldsService.batchCreateCustomFields(teamId, fields, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields', teamId] });
    },
  });
}

// ============================================================================
// READ HOOKS
// ============================================================================

/**
 * Get all custom fields for a team (10 min cache)
 */
export function useCustomFields(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['customFields', teamId],
    queryFn: () => CustomFieldsService.getCustomFields(teamId),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get single custom field
 */
export function useCustomField(teamId: string, fieldId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['customField', teamId, fieldId],
    queryFn: () => CustomFieldsService.getCustomField(teamId, fieldId),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get custom field values for an entity
 */
export function useCustomFieldValues(
  teamId: string,
  entityType: string,
  entityId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['customFieldValues', teamId, entityType, entityId],
    queryFn: () => CustomFieldsService.getCustomFieldValues(teamId, entityType, entityId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// UPDATE HOOKS
// ============================================================================

/**
 * Update custom field
 */
export function useUpdateCustomField(teamId: string, fieldId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<CustomField>) =>
      CustomFieldsService.updateCustomField(teamId, fieldId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields', teamId] });
      queryClient.invalidateQueries({ queryKey: ['customField', teamId, fieldId] });
    },
  });
}

/**
 * Set custom field value
 */
export function useSetCustomFieldValue(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      fieldId,
      value,
      userId,
    }: {
      entityType: string;
      entityId: string;
      fieldId: string;
      value: any;
      userId: string;
    }) =>
      CustomFieldsService.setCustomFieldValue(
        teamId,
        entityType,
        entityId,
        fieldId,
        value,
        userId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['customFieldValues', teamId, variables.entityType, variables.entityId],
      });
    },
  });
}

/**
 * Batch set custom field values
 */
export function useBatchSetCustomFieldValues(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      values,
      userId,
    }: {
      entityType: string;
      entityId: string;
      values: Record<string, any>;
      userId: string;
    }) =>
      CustomFieldsService.batchSetCustomFieldValues(teamId, entityType, entityId, values, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['customFieldValues', teamId, variables.entityType, variables.entityId],
      });
    },
  });
}

// ============================================================================
// DELETE HOOKS
// ============================================================================

/**
 * Delete custom field
 */
export function useDeleteCustomField(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) => CustomFieldsService.deleteCustomField(teamId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields', teamId] });
    },
  });
}

/**
 * Delete custom field value
 */
export function useDeleteCustomFieldValue(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      fieldId,
    }: {
      entityType: string;
      entityId: string;
      fieldId: string;
    }) =>
      CustomFieldsService.deleteCustomFieldValue(teamId, entityType, entityId, fieldId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['customFieldValues', teamId, variables.entityType, variables.entityId],
      });
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Validate custom field value
 */
export function useValidateCustomFieldValue() {
  return (field: CustomField, value: any) => {
    return CustomFieldsService.validateFieldValue(field, value);
  };
}
