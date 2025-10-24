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
  const [isMounted, setIsMounted] = useState(false);
  const { setNotification } = useAppStore();

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize auth state from session token
  useEffect(() => {
    if (!isMounted) return;

    const initializeAuth = async () => {
      try {
        // Try to get session token and user from localStorage
        const token = localStorage.getItem('authToken');
        const cachedUserStr = localStorage.getItem('cachedUser');
        
        if (token && cachedUserStr) {
          try {
            // Parse cached user
            const cachedUser = JSON.parse(cachedUserStr);
            
            // Try to verify session with Firestore
            try {
              const verifiedUser = await authService.verifySession(token);
              if (verifiedUser) {
                // Firestore session found and valid
                setUser(verifiedUser);
                setSession({
                  user: verifiedUser,
                  token: {
                    accessToken: token,
                    expiresIn: 24 * 60 * 60,
                  },
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                });
              } else {
                // Firestore session not found, use cached user
                // This handles cases where sessions collection doesn't exist yet
                setUser(cachedUser);
                setSession({
                  user: cachedUser,
                  token: {
                    accessToken: token,
                    expiresIn: 24 * 60 * 60,
                  },
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                });
              }
            } catch (verifyErr) {
              // Verification error, use cached user
              console.warn("Session verification failed, using cached user:", verifyErr);
              setUser(cachedUser);
              setSession({
                user: cachedUser,
                token: {
                  accessToken: token,
                  expiresIn: 24 * 60 * 60,
                },
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              });
            }
          } catch (parseErr) {
            console.error("Failed to parse cached user:", parseErr);
            localStorage.removeItem('authToken');
            localStorage.removeItem('cachedUser');
            setUser(null);
            setSession(null);
          }
        } else {
          // No token or cached user, not authenticated
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        setError(err as Error);
        console.error("Auth initialization error:", err);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isMounted]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { user, token } = await authService.login(email, password);
        setUser(user);

        // Store token AND user in localStorage for fallback
        localStorage.setItem('authToken', token);
        localStorage.setItem('cachedUser', JSON.stringify(user));

        const sessionData: Session = {
          user,
          token: {
            accessToken: token,
            expiresIn: 24 * 60 * 60,
          },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        setSession(sessionData);

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
      // Get token from session
      const token = session?.token.accessToken;
      if (token) {
        await authService.logout(token);
      }

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('cachedUser');

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
  }, [session, setNotification]);

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
