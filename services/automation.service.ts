import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import {
  AutomationRule,
  RuleTrigger,
  RuleCondition,
  RuleAction,
  RuleExecution,
  Ticket,
} from '@/types';

/**
 * Automation Service
 * Handles creation, execution, and management of automation rules
 * Supports triggers, conditions, and actions for tickets
 */

class AutomationService {
  private readonly rulesCollection = 'automationRules';
  private readonly executionLogsCollection = 'ruleExecutionLogs';

  /**
   * Get all automation rules for a team
   */
  async getAll(teamId: string): Promise<AutomationRule[]> {
    try {
      const db = getFirebaseFirestore();
      const q = query(
        collection(db, this.rulesCollection),
        where('teamId', '==', teamId),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.docToRule(doc));
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      throw error;
    }
  }

  /**
   * Get active automation rules for a team
   */
  async getActive(teamId: string): Promise<AutomationRule[]> {
    try {
      const db = getFirebaseFirestore();
      const q = query(
        collection(db, this.rulesCollection),
        where('teamId', '==', teamId),
        where('isActive', '==', true),
        orderBy('priority', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.docToRule(doc));
    } catch (error) {
      console.error('Error fetching active automation rules:', error);
      throw error;
    }
  }

  /**
   * Get a specific automation rule by ID
   */
  async getById(ruleId: string): Promise<AutomationRule | null> {
    try {
      const db = getFirebaseFirestore();
      const docSnap = await getDoc(doc(db, this.rulesCollection, ruleId));
      return docSnap.exists() ? this.docToRule(docSnap) : null;
    } catch (error) {
      console.error('Error fetching automation rule:', error);
      throw error;
    }
  }

  /**
   * Create a new automation rule
   */
  async create(
    teamId: string,
    name: string,
    description: string,
    triggers: RuleTrigger[],
    conditions: RuleCondition[],
    actions: RuleAction[],
    userId: string,
    priority: number = 5
  ): Promise<AutomationRule> {
    try {
      this.validateRule(triggers, conditions, actions);

      const db = getFirebaseFirestore();
      const ruleId = doc(collection(db, this.rulesCollection)).id;
      const now = Timestamp.now();

      const rule: AutomationRule = {
        id: ruleId,
        teamId,
        name,
        description,
        isActive: true,
        priority: Math.max(1, Math.min(10, priority)),
        triggers,
        conditions,
        actions,
        executeCount: 0,
        errorCount: 0,
        createdBy: userId,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      await setDoc(doc(db, this.rulesCollection, ruleId), {
        ...rule,
        createdAt: now,
        updatedAt: now,
      });

      return rule;
    } catch (error) {
      console.error('Error creating automation rule:', error);
      throw error;
    }
  }

  /**
   * Update an existing automation rule
   */
  async update(
    ruleId: string,
    updates: Partial<AutomationRule>
  ): Promise<AutomationRule | null> {
    try {
      const existingRule = await this.getById(ruleId);
      if (!existingRule) return null;

      // Validate if triggers/conditions/actions are being updated
      if (updates.triggers || updates.conditions || updates.actions) {
        this.validateRule(
          updates.triggers || existingRule.triggers,
          updates.conditions || existingRule.conditions,
          updates.actions || existingRule.actions
        );
      }

      const db = getFirebaseFirestore();
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, this.rulesCollection, ruleId), updateData);

      return this.getById(ruleId);
    } catch (error) {
      console.error('Error updating automation rule:', error);
      throw error;
    }
  }

