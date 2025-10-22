import { Ticket, FilterCriteria, DateRange, CustomFieldFilter } from '@/types';
import { TicketStatus, TicketPriority } from '@/config/constants';

class FilterService {
  /**
   * Apply complex filter criteria to tickets
   */
  applyFilters(tickets: Ticket[], criteria: FilterCriteria): Ticket[] {
    let filtered = [...tickets];

    // Filter by status
    if (criteria.status.length > 0) {
      filtered = filtered.filter((t) => criteria.status.includes(t.status));
    }

    // Filter by priority
    if (criteria.priority.length > 0) {
      filtered = filtered.filter((t) => criteria.priority.includes(t.priority));
    }

    // Filter by assigned agent
    if (criteria.assignedAgentId && criteria.assignedAgentId.length > 0) {
      filtered = filtered.filter((t) =>
        criteria.assignedAgentId!.includes(t.assignedAgentId || '')
      );
    }

    // Filter by contact
    if (criteria.contactId && criteria.contactId.length > 0) {
      filtered = filtered.filter((t) => criteria.contactId!.includes(t.contactId));
    }

    // Filter by tags (match any tag)
    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter((t) =>
        t.tags?.some((tag) => criteria.tags!.includes(tag))
      );
    }

    // Filter by categories (match any category)
    if (criteria.categories && criteria.categories.length > 0) {
      filtered = filtered.filter((t) =>
        t.categories?.some((cat) => criteria.categories!.includes(cat))
      );
    }

    // Filter by date range
    if (criteria.dateRange) {
      filtered = this.applyDateRangeFilter(filtered, criteria.dateRange);
    }

    // Filter by SLA status
    if (criteria.slaStatus && criteria.slaStatus.length > 0) {
      filtered = filtered.filter((t) =>
        t.sla && criteria.slaStatus!.includes(t.sla.status)
      );
    }

    // Filter by custom fields
    if (criteria.customFields && criteria.customFields.length > 0) {
      filtered = this.applyCustomFieldFilters(filtered, criteria.customFields);
    }

    // Full-text search
    if (criteria.searchQuery) {
      filtered = this.applySearchFilter(filtered, criteria.searchQuery);
    }

