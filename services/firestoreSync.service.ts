'use client';

import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Firestore Sync Service
 * Comprehensive data synchronization and persistence layer
 */
export class FirestoreSyncService {
  /**
   * Sync entity to Firestore (create or update)
   */
  static async syncEntity(
    teamId: string,
    entityType: string,
    entityId: string,
    data: Record<string, any>,
    userId: string
  ): Promise<void> {
    const now = Timestamp.now();

    const syncData: Record<string, any> = {
      ...data,
      teamId,
      type: entityType,
      updatedAt: now,
      updatedBy: userId,
      syncedAt: now,
    };

    // If no createdAt, set it
    if (!syncData.createdAt) {
      syncData.createdAt = now;
      syncData.createdBy = userId;
    }

    await setDoc(
      doc(db, 'teams', teamId, this._getCollectionName(entityType), entityId),
      syncData,
      { merge: true }
    );

    // Also sync to global collection for quick access
    await setDoc(
      doc(db, 'global', entityType + 's', entityId),
      {
        teamId,
        ...data,
        syncedAt: now,
      },
      { merge: true }
    );
  }

  /**
   * Batch sync multiple entities
   */
  static async batchSyncEntities(
    teamId: string,
    entityType: string,
    entities: Array<{ id: string; data: Record<string, any> }>,
    userId: string
  ): Promise<void> {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const collectionName = this._getCollectionName(entityType);

    entities.forEach(({ id, data }) => {
      const syncData: Record<string, any> = {
        ...data,
        teamId,
        type: entityType,
        updatedAt: now,
        updatedBy: userId,
        syncedAt: now,
      };

      if (!syncData.createdAt) {
        syncData.createdAt = now;
        syncData.createdBy = userId;
      }

      batch.set(
        doc(db, 'teams', teamId, collectionName, id),
        syncData,
        { merge: true }
      );

      batch.set(
        doc(db, 'global', entityType + 's', id),
        {
          teamId,
          ...data,
          syncedAt: now,
        },
        { merge: true }
      );
    });

    await batch.commit();
  }

  /**
   * Get entity from Firestore
   */
  static async getEntity(
    teamId: string,
    entityType: string,
    entityId: string
  ): Promise<Record<string, any> | null> {
    const docRef = doc(
      db,
      'teams',
      teamId,
      this._getCollectionName(entityType),
      entityId
    );
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return this._convertFromFirestore(docSnap.data());
  }

  /**
   * Get all entities of a type
   */
  static async getEntities(
    teamId: string,
    entityType: string,
    filters?: Array<{ field: string; operator: string; value: any }>
  ): Promise<Record<string, any>[]> {
    const constraints: any[] = [where('teamId', '==', teamId)];

    if (filters) {
      filters.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator as any, value));
      });
    }

    const q = query(
      collection(db, 'teams', teamId, this._getCollectionName(entityType)),
      ...constraints
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => this._convertFromFirestore(doc.data()));
  }

  /**
   * Update entity
   */
  static async updateEntity(
    teamId: string,
    entityType: string,
    entityId: string,
    updates: Record<string, any>,
    userId: string
  ): Promise<void> {
    const now = Timestamp.now();

    const updateData = {
      ...updates,
      updatedAt: now,
      updatedBy: userId,
      syncedAt: now,
    };

    await updateDoc(
      doc(db, 'teams', teamId, this._getCollectionName(entityType), entityId),
      updateData
    );

    // Also update global collection
    await updateDoc(doc(db, 'global', entityType + 's', entityId), {
      ...updates,
      syncedAt: now,
    });
  }

  /**
   * Delete entity
   */
  static async deleteEntity(
    teamId: string,
    entityType: string,
    entityId: string
  ): Promise<void> {
    await deleteDoc(
      doc(db, 'teams', teamId, this._getCollectionName(entityType), entityId)
    );

    // Also delete from global collection
    await deleteDoc(doc(db, 'global', entityType + 's', entityId));
  }

  /**
   * Sync all entities in bulk
   */
  static async bulkSync(
    teamId: string,
    entityType: string,
    entities: Array<{ id: string; data: Record<string, any> }>,
    userId: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    try {
      await this.batchSyncEntities(teamId, entityType, entities, userId);
      success = entities.length;
    } catch (error) {
      console.error('Bulk sync error:', error);
      failed = entities.length;
    }

    return { success, failed };
  }

  /**
   * Search entities
   */
  static async searchEntities(
    teamId: string,
    entityType: string,
    searchField: string,
    searchTerm: string
  ): Promise<Record<string, any>[]> {
    const constraints = [
      where('teamId', '==', teamId),
      where(searchField, '>=', searchTerm),
      where(searchField, '<=', searchTerm + '\uf8ff'),
    ];

    const q = query(
      collection(db, 'teams', teamId, this._getCollectionName(entityType)),
      ...constraints
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => this._convertFromFirestore(doc.data()));
  }

  /**
   * Get sync statistics
   */
  static async getSyncStats(teamId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    lastSync: Date | null;
  }> {
    const entityTypes = ['contacts', 'tickets', 'agents', 'companies'];
    let total = 0;
    const byType: Record<string, number> = {};
    let lastSync: Date | null = null;

    for (const type of entityTypes) {
      const q = query(
        collection(db, 'teams', teamId, type),
        where('teamId', '==', teamId)
      );
      const snapshot = await getDocs(q);
      const count = snapshot.size;

      byType[type] = count;
      total += count;

      // Get last sync time
      snapshot.docs.forEach((doc) => {
        const syncedAt = doc.data().syncedAt?.toDate?.();
        if (syncedAt && (!lastSync || syncedAt > lastSync)) {
          lastSync = syncedAt;
        }
      });
    }

    return { total, byType, lastSync };
  }

  /**
   * Initialize team collections
   */
  static async initializeTeamCollections(teamId: string): Promise<void> {
    const now = Timestamp.now();

    // Create team document
    await setDoc(
      doc(db, 'teams', teamId),
      {
        id: teamId,
        createdAt: now,
        updatedAt: now,
        syncEnabled: true,
      },
      { merge: true }
    );

    // Create collection pointers
    const entityTypes = ['contacts', 'tickets', 'agents', 'companies'];
    for (const type of entityTypes) {
      await setDoc(
        doc(db, 'teams', teamId, '_metadata', type),
        {
          type,
          count: 0,
          lastSyncedAt: now,
        }
      );
    }
  }

  /**
   * Get collection name from entity type
   */
  private static _getCollectionName(entityType: string): string {
    const mapping: Record<string, string> = {
      contact: 'contacts',
      ticket: 'tickets',
      agent: 'agents',
      company: 'companies',
      deal: 'deals',
    };

    return mapping[entityType] || entityType + 's';
  }

  /**
   * Convert Firestore data to JavaScript object
   */
  private static _convertFromFirestore(data: any): Record<string, any> {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      syncedAt: data.syncedAt?.toDate?.() || new Date(data.syncedAt),
    };
  }
}

// Re-export for use as named import
export default FirestoreSyncService;
