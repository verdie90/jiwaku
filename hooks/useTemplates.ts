import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketTemplate } from '@/types';
import { templateService } from '@/services/template.service';

const QUERY_KEYS = {
  all: (teamId: string) => ['templates', teamId],
  detail: (teamId: string, templateId: string) => ['templates', teamId, templateId],
  category: (teamId: string, category: string) => ['templates', teamId, 'category', category],
  favorites: (teamId: string) => ['templates', teamId, 'favorites'],
  mostUsed: (teamId: string) => ['templates', teamId, 'mostUsed'],
  stats: (teamId: string) => ['templates', teamId, 'stats'],
};

/**
 * Hook to fetch all templates
 */
export function useTemplates(teamId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.all(teamId),
    queryFn: () => templateService.getAll(teamId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch templates by category
 */
export function useTemplatesByCategory(teamId: string, category: string) {
  return useQuery({
    queryKey: QUERY_KEYS.category(teamId, category),
    queryFn: () => templateService.getByCategory(teamId, category),
    staleTime: 5 * 60 * 1000,
    enabled: !!teamId && !!category,
  });
}

/**
 * Hook to fetch favorite templates
 */
export function useFavoriteTemplates(teamId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.favorites(teamId),
    queryFn: () => templateService.getFavorites(teamId),
    staleTime: 5 * 60 * 1000,
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch most used templates
 */
export function useMostUsedTemplates(teamId: string, limit: number = 5) {
  return useQuery({
    queryKey: QUERY_KEYS.mostUsed(teamId),
    queryFn: () => templateService.getMostUsed(teamId, limit),
    staleTime: 5 * 60 * 1000,
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch single template
 */
export function useTemplate(teamId: string, templateId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(teamId, templateId),
    queryFn: () => templateService.getById(teamId, templateId),
    staleTime: 5 * 60 * 1000,
    enabled: !!teamId && !!templateId,
  });
}

/**
 * Hook to fetch template statistics
 */
export function useTemplateStatistics(teamId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.stats(teamId),
    queryFn: () => templateService.getStatistics(teamId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!teamId,
  });
}

/**
 * Hook to search templates
 */
export function useSearchTemplates(teamId: string, query: string) {
  return useQuery({
    queryKey: ['templates', teamId, 'search', query],
    queryFn: () => templateService.search(teamId, query),
    staleTime: 2 * 60 * 1000,
    enabled: !!teamId && query.length > 0,
  });
}

/**
 * Hook for template mutations (create, update, delete)
 */
export function useTemplateMutations(teamId: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<TicketTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) =>
      templateService.create(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all(teamId),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: Partial<TicketTemplate>;
    }) => templateService.update(teamId, templateId, data),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(teamId, templateId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all(teamId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (templateId: string) => templateService.delete(teamId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all(teamId),
      });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: ({
      templateId,
      newName,
      createdBy,
    }: {
      templateId: string;
      newName: string;
      createdBy: string;
    }) => templateService.clone(teamId, templateId, newName, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all(teamId),
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    cloneMutation,
  };
}

/**
 * Hook for template favorites toggle
 */
export function useToggleTemplateFavorite(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      isFavorite,
    }: {
      templateId: string;
      isFavorite: boolean;
    }) => templateService.toggleFavorite(teamId, templateId, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.all(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.favorites(teamId),
      });
    },
  });
}

/**
 * Hook for creating ticket from template
 */
export function useCreateTicketFromTemplate(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      contactId,
      customData,
      fieldValues,
    }: {
      templateId: string;
      contactId: string;
      customData?: Record<string, any>;
      fieldValues?: Record<string, any>;
    }) =>
      templateService.createTicketFromTemplate(
        teamId,
        templateId,
        contactId,
        customData,
        fieldValues
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats(teamId),
      });
    },
  });
}

/**
 * Hook to use templates with local state
 */
export function useTemplateState(teamId: string) {
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const { data: templates, isLoading } = useTemplates(teamId);
  const { data: favorites } = useFavoriteTemplates(teamId);
  const { data: mostUsed } = useMostUsedTemplates(teamId);

  const updateFieldValue = useCallback((fieldName: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const resetFieldValues = useCallback(() => {
    setFieldValues({});
  }, []);

  return {
    templates,
    favorites,
    mostUsed,
    selectedTemplate,
    setSelectedTemplate,
    fieldValues,
    updateFieldValue,
    resetFieldValues,
    showTemplateModal,
    setShowTemplateModal,
    isLoading,
  };
}
