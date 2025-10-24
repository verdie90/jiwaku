"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useVerifyResetToken,
  useResetPassword,
} from "@/hooks/usePasswordReset";

interface ResetFormProps {
  token: string;
}

export function ResetForm({ token }: ResetFormProps) {
  const { verifyToken } = useVerifyResetToken();
  const { resetPassword, isLoading: isResetting } = useResetPassword();

  const [step, setStep] = useState<"verify" | "reset" | "success">("verify");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setErrors({
        form: "Token tidak ditemukan. Silakan minta reset password baru.",
      });
      return;
    }

    const verifyOnMount = async () => {
      try {
        await verifyToken(token);
        setStep("reset");
      } catch (err) {
        setErrors({
          form:
            err instanceof Error
              ? err.message
              : "Token tidak valid atau sudah kadaluarsa",
        });
      }
    };

    verifyOnMount();
  }, [token, verifyToken]);

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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Password baru diperlukan";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password minimal 8 karakter";
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Password harus mengandung huruf besar";
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Password harus mengandung huruf kecil";
    } else if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = "Password harus mengandung angka";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password diperlukan";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
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
      await resetPassword(token, formData.newPassword);
      setStep("success");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form:
          error instanceof Error
            ? error.message
            : "Reset password gagal, silakan coba lagi",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white mb-4">
            <span className="text-xl font-bold">J</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Jiwaku</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reset Your Password
          </p>
        </div>

        {/* Reset Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "success" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-green-50 text-green-800">
                  <p className="font-medium">Password Reset Successful!</p>
                  <p className="text-sm mt-1">
                    Your password has been reset. You can now sign in with your
                    new password.
                  </p>
                </div>

                <Link href="/login">
                  <Button type="button" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {errors.form && (
                  <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {errors.form}
                  </div>
                )}

                {step === "verify" ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">
                        Verifying token...
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="New Password"
                      name="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      error={errors.newPassword}
                      disabled={isResetting}
                    />

                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      disabled={isResetting}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={isResetting}
                      disabled={isResetting}
                    >
                      Reset Password
                    </Button>
                  </form>
                )}
              </>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
