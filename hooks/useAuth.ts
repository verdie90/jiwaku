"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@/types";
import { authService } from "@/services/auth.service";
import { useAppStore } from "@/store/app.store";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { setNotification } = useAppStore();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const currentSession = await authService.getCurrentSession();
          if (currentSession) {
            setUser(currentSession.user);
            setSession(currentSession);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        setError(err as Error);
        console.error("Auth error:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await authService.login(email, password);
        setUser(user);

        const session = await authService.getCurrentSession();
        if (session) {
          setSession(session);
        }

        setNotification({
          id: "login-success",
          type: "success",
          title: "Login Successful",
          message: `Welcome back, ${user.name}!`,
          duration: 3000,
        });

        return user;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: "login-error",
          type: "error",
          title: "Login Failed",
          message: error.message,
          duration: 5000,
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setNotification]
  );

  const register = useCallback(
    async (email: string, password: string, name: string, teamId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await authService.register(email, password, {
          name,
          teamId,
          email,
          role: "agent",
        });

        setNotification({
          id: "register-success",
          type: "success",
          title: "Registration Successful",
          message: "Your account has been created. Please log in.",
          duration: 3000,
        });

        return user;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: "register-error",
          type: "error",
          title: "Registration Failed",
          message: error.message,
          duration: 5000,
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setNotification]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
      setUser(null);
      setSession(null);

      setNotification({
        id: "logout-success",
        type: "success",
        title: "Logged Out",
        message: "You have been successfully logged out.",
        duration: 2000,
      });
    } catch (err) {
      const error = err as Error;
      setError(error);

      setNotification({
        id: "logout-error",
        type: "error",
        title: "Logout Failed",
        message: error.message,
        duration: 5000,
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setNotification]);

  const isAuthenticated = !!user && !!session;
  const currentUser = user;
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";
  const isTeamLead = user?.role === "team_lead";
  const isAgent = user?.role === "agent";

  return {
    user: currentUser,
    session,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isTeamLead,
    isAgent,
    login,
    register,
    logout,
  };
}

/**
 * Check if user has specific role
 */
export function useHasRole(role: string | string[]) {
  const { user } = useAuth();
  const roles = Array.isArray(role) ? role : [role];
  return user ? roles.includes(user.role) : false;
}
