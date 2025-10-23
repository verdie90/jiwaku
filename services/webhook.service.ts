/**
 * Webhook Service
 * 
 * Manages webhook endpoints, payload delivery, retry logic, and event triggering.
 * Integrates with Firestore for persistence and includes HMAC signing for security.
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  QueryConstraint,
} from 'firebase/firestore';
import {
  WebhookEndpoint,
  WebhookPayload,
  WebhookDelivery,
  WebhookTest,
  WebhookEventType,
  WebhookSignature,
} from '@/types';
import crypto from 'crypto';

export class WebhookService {
  private readonly MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
  private readonly WEBHOOK_TIMEOUT = 30000; // 30 seconds
  private readonly RETRY_BACKOFF_MULTIPLIER = 1.5;

  /**
   * Create a new webhook endpoint
   */
  async createWebhook(teamId: string, endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookEndpoint> {
    const db = getFirestore();
    const webhookId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate secret for signing
    const secret = this.generateSecret();
    
    const webhookData: WebhookEndpoint = {
      ...endpoint,
      id: webhookId,
      teamId,
      secret,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'teams', teamId, 'webhooks', webhookId), webhookData);
    return webhookData;
  }

  /**
   * Get webhook by ID
   */
  async getWebhookById(teamId: string, webhookId: string): Promise<WebhookEndpoint | null> {
    const db = getFirestore();
    const docSnap = await getDoc(doc(db, 'teams', teamId, 'webhooks', webhookId));
    return docSnap.exists() ? (docSnap.data() as WebhookEndpoint) : null;
  }

  /**
   * Get all webhooks for a team
   */
  async getTeamWebhooks(teamId: string, filters?: { isActive?: boolean; eventType?: WebhookEventType }): Promise<WebhookEndpoint[]> {
    const db = getFirestore();
    const constraints: QueryConstraint[] = [];
    
    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }

    const webhooksQuery = query(
      collection(db, 'teams', teamId, 'webhooks'),
      ...constraints
    );

    const snapshot = await getDocs(webhooksQuery);
    let webhooks = snapshot.docs.map(doc => doc.data() as WebhookEndpoint);

    // Filter by event type if specified
    if (filters?.eventType) {
      webhooks = webhooks.filter(w => w.events.includes(filters.eventType!));
    }

    return webhooks;
  }

  /**
   * Update webhook
   */
  async updateWebhook(teamId: string, webhookId: string, updates: Partial<WebhookEndpoint>): Promise<void> {
    const db = getFirestore();
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    await updateDoc(doc(db, 'teams', teamId, 'webhooks', webhookId), updateData);
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(teamId: string, webhookId: string): Promise<void> {
    const db = getFirestore();
    await deleteDoc(doc(db, 'teams', teamId, 'webhooks', webhookId));
  }

  /**
   * Toggle webhook active status
   */
  async toggleWebhook(teamId: string, webhookId: string): Promise<void> {
    const db = getFirestore();
    const webhook = await this.getWebhookById(teamId, webhookId);
    if (!webhook) throw new Error('Webhook not found');
    
    await updateDoc(doc(db, 'teams', teamId, 'webhooks', webhookId), {
      isActive: !webhook.isActive,
      updatedAt: new Date(),
    });
  }

  /**
   * Verify webhook by sending test payload
   */
  async verifyWebhook(teamId: string, webhookId: string): Promise<WebhookTest> {
    const webhook = await this.getWebhookById(teamId, webhookId);
    if (!webhook) throw new Error('Webhook not found');

    const testPayload: WebhookPayload = {
      id: `test-${Date.now()}`,
      timestamp: new Date(),
      event: 'ticket.created',
      teamId,
      data: {
        ticketId: 'TEST-001',
        title: 'Test Webhook Payload',
        description: 'This is a test webhook delivery',
      },
      metadata: {
        userId: 'webhook-service',
      },
    };

    const test: WebhookTest = {
      id: `test-${Date.now()}`,
      webhookId,
      eventType: 'ticket.created',
      payload: testPayload,
      status: 'failed',
      duration: 0,
      createdAt: new Date(),
    };

    const startTime = Date.now();
    try {
      const response = await this.sendWebhookRequest(webhook, testPayload);
      test.status = 'success';
      test.responseStatus = response.status;
      test.responseBody = response.body;
    } catch (error: any) {
      test.status = error.message.includes('timeout') ? 'timeout' : 'failed';
      test.error = error.message;
    }
    test.duration = Date.now() - startTime;

    // Save test result
    const db = getFirestore();
    await setDoc(
      doc(db, 'teams', teamId, 'webhookTests', test.id),
      test
    );

    return test;
  }

  /**
   * Trigger webhook for an event
   */
  async triggerWebhook(
    teamId: string,
    eventType: WebhookEventType,
    data: Record<string, any>,
    previousData?: Record<string, any>
  ): Promise<void> {
    const webhooks = await this.getTeamWebhooks(teamId, { isActive: true, eventType });
    
    const payload: WebhookPayload = {
      id: `payload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      event: eventType,
      teamId,
      data,
      previousData,
      metadata: {},
    };

    // Validate payload size
    if (JSON.stringify(payload).length > this.MAX_PAYLOAD_SIZE) {
      throw new Error('Payload exceeds maximum size');
    }

    // Queue deliveries for all matching webhooks
    for (const webhook of webhooks) {
      // Check filters
      if (webhook.filters && !this.checkFilters(webhook.filters, data)) {
        continue;
      }

      await this.queueDelivery(teamId, webhook, payload);
    }
  }

  /**
   * Queue a webhook delivery
   */
  private async queueDelivery(teamId: string, webhook: WebhookEndpoint, payload: WebhookPayload): Promise<void> {
    const db = getFirestore();
    const deliveryId = `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookId: webhook.id,
      payloadId: payload.id,
      status: 'pending',
      attempt: 1,
      maxAttempts: webhook.maxRetries,
      createdAt: new Date(),
    };

    await setDoc(
      doc(db, 'teams', teamId, 'webhookDeliveries', deliveryId),
      delivery
    );

    // Attempt immediate delivery
    await this.processDelivery(teamId, webhook, payload, delivery);
  }

  /**
   * Process a webhook delivery
   */
  async processDelivery(
    teamId: string,
    webhook: WebhookEndpoint,
    payload: WebhookPayload,
    delivery: WebhookDelivery
  ): Promise<void> {
    const db = getFirestore();
    const deliveryRef = doc(db, 'teams', teamId, 'webhookDeliveries', delivery.id);

    try {
      const response = await this.sendWebhookRequest(webhook, payload);

      // Success
      await updateDoc(deliveryRef, {
        status: 'success',
        responseStatus: response.status,
        responseBody: response.body,
        deliveredAt: new Date(),
        duration: response.duration,
      });

      // Update webhook last triggered
      await this.updateWebhook(teamId, webhook.id, {
        lastTriggeredAt: new Date(),
      });
    } catch (error: any) {
      const nextAttempt = delivery.attempt + 1;
      const isExhausted = nextAttempt > delivery.maxAttempts;

      if (isExhausted) {
        // Mark as failed
        await updateDoc(deliveryRef, {
          status: 'failed',
          error: error.message,
        });

        // Update webhook error status
        await this.updateWebhook(teamId, webhook.id, {
          lastErrorAt: new Date(),
          lastErrorMessage: error.message,
        });
      } else {
        // Schedule retry
        const delaySeconds = Math.pow(webhook.retryDelaySeconds, nextAttempt * this.RETRY_BACKOFF_MULTIPLIER);
        const nextRetryAt = new Date(Date.now() + delaySeconds * 1000);

        await updateDoc(deliveryRef, {
          status: 'retrying',
          attempt: nextAttempt,
          error: error.message,
          nextRetryAt,
        });
      }
    }
  }

  /**
   * Retry failed deliveries
   */
  async retryFailedDeliveries(teamId: string): Promise<number> {
    const now = new Date();

    const deliveriesQuery = query(
      collection(getFirestore(), 'teams', teamId, 'webhookDeliveries'),
      where('status', '==', 'retrying'),
      where('nextRetryAt', '<=', now)
    );

    const snapshot = await getDocs(deliveriesQuery);
    let retriedCount = 0;

    for (const deliveryDoc of snapshot.docs) {
      const delivery = deliveryDoc.data() as WebhookDelivery;
      const webhook = await this.getWebhookById(teamId, delivery.webhookId);

      if (webhook) {
        // Fetch original payload (in real app, you'd store this)
        // For now, we'll create a placeholder
        const payload: WebhookPayload = {
          id: delivery.payloadId,
          timestamp: new Date(),
          event: 'ticket.created',
          teamId,
          data: {},
        };

        await this.processDelivery(teamId, webhook, payload, delivery);
        retriedCount++;
      }
    }

    return retriedCount;
  }

  /**
   * Get delivery history
   */
  async getDeliveryHistory(
    teamId: string,
    webhookId: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    const db = getFirestore();
    const deliveriesQuery = query(
      collection(db, 'teams', teamId, 'webhookDeliveries'),
      where('webhookId', '==', webhookId)
    );

    const snapshot = await getDocs(deliveriesQuery);
    return snapshot.docs
      .map(doc => doc.data() as WebhookDelivery)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(teamId: string, webhookId: string): Promise<{
    totalDeliveries: number;
    successCount: number;
    failedCount: number;
    retryingCount: number;
    successRate: number;
    lastDelivery: WebhookDelivery | null;
  }> {
    const history = await this.getDeliveryHistory(teamId, webhookId, 1000);

    const stats = {
      totalDeliveries: history.length,
      successCount: history.filter(d => d.status === 'success').length,
      failedCount: history.filter(d => d.status === 'failed').length,
      retryingCount: history.filter(d => d.status === 'retrying').length,
      successRate: history.length > 0 ? (history.filter(d => d.status === 'success').length / history.length) * 100 : 0,
      lastDelivery: history[0] || null,
    };

    return stats;
  }

  /**
   * Send webhook HTTP request
   */
  private async sendWebhookRequest(
    webhook: WebhookEndpoint,
    payload: WebhookPayload
  ): Promise<{ status: number; body: string; duration: number }> {
    const startTime = Date.now();
    const signature = this.createSignature(payload, webhook.secret || '');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-ID': webhook.id,
      'X-Webhook-Timestamp': payload.timestamp.toISOString(),
      'X-Webhook-Signature': signature.signature,
      'X-Webhook-Signature-Timestamp': signature.timestamp.toString(),
      ...webhook.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout || this.WEBHOOK_TIMEOUT);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const body = await response.text();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${body}`);
      }

      return {
        status: response.status,
        body,
        duration,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Create HMAC signature
   */
  private createSignature(payload: WebhookPayload, secret: string): WebhookSignature {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    return {
      timestamp,
      signature: `v1=${signature}`,
    };
  }

  /**
   * Verify HMAC signature
   */
  verifySignature(payload: string, signature: string, secret: string, timestamp: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    
    // Check timestamp is within 5 minutes
    if (Math.abs(now - timestamp) > 300) {
      return false;
    }

    const message = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    const providedSignature = signature.replace('v1=', '');
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate random secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check if data matches webhook filters
   */
  private checkFilters(filters: any[], data: Record<string, any>): boolean {
    return filters.every(filter => {
      const value = this.getNestedValue(data, filter.field);

      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'not_equals':
          return value !== filter.value;
        case 'contains':
          return String(value).includes(String(filter.value));
        case 'greater_than':
          return Number(value) > Number(filter.value);
        case 'less_than':
          return Number(value) < Number(filter.value);
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        case 'regex':
          return new RegExp(filter.value).test(String(value));
        default:
          return true;
      }
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export const webhookService = new WebhookService();