    return filtered;
  }

  /**
   * Apply date range filter to tickets
   */
  private applyDateRangeFilter(tickets: Ticket[], dateRange: DateRange): Ticket[] {
    const { startDate, endDate, type = 'created' } = dateRange;

    return tickets.filter((ticket) => {
      let dateToCheck: Date | undefined;

      switch (type) {
        case 'created':
          dateToCheck = ticket.createdAt;
          break;
        case 'updated':
          dateToCheck = ticket.updatedAt;
          break;
        case 'resolved':
          dateToCheck = ticket.resolvedAt;
          break;
        case 'closed':
          dateToCheck = ticket.closedAt;
          break;
      }

      if (!dateToCheck) return false;

      if (startDate && dateToCheck < startDate) return false;
      if (endDate && dateToCheck > endDate) return false;

      return true;
    });
  }

  /**
   * Apply custom field filters
   */
  private applyCustomFieldFilters(
    tickets: Ticket[],
    customFilters: CustomFieldFilter[]
  ): Ticket[] {
    return tickets.filter((ticket) => {
      return customFilters.every((filter) => {
        const fieldValue = ticket.customFields?.[filter.fieldName];

        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value;
          case 'contains':
            return String(fieldValue || '').includes(String(filter.value));
          case 'gt':
            return Number(fieldValue) > Number(filter.value);
          case 'lt':
            return Number(fieldValue) < Number(filter.value);
          case 'between':
            return (
              Number(fieldValue) >= Number(filter.value) &&
              Number(fieldValue) <= Number(filter.value2)
            );
          default:
            return true;
        }
      });
    });
  }

  /**
   * Apply full-text search across ticket fields
   */
  private applySearchFilter(tickets: Ticket[], query: string): Ticket[] {
    const lowerQuery = query.toLowerCase();

    return tickets.filter((ticket) => {
      const searchableFields = [
        ticket.id.toLowerCase(),
        ticket.title.toLowerCase(),
        ticket.description.toLowerCase(),
        ticket.status.toLowerCase(),
        ticket.priority.toLowerCase(),
        ticket.tags?.join(' ').toLowerCase() || '',
        ticket.categories?.join(' ').toLowerCase() || '',
      ];

      return searchableFields.some((field) => field.includes(lowerQuery));
    });
  }

  /**
   * Get open tickets
   */
  getOpenTickets(tickets: Ticket[]): Ticket[] {
    return tickets.filter((t) => t.status === TicketStatus.OPEN);
  }

  /**
   * Get tickets by priority level
   */
  getHighPriorityTickets(tickets: Ticket[]): Ticket[] {
    return tickets.filter((t) =>
      [TicketPriority.URGENT, TicketPriority.HIGH].includes(t.priority)
    );
  }

  /**
   * Get unassigned tickets
   */
  getUnassignedTickets(tickets: Ticket[]): Ticket[] {
    return tickets.filter((t) => !t.assignedAgentId);
  }

  /**
   * Get overdue tickets (past SLA resolution time)
   */
  getOverdueTickets(tickets: Ticket[]): Ticket[] {
    const now = new Date();

    return tickets.filter((ticket) => {
      if (!ticket.sla || ticket.status === TicketStatus.RESOLVED) {
        return false;
      }

      if (!ticket.sla.respondedAt) {
        // Not responded yet - check response SLA
        const createdTime = ticket.createdAt.getTime();
        const responseSLA = ticket.sla.responseTime * 60 * 1000; // Convert minutes to ms
        const responseDeadline = createdTime + responseSLA;

        return now.getTime() > responseDeadline;
      }

      // Already responded - check resolution SLA
      const respondedTime = ticket.sla.respondedAt.getTime();
      const resolutionSLA = ticket.sla.resolutionTime * 60 * 1000;
      const resolutionDeadline = respondedTime + resolutionSLA;

      return now.getTime() > resolutionDeadline;
    });
  }

  /**
   * Get tickets that will breach SLA soon
   */
  getAtRiskTickets(tickets: Ticket[], warningThresholdMinutes: number = 60): Ticket[] {
    const now = new Date();

    return tickets.filter((ticket) => {
      if (!ticket.sla || ticket.status === TicketStatus.RESOLVED) {
        return false;
      }

      const warningTimeMs = warningThresholdMinutes * 60 * 1000;

      if (!ticket.sla.respondedAt) {
        const createdTime = ticket.createdAt.getTime();
        const responseSLA = ticket.sla.responseTime * 60 * 1000;
        const responseDeadline = createdTime + responseSLA;
        const warningDeadline = responseDeadline - warningTimeMs;

        return now.getTime() > warningDeadline && now.getTime() <= responseDeadline;
      }

      const respondedTime = ticket.sla.respondedAt.getTime();
      const resolutionSLA = ticket.sla.resolutionTime * 60 * 1000;
      const resolutionDeadline = respondedTime + resolutionSLA;
      const warningDeadline = resolutionDeadline - warningTimeMs;

      return now.getTime() > warningDeadline && now.getTime() <= resolutionDeadline;
    });
  }

  /**
   * Group tickets by status
   */
  groupByStatus(tickets: Ticket[]): Record<string, Ticket[]> {
    const grouped: Record<string, Ticket[]> = {};

    tickets.forEach((ticket) => {
      if (!grouped[ticket.status]) {
        grouped[ticket.status] = [];
      }
      grouped[ticket.status].push(ticket);
    });

    return grouped;
  }

  /**
   * Group tickets by priority
   */
  groupByPriority(tickets: Ticket[]): Record<string, Ticket[]> {
    const grouped: Record<string, Ticket[]> = {};

    tickets.forEach((ticket) => {
      if (!grouped[ticket.priority]) {
        grouped[ticket.priority] = [];
      }
      grouped[ticket.priority].push(ticket);
    });

    return grouped;
  }

  /**
   * Group tickets by assigned agent
   */
  groupByAssignee(tickets: Ticket[]): Record<string, Ticket[]> {
    const grouped: Record<string, Ticket[]> = {};

    tickets.forEach((ticket) => {
      const assignee = ticket.assignedAgentId || 'Unassigned';
      if (!grouped[assignee]) {
        grouped[assignee] = [];
      }
      grouped[assignee].push(ticket);
    });

    return grouped;
  }

  /**
   * Get tickets by date range with count
   */
  getTicketsByDateRange(
    tickets: Ticket[],
    startDate: Date,
    endDate: Date
  ): { tickets: Ticket[]; count: number } {
    const filtered = tickets.filter((ticket) => {
      return ticket.createdAt >= startDate && ticket.createdAt <= endDate;
    });

    return { tickets: filtered, count: filtered.length };
  }

  /**
   * Get tickets with specific tags
   */
  getTicketsWithTags(tickets: Ticket[], tags: string[], matchAll: boolean = false): Ticket[] {
    return tickets.filter((ticket) => {
      if (!ticket.tags || ticket.tags.length === 0) return false;

      if (matchAll) {
        return tags.every((tag) => ticket.tags?.includes(tag));
      }

      return tags.some((tag) => ticket.tags?.includes(tag));
    });
  }

  /**
   * Build a summary of filterable properties
   */
  getFilterSummary(tickets: Ticket[]): {
    statuses: { status: string; count: number }[];
    priorities: { priority: string; count: number }[];
    tags: { tag: string; count: number }[];
    assignees: { assigneeId: string; count: number }[];
    dateRange: { min: Date; max: Date };
  } {
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    const assigneeCounts: Record<string, number> = {};

    let minDate = new Date();
    let maxDate = new Date(0);

    tickets.forEach((ticket) => {
      // Status count
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;

      // Priority count
      priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;

      // Tag counts
      ticket.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Assignee count
      const assignee = ticket.assignedAgentId || 'unassigned';
      assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;

      // Date range
      if (ticket.createdAt < minDate) minDate = ticket.createdAt;
      if (ticket.createdAt > maxDate) maxDate = ticket.createdAt;
    });

    return {
      statuses: Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count),
      priorities: Object.entries(priorityCounts)
        .map(([priority, count]) => ({ priority, count }))
        .sort((a, b) => b.count - a.count),
      tags: Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count),
      assignees: Object.entries(assigneeCounts)
        .map(([assigneeId, count]) => ({ assigneeId, count }))
        .sort((a, b) => b.count - a.count),
      dateRange: { min: minDate, max: maxDate },
    };
  }

  /**
   * Sort tickets by various criteria
   */
  sortTickets(
    tickets: Ticket[],
    sortBy: 'priority' | 'date' | 'status' | 'title' = 'date',
    ascending: boolean = false
  ): Ticket[] {
    const sorted = [...tickets];
    const direction = ascending ? 1 : -1;

    switch (sortBy) {
      case 'priority':
        const priorityOrder = [TicketPriority.URGENT, TicketPriority.HIGH, TicketPriority.MEDIUM, TicketPriority.LOW];
        sorted.sort(
          (a, b) =>
            (priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)) *
            direction
        );
        break;

      case 'date':
        sorted.sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime()) * direction);
        break;

      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status) * direction);
        break;

      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title) * direction);
        break;
    }

    return sorted;
  }
}

// Export singleton instance
export const filterService = new FilterService();
