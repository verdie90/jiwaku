"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useChangePassword } from "@/hooks/usePasswordReset";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const { changePassword, isLoading } = useChangePassword();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear success message
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Password saat ini harus diisi";
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = "Password baru harus diisi";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password minimal 8 karakter";
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Password harus mengandung huruf besar";
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Password harus mengandung huruf kecil";
    } else if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = "Password harus mengandung angka";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    // Check if new password is same as current
    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = "Password baru tidak boleh sama dengan password saat ini";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (!user?.id) {
        setErrors({
          form: "User tidak ditemukan",
        });
        return;
      }

      await changePassword(
        user.id,
        formData.currentPassword,
        formData.newPassword
      );

      setSuccessMessage("Password berhasil diubah!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Change password error:", error);
      setErrors({
        form: error instanceof Error ? error.message : "Perubahan password gagal",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pengaturan Akun</h1>
          <p className="text-muted-foreground mt-2">
            Kelola keamanan akun Anda
          </p>
        </div>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>
              Perbarui password Anda untuk menjaga keamanan akun
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {errors.form && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {errors.form}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 text-sm border border-green-200">
                ✓ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Masukkan password saat ini"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.currentPassword
                        ? "border-destructive"
                        : "border-input"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Masukkan password baru (minimal 8 karakter)"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.newPassword
                        ? "border-destructive"
                        : "border-input"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.newPassword}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Password harus mengandung: Huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9)
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Ulangi password baru"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.confirmPassword
                      ? "border-destructive"
                      : "border-input"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements Info */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Persyaratan Password:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>✓ Minimal 8 karakter</li>
                  <li>✓ Minimal 1 huruf besar (A-Z)</li>
                  <li>✓ Minimal 1 huruf kecil (a-z)</li>
                  <li>✓ Minimal 1 angka (0-9)</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Mengubah..." : "Ubah Password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setErrors({});
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Batalkan
                </Button>
              </div>
            </form>

            {/* Security Tips */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-medium text-foreground mb-3">
                💡 Tips Keamanan
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Gunakan password yang unik dan kuat</li>
                <li>• Jangan bagikan password dengan siapapun</li>
                <li>• Gunakan kombinasi huruf, angka, dan simbol</li>
                <li>• Ubah password secara berkala</li>
                <li>• Jika akun Anda diretas, segera ubah password</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Additional Security Options */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Opsi Keamanan Lainnya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Sesi Aktif</p>
                <p className="text-xs text-muted-foreground">
                  Kelola perangkat dan sesi yang terhubung
                </p>
              </div>
              <Button variant="outline" size="sm">
                Kelola
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Riwayat Login</p>
                <p className="text-xs text-muted-foreground">
                  Lihat aktivitas login terbaru Anda
                </p>
              </div>
              <Button variant="outline" size="sm">
                Lihat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
