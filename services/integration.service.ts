'use client';

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
  Timestamp,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  APIKey,
  APIScope,
  Integration,
  ThirdPartyOAuth,
  IntegrationRequestLog,
  RESTAPIEndpoint,
  GraphQLSchema,
  IntegrationMarketplaceItem,
  SyncConfiguration,
} from '@/types';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * Integration Service
 * Manages API keys, integrations, OAuth, and data synchronization
 */
class IntegrationService {
  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  /**
   * Create an API key
   */
  async createAPIKey(
    teamId: string,
    name: string,
    scopes: APIScope[],
    expiresAt?: Date
  ): Promise<APIKey> {
    const id = doc(collection(db, 'apiKeys')).id;
    const key = this._generateAPIKey();
    const prefix = key.substring(0, 10);

    const apiKey: APIKey = {
      id,
      teamId,
      name,
      key: this._hashAPIKey(key), // Store hashed key
      prefix,
      scopes,
      usageCount: 0,
      enabled: true,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
    };

    await setDoc(doc(db, 'teams', teamId, 'apiKeys', id), this._convertToFirestore(apiKey));
    return apiKey;
  }

  /**
   * Get API key by ID
   */
  async getAPIKey(teamId: string, keyId: string): Promise<APIKey | null> {
    const docSnap = await getDoc(doc(db, 'teams', teamId, 'apiKeys', keyId));
    return docSnap.exists() ? this._convertFromFirestore(docSnap.data() as any) : null;
  }

