'use client';

import { useState, useCallback, useMemo } from 'react';
import { Ticket, FilterCriteria, DateRange, CustomFieldFilter, FilterPreset } from '@/types';
import { filterService } from '@/services/filter.service';
import { TicketStatus, TicketPriority } from '@/config/constants';

/**
 * Hook for advanced ticket filtering with complex criteria
 */
export function useFilters(tickets: Ticket[], onResultsChange?: (results: Ticket[]) => void) {
  const [criteria, setCriteria] = useState<Partial<FilterCriteria>>({
    status: [],
    priority: [],
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'status' | 'title'>('date');
  const [sortAscending, setSortAscending] = useState(false);

  // Apply filters and sort
  const filteredResults = useMemo(() => {
    let results = tickets;

    // Apply filters if we have complete criteria
    if (
      criteria.status ||
      criteria.priority ||
      criteria.assignedAgentId ||
      criteria.tags ||
      criteria.searchQuery
    ) {
      const fullCriteria = buildFullCriteria(criteria);
      results = filterService.applyFilters(results, fullCriteria);
    }

    // Apply sorting
    results = filterService.sortTickets(results, sortBy, sortAscending);

    // Call callback if provided
    onResultsChange?.(results);

    return results;
  }, [criteria, sortBy, sortAscending, tickets, onResultsChange]);

  // Update status filter
  const updateStatusFilter = useCallback((statuses: TicketStatus[]) => {
    setCriteria((prev) => ({ ...prev, status: statuses }));
  }, []);

  // Update priority filter
  const updatePriorityFilter = useCallback((priorities: TicketPriority[]) => {
    setCriteria((prev) => ({ ...prev, priority: priorities }));
  }, []);

  // Update assignee filter
  const updateAssigneeFilter = useCallback((assigneeIds: string[]) => {
    setCriteria((prev) => ({ ...prev, assignedAgentId: assigneeIds }));
  }, []);

  // Update tags filter
  const updateTagsFilter = useCallback((tags: string[]) => {
    setCriteria((prev) => ({ ...prev, tags }));
  }, []);

  // Update date range filter
  const updateDateRangeFilter = useCallback((dateRange: DateRange) => {
    setCriteria((prev) => ({ ...prev, dateRange }));
  }, []);

  // Update search query
  const updateSearchQuery = useCallback((query: string) => {
    setCriteria((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // Update custom field filters
  const updateCustomFieldFilters = useCallback((customFields: CustomFieldFilter[]) => {
    setCriteria((prev) => ({ ...prev, customFields }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setCriteria({
      status: [],
      priority: [],
      searchQuery: '',
    });
    setSortBy('date');
    setSortAscending(false);
  }, []);

  // Check if filters are active
  const isFiltered =
    (criteria.status && criteria.status.length > 0) ||
    (criteria.priority && criteria.priority.length > 0) ||
    (criteria.assignedAgentId && criteria.assignedAgentId.length > 0) ||
    (criteria.tags && criteria.tags.length > 0) ||
    (criteria.searchQuery && criteria.searchQuery.length > 0);

  return {
    criteria,
    results: filteredResults,
    isFiltered,
    sortBy,
    sortAscending,
    updateStatusFilter,
    updatePriorityFilter,
    updateAssigneeFilter,
    updateTagsFilter,
    updateDateRangeFilter,
    updateSearchQuery,
    updateCustomFieldFilters,
    resetFilters,
    setSortBy,
    setSortAscending,
  };
}

/**
 * Hook for quick ticket filters
 */
export function useQuickFilters(tickets: Ticket[]) {
  const openTickets = useMemo(() => filterService.getOpenTickets(tickets), [tickets]);
  const highPriorityTickets = useMemo(
    () => filterService.getHighPriorityTickets(tickets),
    [tickets]
  );
  const unassignedTickets = useMemo(() => filterService.getUnassignedTickets(tickets), [tickets]);
  const overdueTickets = useMemo(() => filterService.getOverdueTickets(tickets), [tickets]);
  const atRiskTickets = useMemo(() => filterService.getAtRiskTickets(tickets), [tickets]);

  return {
    openTickets,
    highPriorityTickets,
    unassignedTickets,
    overdueTickets,
    atRiskTickets,
  };
}

/**
 * Hook for grouping and analysis
 */
export function useTicketGrouping(tickets: Ticket[]) {
  const groupedByStatus = useMemo(() => filterService.groupByStatus(tickets), [tickets]);
  const groupedByPriority = useMemo(() => filterService.groupByPriority(tickets), [tickets]);
  const groupedByAssignee = useMemo(() => filterService.groupByAssignee(tickets), [tickets]);
  const summary = useMemo(() => filterService.getFilterSummary(tickets), [tickets]);

  return {
    groupedByStatus,
    groupedByPriority,
    groupedByAssignee,
    summary,
  };
}

/**
 * Hook for managing filter presets (saved filters)
 */
export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const savePreset = useCallback((preset: FilterPreset) => {
    setPresets((prev) => {
      const existing = prev.find((p) => p.id === preset.id);
      if (existing) {
        return prev.map((p) => (p.id === preset.id ? preset : p));
      }
      return [...prev, preset];
    });
  }, []);

  const deletePreset = useCallback((presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }
  }, [activePresetId]);

  const activatePreset = useCallback((presetId: string) => {
    setActivePresetId(presetId);
  }, []);

  const activePreset = presets.find((p) => p.id === activePresetId);

  return {
    presets,
    activePreset,
    activePresetId,
    savePreset,
    deletePreset,
    activatePreset,
  };
}

/**
 * Helper: Build full FilterCriteria from partial
 */
function buildFullCriteria(partial: Partial<FilterCriteria>): FilterCriteria {
  return {
    id: 'temp-' + Date.now(),
    name: 'Dynamic Filter',
    status: partial.status || [],
    priority: partial.priority || [],
    assignedAgentId: partial.assignedAgentId,
    tags: partial.tags,
    customFields: partial.customFields,
    searchQuery: partial.searchQuery,
    dateRange: partial.dateRange,
    slaStatus: partial.slaStatus,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
