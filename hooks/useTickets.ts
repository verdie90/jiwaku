import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, TicketComment } from '@/types';
import { ticketService } from '@/services/ticket.service';
import { useNotification } from '@/lib/zustand-store';

/**
 * Hook to fetch and manage tickets for a team
 */
export function useTickets(
  teamId: string | undefined
): {
  tickets: Ticket[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createTicket: (
    contactId: string,
    data: {
      title: string;
      description: string;
      priority: string;
      status: string;
      tags?: string[];
      categories?: string[];
    }
  ) => Promise<void>;
  updateTicket: (ticketId: string, data: Partial<Ticket>) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
} {
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const {
    data: tickets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tickets', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      return ticketService.getAll(teamId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!teamId,
  });

  const createMutation = useMutation({
    mutationFn: async (params: {
      contactId: string;
      data: {
        title: string;
        description: string;
        priority: string;
        status: string;
        tags?: string[];
        categories?: string[];
      };
    }) => {
      if (!teamId) throw new Error('Team ID is required');
      return ticketService.create(teamId, params.contactId, params.data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', teamId] });
      addNotification({
        type: 'success',
        message: 'Ticket created successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: `Failed to create ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { ticketId: string; data: Partial<Ticket> }) => {
      if (!teamId) throw new Error('Team ID is required');
      return ticketService.update(teamId, params.ticketId, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', teamId] });
      addNotification({
        type: 'success',
        message: 'Ticket updated successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: `Failed to update ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      if (!teamId) throw new Error('Team ID is required');
      return ticketService.delete(teamId, ticketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', teamId] });
      addNotification({
        type: 'success',
        message: 'Ticket deleted successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: `Failed to delete ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  return {
    tickets,
    isLoading,
    error: error as Error | null,
    refetch,
    createTicket: async (contactId, data) => {
      await createMutation.mutateAsync({ contactId, data });
    },
    updateTicket: async (ticketId, data) => {
      await updateMutation.mutateAsync({ ticketId, data });
    },
    deleteTicket: async (ticketId) => {
      await deleteMutation.mutateAsync(ticketId);
    },
  };
}

/**
 * Hook to fetch and manage a single ticket
 */
export function useTicket(
  teamId: string | undefined,
  ticketId: string | undefined
): {
  ticket: Ticket | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateTicket: (data: Partial<Ticket>) => Promise<void>;
  addComment: (
    content: string,
    isInternal: boolean
  ) => Promise<Ticket | null>;
} {
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const {
    data: ticket = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticket', teamId, ticketId],
    queryFn: async () => {
      if (!teamId || !ticketId) return null;
      return ticketService.getById(teamId, ticketId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!teamId && !!ticketId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Ticket>) => {
      if (!teamId || !ticketId) throw new Error('Team ID and Ticket ID are required');
      return ticketService.update(teamId, ticketId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', teamId, ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', teamId] });
      addNotification({
        type: 'success',
        message: 'Ticket updated successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: `Failed to update ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (params: { content: string; isInternal: boolean }) => {
      if (!teamId || !ticketId) throw new Error('Team ID and Ticket ID are required');
      
      const comment: Omit<TicketComment, 'id'> = {
        ticketId,
        authorId: 'current-user', // This should come from auth context
        content: params.content,
        isInternal: params.isInternal,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return ticketService.addComment(teamId, ticketId, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', teamId, ticketId] });
      addNotification({
        type: 'success',
        message: 'Comment added successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: `Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  return {
    ticket: ticket as Ticket | null,
    isLoading,
    error: error as Error | null,
    refetch,
    updateTicket: async (data) => {
      await updateMutation.mutateAsync(data);
    },
    addComment: async (content, isInternal) => {
      return commentMutation.mutateAsync({ content, isInternal });
    },
  };
}

/**
 * Hook to search tickets
 */
export function useTicketSearch(
  query: string,
  tickets: Ticket[]
): { results: Ticket[]; isSearching: boolean } {
  const [isSearching, setIsSearching] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return tickets;

    setIsSearching(true);
    const filtered = tickets.filter((ticket) => {
      const titleMatch = ticket.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const descriptionMatch = ticket.description
        .toLowerCase()
        .includes(query.toLowerCase());
      const idMatch = ticket.id.toLowerCase().includes(query.toLowerCase());

      return titleMatch || descriptionMatch || idMatch;
    });
    setIsSearching(false);

    return filtered;
  }, [query, tickets]);

  return { results, isSearching };
}

/**
 * Hook to manage ticket assignment
 */
export function useTicketAssignment(
  teamId: string | undefined,
  ticketId: string | undefined
): {
  assignTicket: (agentId: string) => Promise<Ticket | null>;
  isAssigning: boolean;
  error: Error | null;
} {
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();

  const assignMutation = useMutation({
    mutationFn: async (agentId: string) => {
      if (!teamId || !ticketId) throw new Error('Team ID and Ticket ID are required');
      return ticketService.assignTicket(teamId, ticketId, agentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', teamId, ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', teamId] });
      addNotification({
        type: 'success',
        message: 'Ticket assigned successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        message: `Failed to assign ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  return {
    assignTicket: async (agentId) => {
      return assignMutation.mutateAsync(agentId);
    },
    isAssigning: assignMutation.isPending,
    error: assignMutation.error as Error | null,
  };
}
