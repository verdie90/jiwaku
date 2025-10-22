import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { TicketTemplate, Ticket, TicketTemplateField } from '@/types';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import { TicketStatus } from '@/config/constants';

class TemplateService {
  /**
   * Get all ticket templates for a team
   */
  async getAll(teamId: string): Promise<TicketTemplate[]> {
    try {
      const db = getFirebaseFirestore();
      const templatesRef = collection(db, 'teams', teamId, 'ticketTemplates');
      const q = query(
        templatesRef,
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => this.mapDocToTemplate(doc));
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getById(teamId: string, templateId: string): Promise<TicketTemplate | null> {
    try {
      const db = getFirebaseFirestore();
      const templateRef = doc(db, 'teams', teamId, 'ticketTemplates', templateId);
      const snapshot = await getDoc(templateRef);

      if (!snapshot.exists()) {
        return null;
      }

      return this.mapDocToTemplate(snapshot);
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getByCategory(teamId: string, category: string): Promise<TicketTemplate[]> {
    try {
      const db = getFirebaseFirestore();
      const templatesRef = collection(db, 'teams', teamId, 'ticketTemplates');
      const q = query(
        templatesRef,
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => this.mapDocToTemplate(doc));
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }
  }

  /**
   * Get favorite templates
   */
  async getFavorites(teamId: string): Promise<TicketTemplate[]> {
    try {
      const db = getFirebaseFirestore();
      const templatesRef = collection(db, 'teams', teamId, 'ticketTemplates');
      const q = query(
        templatesRef,
        where('isFavorite', '==', true),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => this.mapDocToTemplate(doc));
    } catch (error) {
      console.error('Error fetching favorite templates:', error);
      throw error;
    }
  }

  /**
   * Get most used templates
   */
  async getMostUsed(teamId: string, limit_count: number = 5): Promise<TicketTemplate[]> {
    try {
      const db = getFirebaseFirestore();
      const templatesRef = collection(db, 'teams', teamId, 'ticketTemplates');
      const q = query(
        templatesRef,
        where('isActive', '==', true),
        orderBy('usageCount', 'desc'),
        limit(limit_count)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => this.mapDocToTemplate(doc));
    } catch (error) {
      console.error('Error fetching most used templates:', error);
      throw error;
    }
  }

  /**
   * Create a new template
   */
  async create(
    teamId: string,
    data: Omit<TicketTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): Promise<TicketTemplate> {
    try {
      const db = getFirebaseFirestore();
      const templatesRef = collection(db, 'teams', teamId, 'ticketTemplates');

      const newTemplate = {
        ...data,
        teamId,
        usageCount: 0,
        isActive: true,
        isFavorite: data.isFavorite || false,
        customFields: data.customFields || [],
        tags: data.tags || [],
        categories: data.categories || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(templatesRef, newTemplate);

      return {
        id: docRef.id,
        ...newTemplate,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TicketTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update a template
   */
  async update(
    teamId: string,
    templateId: string,
    data: Partial<TicketTemplate>
  ): Promise<TicketTemplate | null> {
    try {
      const db = getFirebaseFirestore();
      const templateRef = doc(db, 'teams', teamId, 'ticketTemplates', templateId);

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(templateRef, updateData);

      return this.getById(teamId, templateId);
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete a template (soft delete by marking inactive)
   */
  async delete(teamId: string, templateId: string): Promise<void> {
    try {
      await this.update(teamId, templateId, { isActive: false });
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Permanently delete a template
   */
  async permanentlyDelete(teamId: string, templateId: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const templateRef = doc(db, 'teams', teamId, 'ticketTemplates', templateId);

      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error permanently deleting template:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(
    teamId: string,
    templateId: string,
    isFavorite: boolean
  ): Promise<TicketTemplate | null> {
    try {
      return this.update(teamId, templateId, { isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Increment usage count when template is applied
   */
  async incrementUsage(teamId: string, templateId: string): Promise<TicketTemplate | null> {
    try {
      const template = await this.getById(teamId, templateId);
      if (!template) return null;

      return this.update(teamId, templateId, {
        usageCount: (template.usageCount || 0) + 1,
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }

  /**
   * Create a ticket from a template
   */
  async createTicketFromTemplate(
    teamId: string,
    templateId: string,
    contactId: string,
    customData?: Partial<Ticket>,
    fieldValues?: Record<string, any>
  ): Promise<Ticket | null> {
    try {
      const template = await this.getById(teamId, templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Import ticket service dynamically to avoid circular dependency
      const { ticketService } = await import('./ticket.service');

      // Build custom fields with provided values
      const customFields: Record<string, any> = {};
      if (template.customFields) {
        template.customFields.forEach((field: TicketTemplateField) => {
          customFields[field.name] = fieldValues?.[field.name] ?? field.defaultValue ?? '';
        });
      }

      // Create ticket with template data
      const ticket = await ticketService.create(teamId, contactId, {
        title: customData?.title || template.name,
        description: customData?.description || template.responseTemplate || '',
        priority: customData?.priority || template.priority,
        status: customData?.status || template.status || ('open' as TicketStatus),
        tags: [...(template.tags || []), ...(customData?.tags || [])],
        categories: [...(template.categories || []), ...(customData?.categories || [])],
        customFields,
      });

      // Update ticket with template-specific fields
      if (template.defaultAssigneeId && !customData?.assignedAgentId) {
        await ticketService.assignTicket(teamId, ticket.id, template.defaultAssigneeId);
      }

      // Increment template usage
      await this.incrementUsage(teamId, templateId);

      return ticket;
    } catch (error) {
      console.error('Error creating ticket from template:', error);
      throw error;
    }
  }

  /**
   * Search templates
   */
  async search(teamId: string, query: string): Promise<TicketTemplate[]> {
    try {
      const templates = await this.getAll(teamId);
      const lowerQuery = query.toLowerCase();

      return templates.filter(
        (template) =>
          template.name.toLowerCase().includes(lowerQuery) ||
          template.description?.toLowerCase().includes(lowerQuery) ||
          template.category.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching templates:', error);
      throw error;
    }
  }

  /**
   * Get template statistics
   */
  async getStatistics(teamId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    favorites: number;
    totalUsage: number;
  }> {
    try {
      const templates = await this.getAll(teamId);

      const stats = {
        total: templates.length,
        byCategory: {} as Record<string, number>,
        favorites: 0,
        totalUsage: 0,
      };

      templates.forEach((template) => {
        // Count by category
        stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;

        // Count favorites
        if (template.isFavorite) {
          stats.favorites += 1;
        }

        // Sum usage
        stats.totalUsage += template.usageCount || 0;
      });

      return stats;
    } catch (error) {
      console.error('Error getting template statistics:', error);
      throw error;
    }
  }

  /**
   * Clone a template
   */
  async clone(
    teamId: string,
    templateId: string,
    newName: string,
    createdBy: string
  ): Promise<TicketTemplate> {
    try {
      const template = await this.getById(teamId, templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create new template with cloned data
      const { id, usageCount, createdAt, updatedAt, ...templateData } = template;
      return this.create(teamId, {
        ...templateData,
        name: newName,
        createdBy,
        isFavorite: false,
      });
    } catch (error) {
      console.error('Error cloning template:', error);
      throw error;
    }
  }

  /**
   * Helper: Map Firestore document to TicketTemplate
   */
  private mapDocToTemplate(doc: any): TicketTemplate {
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as TicketTemplate;
  }
}

// Export singleton instance
export const templateService = new TemplateService();
