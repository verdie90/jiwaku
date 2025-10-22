import io, { Socket } from 'socket.io-client';

export interface SocketEvents {
  'message:new': (data: any) => void;
  'message:updated': (data: any) => void;
  'message:deleted': (data: any) => void;
  'typing:start': (data: { userId: string; conversationId: string }) => void;
  'typing:stop': (data: { userId: string; conversationId: string }) => void;
  'conversation:updated': (data: any) => void;
  'conversation:join': (data: { conversationId: string }) => void;
  'conversation:leave': (data: { conversationId: string }) => void;
  'presence:online': (data: { userId: string }) => void;
  'presence:offline': (data: { userId: string }) => void;
  'presence:typing': (data: { userId: string; conversationId: string }) => void;
}

class SocketManager {
  private socket: Socket | null = null;
  private isConnecting = false;

  /**
   * Connect to Socket.io server
   */
  connect(url: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        this.socket?.once('connect', () => resolve());
        return;
      }

      this.isConnecting = true;

      this.socket = io(url, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket.io connected:', this.socket?.id);
        this.isConnecting = false;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        this.isConnecting = false;
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  /**
   * Listen to socket events
   */
  on<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K]
  ): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.on(event, callback as any);
  }

  /**
   * Remove socket event listener
   */
  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    if (!this.socket) return;
    this.socket.off(event, callback as any);
  }

  /**
   * Emit socket event
   */
  emit<K extends keyof SocketEvents>(
    event: K,
    ...args: any[]
  ): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit(event, ...args);
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    this.emit('conversation:join', { conversationId });
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    this.emit('conversation:leave', { conversationId });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (isTyping) {
      this.emit('typing:start', { conversationId });
    } else {
      this.emit('typing:stop', { conversationId });
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();

// Export type
export type { Socket } from 'socket.io-client';
