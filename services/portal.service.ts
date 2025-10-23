import {
  getFirestore,
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
  limit,
  startAfter,
  QueryConstraint,
} from 'firebase/firestore';
import {
  PortalUser,
  PortalTicket,
  PortalTicketComment,
  PortalFeedback,
  PortalSettings,
  PortalDashboardStats,
  PortalActivity,
  PortalNotification,
  PortalKnowledgeBase,
  PortalUserPreferences,
} from '@/types';

const db = getFirestore();

export class PortalService {
  // ======================== PORTAL USER MANAGEMENT ========================

  /**
   * Get portal user by ID
   */
  async getPortalUser(teamId: string, portalUserId: string): Promise<PortalUser | null> {
    try {
      const userRef = doc(db, 'teams', teamId, 'portalUsers', portalUserId);
      const snapshot = await getDoc(userRef);
      return snapshot.exists() ? (snapshot.data() as PortalUser) : null;
    } catch (error) {
      console.error('Error getting portal user:', error);
      throw error;
    }
  }

  /**
   * Get portal user by email
   */
  async getPortalUserByEmail(teamId: string, email: string): Promise<PortalUser | null> {
    try {
      const usersRef = collection(db, 'teams', teamId, 'portalUsers');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const snapshot = await getDocs(q);
      return snapshot.docs.length > 0 ? (snapshot.docs[0].data() as PortalUser) : null;
    } catch (error) {
      console.error('Error getting portal user by email:', error);
      throw error;
    }
  }

  /**
   * Create portal user
   */
  async createPortalUser(teamId: string, user: Omit<PortalUser, 'createdAt' | 'updatedAt'>): Promise<PortalUser> {
    try {
      const portalUser: PortalUser = {
        ...user,
        email: user.email.toLowerCase(),
        portalLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userRef = doc(db, 'teams', teamId, 'portalUsers', user.id);
      await setDoc(userRef, portalUser);

      // Log activity
      await this.logPortalActivity(teamId, user.id, 'create_ticket', 'Portal user created', true);

      return portalUser;
    } catch (error) {
      console.error('Error creating portal user:', error);
      throw error;
    }
  }

  /**
   * Update portal user
   */
  async updatePortalUser(
    teamId: string,
    portalUserId: string,
    updates: Partial<PortalUser>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'teams', teamId, 'portalUsers', portalUserId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating portal user:', error);
      throw error;
    }
  }

  /**
   * List portal users with pagination
   */
  async listPortalUsers(
    teamId: string,
    pageSize: number = 20,
    _lastUser?: PortalUser
  ): Promise<PortalUser[]> {
    try {
      const usersRef = collection(db, 'teams', teamId, 'portalUsers');
      const constraints: QueryConstraint[] = [
        orderBy('createdAt', 'desc'),
        limit(pageSize),
      ];

      if (_lastUser) {
        constraints.push(startAfter(_lastUser.createdAt));
      }

      const q = query(usersRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PortalUser);
    } catch (error) {
      console.error('Error listing portal users:', error);
      throw error;
    }
  }

