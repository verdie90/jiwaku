'use client';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CustomField, CustomFieldValue } from '@/types/customFields';

/**
 * Custom Fields Service - Firestore integration
 * Manages all custom field operations and persistence
 */
export class CustomFieldsService {
  /**
   * Create a new custom field
   */
  static async createCustomField(
    teamId: string,
    field: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<CustomField> {
    const fieldId = doc(collection(db, 'temp')).id;
    const now = Timestamp.now();

    const customField: CustomField = {
      id: fieldId,
      ...field,
      teamId,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      createdBy: userId,
    };

    await setDoc(
      doc(db, 'teams', teamId, 'customFields', fieldId),
      {
        ...customField,
        createdAt: now,
        updatedAt: now,
      }
    );

    return customField;
  }

  /**
   * Get custom field by ID
   */
  static async getCustomField(teamId: string, fieldId: string): Promise<CustomField | null> {
    const docRef = doc(db, 'teams', teamId, 'customFields', fieldId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return this._convertFromFirestore(docSnap.data() as any);
  }

  /**
   * Get all custom fields for a team
   */
  static async getCustomFields(
    teamId: string,
    enabled?: boolean
  ): Promise<CustomField[]> {
    const constraints: QueryConstraint[] = [where('teamId', '==', teamId)];

    if (enabled !== undefined) {
      constraints.push(where('enabled', '==', enabled));
    }

    const q = query(collection(db, 'teams', teamId, 'customFields'), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => this._convertFromFirestore(doc.data() as any));
  }

  /**
   * Update custom field
   */
  static async updateCustomField(
    teamId: string,
    fieldId: string,
    updates: Partial<CustomField>
  ): Promise<CustomField> {
    const now = Timestamp.now();

    await updateDoc(doc(db, 'teams', teamId, 'customFields', fieldId), {
      ...updates,
      updatedAt: now,
    });

    const updated = await this.getCustomField(teamId, fieldId);
    if (!updated) throw new Error('Field not found after update');

    return updated;
  }

  /**
   * Delete custom field
   */
  static async deleteCustomField(teamId: string, fieldId: string): Promise<void> {
    await deleteDoc(doc(db, 'teams', teamId, 'customFields', fieldId));
  }

  /**
   * Batch create custom fields
   */
  static async batchCreateCustomFields(
    teamId: string,
    fields: Array<Omit<CustomField, 'id' | 'createdAt' | 'updatedAt'>>,
    userId: string
  ): Promise<CustomField[]> {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const createdFields: CustomField[] = [];

    fields.forEach((field) => {
      const fieldId = doc(collection(db, 'temp')).id;

      const customField: CustomField = {
        id: fieldId,
        ...field,
        teamId,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        createdBy: userId,
      };

      batch.set(doc(db, 'teams', teamId, 'customFields', fieldId), {
        ...customField,
        createdAt: now,
        updatedAt: now,
      });

      createdFields.push(customField);
    });

    await batch.commit();
    return createdFields;
  }

  /**
   * Set custom field value for an entity
   */
  static async setCustomFieldValue(
    teamId: string,
    entityType: string,
    entityId: string,
    fieldId: string,
    value: any,
    userId: string
  ): Promise<void> {
    const now = Timestamp.now();

    const fieldValue: CustomFieldValue = {
      fieldId,
      value,
      updatedAt: now.toDate(),
      updatedBy: userId,
    };

    await setDoc(
      doc(
        db,
        'teams',
        teamId,
        entityType + 's', // contacts, tickets, etc.
        entityId,
        'customFieldValues',
        fieldId
      ),
      {
        ...fieldValue,
        updatedAt: now,
      }
    );

    // Also update parent entity's customFieldValues map
    await updateDoc(doc(db, 'teams', teamId, entityType + 's', entityId), {
      [`customFieldValues.${fieldId}`]: value,
      updatedAt: now,
    });
  }

  /**
   * Get custom field values for an entity
   */
  static async getCustomFieldValues(
    teamId: string,
    entityType: string,
    entityId: string
  ): Promise<Record<string, any>> {
    const docRef = doc(db, 'teams', teamId, entityType + 's', entityId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return {};

    const data = docSnap.data();
    return data.customFieldValues || {};
  }

  /**
   * Batch set custom field values
   */
  static async batchSetCustomFieldValues(
    teamId: string,
    entityType: string,
    entityId: string,
    values: Record<string, any>,
    userId: string
  ): Promise<void> {
    const batch = writeBatch(db);
    const now = Timestamp.now();

    Object.entries(values).forEach(([fieldId, value]) => {
      batch.set(
        doc(
          db,
          'teams',
          teamId,
          entityType + 's',
          entityId,
          'customFieldValues',
          fieldId
        ),
        {
          fieldId,
          value,
          updatedAt: now,
          updatedBy: userId,
        }
      );
    });

    batch.update(doc(db, 'teams', teamId, entityType + 's', entityId), {
      customFieldValues: values,
      updatedAt: now,
    });

    await batch.commit();
  }

  /**
   * Delete custom field value
   */
  static async deleteCustomFieldValue(
    teamId: string,
    entityType: string,
    entityId: string,
    fieldId: string
  ): Promise<void> {
    await deleteDoc(
      doc(
        db,
        'teams',
        teamId,
        entityType + 's',
        entityId,
        'customFieldValues',
        fieldId
      )
    );

    // Update parent entity to remove field value
    const fieldValues = await this.getCustomFieldValues(teamId, entityType, entityId);
    delete fieldValues[fieldId];

    await updateDoc(doc(db, 'teams', teamId, entityType + 's', entityId), {
      customFieldValues: fieldValues,
    });
  }

  /**
   * Convert Firestore data to CustomField
   */
  private static _convertFromFirestore(data: any): CustomField {
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    };
  }

  /**
   * Validate custom field value against field configuration
   */
  static validateFieldValue(field: CustomField, value: any): { valid: boolean; error?: string } {
    if (field.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: `${field.label} is required` };
    }

    if (!value) return { valid: true };

    switch (field.type) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, error: 'Invalid email format' };
        }
        break;
      }

      case 'phone': {
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
          return { valid: false, error: 'Invalid phone number' };
        }
        break;
      }

      case 'number': {
        if (typeof value !== 'number') {
          return { valid: false, error: 'Must be a number' };
        }
        if (field.validation?.min && value < field.validation.min) {
          return { valid: false, error: `Minimum value is ${field.validation.min}` };
        }
        if (field.validation?.max && value > field.validation.max) {
          return { valid: false, error: `Maximum value is ${field.validation.max}` };
        }
        break;
      }

      case 'text': {
        if (typeof value !== 'string') {
          return { valid: false, error: 'Must be text' };
        }
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return {
            valid: false,
            error: `Minimum ${field.validation.minLength} characters`,
          };
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return {
            valid: false,
            error: `Maximum ${field.validation.maxLength} characters`,
          };
        }
        break;
      }

      case 'select':
      case 'multiselect': {
        const validOptions = field.options?.map((opt) => opt.value) || [];
        const valuesToCheck = Array.isArray(value) ? value : [value];
        if (!valuesToCheck.every((v) => validOptions.includes(v))) {
          return { valid: false, error: 'Invalid option selected' };
        }
        break;
      }
    }

    return { valid: true };
  }
}
