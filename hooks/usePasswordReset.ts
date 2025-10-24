'use client';

import { useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { useAppStore } from '@/store/app.store';

/**
 * Hook untuk mengelola proses permintaan reset password
 */
export function useRequestPasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const { setNotification } = useAppStore();

  const requestReset = useCallback(
    async (email: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const resetToken = await authService.requestPasswordReset(email);

        setSuccess(true);
        setNotification({
          id: 'password-reset-requested',
          type: 'success',
          title: 'Reset Password Requested',
          message: 'Jika email terdaftar, link reset password akan dikirim.',
          duration: 5000,
        });

        return resetToken;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: 'password-reset-error',
          type: 'error',
          title: 'Request Failed',
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

  return {
    requestReset,
    isLoading,
    error,
    success,
  };
}

/**
 * Hook untuk verifikasi token reset password
 */
export function useVerifyResetToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const { setNotification } = useAppStore();

  const verifyToken = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const userEmail = await authService.verifyResetToken(token);
        setEmail(userEmail);
        return userEmail;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: 'token-verification-error',
          type: 'error',
          title: 'Token Invalid',
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

  return {
    verifyToken,
    isLoading,
    error,
    email,
  };
}

/**
 * Hook untuk melakukan reset password dengan token
 */
export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const { setNotification } = useAppStore();

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await authService.resetPassword(token, newPassword);
        setSuccess(true);

        setNotification({
          id: 'password-reset-success',
          type: 'success',
          title: 'Password Reset Successful',
          message: 'Password Anda telah berhasil diubah. Silakan login dengan password baru.',
          duration: 5000,
        });

        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: 'password-reset-failed',
          type: 'error',
          title: 'Reset Failed',
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

  return {
    resetPassword,
    isLoading,
    error,
    success,
  };
}

/**
 * Hook untuk mengubah password pengguna yang sudah login
 */
export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const { setNotification } = useAppStore();

  const changePassword = useCallback(
    async (userId: string, currentPassword: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await authService.changePassword(userId, currentPassword, newPassword);
        setSuccess(true);

        setNotification({
          id: 'password-changed-success',
          type: 'success',
          title: 'Password Changed',
          message: 'Password Anda telah berhasil diubah.',
          duration: 3000,
        });

        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: 'password-change-failed',
          type: 'error',
          title: 'Change Failed',
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

  return {
    changePassword,
    isLoading,
    error,
    success,
  };
}

/**
 * Hook untuk menghapus akun pengguna
 */
export function useDeleteAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const { setNotification } = useAppStore();

  const deleteAccount = useCallback(
    async (userId: string, password: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await authService.deleteAccount(userId, password);
        setSuccess(true);

        setNotification({
          id: 'account-deleted',
          type: 'success',
          title: 'Account Deleted',
          message: 'Akun Anda telah berhasil dihapus.',
          duration: 3000,
        });

        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: 'account-deletion-failed',
          type: 'error',
          title: 'Deletion Failed',
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

  return {
    deleteAccount,
    isLoading,
    error,
    success,
  };
}

/**
 * Hook untuk mengupdate profil pengguna
 */
export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const { setNotification } = useAppStore();

  const updateProfile = useCallback(
    async (userId: string, updates: Record<string, any>) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const updatedUser = await authService.updateProfile(userId, updates);
        setSuccess(true);

        setNotification({
          id: 'profile-updated',
          type: 'success',
          title: 'Profile Updated',
          message: 'Profil Anda telah berhasil diperbarui.',
          duration: 3000,
        });

        return updatedUser;
      } catch (err) {
        const error = err as Error;
        setError(error);

        setNotification({
          id: 'profile-update-failed',
          type: 'error',
          title: 'Update Failed',
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

  return {
    updateProfile,
    isLoading,
    error,
    success,
  };
}
