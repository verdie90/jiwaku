'use client';

import { useState, useCallback } from 'react';
import { bulkService } from '@/services/bulk.service';
import { TicketStatus, TicketPriority } from '@/config/constants';

/**
 * Hook for managing bulk ticket operations
 */
export function useBulkActions(teamId: string) {
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Toggle ticket selection
  const toggleTicketSelection = useCallback((ticketId: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  }, []);

  // Select all tickets
  const selectAllTickets = useCallback((ticketIds: string[]) => {
    setSelectedTicketIds(ticketIds);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedTicketIds([]);
  }, []);

  // Update status
  const updateStatus = useCallback(
    async (newStatus: TicketStatus) => {
      const validation = bulkService.validateBulkOperation(selectedTicketIds);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await bulkService.updateStatusBatch(teamId, selectedTicketIds, newStatus);
        const summary = bulkService.getOperationSummary('status', selectedTicketIds.length, {
          newStatus,
        });
        setSuccessMessage(`${summary.message}`);
        clearSelection();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status');
      } finally {
        setIsLoading(false);
      }
    },
    [teamId, selectedTicketIds, clearSelection]
  );

  // Update priority
  const updatePriority = useCallback(
    async (newPriority: TicketPriority) => {
      const validation = bulkService.validateBulkOperation(selectedTicketIds);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await bulkService.updatePriorityBatch(teamId, selectedTicketIds, newPriority);
        const summary = bulkService.getOperationSummary('priority', selectedTicketIds.length, {
          newPriority,
        });
        setSuccessMessage(`${summary.message}`);
        clearSelection();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update priority');
      } finally {
        setIsLoading(false);
      }
    },
    [teamId, selectedTicketIds, clearSelection]
  );

  // Assign tickets
  const assignTickets = useCallback(
    async (agentId: string) => {
      const validation = bulkService.validateBulkOperation(selectedTicketIds);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await bulkService.assignBatch(teamId, selectedTicketIds, agentId);
        const summary = bulkService.getOperationSummary('assign', selectedTicketIds.length, {
          agentId,
        });
        setSuccessMessage(`${summary.message}`);
        clearSelection();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign tickets');
      } finally {
        setIsLoading(false);
      }
    },
    [teamId, selectedTicketIds, clearSelection]
  );

  // Unassign tickets
  const unassignTickets = useCallback(async () => {
    const validation = bulkService.validateBulkOperation(selectedTicketIds);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await bulkService.unassignBatch(teamId, selectedTicketIds);
      const summary = bulkService.getOperationSummary('assign', selectedTicketIds.length, {
        action: 'unassign',
      });
      setSuccessMessage(`${summary.message}`);
      clearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unassign tickets');
    } finally {
      setIsLoading(false);
    }
  }, [teamId, selectedTicketIds, clearSelection]);

  // Add tags
  const addTags = useCallback(
    async (tags: string[]) => {
      const validation = bulkService.validateBulkOperation(selectedTicketIds);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await bulkService.addTagsBatch(teamId, selectedTicketIds, tags);
        const summary = bulkService.getOperationSummary('tag', selectedTicketIds.length, {
          tags,
          action: 'add',
        });
        setSuccessMessage(`${summary.message}`);
        clearSelection();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add tags');
      } finally {
        setIsLoading(false);
      }
    },
    [teamId, selectedTicketIds, clearSelection]
  );

  // Remove tags
  const removeTags = useCallback(
    async (tags: string[]) => {
      const validation = bulkService.validateBulkOperation(selectedTicketIds);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await bulkService.removeTagsBatch(teamId, selectedTicketIds, tags);
        const summary = bulkService.getOperationSummary('tag', selectedTicketIds.length, {
          tags,
          action: 'remove',
        });
        setSuccessMessage(`${summary.message}`);
        clearSelection();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove tags');
      } finally {
        setIsLoading(false);
      }
    },
    [teamId, selectedTicketIds, clearSelection]
  );

  // Add categories
  const addCategories = useCallback(
    async (categories: string[]) => {
      const validation = bulkService.validateBulkOperation(selectedTicketIds);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await bulkService.addCategoriesBatch(teamId, selectedTicketIds, categories);
        setSuccessMessage(`Added categories to ${selectedTicketIds.length} ticket(s)`);
        clearSelection();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add categories');
      } finally {
        setIsLoading(false);
      }
    },
    [teamId, selectedTicketIds, clearSelection]
  );

  // Delete tickets
  const deleteTickets = useCallback(async () => {
    const validation = bulkService.validateBulkOperation(selectedTicketIds);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await bulkService.deleteBatch(teamId, selectedTicketIds);
      const summary = bulkService.getOperationSummary('delete', selectedTicketIds.length);
      setSuccessMessage(`${summary.message}`);
      clearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tickets');
    } finally {
      setIsLoading(false);
    }
  }, [teamId, selectedTicketIds, clearSelection]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Check if any tickets are selected
  const hasSelection = selectedTicketIds.length > 0;

  return {
    selectedTicketIds,
    hasSelection,
    isLoading,
    error,
    successMessage,
    toggleTicketSelection,
    selectAllTickets,
    clearSelection,
    updateStatus,
    updatePriority,
    assignTickets,
    unassignTickets,
    addTags,
    removeTags,
    addCategories,
    deleteTickets,
    clearMessages,
  };
}
