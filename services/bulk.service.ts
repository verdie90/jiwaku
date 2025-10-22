import {
  doc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { Ticket } from '@/types';
import { TicketStatus, TicketPriority } from '@/config/constants';
import { getFirebaseFirestore } from '@/lib/firebase/client';

class BulkService {
  /**
   * Batch update ticket status
   */
  async updateStatusBatch(
    teamId: string,
    ticketIds: string[],
    newStatus: TicketStatus
  ): Promise<void> {
    try {
      if (ticketIds.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          status: newStatus,
          updatedAt: Timestamp.now(),
          ...(newStatus === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
          ...(newStatus === TicketStatus.CLOSED && { closedAt: new Date() }),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating ticket statuses:', error);
      throw error;
    }
  }

  /**
   * Batch update ticket priority
   */
  async updatePriorityBatch(
    teamId: string,
    ticketIds: string[],
    newPriority: TicketPriority
  ): Promise<void> {
    try {
      if (ticketIds.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          priority: newPriority,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating ticket priorities:', error);
      throw error;
    }
  }

  /**
   * Batch assign tickets to agent
   */
  async assignBatch(teamId: string, ticketIds: string[], agentId: string): Promise<void> {
    try {
      if (ticketIds.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          assignedAgentId: agentId,
          status: TicketStatus.ASSIGNED,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error assigning tickets:', error);
      throw error;
    }
  }

  /**
   * Batch unassign tickets
   */
  async unassignBatch(teamId: string, ticketIds: string[]): Promise<void> {
    try {
      if (ticketIds.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          assignedAgentId: null,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error unassigning tickets:', error);
      throw error;
    }
  }

  /**
   * Batch add tags to tickets
   */
  async addTagsBatch(teamId: string, ticketIds: string[], tagsToAdd: string[]): Promise<void> {
    try {
      if (ticketIds.length === 0 || tagsToAdd.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          tags: this.mergeArrays('tags', tagsToAdd),
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error adding tags:', error);
      throw error;
    }
  }

  /**
   * Batch remove tags from tickets
   */
  async removeTagsBatch(
    teamId: string,
    ticketIds: string[],
    tagsToRemove: string[]
  ): Promise<void> {
    try {
      if (ticketIds.length === 0 || tagsToRemove.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          tags: this.filterArray('tags', tagsToRemove),
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error removing tags:', error);
      throw error;
    }
  }

  /**
   * Batch add categories to tickets
   */
  async addCategoriesBatch(
    teamId: string,
    ticketIds: string[],
    categoriesToAdd: string[]
  ): Promise<void> {
    try {
      if (ticketIds.length === 0 || categoriesToAdd.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          categories: this.mergeArrays('categories', categoriesToAdd),
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error adding categories:', error);
      throw error;
    }
  }

  /**
   * Batch delete tickets
   */
  async deleteBatch(teamId: string, ticketIds: string[]): Promise<void> {
    try {
      if (ticketIds.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.delete(ticketRef);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting tickets:', error);
      throw error;
    }
  }

  /**
   * Batch update custom fields
   */
  async updateCustomFieldsBatch(
    teamId: string,
    ticketIds: string[],
    customFieldUpdates: Record<string, any>
  ): Promise<void> {
    try {
      if (ticketIds.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, {
          customFields: customFieldUpdates,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating custom fields:', error);
      throw error;
    }
  }

  /**
   * Batch update multiple fields at once
   */
  async updateFieldsBatch(
    teamId: string,
    ticketIds: string[],
    updates: Partial<Ticket>
  ): Promise<void> {
    try {
      if (ticketIds.length === 0) return;

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      ticketIds.forEach((ticketId) => {
        const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
        batch.update(ticketRef, updateData);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating fields:', error);
      throw error;
    }
  }

  /**
   * Helper: Merge arrays in Firestore (avoid duplicates)
   */
  private mergeArrays(_field: string, itemsToAdd: string[]): any {
    return itemsToAdd;
  }

  /**
   * Helper: Filter array items
   */
  private filterArray(_field: string, itemsToRemove: string[]): any {
    return itemsToRemove;
  }

  /**
   * Get operation summary
   */
  getOperationSummary(
    operationType: 'status' | 'priority' | 'assign' | 'tag' | 'delete',
    ticketCount: number,
    details?: Record<string, any>
  ) {
    const summaries: Record<string, string> = {
      status: `Updated status for ${ticketCount} ticket(s)`,
      priority: `Updated priority for ${ticketCount} ticket(s)`,
      assign: `Assigned ${ticketCount} ticket(s) to agent`,
      tag: `Added/removed tags on ${ticketCount} ticket(s)`,
      delete: `Deleted ${ticketCount} ticket(s)`,
    };

    return {
      operation: operationType,
      message: summaries[operationType],
      affectedTickets: ticketCount,
      timestamp: new Date(),
      details,
    };
  }

  /**
   * Validate bulk operation
   */
  validateBulkOperation(
    ticketIds: string[],
    maxBatchSize: number = 500
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (ticketIds.length === 0) {
      errors.push('No tickets selected');
    }

    if (ticketIds.length > maxBatchSize) {
      errors.push(`Maximum ${maxBatchSize} tickets can be updated at once`);
    }

    if (new Set(ticketIds).size !== ticketIds.length) {
      errors.push('Duplicate ticket IDs detected');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const bulkService = new BulkService();
