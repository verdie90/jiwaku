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
} from 'firebase/firestore';
import { Ticket, TicketComment } from '@/types';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import { TicketStatus, TicketPriority } from '@/config/constants';

class TicketService {
  async getAll(teamId: string): Promise<Ticket[]> {
    try {
      const db = getFirebaseFirestore();
      const ticketsRef = collection(db, 'teams', teamId, 'tickets');
      const q = query(ticketsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
        closedAt: doc.data().closedAt?.toDate(),
      } as Ticket));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getById(teamId: string, ticketId: string): Promise<Ticket | null> {
    try {
      const db = getFirebaseFirestore();
      const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);
      const snapshot = await getDoc(ticketRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate() || new Date(),
        updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
        resolvedAt: snapshot.data().resolvedAt?.toDate(),
        closedAt: snapshot.data().closedAt?.toDate(),
      } as Ticket;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  }

  async create(
    teamId: string,
    contactId: string,
    data: {
      title: string;
      description: string;
      priority: TicketPriority;
      status: TicketStatus;
      tags?: string[];
      categories?: string[];
      customFields?: Record<string, any>;
    }
  ): Promise<Ticket> {
    try {
      const db = getFirebaseFirestore();
      const ticketsRef = collection(db, 'teams', teamId, 'tickets');

      const newTicket = {
        ...data,
        teamId,
        contactId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        comments: [],
        tags: data.tags || [],
        categories: data.categories || [],
        customFields: data.customFields || {},
        sla: {
          responseTime: 1440, // 24 hours in minutes
          resolutionTime: 2880, // 48 hours in minutes
          status: 'within',
        },
      };

      const docRef = await addDoc(ticketsRef, newTicket);

      return {
        id: docRef.id,
        ...newTicket,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async update(
    teamId: string,
    ticketId: string,
    data: Partial<Ticket>
  ): Promise<Ticket | null> {
    try {
      const db = getFirebaseFirestore();
      const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(ticketRef, updateData);

      return this.getById(teamId, ticketId);
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  async delete(teamId: string, ticketId: string): Promise<void> {
    try {
      const db = getFirebaseFirestore();
      const ticketRef = doc(db, 'teams', teamId, 'tickets', ticketId);

      await deleteDoc(ticketRef);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }

  async search(
    teamId: string,
    query: string,
    tickets?: Ticket[]
  ): Promise<Ticket[]> {
    try {
      const allTickets = tickets || (await this.getAll(teamId));
      const lowerQuery = query.toLowerCase();

      return allTickets.filter((ticket) => {
        const titleMatch = ticket.title.toLowerCase().includes(lowerQuery);
        const descriptionMatch = ticket.description
          .toLowerCase()
          .includes(lowerQuery);
        const idMatch = ticket.id.toLowerCase().includes(lowerQuery);

        return titleMatch || descriptionMatch || idMatch;
      });
    } catch (error) {
      console.error('Error searching tickets:', error);
      throw error;
    }
  }

  async updateStatus(
    teamId: string,
    ticketId: string,
    status: TicketStatus
  ): Promise<Ticket | null> {
    try {
      const updateData: Partial<Ticket> = {
        status,
      };

      // Set resolved date if status is RESOLVED
      if (status === TicketStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      }

      // Set closed date if status is CLOSED
      if (status === TicketStatus.CLOSED) {
        updateData.closedAt = new Date();
      }

      return this.update(teamId, ticketId, updateData);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async assignTicket(
    teamId: string,
    ticketId: string,
    agentId: string
  ): Promise<Ticket | null> {
    try {
      return this.update(teamId, ticketId, {
        assignedAgentId: agentId,
        status: TicketStatus.ASSIGNED,
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  }

  async addComment(
    teamId: string,
    ticketId: string,
    comment: Omit<TicketComment, 'id'>
  ): Promise<Ticket | null> {
    try {
      const ticket = await this.getById(teamId, ticketId);
      if (!ticket) return null;

      const newComment: TicketComment = {
        ...comment,
        id: `${Date.now()}`,
      };

      const updatedComments = [...(ticket.comments || []), newComment];

      return this.update(teamId, ticketId, {
        comments: updatedComments,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getTicketsByContactId(
    teamId: string,
    contactId: string
  ): Promise<Ticket[]> {
    try {
      const db = getFirebaseFirestore();
      const ticketsRef = collection(db, 'teams', teamId, 'tickets');
      const q = query(
        ticketsRef,
        where('contactId', '==', contactId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
        closedAt: doc.data().closedAt?.toDate(),
      } as Ticket));
    } catch (error) {
      console.error('Error fetching tickets by contact:', error);
      throw error;
    }
  }

  async getAssignedTickets(
    teamId: string,
    agentId: string
  ): Promise<Ticket[]> {
    try {
      const db = getFirebaseFirestore();
      const ticketsRef = collection(db, 'teams', teamId, 'tickets');
      const q = query(
        ticketsRef,
        where('assignedAgentId', '==', agentId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
        closedAt: doc.data().closedAt?.toDate(),
      } as Ticket));
    } catch (error) {
      console.error('Error fetching assigned tickets:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const ticketService = new TicketService();
