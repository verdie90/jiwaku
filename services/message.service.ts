import { Message, MessageAttachment, PaginatedResponse } from "@/types";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { FIRESTORE_COLLECTIONS } from "@/config/firebase";

/**
 * Message Service
 * Handles all message operations
 */
export class MessageService {
  private db = getFirebaseFirestore();

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: "user" | "contact",
    content: string,
    contentType: "text" | "image" | "audio" | "video" | "file" = "text",
    attachments?: MessageAttachment[]
  ): Promise<Message> {
    try {
      const messageData = {
        conversationId,
        senderId,
        senderType,
        content,
        contentType,
        status: "sent" as const,
        attachments: attachments || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(this.db, FIRESTORE_COLLECTIONS.MESSAGES),
        messageData
      );

      return {
        id: docRef.id,
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<PaginatedResponse<Message>> {
    try {
      let q = query(
        collection(this.db, FIRESTORE_COLLECTIONS.MESSAGES),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1)
      );

      if (lastDoc) {
        q = query(
          collection(this.db, FIRESTORE_COLLECTIONS.MESSAGES),
          where("conversationId", "==", conversationId),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize + 1)
        );
      }

      const snapshot = await getDocs(q);
      const messages: Message[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Message);
      });

      const hasMore = messages.length > pageSize;
      if (hasMore) {
        messages.pop();
      }

      return {
        data: messages.reverse(),
        total: snapshot.size,
        page: 1,
        pageSize,
        hasMore,
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Failed to fetch messages");
    }
  }

  /**
   * Update message status
   */
  async updateMessageStatus(
    messageId: string,
    status: "sending" | "sent" | "delivered" | "read" | "failed"
  ): Promise<void> {
    try {
      const messageRef = doc(
        this.db,
        FIRESTORE_COLLECTIONS.MESSAGES,
        messageId
      );
      await updateDoc(messageRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating message status:", error);
      throw new Error("Failed to update message status");
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(
        this.db,
        FIRESTORE_COLLECTIONS.MESSAGES,
        messageId
      );
      await updateDoc(messageRef, {
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Failed to delete message");
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(
        this.db,
        FIRESTORE_COLLECTIONS.MESSAGES,
        messageId
      );
      await updateDoc(messageRef, {
        [`readBy.${userId}`]: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw new Error("Failed to mark message as read");
    }
  }

  /**
   * Search messages
   */
  async searchMessages(
    conversationId: string,
    searchTerm: string
  ): Promise<Message[]> {
    try {
      const q = query(
        collection(this.db, FIRESTORE_COLLECTIONS.MESSAGES),
        where("conversationId", "==", conversationId),
        where("content", ">=", searchTerm),
        where("content", "<=", searchTerm + "\uf8ff")
      );

      const snapshot = await getDocs(q);
      const messages: Message[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Message);
      });

      return messages;
    } catch (error) {
      console.error("Error searching messages:", error);
      throw new Error("Failed to search messages");
    }
  }
}

// Export singleton instance
export const messageService = new MessageService();
