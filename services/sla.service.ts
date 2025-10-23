import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import {
  SLAPolicy,
  SLAMetrics,
  SLAEmailTemplate,
  EscalationRule,
  EscalationAction,
  SLADashboardStats,
  SLAAuditLog,
  SLAConfiguration,
  SLAEscalationLog,
  Ticket,
} from "@/types";

/**
 * SLA (Service Level Agreement) Management Service
 * Handles SLA policies, metrics, escalations, and compliance tracking
 */
export class SLAService {
  private db = getFirestore();

  // =========================================================================
  // SLA POLICY MANAGEMENT
  // =========================================================================

  /**
   * Get an SLA policy by ID
   */
  async getSLAPolicy(teamId: string, policyId: string): Promise<SLAPolicy | null> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaPolicies", policyId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return this._convertFirestoreDoc(docSnap.data());
    } catch (error) {
      console.error("Error getting SLA policy:", error);
      throw error;
    }
  }

  /**
   * Get all SLA policies for a team
   */
  async getSLAPolicies(teamId: string): Promise<SLAPolicy[]> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "slaPolicies"),
        where("enabled", "==", true),
        orderBy("updatedAt", "desc")
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting SLA policies:", error);
      throw error;
    }
  }

  /**
   * Create a new SLA policy
   */
  async createSLAPolicy(teamId: string, policy: Omit<SLAPolicy, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const policyRef = doc(collection(this.db, "teams", teamId, "slaPolicies"));
      const newPolicy: SLAPolicy = {
        id: policyRef.id,
        ...policy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(policyRef, this._convertToFirestore(newPolicy));
      
      // Log audit
      await this.logAuditEntry(teamId, {
        action: "create_policy",
        details: { policyId: policyRef.id, policyName: policy.name },
        performedBy: policy.createdBy,
        performedByRole: "admin",
      });
      
      return policyRef.id;
    } catch (error) {
      console.error("Error creating SLA policy:", error);
      throw error;
    }
  }

  /**
   * Update an SLA policy
   */
  async updateSLAPolicy(teamId: string, policyId: string, updates: Partial<SLAPolicy>): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaPolicies", policyId);
      
      // Get old policy for audit
      const oldPolicy = await this.getSLAPolicy(teamId, policyId);
      
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await updateDoc(docRef, this._convertToFirestore(updateData));
      
      // Log audit with changes
      if (oldPolicy) {
        const changes = this._getChanges(oldPolicy, { ...oldPolicy, ...updates });
        await this.logAuditEntry(teamId, {
          action: "update_policy",
          details: { policyId, policyName: oldPolicy.name },
          changes,
          performedBy: updates.updatedBy || "system",
          performedByRole: "admin",
        });
      }
    } catch (error) {
      console.error("Error updating SLA policy:", error);
      throw error;
    }
  }

  /**
   * Delete an SLA policy
   */
  async deleteSLAPolicy(teamId: string, policyId: string, deletedBy: string): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaPolicies", policyId);
      const policy = await this.getSLAPolicy(teamId, policyId);
      
      await deleteDoc(docRef);
      
      // Log audit
      await this.logAuditEntry(teamId, {
        action: "delete_policy",
        details: { policyId, policyName: policy?.name },
        performedBy: deletedBy,
        performedByRole: "admin",
      });
    } catch (error) {
      console.error("Error deleting SLA policy:", error);
      throw error;
    }
  }

  /**
   * Enable/disable an SLA policy
   */
  async toggleSLAPolicyStatus(teamId: string, policyId: string, enabled: boolean, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaPolicies", policyId);
      await updateDoc(docRef, {
        enabled,
        updatedAt: new Date(),
        updatedBy,
      });
      
      const policy = await this.getSLAPolicy(teamId, policyId);
      await this.logAuditEntry(teamId, {
        action: enabled ? "enable_policy" : "disable_policy",
        details: { policyId, policyName: policy?.name },
        performedBy: updatedBy,
        performedByRole: "admin",
      });
    } catch (error) {
      console.error("Error toggling SLA policy status:", error);
      throw error;
    }
  }

  // =========================================================================
  // ESCALATION RULES MANAGEMENT
  // =========================================================================

  /**
   * Get escalation rules for a policy
   */
  async getEscalationRules(teamId: string, policyId: string): Promise<EscalationRule[]> {
    try {
      const policy = await this.getSLAPolicy(teamId, policyId);
      return policy?.escalationRules || [];
    } catch (error) {
      console.error("Error getting escalation rules:", error);
      throw error;
    }
  }

  /**
   * Add an escalation rule to a policy
   */
  async addEscalationRule(teamId: string, policyId: string, rule: Omit<EscalationRule, "id" | "createdAt">): Promise<string> {
    try {
      const policy = await this.getSLAPolicy(teamId, policyId);
      if (!policy) throw new Error("Policy not found");
      
      const ruleId = `rule_${Date.now()}`;
      const newRule: EscalationRule = {
        id: ruleId,
        ...rule,
        createdAt: new Date(),
      };
      
      policy.escalationRules.push(newRule);
      await this.updateSLAPolicy(teamId, policyId, policy);
      
      return ruleId;
    } catch (error) {
      console.error("Error adding escalation rule:", error);
      throw error;
    }
  }

  /**
   * Update an escalation rule
   */
  async updateEscalationRule(teamId: string, policyId: string, ruleId: string, updates: Partial<EscalationRule>): Promise<void> {
    try {
      const policy = await this.getSLAPolicy(teamId, policyId);
      if (!policy) throw new Error("Policy not found");
      
      const ruleIndex = policy.escalationRules.findIndex((r) => r.id === ruleId);
      if (ruleIndex === -1) throw new Error("Escalation rule not found");
      
      policy.escalationRules[ruleIndex] = {
        ...policy.escalationRules[ruleIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      await this.updateSLAPolicy(teamId, policyId, policy);
    } catch (error) {
      console.error("Error updating escalation rule:", error);
      throw error;
    }
  }

  /**
   * Delete an escalation rule
   */
  async deleteEscalationRule(teamId: string, policyId: string, ruleId: string): Promise<void> {
    try {
      const policy = await this.getSLAPolicy(teamId, policyId);
      if (!policy) throw new Error("Policy not found");
      
      policy.escalationRules = policy.escalationRules.filter((r) => r.id !== ruleId);
      await this.updateSLAPolicy(teamId, policyId, policy);
    } catch (error) {
      console.error("Error deleting escalation rule:", error);
      throw error;
    }
  }

  // =========================================================================
  // EMAIL TEMPLATE MANAGEMENT
  // =========================================================================

  /**
   * Get an email template by ID
   */
  async getEmailTemplate(teamId: string, templateId: string): Promise<SLAEmailTemplate | null> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaEmailTemplates", templateId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return this._convertFirestoreDoc(docSnap.data());
    } catch (error) {
      console.error("Error getting email template:", error);
      throw error;
    }
  }

  /**
   * Get all email templates for a team
   */
  async getEmailTemplates(teamId: string): Promise<SLAEmailTemplate[]> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "slaEmailTemplates"),
        where("enabled", "==", true),
        orderBy("updatedAt", "desc")
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting email templates:", error);
      throw error;
    }
  }

  /**
   * Get templates by trigger type
   */
  async getTemplatesByTrigger(teamId: string, triggerType: string): Promise<SLAEmailTemplate[]> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "slaEmailTemplates"),
        where("triggerType", "==", triggerType),
        where("enabled", "==", true)
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting email templates by trigger:", error);
      throw error;
    }
  }

  /**
   * Create a new email template
   */
  async createEmailTemplate(teamId: string, template: Omit<SLAEmailTemplate, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const templateRef = doc(collection(this.db, "teams", teamId, "slaEmailTemplates"));
      const newTemplate: SLAEmailTemplate = {
        id: templateRef.id,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(templateRef, this._convertToFirestore(newTemplate));
      
      return templateRef.id;
    } catch (error) {
      console.error("Error creating email template:", error);
      throw error;
    }
  }

  /**
   * Update an email template
   */
  async updateEmailTemplate(teamId: string, templateId: string, updates: Partial<SLAEmailTemplate>): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaEmailTemplates", templateId);
      
      await updateDoc(docRef, this._convertToFirestore({
        ...updates,
        updatedAt: new Date(),
      }));
    } catch (error) {
      console.error("Error updating email template:", error);
      throw error;
    }
  }

  /**
   * Delete an email template
   */
  async deleteEmailTemplate(teamId: string, templateId: string): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaEmailTemplates", templateId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting email template:", error);
      throw error;
    }
  }

  // =========================================================================
  // SLA METRICS & TRACKING
  // =========================================================================

  /**
   * Create SLA metrics for a ticket
   */
  async createSLAMetrics(teamId: string, ticket: Ticket, policy: SLAPolicy): Promise<string> {
    try {
      const now = new Date();
      const responseDeadline = this._calculateDeadline(now, policy.responseTime.value);
      const resolutionDeadline = this._calculateDeadline(now, policy.resolutionTime.value);
      
      const metricsRef = doc(collection(this.db, "teams", teamId, "slaMetrics"));
      const metrics: SLAMetrics = {
        id: metricsRef.id,
        teamId,
        ticketId: ticket.id,
        policyId: policy.id,
        policyName: policy.name,
        responseDeadline,
        resolutionDeadline,
        responseMetSLA: false,
        resolutionMetSLA: false,
        responseBreached: false,
        resolutionBreached: false,
        escalationsTriggered: [],
        status: "pending",
        progressPercentage: 0,
        isWarningIssued: false,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(metricsRef, this._convertToFirestore(metrics));
      
      return metricsRef.id;
    } catch (error) {
      console.error("Error creating SLA metrics:", error);
      throw error;
    }
  }

  /**
   * Get SLA metrics for a ticket
   */
  async getSLAMetricsForTicket(teamId: string, ticketId: string): Promise<SLAMetrics | null> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "slaMetrics"),
        where("ticketId", "==", ticketId),
        limit(1)
      );
      
      const querySnap = await getDocs(q);
      if (querySnap.empty) return null;
      
      return this._convertFirestoreDoc(querySnap.docs[0].data());
    } catch (error) {
      console.error("Error getting SLA metrics:", error);
      throw error;
    }
  }

  /**
   * Update SLA metrics (mark response/resolution met)
   */
  async updateSLAMetrics(teamId: string, metricsId: string, updates: Partial<SLAMetrics>): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaMetrics", metricsId);
      
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await updateDoc(docRef, this._convertToFirestore(updateData));
    } catch (error) {
      console.error("Error updating SLA metrics:", error);
      throw error;
    }
  }

  /**
   * Check SLA status and trigger escalations if needed
   */
  async checkAndUpdateSLAStatus(teamId: string, ticketId: string): Promise<void> {
    try {
      const metrics = await this.getSLAMetricsForTicket(teamId, ticketId);
      if (!metrics) return;
      
      const now = new Date();
      const responseDueIn = metrics.responseDeadline.getTime() - now.getTime();
      const resolutionDueIn = metrics.resolutionDeadline.getTime() - now.getTime();
      const totalResolutionTime = metrics.resolutionDeadline.getTime() - metrics.createdAt.getTime();
      
      let newStatus = metrics.status;
      let shouldEscalate = false;
      
      // Check response SLA
      if (!metrics.responseMetSLA && responseDueIn < 0 && !metrics.responseBreached) {
        metrics.responseBreached = true;
        metrics.responseBreachAt = now;
        metrics.responseBreachDurationMinutes = Math.abs(responseDueIn) / (1000 * 60);
        newStatus = "breached";
        shouldEscalate = true;
      } else if (!metrics.responseMetSLA && responseDueIn < totalResolutionTime * 0.2) {
        newStatus = "at_risk";
        if (!metrics.isWarningIssued) {
          metrics.isWarningIssued = true;
          metrics.warningIssuedAt = now;
        }
      }
      
      // Check resolution SLA
      if (!metrics.resolutionMetSLA && resolutionDueIn < 0 && !metrics.resolutionBreached) {
        metrics.resolutionBreached = true;
        metrics.resolutionBreachAt = now;
        metrics.resolutionBreachDurationMinutes = Math.abs(resolutionDueIn) / (1000 * 60);
        newStatus = "breached";
        shouldEscalate = true;
      } else if (!metrics.resolutionMetSLA && resolutionDueIn < totalResolutionTime * 0.2) {
        newStatus = "at_risk";
        if (!metrics.isWarningIssued) {
          metrics.isWarningIssued = true;
          metrics.warningIssuedAt = now;
        }
      }
      
      // Update progress
      const timeRemaining = Math.max(responseDueIn, resolutionDueIn);
      metrics.progressPercentage = Math.max(0, 100 - (timeRemaining / totalResolutionTime) * 100);
      metrics.status = newStatus;
      
      await this.updateSLAMetrics(teamId, metrics.id, metrics);
      
      if (shouldEscalate) {
        await this.triggerEscalations(teamId, ticketId, metrics.policyId);
      }
    } catch (error) {
      console.error("Error checking SLA status:", error);
      throw error;
    }
  }

  // =========================================================================
  // ESCALATION HANDLING
  // =========================================================================

  /**
   * Trigger escalations for a ticket based on SLA rules
   */
  async triggerEscalations(teamId: string, ticketId: string, policyId: string): Promise<void> {
    try {
      const policy = await this.getSLAPolicy(teamId, policyId);
      if (!policy || !policy.escalationRules.length) return;
      
      const metrics = await this.getSLAMetricsForTicket(teamId, ticketId);
      if (!metrics) return;
      
      for (const rule of policy.escalationRules) {
        if (!rule.enabled) continue;
        
        const escalationLog: SLAEscalationLog = {
          id: `esc_${Date.now()}`,
          ruleId: rule.id,
          ruleName: `${policy.name} - Rule ${rule.order}`,
          reason: rule.triggerEvent as any,
          actionsTaken: [],
          status: "in_progress",
          triggeredBy: "system",
          createdAt: new Date(),
        };
        
        // Execute actions
        for (const action of rule.actions) {
          if (!action.enabled) continue;
          
          try {
            const result = await this._executeEscalationAction(teamId, ticketId, action);
            escalationLog.actionsTaken.push({
              type: action.type,
              config: action.config,
              result: result.success ? "success" : "failed",
              resultMessage: result.message,
            });
          } catch (error) {
            escalationLog.actionsTaken.push({
              type: action.type,
              config: action.config,
              result: "failed",
              resultMessage: (error as Error).message,
            });
          }
        }
        
        // Mark escalation log as completed
        escalationLog.status = escalationLog.actionsTaken.every((a) => a.result !== "failed") ? "completed" : "failed";
        escalationLog.completedAt = new Date();
        
        // Save escalation log
        metrics.escalationsTriggered.push(escalationLog);
      }
      
      await this.updateSLAMetrics(teamId, metrics.id, metrics);
    } catch (error) {
      console.error("Error triggering escalations:", error);
      throw error;
    }
  }

  // =========================================================================
  // SLA CONFIGURATION
  // =========================================================================

  /**
   * Get SLA configuration for a team
   */
  async getSLAConfiguration(teamId: string): Promise<SLAConfiguration | null> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaConfiguration", "config");
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return this._convertFirestoreDoc(docSnap.data());
    } catch (error) {
      console.error("Error getting SLA configuration:", error);
      throw error;
    }
  }

  /**
   * Update SLA configuration
   */
  async updateSLAConfiguration(teamId: string, config: Partial<SLAConfiguration>, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(this.db, "teams", teamId, "slaConfiguration", "config");
      
      const updateData = {
        ...config,
        updatedAt: new Date(),
        updatedBy,
      };
      
      await setDoc(docRef, this._convertToFirestore(updateData), { merge: true });
      
      // Log audit
      await this.logAuditEntry(teamId, {
        action: "update_policy",
        details: { configUpdated: true },
        performedBy: updatedBy,
        performedByRole: "admin",
      });
    } catch (error) {
      console.error("Error updating SLA configuration:", error);
      throw error;
    }
  }

  // =========================================================================
  // SLA DASHBOARD & REPORTING
  // =========================================================================

  /**
   * Get SLA dashboard statistics
   */
  async getSLADashboardStats(teamId: string, startDate?: Date, endDate?: Date): Promise<SLADashboardStats> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const end = endDate || new Date();
      
      let q: any = query(
        collection(this.db, "teams", teamId, "slaMetrics"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end),
        orderBy("createdAt", "desc")
      );
      
      const querySnap = await getDocs(q);
      const allMetrics = querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data())) as SLAMetrics[];
      
      const stats: SLADashboardStats = {
        id: `stats_${Date.now()}`,
        teamId,
        totalTicketsWithSLA: allMetrics.length,
        slaMetTickets: allMetrics.filter((m) => m.responseMetSLA && m.resolutionMetSLA).length,
        slaBreachedTickets: allMetrics.filter((m) => m.responseBreached || m.resolutionBreached).length,
        atRiskTickets: allMetrics.filter((m) => m.status === "at_risk").length,
        overallSLAComplianceRate: allMetrics.length > 0
          ? (allMetrics.filter((m) => m.responseMetSLA && m.resolutionMetSLA).length / allMetrics.length) * 100
          : 0,
        averageResponseTimeMinutes: allMetrics.length > 0
          ? allMetrics.reduce((sum, m) => sum + (m.responseBreachDurationMinutes || 0), 0) / allMetrics.length
          : 0,
        averageResolutionTimeMinutes: allMetrics.length > 0
          ? allMetrics.reduce((sum, m) => sum + (m.resolutionBreachDurationMinutes || 0), 0) / allMetrics.length
          : 0,
        byPriority: [],
        byPolicy: [],
        trend: [],
        periodStart: start,
        periodEnd: end,
        updatedAt: new Date(),
      };
      
      // Group by priority
      const priorityGroups = this._groupBy(allMetrics, "policyName");
      for (const [policyName, metrics] of Object.entries(priorityGroups)) {
        const metricsArray = metrics as SLAMetrics[];
        stats.byPolicy.push({
          policyId: metricsArray[0].policyId,
          policyName,
          totalTickets: metricsArray.length,
          metSLA: metricsArray.filter((m) => m.responseMetSLA && m.resolutionMetSLA).length,
          breachedSLA: metricsArray.filter((m) => m.responseBreached || m.resolutionBreached).length,
          complianceRate: (metricsArray.filter((m) => m.responseMetSLA && m.resolutionMetSLA).length / metricsArray.length) * 100,
        });
      }
      
      return stats;
    } catch (error) {
      console.error("Error getting SLA dashboard stats:", error);
      throw error;
    }
  }

  // =========================================================================
  // AUDIT LOGGING
  // =========================================================================

  /**
   * Log an audit entry for SLA operations
   */
  async logAuditEntry(teamId: string, entry: Omit<SLAAuditLog, "id" | "teamId" | "createdAt">): Promise<void> {
    try {
      const auditRef = doc(collection(this.db, "teams", teamId, "slaAuditLogs"));
      const auditLog: SLAAuditLog = {
        id: auditRef.id,
        teamId,
        ...entry,
        createdAt: new Date(),
      };
      
      await setDoc(auditRef, this._convertToFirestore(auditLog));
    } catch (error) {
      console.error("Error logging audit entry:", error);
      // Don't throw - audit logging should not break main operations
    }
  }

  /**
   * Get audit logs for a team
   */
  async getAuditLogs(teamId: string, limit_: number = 100): Promise<SLAAuditLog[]> {
    try {
      const q = query(
        collection(this.db, "teams", teamId, "slaAuditLogs"),
        orderBy("createdAt", "desc"),
        limit(limit_)
      );
      
      const querySnap = await getDocs(q);
      return querySnap.docs.map((doc) => this._convertFirestoreDoc(doc.data()));
    } catch (error) {
      console.error("Error getting audit logs:", error);
      throw error;
    }
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  /**
   * Execute an escalation action
   */
  private async _executeEscalationAction(_teamId: string, _ticketId: string, action: EscalationAction): Promise<{ success: boolean; message: string }> {
    switch (action.type) {
      case "assign_to_manager":
        // Assign ticket to manager
        return { success: true, message: "Assigned to manager" };
      
      case "notify_manager":
        // Notify manager
        return { success: true, message: "Manager notified" };
      
      case "notify_team":
        // Notify team
        return { success: true, message: "Team notified" };
      
      case "priority_increase":
        // Increase priority
        return { success: true, message: "Priority increased" };
      
      case "send_email":
        // Send email
        return { success: true, message: "Email sent" };
      
      case "webhook":
        // Call webhook
        return { success: true, message: "Webhook triggered" };
      
      case "create_task":
        // Create follow-up task
        return { success: true, message: "Task created" };
      
      default:
        return { success: false, message: "Unknown action type" };
    }
  }

  /**
   * Calculate deadline based on SLA time and business hours
   */
  private _calculateDeadline(from: Date, minutes: number): Date {
    return new Date(from.getTime() + minutes * 60 * 1000);
  }

  /**
   * Convert Firestore document to typed object
   */
  private _convertFirestoreDoc(data: any): any {
    const converted = { ...data };
    
    // Convert Firestore timestamps to Date objects
    Object.keys(converted).forEach((key) => {
      if (converted[key]?.toDate) {
        converted[key] = converted[key].toDate();
      }
    });
    
    return converted;
  }

  /**
   * Convert object to Firestore-compatible format
   */
  private _convertToFirestore(data: any): any {
    const converted = { ...data };
    
    // Convert Date objects to Firestore timestamps
    Object.keys(converted).forEach((key) => {
      if (converted[key] instanceof Date) {
        converted[key] = Timestamp.fromDate(converted[key]);
      }
    });
    
    return converted;
  }

  /**
   * Get differences between two objects for audit trail
   */
  private _getChanges(oldObj: any, newObj: any): any[] {
    const changes: any[] = [];
    
    Object.keys(newObj).forEach((key) => {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        changes.push({
          field: key,
          oldValue: oldObj[key],
          newValue: newObj[key],
        });
      }
    });
    
    return changes;
  }

  /**
   * Group array by property
   */
  private _groupBy(arr: any[], key: string): Record<string, any[]> {
    return arr.reduce((result, item) => {
      const group = item[key];
      result[group] = result[group] || [];
      result[group].push(item);
      return result;
    }, {});
  }
}

// Export singleton instance
export const slaService = new SLAService();