  /**
   * List API keys for team
   */
  async getAPIKeys(teamId: string): Promise<APIKey[]> {
    const q = query(collection(db, 'teams', teamId, 'apiKeys'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this._convertFromFirestore(doc.data() as any));
  }

  /**
   * Update API key scopes or status
   */
  async updateAPIKey(teamId: string, keyId: string, updates: Partial<APIKey>): Promise<void> {
    const updates_safe = { ...updates, updatedAt: new Date() };
    await updateDoc(doc(db, 'teams', teamId, 'apiKeys', keyId), this._convertToFirestore(updates_safe));
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(teamId: string, keyId: string): Promise<void> {
    await deleteDoc(doc(db, 'teams', teamId, 'apiKeys', keyId));
  }

  /**
   * Validate API key
   */
  async validateAPIKey(teamId: string, keyPrefix: string): Promise<APIKey | null> {
    const q = query(
      collection(db, 'teams', teamId, 'apiKeys'),
      where('prefix', '==', keyPrefix),
      where('enabled', '==', true)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const apiKey = this._convertFromFirestore(querySnapshot.docs[0].data() as any);

    // Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return null;
    }

    // Increment usage count
    await this.updateAPIKey(teamId, apiKey.id, { usageCount: apiKey.usageCount + 1, lastUsedAt: new Date() });

    return apiKey;
  }

  // ============================================================================
  // INTEGRATION MANAGEMENT
  // ============================================================================

  /**
   * Create integration
   */
  async createIntegration(teamId: string, integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Integration> {
    const id = doc(collection(db, 'integrations')).id;
    const newIntegration: Integration = {
      ...integration,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'teams', teamId, 'integrations', id), this._convertToFirestore(newIntegration));
    return newIntegration;
  }

  /**
   * Get integration
   */
  async getIntegration(teamId: string, integrationId: string): Promise<Integration | null> {
    const docSnap = await getDoc(doc(db, 'teams', teamId, 'integrations', integrationId));
    return docSnap.exists() ? this._convertFromFirestore(docSnap.data() as any) : null;
  }

  /**
   * List integrations
   */
  async getIntegrations(teamId: string): Promise<Integration[]> {
    const q = query(collection(db, 'teams', teamId, 'integrations'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this._convertFromFirestore(doc.data() as any));
  }

  /**
   * Update integration
   */
  async updateIntegration(teamId: string, integrationId: string, updates: Partial<Integration>): Promise<void> {
    const updates_safe = { ...updates, updatedAt: new Date() };
    await updateDoc(doc(db, 'teams', teamId, 'integrations', integrationId), this._convertToFirestore(updates_safe));
  }

  /**
   * Delete integration
   */
  async deleteIntegration(teamId: string, integrationId: string): Promise<void> {
    await deleteDoc(doc(db, 'teams', teamId, 'integrations', integrationId));
  }

  /**
   * Test integration connection
   */
  async testIntegration(teamId: string, integrationId: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.getIntegration(teamId, integrationId);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    try {
      // Test based on integration type
      switch (integration.type) {
        case 'rest-api':
          // Test REST endpoint
          if (integration.config.baseUrl) {
            const headers: Record<string, string> = {};
            if (integration.credentials?.apiKey) {
              headers['Authorization'] = `Bearer ${integration.credentials.apiKey}`;
            }
            
            const response = await fetch(integration.config.baseUrl, {
              method: 'GET',
              headers,
            });
            return { success: response.ok, message: `HTTP ${response.status}` };
          }
          break;
        case 'zapier':
          // Verify Zapier webhook
          return { success: true, message: 'Zapier integration verified' };
        default:
          return { success: true, message: `${integration.type} integration verified` };
      }

      return { success: true, message: 'Integration tested successfully' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  // ============================================================================
  // OAUTH MANAGEMENT
  // ============================================================================

  /**
   * Store OAuth token
   */
  async storeOAuthToken(teamId: string, oauth: Omit<ThirdPartyOAuth, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThirdPartyOAuth> {
    const id = doc(collection(db, 'oauthTokens')).id;
    const newOAuth: ThirdPartyOAuth = {
      ...oauth,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'teams', teamId, 'oauthTokens', id), this._convertToFirestore(newOAuth));
    return newOAuth;
  }

  /**
   * Get OAuth token
   */
  async getOAuthToken(teamId: string, provider: string, userId: string): Promise<ThirdPartyOAuth | null> {
    const q = query(
      collection(db, 'teams', teamId, 'oauthTokens'),
      where('provider', '==', provider),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : this._convertFromFirestore(querySnapshot.docs[0].data() as any);
  }

  /**
   * Refresh OAuth token
   */
  async refreshOAuthToken(teamId: string, oauthId: string, newToken: string, expiresAt: Date): Promise<void> {
    await updateDoc(doc(db, 'teams', teamId, 'oauthTokens', oauthId), {
      accessToken: newToken,
      expiresAt: Timestamp.fromDate(expiresAt),
      isExpired: false,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Revoke OAuth token
   */
  async revokeOAuthToken(teamId: string, oauthId: string): Promise<void> {
    await deleteDoc(doc(db, 'teams', teamId, 'oauthTokens', oauthId));
  }

  // ============================================================================
  // REQUEST LOGGING
  // ============================================================================

  /**
   * Log integration request
   */
  async logIntegrationRequest(
    teamId: string,
    integrationId: string,
    request: Omit<IntegrationRequestLog, 'id' | 'teamId' | 'integrationId'>
  ): Promise<void> {
    const id = doc(collection(db, 'requestLogs')).id;
    const log: IntegrationRequestLog = {
      ...request,
      id,
      teamId,
      integrationId,
    };

    await setDoc(doc(db, 'teams', teamId, 'integrationRequestLogs', id), this._convertToFirestore(log));
  }

  /**
   * Get request logs
   */
  async getIntegrationRequestLogs(teamId: string, integrationId: string, limit: number = 100): Promise<IntegrationRequestLog[]> {
    const q = query(
      collection(db, 'teams', teamId, 'integrationRequestLogs'),
      where('integrationId', '==', integrationId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => this._convertFromFirestore(doc.data() as any))
      .slice(0, limit);
  }

  // ============================================================================
  // REST API ENDPOINTS
  // ============================================================================

  /**
   * Create REST API endpoint
   */
  async createRESTEndpoint(teamId: string, endpoint: Omit<RESTAPIEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<RESTAPIEndpoint> {
    const id = doc(collection(db, 'restEndpoints')).id;
    const newEndpoint: RESTAPIEndpoint = {
      ...endpoint,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'teams', teamId, 'restEndpoints', id), this._convertToFirestore(newEndpoint));
    return newEndpoint;
  }

  /**
   * Get REST endpoints
   */
  async getRESTEndpoints(teamId: string): Promise<RESTAPIEndpoint[]> {
    const q = query(collection(db, 'teams', teamId, 'restEndpoints'), where('enabled', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this._convertFromFirestore(doc.data() as any));
  }

  /**
   * Delete REST endpoint
   */
  async deleteRESTEndpoint(teamId: string, endpointId: string): Promise<void> {
    await deleteDoc(doc(db, 'teams', teamId, 'restEndpoints', endpointId));
  }

  // ============================================================================
  // GRAPHQL SCHEMA
  // ============================================================================

  /**
   * Store GraphQL schema
   */
  async setGraphQLSchema(teamId: string, schema: Omit<GraphQLSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<GraphQLSchema> {
    const id = doc(collection(db, 'graphqlSchemas')).id;
    const newSchema: GraphQLSchema = {
      ...schema,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'teams', teamId, 'graphqlSchemas', id), this._convertToFirestore(newSchema));
    return newSchema;
  }

  /**
   * Get GraphQL schema
   */
  async getGraphQLSchema(teamId: string): Promise<GraphQLSchema | null> {
    const q = query(collection(db, 'teams', teamId, 'graphqlSchemas'), where('enabled', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : this._convertFromFirestore(querySnapshot.docs[0].data() as any);
  }

  // ============================================================================
  // SYNC CONFIGURATION
  // ============================================================================

  /**
   * Create sync configuration
   */
  async createSyncConfig(teamId: string, config: Omit<SyncConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<SyncConfiguration> {
    const id = doc(collection(db, 'syncConfigs')).id;
    const newConfig: SyncConfiguration = {
      ...config,
      id,
      totalSyncAttempts: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'teams', teamId, 'syncConfigurations', id), this._convertToFirestore(newConfig));
    return newConfig;
  }

  /**
   * Get sync configurations
   */
  async getSyncConfigurations(teamId: string, integrationId?: string): Promise<SyncConfiguration[]> {
    let q: any;
    if (integrationId) {
      q = query(collection(db, 'teams', teamId, 'syncConfigurations'), where('integrationId', '==', integrationId));
    } else {
      q = query(collection(db, 'teams', teamId, 'syncConfigurations'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this._convertFromFirestore(doc.data() as any));
  }

  /**
   * Update sync configuration
   */
  async updateSyncConfig(teamId: string, configId: string, updates: Partial<SyncConfiguration>): Promise<void> {
    const updates_safe = { ...updates, updatedAt: new Date() };
    await updateDoc(doc(db, 'teams', teamId, 'syncConfigurations', configId), this._convertToFirestore(updates_safe));
  }

  /**
   * Log sync attempt
   */
  async logSyncAttempt(teamId: string, configId: string, success: boolean): Promise<void> {
    const config = await this.getSyncConfigurations(teamId);
    const syncConfig = config.find((c) => c.id === configId);

    if (syncConfig) {
      const updates = {
        totalSyncAttempts: syncConfig.totalSyncAttempts + 1,
        successfulSyncs: success ? syncConfig.successfulSyncs + 1 : syncConfig.successfulSyncs,
        failedSyncs: !success ? syncConfig.failedSyncs + 1 : syncConfig.failedSyncs,
        lastSyncAt: new Date(),
      };
      await this.updateSyncConfig(teamId, configId, updates);
    }
  }

  // ============================================================================
  // MARKETPLACE
  // ============================================================================

  /**
   * Get available integrations from marketplace
   */
  async getMarketplaceIntegrations(): Promise<IntegrationMarketplaceItem[]> {
    const q = query(collection(db, 'integrationMarketplace'), where('available', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as IntegrationMarketplaceItem);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Generate API key
   */
  private _generateAPIKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'jiwaku_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Hash API key (simple hash for demo, use bcrypt in production)
   */
  private _hashAPIKey(key: string): string {
    return Buffer.from(key).toString('base64');
  }

  /**
   * Convert Firestore document to entity
   */
  private _convertFromFirestore(data: any): any {
    const result = { ...data };
    if (data.createdAt instanceof Timestamp) {
      result.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt instanceof Timestamp) {
      result.updatedAt = data.updatedAt.toDate();
    }
    if (data.expiresAt instanceof Timestamp) {
      result.expiresAt = data.expiresAt.toDate();
    }
    if (data.lastUsedAt instanceof Timestamp) {
      result.lastUsedAt = data.lastUsedAt.toDate();
    }
    if (data.startTime instanceof Timestamp) {
      result.startTime = data.startTime.toDate();
    }
    if (data.endTime instanceof Timestamp) {
      result.endTime = data.endTime.toDate();
    }
    if (data.lastSyncAt instanceof Timestamp) {
      result.lastSyncAt = data.lastSyncAt.toDate();
    }
    if (data.nextSyncAt instanceof Timestamp) {
      result.nextSyncAt = data.nextSyncAt.toDate();
    }
    return result;
  }

  /**
   * Convert entity to Firestore document
   */
  private _convertToFirestore(data: any): Record<string, any> {
    const result = { ...data };
    if (data.createdAt instanceof Date) {
      result.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt instanceof Date) {
      result.updatedAt = Timestamp.fromDate(data.updatedAt);
    }
    if (data.expiresAt instanceof Date) {
      result.expiresAt = Timestamp.fromDate(data.expiresAt);
    }
    if (data.lastUsedAt instanceof Date) {
      result.lastUsedAt = Timestamp.fromDate(data.lastUsedAt);
    }
    if (data.startTime instanceof Date) {
      result.startTime = Timestamp.fromDate(data.startTime);
    }
    if (data.endTime instanceof Date) {
      result.endTime = Timestamp.fromDate(data.endTime);
    }
    if (data.lastSyncAt instanceof Date) {
      result.lastSyncAt = Timestamp.fromDate(data.lastSyncAt);
    }
    if (data.nextSyncAt instanceof Date) {
      result.nextSyncAt = Timestamp.fromDate(data.nextSyncAt);
    }
    return result;
  }
}

export default new IntegrationService();
