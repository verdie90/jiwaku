import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id'>
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = notification.duration || 5000;

    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));

// Helper hook for backward compatibility
export function useNotification() {
  const { addNotification } = useNotificationStore();
  return { addNotification };
}
