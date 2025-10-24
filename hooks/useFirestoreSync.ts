'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { FirestoreSyncService } from '@/services/firestoreSync.service';

/**
 * Hook for syncing a single entity to Firestore
 */
export function useSyncEntity(
  teamId: string
): UseMutationResult<
  void,
  Error,
  {
    entityType: string;
    entityId: string;
    data: Record<string, any>;
    userId: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityType, entityId, data, userId }) => {
      await FirestoreSyncService.syncEntity(
        teamId,
        entityType,
        entityId,
        data,
        userId
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate entity queries
      queryClient.invalidateQueries({
        queryKey: ['entity', teamId, variables.entityType, variables.entityId],
      });
      queryClient.invalidateQueries({
        queryKey: ['entities', teamId, variables.entityType],
      });
      queryClient.invalidateQueries({
        queryKey: ['syncStats', teamId],
      });
    },
  });
}

/**
 * Hook for bulk syncing multiple entities to Firestore
 */
export function useBatchSyncEntities(
  teamId: string
): UseMutationResult<
  void,
  Error,
  {
    entityType: string;
    entities: Array<{ id: string; data: Record<string, any> }>;
    userId: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityType, entities, userId }) => {
      await FirestoreSyncService.batchSyncEntities(
        teamId,
        entityType,
        entities,
        userId
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate entity queries
      queryClient.invalidateQueries({
        queryKey: ['entities', teamId, variables.entityType],
      });
      queryClient.invalidateQueries({
        queryKey: ['syncStats', teamId],
      });
    },
  });
}

/**
 * Hook for retrieving a single entity from Firestore
 */
export function useEntity(
  teamId: string,
  entityType: string,
  entityId: string,
  enabled = true
): UseQueryResult<Record<string, any> | null, Error> {
  return useQuery({
    queryKey: ['entity', teamId, entityType, entityId],
    queryFn: async () => {
      const entity = await FirestoreSyncService.getEntity(
        teamId,
        entityType,
        entityId
      );
      return entity;
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for retrieving all entities of a type from Firestore
 */
export function useEntities(
  teamId: string,
  entityType: string,
  filters: Array<{ field: string; operator: string; value: any }> = [],
  enabled = true
): UseQueryResult<Record<string, any>[], Error> {
  return useQuery({
    queryKey: ['entities', teamId, entityType, filters],
    queryFn: async () => {
      const entities = await FirestoreSyncService.getEntities(
        teamId,
        entityType,
        filters
      );
      return entities;
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for updating an entity in Firestore
 */
export function useUpdateEntity(
  teamId: string,
  entityType: string,
  entityId: string
): UseMutationResult<
  void,
  Error,
  {
    data: Record<string, any>;
    userId: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, userId }) => {
      await FirestoreSyncService.updateEntity(
        teamId,
        entityType,
        entityId,
        data,
        userId
      );
    },
    onSuccess: () => {
      // Invalidate entity queries
      queryClient.invalidateQueries({
        queryKey: ['entity', teamId, entityType, entityId],
      });
      queryClient.invalidateQueries({
        queryKey: ['entities', teamId, entityType],
      });
      queryClient.invalidateQueries({
        queryKey: ['syncStats', teamId],
      });
    },
  });
}

/**
 * Hook for deleting an entity from Firestore
 */
export function useDeleteEntity(
  teamId: string,
  entityType: string
): UseMutationResult<
  void,
  Error,
  {
    entityId: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityId }) => {
      await FirestoreSyncService.deleteEntity(
        teamId,
        entityType,
        entityId
      );
    },
    onSuccess: () => {
      // Invalidate entity queries
      queryClient.invalidateQueries({
        queryKey: ['entities', teamId, entityType],
      });
      queryClient.invalidateQueries({
        queryKey: ['syncStats', teamId],
      });
    },
  });
}

/**
 * Hook for searching entities by field value
 */
export function useSearchEntities(
  teamId: string,
  entityType: string,
  searchField: string,
  searchValue: string,
  enabled = true
): UseQueryResult<Record<string, any>[], Error> {
  return useQuery({
    queryKey: [
      'searchEntities',
      teamId,
      entityType,
      searchField,
      searchValue,
    ],
    queryFn: async () => {
      const entities = await FirestoreSyncService.searchEntities(
        teamId,
        entityType,
        searchField,
        searchValue
      );
      return entities;
    },
    enabled: enabled && searchValue.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for retrieving sync statistics
 */
export function useSyncStats(
  teamId: string,
  enabled = true
): UseQueryResult<
  {
    total: number;
    byType: Record<string, number>;
    lastSync: Date | null;
  },
  Error
> {
  return useQuery({
    queryKey: ['syncStats', teamId],
    queryFn: async () => {
      const stats = await FirestoreSyncService.getSyncStats(teamId);
      return stats;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for initializing team collections
 */
export function useInitializeTeamCollections(
  teamId: string
): UseMutationResult<
  void,
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await FirestoreSyncService.initializeTeamCollections(teamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['syncStats', teamId],
      });
    },
  });
}

/**
 * Hook for bulk syncing with error tracking
 */
export function useBulkSync(
  teamId: string
): UseMutationResult<
  { success: number; failed: number },
  Error,
  {
    entityType: string;
    entities: Array<{ id: string; data: Record<string, any> }>;
    userId: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityType, entities, userId }) => {
      const result = await FirestoreSyncService.bulkSync(
        teamId,
        entityType,
        entities,
        userId
      );
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['entities', teamId, variables.entityType],
      });
      queryClient.invalidateQueries({
        queryKey: ['syncStats', teamId],
      });
    },
  });
}
