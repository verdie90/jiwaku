import { Contact, ChannelContact } from '@/types';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  channels?: ChannelContact[];
}

class ContactService {
  private collectionName = 'contacts';

  private getDb() {
    return getFirebaseFirestore();
  }

  /**
   * Get all contacts for a team
   */
  async getAll(teamId: string): Promise<Contact[]> {
    try {
      const q = query(
        collection(this.getDb(), this.collectionName),
        where('teamId', '==', teamId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => this.mapDocToContact(doc));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  /**
   * Get a contact by ID
   */
  async getById(contactId: string): Promise<Contact | null> {
    try {
      const docRef = doc(this.getDb(), this.collectionName, contactId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return this.mapDocToContact(docSnap);
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  /**
   * Create a new contact
   */
  async create(
    teamId: string,
    data: ContactInput
  ): Promise<Contact> {
    try {
      const now = Timestamp.now();

      const contactData = {
        teamId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company || '',
        jobTitle: data.jobTitle || '',
        channels: data.channels || [],
        conversationCount: 0,
        createdAt: now,
        updatedAt: now,
        lastContactedAt: null,
      };

      const docRef = await addDoc(
        collection(this.getDb(), this.collectionName),
        contactData
      );

      return {
        id: docRef.id,
        ...contactData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        lastContactedAt: undefined,
      } as unknown as Contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  /**
   * Update a contact
   */
  async update(
    contactId: string,
    data: Partial<ContactInput>
  ): Promise<void> {
    try {
      const now = Timestamp.now();

      const updateData: Record<string, any> = {
        updatedAt: now,
      };

      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.email) updateData.email = data.email;
      if (data.phone) updateData.phone = data.phone;
      if (data.company !== undefined) updateData.company = data.company;
      if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
      if (data.channels) updateData.channels = data.channels;

      const docRef = doc(this.getDb(), this.collectionName, contactId);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  /**
   * Delete a contact
   */
  async delete(contactId: string): Promise<void> {
    try {
      const docRef = doc(this.getDb(), this.collectionName, contactId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Search contacts by name, email, or phone
   */
  async search(
    teamId: string,
    query: string
  ): Promise<Contact[]> {
    try {
      const lowerQuery = query.toLowerCase();

      // Since Firestore doesn't support full-text search with LIKE,
      // we fetch all contacts and filter client-side
      const contacts = await this.getAll(teamId);

      return contacts.filter((contact) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        return (
          fullName.includes(lowerQuery) ||
          contact.email.toLowerCase().includes(lowerQuery) ||
          contact.phone.toLowerCase().includes(lowerQuery) ||
          (contact.company?.toLowerCase().includes(lowerQuery) ?? false)
        );
      });
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }

  /**
   * Update conversation count for a contact
   */
  async updateConversationCount(
    contactId: string,
    count: number
  ): Promise<void> {
    try {
      const docRef = doc(this.getDb(), this.collectionName, contactId);
      await updateDoc(docRef, {
        conversationCount: count,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating conversation count:', error);
      throw error;
    }
  }

  /**
   * Update last contacted time
   */
  async updateLastContacted(contactId: string): Promise<void> {
    try {
      const docRef = doc(this.getDb(), this.collectionName, contactId);
      await updateDoc(docRef, {
        lastContactedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating last contacted:', error);
      throw error;
    }
  }

  /**
   * Map Firestore document to Contact type
   */
  private mapDocToContact(doc: any): Contact {
    const data = doc.data();
    return {
      id: doc.id,
      teamId: data.teamId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      channels: data.channels || [],
      company: data.company,
      jobTitle: data.jobTitle,
      conversationCount: data.conversationCount || 0,
      lastContactedAt: data.lastContactedAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      metadata: data.metadata,
    };
  }
}

// Export singleton instance
export const contactService = new ContactService();
