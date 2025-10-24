'use client';

import React, { useState } from 'react';
import { useRequestPasswordReset, useResetPassword } from '@/hooks/usePasswordReset';

interface PasswordResetProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Komponen Modal/Dialog untuk Reset Password
 * Step 1: Input email untuk request reset
 * Step 2: Input token dan password baru
 * Step 3: Success message
 */
export function PasswordResetModal({ onSuccess, onCancel }: PasswordResetProps) {
  const [step, setStep] = useState<'email' | 'token' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { requestReset, isLoading: isRequestingReset } = useRequestPasswordReset();
  const { resetPassword, isLoading: isResetting } = useResetPassword();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestReset(email);
      setStep('token');
    } catch (error) {
      console.error('Reset request failed:', error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Password tidak cocok');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password minimal 8 karakter');
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setStep('success');
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Step 1: Request Reset */}
        {step === 'email' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mb-6">
              Masukkan email Anda untuk menerima link reset password.
            </p>

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nama@contoh.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isRequestingReset || !email}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
                >
                  {isRequestingReset ? 'Mengirim...' : 'Kirim Link'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Reset Password */}
        {step === 'token' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Buat Password Baru</h2>
            <p className="text-gray-600 mb-6">
              Masukkan token yang dikirim ke email dan password baru Anda.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Reset
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Token dari email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimal 8 karakter"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Harus mengandung huruf besar, huruf kecil, dan angka
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan ulang password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isResetting || !token || !newPassword || !confirmPassword}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
                >
                  {isResetting ? 'Memproses...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Kembali
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3 text-gray-900">Berhasil!</h2>
            <p className="text-gray-600 mb-6">
              Password Anda telah berhasil diubah. Silakan login dengan password baru.
            </p>

            <button
              onClick={() => {
                onSuccess?.();
                onCancel?.();
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Komponen Form untuk Change Password (untuk pengguna yang sudah login)
 */
export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Placeholder - perlu diintegrasikan dengan useChangePassword hook
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Password baru tidak cocok');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password minimal 8 karakter');
      return;
    }

    // TODO: Call useChangePassword hook
    console.log('Change password:', { currentPassword, newPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <h3 className="text-lg font-semibold text-gray-900">Ubah Password</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Saat Ini
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan password saat ini"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Baru
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Minimal 8 karakter"
        />
        <p className="text-xs text-gray-500 mt-1">
          Harus mengandung huruf besar, huruf kecil, dan angka
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Konfirmasi Password Baru
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Masukkan ulang password baru"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition"
      >
        Ubah Password
      </button>
    </form>
  );
}