  /**
   * Delete an automation rule
   */
  async delete(ruleId: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      await deleteDoc(doc(db, this.rulesCollection, ruleId));
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      throw error;
    }
  }

  /**
   * Toggle rule active status
   */
  async toggleActive(ruleId: string): Promise<AutomationRule | null> {
    try {
      const rule = await this.getById(ruleId);
      if (!rule) return null;

      const db = getFirebaseFirestore();
      await updateDoc(doc(db, this.rulesCollection, ruleId), {
        isActive: !rule.isActive,
        updatedAt: Timestamp.now(),
      });

      return this.getById(ruleId);
    } catch (error) {
      console.error('Error toggling rule active status:', error);
      throw error;
    }
  }

  /**
   * Check if a ticket matches rule conditions
   */
  checkConditions(ticket: Ticket, conditions: RuleCondition[]): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition =>
      this.evaluateCondition(ticket, condition)
    );
  }

  /**
   * Evaluate a single condition against a ticket
   */
  private evaluateCondition(ticket: Ticket, condition: RuleCondition): boolean {
    const value = this.getTicketFieldValue(ticket, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'not_contains':
        return !String(value).includes(String(condition.value));
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return !Array.isArray(condition.value) || !condition.value.includes(value);
      case 'starts_with':
        return String(value).startsWith(String(condition.value));
      case 'ends_with':
        return String(value).endsWith(String(condition.value));
      default:
        return true;
    }
  }

  /**
   * Get ticket field value by path
   */
  private getTicketFieldValue(ticket: Ticket, field: string): any {
    const parts = field.split('.');
    let value: any = ticket;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Execute actions on a ticket
   */
  async executeActions(
    ticket: Ticket,
    actions: RuleAction[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };

    for (const action of actions) {
      try {
        await this.executeAction(ticket, action);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Action ${action.type} failed: ${error}`);
      }
    }

    return result;
  }

  /**
   * Execute a single action on a ticket
   */
  private async executeAction(ticket: Ticket, action: RuleAction): Promise<void> {
    switch (action.type) {
      case 'assign':
        await this.assignTicket(ticket.id, action.targetValue);
        break;
      case 'set_priority':
        await this.setTicketPriority(ticket.id, action.targetValue);
        break;
      case 'set_status':
        await this.setTicketStatus(ticket.id, action.targetValue);
        break;
      case 'add_tag':
        await this.addTicketTag(ticket.id, action.targetValue);
        break;
      case 'remove_tag':
        await this.removeTicketTag(ticket.id, action.targetValue);
        break;
      case 'add_category':
        await this.addTicketCategory(ticket.id, action.targetValue);
        break;
      case 'set_custom_field':
        if (action.customData) {
          await this.setTicketCustomField(
            ticket.id,
            action.customData.fieldName,
            action.targetValue
          );
        }
        break;
      case 'send_notification':
        // Notification would be sent via messaging service
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Process a ticket against all active rules
   */
  async processTicket(ticket: Ticket, teamId: string): Promise<RuleExecution[]> {
    try {
      const rules = await this.getActive(teamId);
      const executions: RuleExecution[] = [];

      // Sort by priority
      const sortedRules = rules.sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        const execution = await this.executeRule(rule, ticket);
        executions.push(execution);
      }

      return executions;
    } catch (error) {
      console.error('Error processing ticket against rules:', error);
      throw error;
    }
  }

  /**
   * Execute a specific rule against a ticket
   */
  async executeRule(rule: AutomationRule, ticket: Ticket): Promise<RuleExecution> {
    const db = getFirebaseFirestore();
    const executionId = doc(collection(db, this.executionLogsCollection)).id;
    const now = Timestamp.now();

    const execution: RuleExecution = {
      id: executionId,
      ruleId: rule.id,
      ticketId: ticket.id,
      triggeredAt: now.toDate(),
      status: 'success',
      executedActions: 0,
      failedActions: 0,
    };

    try {
      // Check if conditions match
      if (!this.checkConditions(ticket, rule.conditions)) {
        execution.status = 'skipped';
      } else {
        // Execute all actions
        const actionResults = await this.executeActions(ticket, rule.actions);
        execution.executedActions = actionResults.success;
        execution.failedActions = actionResults.failed;

        if (actionResults.failed > 0) {
          execution.status = 'failed';
          execution.error = actionResults.errors.join('; ');
        }
      }

      // Update rule execution stats
      await updateDoc(doc(db, this.rulesCollection, rule.id), {
        executeCount: (rule.executeCount || 0) + 1,
        errorCount:
          (rule.errorCount || 0) + (execution.status === 'failed' ? 1 : 0),
        lastExecutedAt: now,
      });

      // Log execution
      await setDoc(
        doc(db, this.executionLogsCollection, executionId),
        execution
      );

      return execution;
    } catch (error) {
      console.error('Error executing rule:', error);
      execution.status = 'failed';
      execution.error = String(error);
      execution.failedActions = rule.actions.length;

      // Log failed execution
      await setDoc(
        doc(db, this.executionLogsCollection, executionId),
        execution
      );

      return execution;
    }
  }

  /**
   * Get execution logs for a rule
   */
  async getExecutionLogs(
    ruleId: string,
    limit: number = 50
  ): Promise<RuleExecution[]> {
    try {
      const db = getFirebaseFirestore();
      const q = query(
        collection(db, this.executionLogsCollection),
        where('ruleId', '==', ruleId),
        orderBy('triggeredAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .slice(0, limit)
        .map(doc => doc.data() as RuleExecution);
    } catch (error) {
      console.error('Error fetching execution logs:', error);
      throw error;
    }
  }

  /**
   * Get rule statistics
   */
  async getStatistics(ruleId: string): Promise<any> {
    try {
      const rule = await this.getById(ruleId);
      if (!rule) return null;

      const logs = await this.getExecutionLogs(ruleId, 100);

      const stats = {
        ruleId,
        totalExecutions: rule.executeCount || 0,
        totalErrors: rule.errorCount || 0,
        successRate: rule.executeCount
          ? (((rule.executeCount - (rule.errorCount || 0)) /
              rule.executeCount) *
              100)
            .toFixed(2) + '%'
          : 'N/A',
        recentExecutions: logs.slice(0, 10),
        lastExecutedAt: rule.lastExecutedAt,
        avgActionsPerExecution:
          logs.length > 0
            ? (
                logs.reduce((sum, log) => sum + log.executedActions, 0) /
                logs.length
              ).toFixed(2)
            : 0,
      };

      return stats;
    } catch (error) {
      console.error('Error calculating rule statistics:', error);
      throw error;
    }
  }

  /**
   * Batch update rules
   */
  async batchUpdateStatus(
    ruleIds: string[],
    isActive: boolean
  ): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const batch = writeBatch(db);
      const now = Timestamp.now();

      ruleIds.forEach(ruleId => {
        batch.update(doc(db, this.rulesCollection, ruleId), {
          isActive,
          updatedAt: now,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error batch updating rules:', error);
      throw error;
    }
  }

  /**
   * Validate rule configuration
   */
  private validateRule(
    triggers: RuleTrigger[],
    _conditions: RuleCondition[],
    actions: RuleAction[]
  ): void {
    if (!triggers || triggers.length === 0) {
      throw new Error('Rule must have at least one trigger');
    }

    if (!actions || actions.length === 0) {
      throw new Error('Rule must have at least one action');
    }

    // Validate actions
    const validActionTypes = [
      'assign',
      'set_priority',
      'set_status',
      'add_tag',
      'remove_tag',
      'add_category',
      'send_notification',
      'set_custom_field',
      'create_related_ticket',
      'update_sla',
    ];

    actions.forEach(action => {
      if (!validActionTypes.includes(action.type)) {
        throw new Error(`Invalid action type: ${action.type}`);
      }
    });
  }

  /**
   * Helper methods for ticket updates
   */
  private async assignTicket(ticketId: string, agentId: string): Promise<void> {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'tickets', ticketId), {
      assignedAgentId: agentId,
      updatedAt: Timestamp.now(),
    });
  }

  private async setTicketPriority(
    ticketId: string,
    priority: string
  ): Promise<void> {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'tickets', ticketId), {
      priority,
      updatedAt: Timestamp.now(),
    });
  }

  private async setTicketStatus(
    ticketId: string,
    status: string
  ): Promise<void> {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'tickets', ticketId), {
      status,
      updatedAt: Timestamp.now(),
    });
  }

  private async addTicketTag(ticketId: string, tag: string): Promise<void> {
    const db = getFirebaseFirestore();
    const ticket = await getDoc(doc(db, 'tickets', ticketId));
    const tags = ticket.data()?.tags || [];
    if (!tags.includes(tag)) {
      tags.push(tag);
      await updateDoc(doc(db, 'tickets', ticketId), {
        tags,
        updatedAt: Timestamp.now(),
      });
    }
  }

  private async removeTicketTag(ticketId: string, tag: string): Promise<void> {
    const db = getFirebaseFirestore();
    const ticket = await getDoc(doc(db, 'tickets', ticketId));
    const tags = ticket.data()?.tags || [];
    const filtered = tags.filter((t: string) => t !== tag);
    await updateDoc(doc(db, 'tickets', ticketId), {
      tags: filtered,
      updatedAt: Timestamp.now(),
    });
  }

  private async addTicketCategory(
    ticketId: string,
    category: string
  ): Promise<void> {
    const db = getFirebaseFirestore();
    const ticket = await getDoc(doc(db, 'tickets', ticketId));
    const categories = ticket.data()?.categories || [];
    if (!categories.includes(category)) {
      categories.push(category);
      await updateDoc(doc(db, 'tickets', ticketId), {
        categories,
        updatedAt: Timestamp.now(),
      });
    }
  }

  private async setTicketCustomField(
    ticketId: string,
    fieldName: string,
    value: any
  ): Promise<void> {
    const db = getFirebaseFirestore();
    const ticket = await getDoc(doc(db, 'tickets', ticketId));
    const customFields = ticket.data()?.customFields || {};
    customFields[fieldName] = value;
    await updateDoc(doc(db, 'tickets', ticketId), {
      customFields,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Convert Firestore document to AutomationRule
   */
  private docToRule(doc: any): AutomationRule {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      lastExecutedAt: data.lastExecutedAt?.toDate?.() || data.lastExecutedAt,
    };
  }
}

export const automationService = new AutomationService();
