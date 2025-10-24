"use client";

import { useState } from "react";
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
import { useRequestPasswordReset } from "@/hooks/usePasswordReset";

export default function ForgotPasswordPage() {
  const { requestReset, isLoading } = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "token" | "success">("email");
  const [resetToken, setResetToken] = useState("");

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email harus diisi");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email tidak valid");
      return;
    }

    try {
      const token = await requestReset(email);
      setResetToken(token);
      setStep("token");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Permintaan reset gagal"
      );
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
            AI-Powered Omnichannel CRM
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Lupa Password?</CardTitle>
            <CardDescription>
              Masukkan email Anda untuk menerima link reset password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Mengirim..." : "Kirim Link Reset"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Ingat password Anda?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Masuk
                  </Link>
                </div>
              </form>
            )}

            {step === "token" && (
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    📧 Link reset password telah dikirim ke <strong>{email}</strong>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Token: <code className="text-xs bg-muted px-2 py-1 rounded">{resetToken}</code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Salin token ini untuk proses reset password
                  </p>
                </div>

                <Button
                  onClick={() => setStep("success")}
                  className="w-full"
                >
                  Saya Sudah Menerima Email
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep("email")}
                  className="w-full"
                >
                  Kirim Ulang
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
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

                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Email Berhasil Dikirim
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Periksa email Anda untuk link reset password. Link ini berlaku selama 24 jam.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="block"
                >
                  <Button className="w-full">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            )}
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
