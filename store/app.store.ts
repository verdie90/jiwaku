"use client";

import { create } from "zustand";
import { Notification } from "@/types";

interface AppState {
  notifications: Notification[];
  isOnline: boolean;
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;

  // Actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setOnline: (online: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setSidebarOpen: (open: boolean) => void;
  setNotification: (notification: Notification) => void;
}

export const useAppStore = create<AppState>((set) => ({
  notifications: [],
  isOnline: true,
  theme: "system",
  sidebarOpen: true,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setOnline: (online) => set({ isOnline: online }),

  setTheme: (theme) => set({ theme }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setNotification: (notification) => {
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== notification.id),
        }));
      }, notification.duration);
    }
  },
}));