  /**
   * Delete portal user
   */
  async deletePortalUser(teamId: string, portalUserId: string): Promise<void> {
    try {
      const userRef = doc(db, 'teams', teamId, 'portalUsers', portalUserId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting portal user:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    teamId: string,
    portalUserId: string,
    preferences: PortalUserPreferences
  ): Promise<void> {
    try {
      const userRef = doc(db, 'teams', teamId, 'portalUsers', portalUserId);
      await updateDoc(userRef, { preferences, updatedAt: new Date() });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // ======================== PORTAL TICKETS ========================

  /**
   * Get portal ticket
   */
  async getPortalTicket(teamId: string, ticketId: string): Promise<PortalTicket | null> {
    try {
      const ticketRef = doc(db, 'teams', teamId, 'portalTickets', ticketId);
      const snapshot = await getDoc(ticketRef);
      return snapshot.exists() ? (snapshot.data() as PortalTicket) : null;
    } catch (error) {
      console.error('Error getting portal ticket:', error);
      throw error;
    }
  }

  /**
   * Get customer's tickets
   */
  async getCustomerTickets(
    teamId: string,
    portalUserId: string,
    status?: string
  ): Promise<PortalTicket[]> {
    try {
      const ticketsRef = collection(db, 'teams', teamId, 'portalTickets');
      const constraints: QueryConstraint[] = [
        where('portalUserId', '==', portalUserId),
        orderBy('createdAt', 'desc'),
      ];

      if (status) {
        constraints.push(where('status', '==', status));
      }

      const q = query(ticketsRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PortalTicket);
    } catch (error) {
      console.error('Error getting customer tickets:', error);
      throw error;
    }
  }

  /**
   * Create portal ticket (self-service)
   */
  async createPortalTicket(
    teamId: string,
    ticket: Omit<PortalTicket, 'createdAt' | 'updatedAt'>
  ): Promise<PortalTicket> {
    try {
      const portalTicket: PortalTicket = {
        ...ticket,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ticketRef = doc(db, 'teams', teamId, 'portalTickets', ticket.id);
      await setDoc(ticketRef, portalTicket);

      // Log activity
      await this.logPortalActivity(
        teamId,
        ticket.portalUserId,
        'create_ticket',
        `Created ticket: ${ticket.title}`,
        true
      );

      return portalTicket;
    } catch (error) {
      console.error('Error creating portal ticket:', error);
      throw error;
    }
  }

  /**
   * Update portal ticket
   */
  async updatePortalTicket(
    teamId: string,
    ticketId: string,
    updates: Partial<PortalTicket>
  ): Promise<void> {
    try {
      const ticketRef = doc(db, 'teams', teamId, 'portalTickets', ticketId);
      await updateDoc(ticketRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating portal ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket dashboard stats for customer
   */
  async getCustomerDashboardStats(
    teamId: string,
    portalUserId: string
  ): Promise<PortalDashboardStats> {
    try {
      const tickets = await this.getCustomerTickets(teamId, portalUserId);

      const stats: PortalDashboardStats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
        pendingTickets: tickets.filter(t => t.status === 'waiting').length,
        averageResolutionTime: this._calculateAvgResolutionTime(tickets),
        lastTicketCreated: tickets.length > 0 ? tickets[0].createdAt : undefined,
        unreadCommentsCount: 0, // TODO: Implement unread comments tracking
        averageRating: undefined, // TODO: Calculate from feedback
      };

      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // ======================== PORTAL COMMENTS ========================

  /**
   * Get ticket comments
   */
  async getTicketComments(
    teamId: string,
    ticketId: string,
    portalUserId?: string
  ): Promise<PortalTicketComment[]> {
    try {
      const commentsRef = collection(db, 'teams', teamId, 'portalTicketComments');
      const constraints: QueryConstraint[] = [
        where('ticketId', '==', ticketId),
        orderBy('createdAt', 'desc'),
      ];

      const q = query(commentsRef, ...constraints);
      const snapshot = await getDocs(q);

      let comments = snapshot.docs.map(doc => doc.data() as PortalTicketComment);

      // Filter internal comments if customer
      if (portalUserId) {
        comments = comments.filter(c => !c.isInternal || c.authorId === portalUserId);
      }

      return comments;
    } catch (error) {
      console.error('Error getting ticket comments:', error);
      throw error;
    }
  }

  /**
   * Add comment to ticket
   */
  async addTicketComment(
    teamId: string,
    comment: Omit<PortalTicketComment, 'createdAt' | 'updatedAt'>
  ): Promise<PortalTicketComment> {
    try {
      const portalComment: PortalTicketComment = {
        ...comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const commentRef = doc(db, 'teams', teamId, 'portalTicketComments', comment.id);
      await setDoc(commentRef, portalComment);

      // Log activity
      await this.logPortalActivity(
        teamId,
        comment.authorId,
        'comment',
        `Commented on ticket`,
        true
      );

      return portalComment;
    } catch (error) {
      console.error('Error adding ticket comment:', error);
      throw error;
    }
  }

  // ======================== PORTAL FEEDBACK ========================

  /**
   * Submit feedback
   */
  async submitFeedback(
    teamId: string,
    feedback: Omit<PortalFeedback, 'createdAt' | 'updatedAt'>
  ): Promise<PortalFeedback> {
    try {
      const portalFeedback: PortalFeedback = {
        ...feedback,
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const feedbackRef = doc(db, 'teams', teamId, 'portalFeedback', feedback.id);
      await setDoc(feedbackRef, portalFeedback);

      // Log activity
      await this.logPortalActivity(
        teamId,
        feedback.portalUserId,
        'submit_feedback',
        `Submitted feedback with rating: ${feedback.overallRating}`,
        true
      );

      return portalFeedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Get ticket feedback
   */
  async getTicketFeedback(teamId: string, ticketId: string): Promise<PortalFeedback | null> {
    try {
      const feedbackRef = collection(db, 'teams', teamId, 'portalFeedback');
      const q = query(feedbackRef, where('ticketId', '==', ticketId), limit(1));
      const snapshot = await getDocs(q);
      return snapshot.docs.length > 0 ? (snapshot.docs[0].data() as PortalFeedback) : null;
    } catch (error) {
      console.error('Error getting ticket feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(teamId: string): Promise<{
    averageRating: number;
    totalFeedback: number;
    averageNPS: number;
  }> {
    try {
      const feedbackRef = collection(db, 'teams', teamId, 'portalFeedback');
      const q = query(feedbackRef, where('status', '==', 'submitted'));
      const snapshot = await getDocs(q);

      const feedback = snapshot.docs.map(doc => doc.data() as PortalFeedback);

      if (feedback.length === 0) {
        return { averageRating: 0, totalFeedback: 0, averageNPS: 0 };
      }

      const avgRating = feedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) / feedback.length;
      const avgNPS =
        feedback.reduce((sum, f) => sum + (f.npsScore || 0), 0) / feedback.filter(f => f.npsScore).length;

      return {
        averageRating: Math.round(avgRating * 10) / 10,
        totalFeedback: feedback.length,
        averageNPS: Math.round(avgNPS),
      };
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      throw error;
    }
  }

  // ======================== PORTAL SETTINGS ========================

  /**
   * Get portal settings
   */
  async getPortalSettings(teamId: string): Promise<PortalSettings | null> {
    try {
      const settingsRef = doc(db, 'teams', teamId, 'portalSettings', 'config');
      const snapshot = await getDoc(settingsRef);
      return snapshot.exists() ? (snapshot.data() as PortalSettings) : null;
    } catch (error) {
      console.error('Error getting portal settings:', error);
      throw error;
    }
  }

  /**
   * Update portal settings
   */
  async updatePortalSettings(
    teamId: string,
    settings: Partial<PortalSettings>
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'teams', teamId, 'portalSettings', 'config');
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating portal settings:', error);
      throw error;
    }
  }

  // ======================== PORTAL ACTIVITY & NOTIFICATIONS ========================

  /**
   * Log portal activity
   */
  async logPortalActivity(
    teamId: string,
    portalUserId: string,
    action: string,
    actionDescription: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      const activityRef = collection(db, 'teams', teamId, 'portalActivity');
      const newActivity: PortalActivity = {
        id: doc(activityRef).id,
        teamId,
        portalUserId,
        action: action as any,
        actionDescription,
        success,
        errorMessage,
        createdAt: new Date(),
      };

      await setDoc(doc(activityRef, newActivity.id), newActivity);
    } catch (error) {
      console.error('Error logging portal activity:', error);
      // Don't throw - activity logging should not break main operations
    }
  }

  /**
   * Get portal notifications for user
   */
  async getPortalNotifications(
    teamId: string,
    portalUserId: string,
    unreadOnly: boolean = false
  ): Promise<PortalNotification[]> {
    try {
      const notificationsRef = collection(db, 'teams', teamId, 'portalNotifications');
      const constraints: QueryConstraint[] = [
        where('portalUserId', '==', portalUserId),
        orderBy('createdAt', 'desc'),
        limit(50),
      ];

      if (unreadOnly) {
        constraints.push(where('isRead', '==', false));
      }

      const q = query(notificationsRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PortalNotification);
    } catch (error) {
      console.error('Error getting portal notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(
    teamId: string,
    notificationId: string
  ): Promise<void> {
    try {
      const notifRef = doc(db, 'teams', teamId, 'portalNotifications', notificationId);
      await updateDoc(notifRef, {
        isRead: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // ======================== KNOWLEDGE BASE ========================

  /**
   * Get knowledge base articles by category
   */
  async getKnowledgeBase(
    teamId: string,
    category?: string
  ): Promise<PortalKnowledgeBase[]> {
    try {
      const kbRef = collection(db, 'teams', teamId, 'portalKnowledgeBase');
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('featured', 'desc'),
        orderBy('views', 'desc'),
      ];

      if (category) {
        constraints.push(where('category', '==', category));
      }

      const q = query(kbRef, ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PortalKnowledgeBase);
    } catch (error) {
      console.error('Error getting knowledge base:', error);
      throw error;
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(
    teamId: string,
    searchTerm: string
  ): Promise<PortalKnowledgeBase[]> {
    try {
      const kbRef = collection(db, 'teams', teamId, 'portalKnowledgeBase');
      const q = query(
        kbRef,
        where('status', '==', 'published'),
        where('searchKeywords', 'array-contains', searchTerm.toLowerCase())
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PortalKnowledgeBase);
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }
  }

  /**
   * Increment KB article views
   */
  async incrementKBViews(teamId: string, articleId: string): Promise<void> {
    try {
      const articleRef = doc(db, 'teams', teamId, 'portalKnowledgeBase', articleId);
      const article = await getDoc(articleRef);
      if (article.exists()) {
        const current = (article.data() as PortalKnowledgeBase).views || 0;
        await updateDoc(articleRef, { views: current + 1 });
      }
    } catch (error) {
      console.error('Error incrementing KB views:', error);
      throw error;
    }
  }

  // ======================== HELPER METHODS ========================

  /**
   * Calculate average resolution time from tickets
   */
  private _calculateAvgResolutionTime(tickets: PortalTicket[]): number {
    if (tickets.length === 0) return 0;

    const resolvedTickets = tickets.filter(
      t => t.status === 'resolved' && t.updatedAt
    );

    if (resolvedTickets.length === 0) return 0;

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const updated = new Date(ticket.updatedAt).getTime();
      return sum + (updated - created);
    }, 0);

    return Math.round(totalTime / resolvedTickets.length / 3600000); // Convert to hours
  }

  /**
   * Verify portal access
   */
  async verifyPortalAccess(
    teamId: string,
    portalUserId: string,
    ticketId: string
  ): Promise<boolean> {
    try {
      const ticket = await this.getPortalTicket(teamId, ticketId);
      if (!ticket) return false;

      // Verify ownership
      return ticket.portalUserId === portalUserId && ticket.visibility === 'public';
    } catch (error) {
      console.error('Error verifying portal access:', error);
      return false;
    }
  }
}

export const portalService = new PortalService();
