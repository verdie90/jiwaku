'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contact } from '@/types';
import { contactService, ContactInput } from '@/services/contact.service';
import { useNotification } from '@/lib/zustand-store';

/**
 * Hook to fetch and manage contacts for a team
 */
export function useContacts(teamId?: string) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  // Fetch contacts
  const query = useQuery({
    queryKey: ['contacts', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      return contactService.getAll(teamId);
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: async (data: ContactInput) => {
      if (!teamId) throw new Error('Team ID is required');
      return contactService.create(teamId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', teamId] });
      addNotification({
        type: 'success',
        message: 'Contact created successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to create contact',
      });
    },
  });

  // Update contact mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ContactInput>;
    }) => {
      return contactService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', teamId] });
      addNotification({
        type: 'success',
        message: 'Contact updated successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to update contact',
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return contactService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', teamId] });
      addNotification({
        type: 'success',
        message: 'Contact deleted successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to delete contact',
      });
    },
  });

  return {
    contacts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createContact: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateContact: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteContact: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch a single contact
 */
export function useContact(contactId?: string) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const query = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      if (!contactId) return null;
      return contactService.getById(contactId);
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update contact mutation (with optional onSuccess callback)
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ContactInput>) => {
      if (!contactId) throw new Error('Contact ID is required');
      return contactService.update(contactId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addNotification({
        type: 'success',
        message: 'Contact updated successfully',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to update contact',
      });
    },
  });

  return {
    contact: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateContact: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch: query.refetch,
  };
}

/**
 * Hook to search contacts
 */
export function useContactSearch(
  query: string,
  contacts: Contact[]
) {
  const results = contacts.filter((contact) => {
    if (!query.trim()) return true;

    const lowerQuery = query.toLowerCase();
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const email = contact.email.toLowerCase();
    const phone = contact.phone.toLowerCase();
    const company = (contact.company || '').toLowerCase();

    return (
      fullName.includes(lowerQuery) ||
      email.includes(lowerQuery) ||
      phone.includes(lowerQuery) ||
      company.includes(lowerQuery)
    );
  });

  return {
    results,
    isSearching: false,
  };
}
